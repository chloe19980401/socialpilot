// =============================================================
// sync-post-metrics · 一键同步帖子（YouTube）
//  1) 导入频道最近的视频为帖子：按 external_id 去重，同一视频只导一次
//  2) 刷新已有帖子互动量：播放/点赞/评论；标题留空则回填
// 只更新/新增，绝不产生重复帖子。需要 YOUTUBE_API_KEY。
// 调用：POST {}（内容中心「一键同步互动数据」按钮）
// =============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
const admin = () => createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })

const API = 'https://www.googleapis.com/youtube/v3'
const KEY = Deno.env.get('YOUTUBE_API_KEY') ?? ''

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out
}
// 取字符串到第一个 / ? # 之前（代替正则，避免部署转义问题）
function firstSeg(s: string): string {
  let out = ''
  for (const c of s) { if (c === '/' || c === '?' || c === '#') break; out += c }
  return out
}
function parseYouTubeUrl(url: string): { channelId?: string; handle?: string; query?: string } {
  const u = String(url || '')
  let i = u.indexOf('/channel/'); if (i >= 0) return { channelId: firstSeg(u.slice(i + 9)) }
  i = u.indexOf('/@'); if (i >= 0) return { handle: firstSeg(u.slice(i + 2)) }
  i = u.indexOf('/c/'); if (i >= 0) return { query: firstSeg(u.slice(i + 3)) }
  i = u.indexOf('/user/'); if (i >= 0) return { query: firstSeg(u.slice(i + 6)) }
  return {}
}
async function resolveChannelId(row: any): Promise<string | null> {
  if (row.external_id) return row.external_id
  const p = parseYouTubeUrl(row.profile_url || '')
  if (p.channelId) return p.channelId
  let handle = p.handle || (row.handle || '')
  if (handle.startsWith('@')) handle = handle.slice(1)
  if (handle) {
    const r = await fetch(`${API}/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${KEY}`)
    const d = await r.json(); if (d.items?.[0]?.id) return d.items[0].id
  }
  const q = p.query || handle || row.profile_url
  if (q) {
    const r = await fetch(`${API}/search?part=snippet&type=channel&q=${encodeURIComponent(q)}&maxResults=1&key=${KEY}`)
    const d = await r.json(); return d.items?.[0]?.snippet?.channelId ?? null
  }
  return null
}
async function uploadsPlaylist(channelId: string): Promise<string | null> {
  const r = await fetch(`${API}/channels?part=contentDetails&id=${channelId}&key=${KEY}`)
  const d = await r.json()
  return d.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null
}
async function recentVideoIds(playlistId: string, max = 50): Promise<string[]> {
  const r = await fetch(`${API}/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=${max}&key=${KEY}`)
  const d = await r.json()
  return (d.items ?? []).map((i: any) => i.contentDetails?.videoId).filter(Boolean)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (!KEY) return json({ error: '未配置 YOUTUBE_API_KEY' }, 400)
  const db = admin()

  // 已有 youtube 帖子：external_id -> post（用于去重与刷新）
  const { data: existing } = await db.from('posts').select('id, external_id, title').ilike('platform', 'youtube')
  const postByExt: Record<string, any> = {}
  for (const p of existing ?? []) if (p.external_id) postByExt[p.external_id] = p

  // 我方 youtube 账号
  const { data: accounts } = await db.from('accounts').select('id, brand_id, external_id, handle, profile_url').ilike('platform', 'youtube')

  // 目标视频：各账号最近视频（记账号归属，用于新导入）+ 已有帖子的 external_id（仅刷新）
  const owner: Record<string, { account_id: string; brand_id: string | null }> = {}
  const targetIds = new Set<string>(Object.keys(postByExt))
  let accFailed = 0
  for (const a of accounts ?? []) {
    try {
      const cid = await resolveChannelId(a)
      if (!cid) { accFailed++; continue }
      const up = await uploadsPlaylist(cid)
      if (!up) { accFailed++; continue }
      const vids = await recentVideoIds(up, 50)
      for (const v of vids) { targetIds.add(v); if (!owner[v]) owner[v] = { account_id: a.id, brand_id: a.brand_id } }
    } catch (_e) { accFailed++ }
  }

  const ids = [...targetIds]
  let updated = 0, imported = 0, failed = 0
  for (const group of chunk(ids, 50)) {
    try {
      const r = await fetch(`${API}/videos?part=statistics,snippet&id=${encodeURIComponent(group.join(','))}&key=${KEY}`)
      const d = await r.json()
      const byId: Record<string, any> = {}
      for (const it of d.items ?? []) byId[it.id] = it
      for (const vid of group) {
        const it = byId[vid]
        if (!it) { if (postByExt[vid]) failed++; continue }   // 私有/已删，跳过不动原数据
        const s = it.statistics || {}
        const views = Number(s.viewCount || 0), likes = Number(s.likeCount || 0), comments = Number(s.commentCount || 0)
        const existP = postByExt[vid]
        if (existP) {
          const upd: Record<string, unknown> = { views, likes, comments }
          if (!existP.title && it.snippet?.title) upd.title = it.snippet.title
          await db.from('posts').update(upd).eq('id', existP.id)
          updated++
        } else if (owner[vid]) {
          const sn = it.snippet || {}
          const thumb = sn.thumbnails?.medium?.url || sn.thumbnails?.high?.url || sn.thumbnails?.default?.url || null
          await db.from('posts').insert({
            external_id: vid, platform: 'youtube', title: sn.title || null,
            url: `https://www.youtube.com/watch?v=${vid}`, thumbnail_url: thumb,
            published_at: sn.publishedAt || null,
            brand_id: owner[vid].brand_id || null, account_id: owner[vid].account_id || null,
            views, likes, comments, status: 'published',
          })
          postByExt[vid] = { id: null, external_id: vid }  // 防同批重复
          imported++
        }
      }
    } catch (_e) { failed += group.length }
  }

  try {
    await db.from('sync_logs').insert({ platform: 'youtube', scope: 'post-metrics', status: (failed || accFailed) ? 'partial' : 'success', processed: updated + imported, failed })
  } catch (_e) { /* ignore */ }
  return json({ platform: 'youtube', scope: 'post-metrics', updated, imported, failed, accounts: (accounts ?? []).length, accFailed })
})
