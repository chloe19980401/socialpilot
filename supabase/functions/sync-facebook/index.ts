import { admin, json, corsHeaders, writeLog } from '../_shared/util.ts'

const GRAPH = 'https://graph.facebook.com/v19.0'
const TOKEN = Deno.env.get('FB_ACCESS_TOKEN') || Deno.env.get('IG_ACCESS_TOKEN') || ''

function normUrl(value: string): string {
  try {
    const u = new URL(value)
    return `${u.hostname.replace(/^www\./, '').toLowerCase()}${u.pathname.replace(/\/+$/, '').toLowerCase()}`
  } catch { return String(value || '').trim().toLowerCase() }
}

function idParts(value: string): string[] {
  return String(value || '').split(/[_/]/).filter(Boolean)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (!TOKEN) return json({ error: '未配置 FB_ACCESS_TOKEN / IG_ACCESS_TOKEN' }, 400)

  const { scope = 'accounts' } = await req.json().catch(() => ({}))
  if (scope === 'competitors') return json({ platform: 'facebook', scope, processed: 0, failed: 0 })

  const db = admin()
  const { data: accounts } = await db.from('accounts').select('*').ilike('platform', 'facebook')
  const { data: posts } = await db.from('posts').select('id, url, external_id').ilike('platform', 'facebook')
  let processed = 0, failed = 0, postsUpdated = 0

  for (const account of accounts ?? []) {
    if (!account.external_id) { failed++; continue }
    try {
      const fields = 'id,message,permalink_url,created_time,shares,likes.limit(0).summary(true),comments.limit(0).summary(true)'
      const r = await fetch(`${GRAPH}/${account.external_id}/posts?fields=${encodeURIComponent(fields)}&limit=100&access_token=${TOKEN}`)
      const payload = await r.json()
      if (payload.error) throw new Error(payload.error.message || 'Facebook posts request failed')

      for (const item of payload.data ?? []) {
        const apiIds = new Set(idParts(item.id))
        const apiUrl = normUrl(item.permalink_url || '')
        const post = (posts ?? []).find((p: any) => {
          const postIds = idParts(p.external_id)
          return postIds.some((id) => apiIds.has(id)) || (apiUrl && normUrl(p.url || '') === apiUrl)
        })
        if (!post) continue
        await db.from('posts').update({
          external_id: String(item.id),
          url: item.permalink_url || undefined,
          title: item.message ? item.message.slice(0, 200) : undefined,
          published_at: item.created_time || undefined,
          likes: Number(item.likes?.summary?.total_count || 0),
          comments: Number(item.comments?.summary?.total_count || 0),
          shares: Number(item.shares?.count || 0),
        }).eq('id', post.id)
        postsUpdated++
      }
      await db.from('accounts').update({ connected: true, last_synced_at: new Date().toISOString() }).eq('id', account.id)
      processed++
    } catch (_e) { failed++ }
  }

  await writeLog(db, 'facebook', scope, failed ? 'partial' : 'success', processed, failed, `posts_updated=${postsUpdated}`)
  return json({ platform: 'facebook', scope, processed, failed, posts_updated: postsUpdated })
})
