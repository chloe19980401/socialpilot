import { admin, json, corsHeaders } from '../_shared/util.ts'

const GRAPH = Deno.env.get('META_GRAPH_URL') || 'https://graph.facebook.com/v23.0'
const IG_TOKEN = Deno.env.get('IG_ACCESS_TOKEN') || ''
const FB_TOKEN = Deno.env.get('FB_ACCESS_TOKEN') || IG_TOKEN

type Json = Record<string, any>

class PublishError extends Error {
  blocked: boolean
  data?: Json
  constructor(message: string, blocked = false, data?: Json) {
    super(message); this.blocked = blocked; this.data = data
  }
}

async function api(url: string, init?: RequestInit) {
  const response = await fetch(url, init)
  const data = await response.json().catch(() => ({}))
  const apiError = data?.error && data.error.code !== 'ok'
  if (!response.ok || apiError) {
    const message = data?.error?.message || data?.error_description || data?.message || `HTTP ${response.status}`
    throw new PublishError(message, response.status === 401 || response.status === 403, data)
  }
  return data
}

function publicAsset(plan: Json, platform: string) {
  const type = String(plan.content_type || '').toLowerCase()
  const video = ['video', 'reels', 'story'].includes(type)
  const url = video ? plan.asset_url : (plan.thumbnail_url || plan.asset_url)
  if (!url) throw new PublishError(`${platform} 缺少${video ? '视频素材链接' : '图片链接'}`, true)
  let parsed: URL
  try { parsed = new URL(url) } catch { throw new PublishError('素材链接不是有效网址', true) }
  if (parsed.protocol !== 'https:') throw new PublishError('平台发布要求可公网访问的 HTTPS 素材链接', true)
  return { url, video, type }
}

async function pageToken(pageId: string) {
  if (!FB_TOKEN) throw new PublishError('未配置 Facebook 发布令牌', true)
  const d = await api(`${GRAPH}/${pageId}?fields=id,name,access_token&access_token=${encodeURIComponent(FB_TOKEN)}`)
  return d.access_token || FB_TOKEN
}

async function publishFacebook(plan: Json, account: Json) {
  if (!account.external_id) throw new PublishError('Facebook 账号缺少 Page ID', true)
  const media = publicAsset(plan, 'Facebook')
  const token = await pageToken(account.external_id)
  const params = new URLSearchParams({ access_token: token })
  if (media.video) {
    params.set('file_url', media.url); params.set('description', plan.content || plan.title || '')
    const d = await api(`${GRAPH}/${account.external_id}/videos`, { method: 'POST', body: params })
    return { external_id: String(d.id), processing: true, raw: d }
  }
  params.set('url', media.url); params.set('caption', plan.content || plan.title || '')
  const d = await api(`${GRAPH}/${account.external_id}/photos`, { method: 'POST', body: params })
  return { external_id: String(d.post_id || d.id), raw: d }
}

async function waitInstagramContainer(id: string) {
  for (let i = 0; i < 6; i++) {
    const d = await api(`${GRAPH}/${id}?fields=status_code,status&access_token=${encodeURIComponent(IG_TOKEN)}`)
    if (d.status_code === 'FINISHED') return
    if (d.status_code === 'ERROR' || d.status_code === 'EXPIRED') throw new PublishError(d.status || `Instagram 容器状态：${d.status_code}`)
    await new Promise((resolve) => setTimeout(resolve, 1500))
  }
  throw new PublishError('Instagram 仍在处理素材，请稍后重试')
}

async function publishInstagram(plan: Json, account: Json) {
  if (!IG_TOKEN) throw new PublishError('未配置 Instagram 发布令牌', true)
  if (!account.external_id) throw new PublishError('Instagram 账号缺少 Business ID', true)
  const media = publicAsset(plan, 'Instagram')
  const params = new URLSearchParams({ access_token: IG_TOKEN, caption: plan.content || plan.title || '' })
  if (media.video) { params.set('media_type', 'REELS'); params.set('video_url', media.url); params.set('share_to_feed', 'true') }
  else params.set('image_url', media.url)
  const created = await api(`${GRAPH}/${account.external_id}/media`, { method: 'POST', body: params })
  if (media.video) await waitInstagramContainer(String(created.id))
  const published = await api(`${GRAPH}/${account.external_id}/media_publish`, {
    method: 'POST', body: new URLSearchParams({ access_token: IG_TOKEN, creation_id: String(created.id) }),
  })
  return { external_id: String(published.id), raw: published }
}

