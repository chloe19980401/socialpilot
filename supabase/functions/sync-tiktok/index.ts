// =============================================================
// sync-tiktok · TikTok 数据同步
//
// ⚠️ 重要现实限制：
//  · TikTok 官方开放接口（Display API / Business API）只能读取「已授权登录的
//    那个账号自己」的数据，无法按用户名查任意竞品的公开粉丝数。
//  · 因此竞品的 TikTok 数据无法通过官方合规接口自动抓取，只能手动录入，
//    或接入第三方数据商（如 social blade / 付费 API，各有 ToS 风险）。
//
// 本函数实现「自有账号」的官方拉取（OAuth 授权后拿 access_token）：
// 需要环境变量：
//   TIKTOK_ACCESS_TOKEN  —— 通过 TikTok Login Kit OAuth 拿到的用户 token
// 部署：supabase functions deploy sync-tiktok
// 调用：POST { "scope": "accounts" }
// =============================================================
import { admin, json, corsHeaders, snapshot, writeLog } from '../_shared/util.ts'

const TOKEN = Deno.env.get('TIKTOK_ACCESS_TOKEN') ?? ''

// Display API：读取已授权用户的公开资料统计
async function ownStats() {
  const fields = 'follower_count,likes_count,video_count'
  const r = await fetch(`https://open.tiktokapis.com/v2/user/info/?fields=${fields}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  })
  const d = await r.json()
  const u = d?.data?.user
  if (!u) return null
  return { followers: Number(u.follower_count || 0), likes: Number(u.likes_count || 0), posts_count: Number(u.video_count || 0) }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (!TOKEN) return json({ error: '未配置 TIKTOK_ACCESS_TOKEN（需先做 OAuth 授权）' }, 400)

  const { scope = 'accounts' } = await req.json().catch(() => ({}))
  const db = admin()
  let processed = 0, failed = 0

  if (scope === 'competitors') {
    // 官方接口不支持，直接返回说明
    await writeLog(db, 'tiktok', 'competitors', 'error', 0, 0, '官方接口不支持抓取任意竞品，需手动录入或第三方数据商')
    return json({ platform: 'tiktok', scope, processed: 0, failed: 0, note: '竞品 TikTok 数据无法通过官方接口自动抓取' })
  }

  // 自有账号：本 token 对应的那个账号。约定 accounts 表里存一个 platform=tiktok 且 connected 的主号
  const { data: rows } = await db.from('accounts').select('*').ilike('platform', 'tiktok').limit(1)
  const row = rows?.[0]
  if (row) {
    try {
      const s = await ownStats()
      if (s) {
        await db.from('accounts').update({ followers: s.followers, connected: true, last_synced_at: new Date().toISOString() }).eq('id', row.id)
        await snapshot(db, 'account', row.id, 'tiktok', s)
        processed++
      } else failed++
    } catch (_e) { failed++ }
  }

  await writeLog(db, 'tiktok', scope, failed ? 'partial' : 'success', processed, failed)
  return json({ platform: 'tiktok', scope, processed, failed })
})
