import { admin, json, corsHeaders, writeLog } from '../_shared/util.ts'

const GRAPH = 'https://graph.facebook.com/v19.0'
const TOKEN = Deno.env.get('FB_ACCESS_TOKEN') || Deno.env.get('IG_ACCESS_TOKEN') || ''

function ids(value: string): string[] {
  const raw = String(value || '')
  const found = raw.match(/\d{8,}/g) ?? []
  try {
    const u = new URL(raw)
    for (const key of ['fbid', 'story_fbid', 'v']) {
      const v = u.searchParams.get(key); if (v) found.unshift(v)
    }
  } catch { /* not a URL */ }
  return [...new Set(found)]
}

function canonicalUrl(html: string): string {
  const match = html.match(/<meta[^>]+(?:property|name)=["'](?:og:url|twitter:url)["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
  return match?.[1]?.replace(/&amp;/g, '&') || ''
}

async function candidatesFor(post: any): Promise<string[]> {
  // Prefer the current URL over a previously stored external_id. This avoids
  // refreshing the old Facebook object after an operator replaces the link.
  const urlIds = ids(post.url || '')
  if (urlIds.length) return [...new Set([...urlIds, ...ids(post.external_id || '')])]
  if (!post.url) return ids(post.external_id || '')
  try {
    const r = await fetch(post.url.trim(), {
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    const finalIds = ids(r.url)
    if (finalIds.length) return [...new Set([...finalIds, ...ids(post.external_id || '')])]
    const canonical = canonicalUrl(await r.text())
    return [...new Set([...ids(canonical), ...ids(post.external_id || '')])]
  } catch {
    return ids(post.external_id || '')
  }
}

async function graphObject(id: string) {
  const common = 'id,created_time,likes.limit(0).summary(true),comments.limit(0).summary(true)'
  const fieldSets = [
    `${common},description,permalink_url,views`,
    `${common},message,permalink_url,shares`,
    `${common},name,link`,
  ]
  let lastError = ''
  for (const fields of fieldSets) {
    const r = await fetch(`${GRAPH}/${id}?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(TOKEN)}`)
    const d = await r.json()
    if (!d.error) return d
    lastError = d.error.message || `Facebook object ${id} failed`
  }
  throw new Error(lastError)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (!TOKEN) return json({ error: '未配置 FB_ACCESS_TOKEN / IG_ACCESS_TOKEN' }, 400)
  const { scope = 'accounts' } = await req.json().catch(() => ({}))
  if (scope === 'competitors') return json({ platform: 'facebook', scope, processed: 0, failed: 0 })

  const db = admin()
  const { data: accounts } = await db.from('accounts').select('*').ilike('platform', 'facebook')
  const { data: posts } = await db.from('posts').select('id, url, external_id, title, published_at, likes, comments, shares, views').ilike('platform', 'facebook')
  let processed = 0, failed = 0, postsRefreshed = 0
  const errors: string[] = []

  // The current Meta token can read known Page objects but lacks
  // pages_read_engagement for /PAGE/feed. Query each stored object id directly.
  for (const post of posts ?? []) {
    const candidates = await candidatesFor(post)
    if (!candidates.length) {
      failed++
      errors.push(`${post.id}: 无法从 Facebook 分享链接解析帖子 ID`)
      continue
    }
    let item: any = null
    let lastError = ''
    for (const id of candidates) {
      try { item = await graphObject(id); break }
      catch (e) { lastError = String(e?.message || e) }
    }
    if (!item) {
      failed++
      if (lastError) errors.push(`${post.id}: ${lastError}`)
      // A temporary Graph error must never erase the last successfully synced
      // metrics. Keep the existing snapshot and report the failure in sync_logs.
      continue
    }
    const update: Record<string, unknown> = { external_id: String(item.id) }
    if (item.permalink_url || item.link) update.url = item.permalink_url || item.link
    const title = (item.message || item.title || item.description || item.name)?.slice(0, 200)
    if (title) update.title = title
    if (item.created_time) update.published_at = item.created_time
    if (item.likes?.summary?.total_count != null) update.likes = Number(item.likes.summary.total_count)
    if (item.comments?.summary?.total_count != null) update.comments = Number(item.comments.summary.total_count)
    if (item.shares?.count != null) update.shares = Number(item.shares.count)
    // Meta does not expose playback for every object type or token scope.
    // Missing means unknown, not zero: preserve the last successful value.
    if (item.views != null) update.views = Number(item.views)
    await db.from('posts').update(update).eq('id', post.id)
    postsRefreshed++
  }

  if ((accounts ?? []).length) {
    await db.from('accounts').update({ connected: true, last_synced_at: new Date().toISOString() }).ilike('platform', 'facebook')
    processed = 1
  }
  const message = `posts_refreshed=${postsRefreshed}${errors.length ? `; ${errors.slice(0, 3).join(' | ')}` : ''}`
  await writeLog(db, 'facebook', scope, failed && !postsRefreshed ? 'partial' : 'success', processed, failed, message)
  return json({ platform: 'facebook', scope, processed, failed, posts_refreshed: postsRefreshed, errors: errors.slice(0, 5) })
})
