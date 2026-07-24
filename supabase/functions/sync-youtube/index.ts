// =============================================================
// sync-youtube · 用 YouTube Data API v3 拉取自有账号 + 竞品的频道数据
// 需要环境变量：YOUTUBE_API_KEY
// 部署：supabase functions deploy sync-youtube
// 调用：POST { "scope": "accounts" | "competitors" | "all" }
// =============================================================
import { admin, json, corsHeaders, snapshot, writeLog } from '../_shared/util.ts'

const API = 'https://www.googleapis.com/youtube/v3'
const KEY = Deno.env.get('YOUTUBE_API_KEY') ?? ''

// 从主页链接解析：/channel/UC… 直接是频道ID；/@名字 是 handle；/c//user/ 走搜索
function parseYouTubeUrl(url: string) {
  if (!url) return {} as { channelId?: string; handle?: string; query?: string }
  const mCh = url.match(/\/channel\/([A-Za-z0-9_-]+)/)
  if (mCh) return { channelId: mCh[1] }
  const mAt = url.match(/\/@([A-Za-z0-9_.\-]+)/)
  if (mAt) return { handle: mAt[1] }
  const mCU = url.match(/\/(?:c|user)\/([A-Za-z0-9_.\-]+)/)
  if (mCU) return { query: mCU[1] }
  return {}
}

// 把主页链接 / handle 解析成 channelId
async function resolveChannelId(row: { external_id?: string; handle?: string; profile_url?: string }) {
  if (row.external_id) return row.external_id
  const p = parseYouTubeUrl(row.profile_url || '')
  if (p.channelId) return p.channelId
  const handle = p.handle || (row.handle || '').replace(/^@/, '')
  if (handle) {
    const r = await fetch(`${API}/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${KEY}`)
    const d = await r.json()
    if (d.items?.[0]?.id) return d.items[0].id
  }
  const q = p.query || handle || row.profile_url
  if (q) {
    const r = await fetch(`${API}/search?part=snippet&type=channel&q=${encodeURIComponent(q)}&maxResults=1&key=${KEY}`)
    const d = await r.json()
    return d.items?.[0]?.snippet?.channelId ?? null
  }
  return null
}

async function fetchStats(channelId: string) {
  const r = await fetch(`${API}/channels?part=statistics&id=${channelId}&key=${KEY}`)
  const d = await r.json()
  const s = d.items?.[0]?.statistics
  if (!s) return null
  return {
    followers: Number(s.subscriberCount || 0),
    views: Number(s.viewCount || 0),
    posts_count: Number(s.videoCount || 0),
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (!KEY) return json({ error: '未配置 YOUTUBE_API_KEY' }, 400)

  const { scope = 'all' } = await req.json().catch(() => ({}))
  const db = admin()
  const targets: { table: string; type: 'account' | 'competitor' }[] = []
  if (scope === 'accounts' || scope === 'all') targets.push({ table: 'accounts', type: 'account' })
  if (scope === 'competitors' || scope === 'all') targets.push({ table: 'competitors', type: 'competitor' })

  let processed = 0, failed = 0
  for (const t of targets) {
    const { data: rows } = await db.from(t.table).select('*').ilike('platform', 'youtube')
    for (const row of rows ?? []) {
      try {
        const cid = await resolveChannelId(row)
        if (!cid) { failed++; continue }
        const stats = await fetchStats(cid)
        if (!stats) { failed++; continue }
        const upd: Record<string, unknown> = {
          external_id: cid,
          followers: stats.followers,
          last_synced_at: new Date().toISOString(),
        }
        if (t.table === 'accounts') upd.connected = true          // 账号表专有列
        if (t.table === 'competitors') upd.posts_count = stats.posts_count  // 竞品表专有列
        await db.from(t.table).update(upd).eq('id', row.id)
        await snapshot(db, t.type, row.id, 'youtube', stats)
        processed++
      } catch (_e) { failed++ }
    }
  }
  await writeLog(db, 'youtube', scope, failed ? 'partial' : 'success', processed, failed)
  return json({ platform: 'youtube', scope, processed, failed })
})