async function tiktokToken(db: ReturnType<typeof admin>) {
  const { data } = await db.from('tiktok_tokens').select('*').eq('id', 1).maybeSingle()
  if (!data?.access_token) throw new PublishError('TikTok 尚未授权', true)
  if (!String(data.scope || '').split(',').map((x: string) => x.trim()).includes('video.publish')) {
    throw new PublishError('TikTok 授权缺少 video.publish，请重新授权并勾选发布权限', true)
  }
  if (new Date(data.expires_at || 0).getTime() > Date.now() + 60_000) return data.access_token
  const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY') || ''
  const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET') || ''
  if (!clientKey || !clientSecret || !data.refresh_token) throw new PublishError('TikTok token 已过期且无法刷新', true)
  const refreshed = await api('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_key: clientKey, client_secret: clientSecret, grant_type: 'refresh_token', refresh_token: data.refresh_token }),
  })
  await db.from('tiktok_tokens').update({
    access_token: refreshed.access_token, refresh_token: refreshed.refresh_token || data.refresh_token,
    scope: refreshed.scope || data.scope,
    expires_at: new Date(Date.now() + Number(refreshed.expires_in || 0) * 1000).toISOString(), updated_at: new Date().toISOString(),
  }).eq('id', 1)
  return refreshed.access_token
}

async function publishTikTok(plan: Json, _account: Json, db: ReturnType<typeof admin>) {
  const token = await tiktokToken(db)
  const media = publicAsset(plan, 'TikTok')
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=UTF-8' }
  const creator = await api('https://open.tiktokapis.com/v2/post/publish/creator_info/query/', { method: 'POST', headers })
  const privacy = creator?.data?.privacy_level_options?.includes('PUBLIC_TO_EVERYONE') ? 'PUBLIC_TO_EVERYONE' : creator?.data?.privacy_level_options?.[0]
  if (!privacy) throw new PublishError('TikTok 未返回可用的发布隐私级别', true, creator)
  const title = String(plan.content || plan.title || '').slice(0, 2200)
  const endpoint = media.video ? 'video/init/' : 'content/init/'
  const body = media.video ? {
    post_info: { title, privacy_level: privacy, disable_duet: false, disable_comment: false, disable_stitch: false },
    source_info: { source: 'PULL_FROM_URL', video_url: media.url },
  } : {
    post_info: { title: String(plan.title || '').slice(0, 90), description: title, privacy_level: privacy, disable_comment: false, auto_add_music: true },
    source_info: { source: 'PULL_FROM_URL', photo_cover_index: 0, photo_images: [media.url] }, post_mode: 'DIRECT_POST', media_type: 'PHOTO',
  }
  const d = await api(`https://open.tiktokapis.com/v2/post/publish/${endpoint}`, { method: 'POST', headers, body: JSON.stringify(body) })
  if (d?.error?.code && d.error.code !== 'ok') throw new PublishError(d.error.message || d.error.code, false, d)
  return { external_id: String(d?.data?.publish_id || ''), processing: true, raw: d }
}

async function googleAccessToken() {
  const clientId = Deno.env.get('YOUTUBE_CLIENT_ID') || ''
  const clientSecret = Deno.env.get('YOUTUBE_CLIENT_SECRET') || ''
  const refreshToken = Deno.env.get('YOUTUBE_REFRESH_TOKEN') || ''
  if (!clientId || !clientSecret || !refreshToken) throw new PublishError('YouTube 仅配置了数据 API Key，尚缺上传所需的 OAuth refresh token', true)
  const d = await api('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' }),
  })
  return d.access_token
}

