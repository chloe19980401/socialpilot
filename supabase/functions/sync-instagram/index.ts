// =============================================================
// sync-instagram · 用 Instagram Graph API 拉数据
//  · 竞品：business_discovery 可按用户名查任意「公开商业号」的粉丝/贴文数
//  · 自有账号：直接读绑定商业号的 followers_count / media_count
// 需要环境变量：
//   IG_ACCESS_TOKEN   —— 长期有效的 Page/User Token（含 instagram_basic 等权限）
//   IG_BUSINESS_ID    —— 你自己的 IG 商业号在 Graph 里的 user id
// 部署：supabase functions deploy sync-instagram
// 调用：POST { "scope": "accounts" | "competitors" | "all" }
// =============================================================
import { admin, json, corsHeaders, snapshot, writeLog } from '../_shared/util.ts'

const GRAPH = 'https://graph.facebook.com/v19.0'
const TOKEN = Deno.env.get('IG_ACCESS_TOKEN') ?? ''
const IG_ID = Deno.env.get('IG_BUSINESS_ID') ?? ''

// 竞品：business_discovery 按用户名查公开商业号
async function discover(username: string) {
  const fields = `business_discovery.username(${username}){followers_count,media_count,name}`
  const r = await fetch(`${GRAPH}/${IG_ID}?fields=${encodeURIComponent(fields)}&access_token=${TOKEN}`)
  const d = await r.json()
  const bd = d.business_discovery
  if (!bd) return null
  return { followers: Number(bd.followers_count || 0), posts_count: Number(bd.media_count || 0), name: bd.name }
}

// 自有账号：external_id = 该商业号的 ig user id
async function ownStats(igUserId: string) {
  const r = await fetch(`${GRAPH}/${igUserId}?fields=followers_count,media_count&access_token=${TOKEN}`)
  const d = await r.json()
  if (d.error) return null
  return { followers: Number(d.followers_count || 0), posts_count: Number(d.media_count || 0) }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (!TOKEN || !IG_ID) return json({ error: '未配置 IG_ACCESS_TOKEN / IG_BUSINESS_ID' }, 400)

  const { scope = 'all' } = await req.json().catch(() => ({}))
  const db = admin()
  let processed = 0, failed = 0

  if (scope === 'competitors' || scope === 'all') {
    const { data: rows } = await db.from('competitors').select('*').ilike('platform', 'instagram')
    for (const row of rows ?? []) {
      try {
        const uname = (row.handle || '').replace(/^@/, '')
        if (!uname) { failed++; continue }
        const s = await discover(uname)
        if (!s) { failed++; continue }
        await db.from('competitors').update({ followers: s.followers, posts_count: s.posts_count, last_synced_at: new Date().toISOString() }).eq('id', row.id)
        await snapshot(db, 'competitor', row.id, 'instagram', s)
        processed++
      } catch (_e) { failed++ }
    }
  }

  if (scope === 'accounts' || scope === 'all') {
    const { data: rows } = await db.from('accounts').select('*').ilike('platform', 'instagram')
    for (const row of rows ?? []) {
      try {
        if (!row.external_id) { failed++; continue }  // 需先填该商业号的 ig user id
        const s = await ownStats(row.external_id)
        if (!s) { failed++; continue }
        await db.from('accounts').update({ followers: s.followers, connected: true, last_synced_at: new Date().toISOString() }).eq('id', row.id)
        await snapshot(db, 'account', row.id, 'instagram', s)
        processed++
      } catch (_e) { failed++ }
    }
  }

  await writeLog(db, 'instagram', scope, failed ? 'partial' : 'success', processed, failed)
  return json({ platform: 'instagram', scope, processed, failed })
})
