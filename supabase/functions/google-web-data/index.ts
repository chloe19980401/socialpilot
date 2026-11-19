import { admin, corsHeaders, json } from '../_shared/util.ts'

const clientId = () => Deno.env.get('GOOGLE_WEB_CLIENT_ID') || Deno.env.get('YT_ANALYTICS_CLIENT_ID') || Deno.env.get('YOUTUBE_CLIENT_ID') || ''
const clientSecret = () => Deno.env.get('GOOGLE_WEB_CLIENT_SECRET') || Deno.env.get('YT_ANALYTICS_CLIENT_SECRET') || Deno.env.get('YOUTUBE_CLIENT_SECRET') || ''

async function userContext(req: Request) {
  const auth = req.headers.get('authorization') || ''
  if (!auth.startsWith('Bearer ')) return null
  const db = admin()
  const { data: { user } } = await db.auth.getUser(auth.slice(7))
  if (!user) return null
  const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle()
  return { user, role: profile?.role || '' }
}

async function accessToken(refreshToken: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId(), client_secret: clientSecret(), refresh_token: refreshToken, grant_type: 'refresh_token' }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error_description || data?.error || 'Google token 刷新失败')
  return data.access_token as string
}

async function googleJson(url: string, token: string, init: RequestInit = {}) {
  const response = await fetch(url, { ...init, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers || {}) } })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data?.error?.message || `Google API HTTP ${response.status}`)
  return data
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const ctx = await userContext(req)
  if (!ctx) return json({ error: '未登录' }, 401)
  const body = await req.json().catch(() => ({}))
  const action = body.action || 'status'
  const db = admin()
  const { data: connection } = await db.from('oauth_sessions')
    .select('*')
    .ilike('scope', '%analytics.readonly%')
    .ilike('scope', '%webmasters.readonly%')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (action === 'status') {
    if (!connection) return json({ connected: false })
    if (!clientId() || !clientSecret()) return json({ connected: false, reconnect_required: true, error: 'Google OAuth 客户端未配置' })
    try {
      await accessToken(connection.refresh_token)
      return json({
        connected: true,
        google_email: connection.user_email || null,
        connected_at: connection.created_at || null,
      })
    } catch (e) {
      return json({
        connected: false,
        reconnect_required: true,
        error: e instanceof Error ? e.message : String(e),
      })
    }
  }
  if (!connection) return json({ error: '尚未连接 Google' }, 409)
  if (!clientId() || !clientSecret()) return json({ error: 'Google OAuth 客户端未配置' }, 503)

  try {
    const token = await accessToken(connection.refresh_token)
    if (action === 'discover') {
      if (ctx.role !== 'admin') return json({ error: '仅管理员可配置数据源' }, 403)
      const [analytics, search] = await Promise.all([
        googleJson('https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200', token),
        googleJson('https://www.googleapis.com/webmasters/v3/sites', token),
      ])
      const properties = (analytics.accountSummaries || []).flatMap((account: any) => (account.propertySummaries || []).map((p: any) => ({
        id: String(p.property || '').replace('properties/', ''), name: p.displayName || p.property, account: account.displayName || '',
      })))
      const sites = (search.siteEntry || []).map((s: any) => ({ url: s.siteUrl, permission: s.permissionLevel }))
      return json({ properties, sites })
    }
    if (action === 'report') {
      const propertyId = String(body.ga_property_id || '').replace('properties/', '')
      const siteUrl = String(body.gsc_site_url || '')
      if (!propertyId || !siteUrl) return json({ error: '请先选择 GA4 属性和 GSC 站点' }, 409)
      const days = Math.min(365, Math.max(7, Number(body.days) || 28))
      const end = new Date(); end.setUTCDate(end.getUTCDate() - 1)
      const start = new Date(end); start.setUTCDate(start.getUTCDate() - days + 1)
      const date = (d: Date) => d.toISOString().slice(0, 10)
      const startDate = date(start); const endDate = date(end)
      const gaBody = {
        dateRanges: [{ startDate, endDate }], dimensions: [{ name: 'date' }],
        metrics: ['activeUsers', 'sessions', 'screenPageViews', 'engagedSessions', 'newUsers'].map((name) => ({ name })),
        orderBys: [{ dimension: { dimensionName: 'date' } }], limit: 400,
      }
      const gscBase = { startDate, endDate, type: 'web', dataState: 'all' }
      const site = encodeURIComponent(siteUrl)
      const [ga, gscDaily, gscQueries, gscPages] = await Promise.all([
        googleJson(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, token, { method: 'POST', body: JSON.stringify(gaBody) }),
        googleJson(`https://www.googleapis.com/webmasters/v3/sites/${site}/searchAnalytics/query`, token, { method: 'POST', body: JSON.stringify({ ...gscBase, dimensions: ['date'], rowLimit: 400 }) }),
        googleJson(`https://www.googleapis.com/webmasters/v3/sites/${site}/searchAnalytics/query`, token, { method: 'POST', body: JSON.stringify({ ...gscBase, dimensions: ['query'], rowLimit: 10 }) }),
        googleJson(`https://www.googleapis.com/webmasters/v3/sites/${site}/searchAnalytics/query`, token, { method: 'POST', body: JSON.stringify({ ...gscBase, dimensions: ['page'], rowLimit: 10 }) }),
      ])
      const gaDaily = (ga.rows || []).map((r: any) => {
        const rawDate = r.dimensionValues?.[0]?.value || ''
        return {
        date: rawDate.length === 8 ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}` : rawDate, activeUsers: Number(r.metricValues?.[0]?.value || 0), sessions: Number(r.metricValues?.[1]?.value || 0),
        views: Number(r.metricValues?.[2]?.value || 0), engagedSessions: Number(r.metricValues?.[3]?.value || 0), newUsers: Number(r.metricValues?.[4]?.value || 0),
      }})
      const searchDaily = (gscDaily.rows || []).map((r: any) => ({ date: r.keys?.[0] || '', clicks: Number(r.clicks || 0), impressions: Number(r.impressions || 0), ctr: Number(r.ctr || 0), position: Number(r.position || 0) }))
      const top = (rows: any[] = []) => rows.map((r: any) => ({ key: r.keys?.[0] || '', clicks: Number(r.clicks || 0), impressions: Number(r.impressions || 0), ctr: Number(r.ctr || 0), position: Number(r.position || 0) }))
      return json({ startDate, endDate, gaDaily, searchDaily, topQueries: top(gscQueries.rows), topPages: top(gscPages.rows) })
    }
    return json({ error: '未知操作' }, 400)
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 502)
  }
})