async function publishYouTube(plan: Json, _account: Json) {
  const media = publicAsset(plan, 'YouTube')
  if (!media.video) throw new PublishError('YouTube 当前只支持发布视频', true)
  const token = await googleAccessToken()
  const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': 'video/*' },
    body: JSON.stringify({ snippet: { title: String(plan.title || '未命名视频').slice(0, 100), description: plan.content || '' }, status: { privacyStatus: 'public', selfDeclaredMadeForKids: false } }),
  })
  if (!init.ok) throw new PublishError((await init.json().catch(() => ({})))?.error?.message || `YouTube 初始化上传失败 HTTP ${init.status}`)
  const location = init.headers.get('location')
  if (!location) throw new PublishError('YouTube 未返回上传地址')
  const source = await fetch(media.url)
  if (!source.ok || !source.body) throw new PublishError(`无法读取视频素材 HTTP ${source.status}`)
  const uploaded = await api(location, { method: 'PUT', headers: { 'Content-Type': source.headers.get('content-type') || 'video/mp4' }, body: source.body })
  return { external_id: String(uploaded.id), published_url: `https://youtu.be/${uploaded.id}`, raw: uploaded }
}

async function publish(platform: string, plan: Json, account: Json, db: ReturnType<typeof admin>) {
  if (platform === 'facebook') return publishFacebook(plan, account)
  if (platform === 'instagram') return publishInstagram(plan, account)
  if (platform === 'tiktok') return publishTikTok(plan, account, db)
  if (platform === 'youtube') return publishYouTube(plan, account)
  throw new PublishError(`暂不支持平台：${platform}`, true)
}

async function capabilities(platform: string, account: Json, db: ReturnType<typeof admin>) {
  if (platform === 'facebook') {
    if (!account.external_id) throw new PublishError('缺少 Facebook Page ID', true)
    await pageToken(account.external_id)
    return { ready: true, message: 'Facebook Page 发布授权可用' }
  }
  if (platform === 'instagram') {
    if (!IG_TOKEN || !account.external_id) throw new PublishError('缺少 Instagram 发布令牌或 Business ID', true)
    await api(`${GRAPH}/${account.external_id}?fields=id,username&access_token=${encodeURIComponent(IG_TOKEN)}`)
    return { ready: true, message: 'Instagram 内容发布授权可用' }
  }
  if (platform === 'tiktok') {
    const token = await tiktokToken(db)
    const d = await api('https://open.tiktokapis.com/v2/post/publish/creator_info/query/', {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=UTF-8' },
    })
    return { ready: true, message: 'TikTok Direct Post 授权可用', privacy_levels: d?.data?.privacy_level_options || [] }
  }
  if (platform === 'youtube') {
    await googleAccessToken()
    return { ready: true, message: 'YouTube 视频上传授权可用' }
  }
  throw new PublishError(`暂不支持平台：${platform}`, true)
}

async function checkProcessing(job: Json, account: Json, db: ReturnType<typeof admin>) {
  if (!job.external_id) throw new PublishError('平台没有返回发布任务 ID')
  if (job.platform === 'tiktok') {
    const token = await tiktokToken(db)
    const d = await api('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ publish_id: job.external_id }),
    })
    const value = d?.data?.status
    if (value === 'PUBLISH_COMPLETE') return { complete: true, raw: d }
    if (value === 'FAILED') throw new PublishError(`TikTok 发布失败：${d?.data?.fail_reason || '未知原因'}`)
    return { complete: false, raw: d }
  }
  if (job.platform === 'facebook') {
    const token = await pageToken(account.external_id)
    const d = await api(`${GRAPH}/${job.external_id}?fields=status,permalink_url&access_token=${encodeURIComponent(token)}`)
    const value = d?.status?.video_status || d?.status?.uploading_phase?.status
    if (['ready', 'complete', 'completed'].includes(String(value).toLowerCase())) return { complete: true, raw: d, published_url: d.permalink_url }
    if (['error', 'failed'].includes(String(value).toLowerCase())) throw new PublishError('Facebook 视频处理失败')
    return { complete: false, raw: d }
  }
  return { complete: true, raw: job.response_data || {} }
}

async function authorize(req: Request, db: ReturnType<typeof admin>, plan: Json) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) throw new PublishError('请先登录', true)
  const { data: { user }, error } = await db.auth.getUser(token)
  if (error || !user) throw new PublishError('登录已失效，请重新登录', true)
  const { data: profile } = await db.from('profiles').select('role,email,disabled_at').eq('id', user.id).maybeSingle()
  if (profile?.disabled_at) throw new PublishError('账号已被禁用', true)
  const owner = String(plan.assignee_email || '').trim().toLowerCase() === String(profile?.email || user.email || '').trim().toLowerCase()
  if (profile?.role !== 'admin' && !(profile?.role === 'operator' && owner)) throw new PublishError('只有管理员或该排期负责人可以发布', true)
  return user
}

async function syncPlan(db: ReturnType<typeof admin>, plan: Json) {
  const { data: done } = await db.from('publication_jobs').select('account_id').eq('plan_id', plan.id).eq('status', 'published')
  const published = [...new Set([...(plan.published_account_ids || []), ...(done || []).map((x: Json) => x.account_id)])]
  const targets = plan.account_ids?.length ? plan.account_ids : (plan.account_id ? [plan.account_id] : [])
  const allDone = targets.length > 0 && targets.every((id: string) => published.includes(id))
  await db.from('content_plans').update({ published_account_ids: published, ...(allDone ? { status: 'published' } : {}) }).eq('id', plan.id)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const db = admin()
  try {
    const body = await req.json()
    const { plan_id, account_id, action = 'publish' } = body || {}
    if (!plan_id || !account_id) return json({ error: '缺少 plan_id / account_id' }, 400)
    const { data: plan } = await db.from('content_plans').select('*').eq('id', plan_id).maybeSingle()
    const { data: account } = await db.from('accounts').select('*').eq('id', account_id).maybeSingle()
    if (!plan || !account) return json({ error: '排期或账号不存在' }, 404)
    const user = await authorize(req, db, plan)
    const targets = plan.account_ids?.length ? plan.account_ids : (plan.account_id ? [plan.account_id] : [])
    if (!targets.includes(account.id)) throw new PublishError('该账号不在排期发布目标中', true)
    if (action === 'capabilities') {
      const result = await capabilities(String(account.platform).toLowerCase(), account, db)
      return json({ ok: true, platform: account.platform, ...result })
    }
    if (plan.status !== 'approved' && plan.status !== 'published') throw new PublishError('帖子审核通过后才能发布', true)

    const scheduledAt = plan.scheduled_at || new Date().toISOString()
    const { data: job } = await db.from('publication_jobs').upsert({
      plan_id: plan.id, account_id: account.id, platform: account.platform,
      scheduled_at: scheduledAt, requested_by: user.id,
      ...(action === 'schedule' ? { status: 'queued', error_message: null } : {}),
    }, { onConflict: 'plan_id,account_id' }).select().single()
    if (action === 'schedule') return json({ ok: true, job })
    if (action === 'check') {
      if (job?.status !== 'processing') return json({ ok: true, job })
      try {
        const checked = await checkProcessing(job, account, db)
        const values = checked.complete
          ? { status: 'published', response_data: checked.raw || {}, published_url: checked.published_url || job.published_url, published_at: new Date().toISOString(), error_message: null }
          : { response_data: checked.raw || {} }
        const { data: updated } = await db.from('publication_jobs').update(values).eq('id', job.id).select().single()
        if (checked.complete) await syncPlan(db, plan)
        return json({ ok: true, job: updated })
      } catch (e) {
        const err = e as PublishError
        const { data: updated } = await db.from('publication_jobs').update({ status: 'failed', error_message: err.message }).eq('id', job.id).select().single()
        return json({ ok: false, error: err.message, job: updated }, 502)
      }
    }
    if (job?.status === 'published') return json({ ok: true, job, already_published: true })

    await db.from('publication_jobs').update({ status: 'publishing', error_message: null, attempts: Number(job?.attempts || 0) + 1, started_at: new Date().toISOString() }).eq('id', job.id)
    try {
      const result = await publish(String(account.platform).toLowerCase(), plan, account, db)
      const status = result.processing ? 'processing' : 'published'
      const values = {
        status, external_id: result.external_id || null, published_url: result.published_url || null,
        response_data: result.raw || {}, published_at: status === 'published' ? new Date().toISOString() : null,
      }
      const { data: updated } = await db.from('publication_jobs').update(values).eq('id', job.id).select().single()
      if (status === 'published') await syncPlan(db, plan)
      return json({ ok: true, job: updated })
    } catch (e) {
      const err = e as PublishError
      const status = err.blocked ? 'blocked' : 'failed'
      const { data: updated } = await db.from('publication_jobs').update({ status, error_message: err.message, response_data: err.data || {} }).eq('id', job.id).select().single()
      return json({ ok: false, error: err.message, job: updated }, err.blocked ? 400 : 502)
    }
  } catch (e) {
    const err = e as PublishError
    return json({ ok: false, error: err.message || String(e) }, err.blocked ? 403 : 500)
  }
})
