// =============================================================
// sync-tiktok · TikTok 数据同步（自有账号统计 + 帖子/视频）
//
// Token 来源优先级：
//   1) tiktok_tokens 表（由 tiktok-oauth 授权写入）——过期时用 refresh_token 自动续期
//   2) 兜底：环境变量 TIKTOK_ACCESS_TOKEN（手动贴的静态 token）
// 自动续期需要：TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET
//
// ⚠️ 官方接口只能读「已授权账号自己」的数据，竞品拿不到（只能手动录入）。
// 拉取：
//   · GET  /v2/user/info/  —— 粉丝/点赞/视频总数（scope: user.info.stats）
//   · POST /v2/video/list/ —— 最近视频逐条指标（scope: video.list）→ 写入 posts 表
// 部署：supabase functions deploy sync-tiktok
// 调用：POST { "scope": "accounts" }
// =============================================================
import { admin, json, corsHeaders, snapshot, writeLog } from '../_shared/util.ts'

const API = 'https://open.tiktokapis.com/v2'
const CLIENT_KEY = Deno.env.get('TIKTOK_CLIENT_KEY') ?? ''
const CLIENT_SECRET = Deno.env.get('TIKTOK_CLIENT_SECRET') ?? ''

// 取一个有效 access_token：优先读表并在过期时续期，否则回退到静态 secret
async function getToken(db: ReturnType<typeof admin>): Promise<string> {
  const { data: row } = await db.from('tiktok_tokens').select('*').eq('id', 1).maybeSingle()
  if (row?.access_token) {
    const exp = row.expires_at ? new Date(row.expires_at).getTime() : 0
    if (exp > Date.now() + 60000) return row.access_token
    if (row.refresh_token && CLIENT_KEY && CLIENT_SECRET) {
      const body = new URLSearchParams({
        client_key: CLIENT_KEY, client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token', refresh_token: row.refresh_token,
      })
      const r = await fetch(`${API}/oauth/token/`, {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body,
      })
      const d = await r.json()
      if (d.access_token) {
        const now = Date.now()
        await db.from('tiktok_tokens').update({
          access_token: d.access_token,
          refresh_token: d.refresh_token ?? row.refresh_token,
          scope: d.scope ?? row.scope,
          expires_at: new Date(now + Number(d.expires_in || 0) * 1000).toISOString(),
          refresh_expires_at: new Date(now + Number(d.refresh_expires_in || 0) * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('id', 1)
        return d.access_token
      }
    }
    return row.access_token
  }
  return Deno.env.get('TIKTOK_ACCESS_TOKEN') ?? ''
}

async function ownStats(TOKEN: string) {
  const r = await fetch(`${API}/user/info/?fields=follower_count,following_count,likes_count,video_count`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  })
  const d = await r.json()
  const u = d?.data?.user
  if (!u) return null
  return { followers: Number(u.follower_count || 0), likes: Number(u.likes_count || 0), posts_count: Number(u.video_count || 0) }
}

async function ownVideos(TOKEN: string, maxTotal = 60) {
  const fields = 'id,title,video_description,cover_image_url,share_url,create_time,view_count,like_count,comment_count,share_count'
  const videos: any[] = []
  let cursor: number | undefined
  for (let i = 0; i < 10 && videos.length < maxTotal; i++) {
    const body: Record<string, unknown> = { max_count: 20 }
    if (cursor) body.cursor = cursor
    const r = await fetch(`${API}/video/list/?fields=${fields}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const d = await r.json()
    const batch = d?.data?.videos ?? []
    videos.push(...batch)
    if (!d?.data?.has_more) break
    cursor = d?.data?.cursor
  }
  return videos.slice(0, maxTotal)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  const { scope = 'accounts' } = await req.json().catch(() => ({}))
  const db = admin()
  let processed = 0, failed = 0, postsUpserted = 0

  if (scope === 'competitors') {
    await writeLog(db, 'tiktok', 'competitors', 'error', 0, 0, '官方接口不支持抓取任意竞品，需手动录入或第三方数据商')
    return json({ platform: 'tiktok', scope, processed: 0, failed: 0, note: '竞品 TikTok 数据无法通过官方接口自动抓取' })
  }

  const TOKEN = await getToken(db)
  if (!TOKEN) {
    await writeLog(db, 'tiktok', scope, 'error', 0, 0, '未授权：请先走 TikTok OAuth (tiktok-oauth)')
    return json({ error: '未授权，请先完成 TikTok OAuth' }, 400)
  }

  const { data: rows } = await db.from('accounts').select('*').ilike('platform', 'tiktok').limit(1)
  const row = rows?.[0]
  if (!row) {
    await writeLog(db, 'tiktok', scope, 'error', 0, 0, 'accounts 表里没有 platform=tiktok 的账号')
    return json({ platform: 'tiktok', scope, processed: 0, failed: 0, note: '未找到 TikTok 账号' })
  }

  try {
    const s = await ownStats(TOKEN)
    if (s) {
      await db.from('accounts')
        .update({ followers: s.followers, connected: true, last_synced_at: new Date().toISOString() })
        .eq('id', row.id)
      await snapshot(db, 'account', row.id, 'tiktok', s)
      processed++
    } else {
      failed++
    }

    const videos = await ownVideos(TOKEN)
    for (const v of videos) {
      const rec = {
        account_id: row.id,
        brand_id: row.brand_id,
        platform: 'tiktok',
        external_id: String(v.id),
        title: (v.title || v.video_description || '').slice(0, 200) || 'TikTok 视频',
        content: v.video_description || null,
        thumbnail_url: v.cover_image_url || null,
        published_at: v.create_time ? new Date(v.create_time * 1000).toISOString() : null,
        likes: Number(v.like_count || 0),
        views: Number(v.view_count || 0),
        comments: Number(v.comment_count || 0),
        shares: Number(v.share_count || 0),
        status: 'published',
      }
      const { error } = await db.from('posts').upsert(rec, { onConflict: 'account_id,external_id' })
      if (!error) postsUpserted++
    }
  } catch (_e) {
    failed++
  }

  await writeLog(db, 'tiktok', scope, failed ? 'partial' : 'success', processed, failed, `posts_upserted=${postsUpserted}`)
  return json({ platform: 'tiktok', scope, processed, failed, posts_upserted: postsUpserted })
})
