import { admin, json } from '../_shared/util.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}
const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-web-oauth`
const appUrl = Deno.env.get('APP_URL') || 'https://socialwonly.foreverdoodle.com/'
const clientId = () => Deno.env.get('GOOGLE_WEB_CLIENT_ID') || Deno.env.get('YT_ANALYTICS_CLIENT_ID') || Deno.env.get('YOUTUBE_CLIENT_ID') || ''
const clientSecret = () => Deno.env.get('GOOGLE_WEB_CLIENT_SECRET') || Deno.env.get('YT_ANALYTICS_CLIENT_SECRET') || Deno.env.get('YOUTUBE_CLIENT_SECRET') || ''

const encoder = new TextEncoder()
const b64url = (value: Uint8Array | string) => {
  const bytes = typeof value === 'string' ? encoder.encode(value) : value
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}
const fromB64url = (value: string) => atob(value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4))
async function sign(value: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(clientSecret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))))
}
async function createState(userId: string) {
  const payload = b64url(JSON.stringify({ userId, exp: Date.now() + 10 * 60 * 1000, nonce: crypto.randomUUID() }))
  return `${payload}.${await sign(payload)}`
}
async function verifyState(state: string) {
  const [payload, signature] = state.split('.')
  if (!payload || !signature || await sign(payload) !== signature) return null
  const decoded = JSON.parse(fromB64url(payload))
  return decoded.exp > Date.now() ? decoded : null
}

function redirect(status: string, detail = '') {
  const target = `${appUrl.replace(/\/$/, '')}/#/trends?google=${encodeURIComponent(status)}${detail ? `&detail=${encodeURIComponent(detail)}` : ''}`
  return new Response(null, { status: 302, headers: { Location: target, ...cors } })
}

async function currentAdmin(req: Request) {
  const auth = req.headers.get('authorization') || ''
  if (!auth.startsWith('Bearer ')) return null
  const db = admin()
  const { data: { user } } = await db.auth.getUser(auth.slice(7))
  if (!user) return null
  const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle()
  return profile?.role === 'admin' ? user : null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (req.method === 'GET' && code && state) {
    try {
      if (!clientId() || !clientSecret()) return redirect('error', 'Google OAuth 客户端尚未配置')
      const saved = await verifyState(state)
      if (!saved) return redirect('error', '授权状态已过期，请重新连接')

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ code, client_id: clientId(), client_secret: clientSecret(), redirect_uri: redirectUri, grant_type: 'authorization_code' }),
      })
      const tokens = await tokenRes.json()
      if (!tokenRes.ok || !tokens.refresh_token) throw new Error(tokens?.error_description || 'Google 未返回 refresh token，请撤销旧授权后重试')
      const infoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${tokens.access_token}` } })
      const info = await infoRes.json().catch(() => ({}))
      const db = admin()
      const { error } = await db.from('oauth_sessions').insert({
        access_token: tokens.access_token, refresh_token: tokens.refresh_token, token_type: tokens.token_type,
        expires_in: tokens.expires_in, scope: tokens.scope || null, user_email: info.email || null,
        user_name: info.name || null, user_picture: info.picture || null,
      })
      if (error) throw error
      return redirect('connected')
    } catch (e) {
      return redirect('error', e instanceof Error ? e.message : String(e))
    }
  }

  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const user = await currentAdmin(req)
  if (!user) return json({ error: '仅管理员可连接 Google 数据' }, 403)
  if (!clientId() || !clientSecret()) return json({ error: '缺少 GOOGLE_WEB_CLIENT_ID / GOOGLE_WEB_CLIENT_SECRET' }, 503)

  // This OAuth client is already registered in Google Cloud with the legacy
  // production callback. Route authorization through that callback so the
  // redirect URI exactly matches Google's allowlist; tokens remain server-side.
  const callbackInit = new URL(`${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback`)
  callbackInit.searchParams.set('action', 'init')
  callbackInit.searchParams.set('redirect_to', `${appUrl.replace(/\/$/, '')}/#/trends`)
  return json({
    authorization_url: callbackInit.toString(),
    redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback`,
  })

  /* Kept for migration reference if a dedicated OAuth client is configured.
  const stateValue = await createState(user.id)
  const params = new URLSearchParams({
    client_id: clientId(), redirect_uri: redirectUri, response_type: 'code', access_type: 'offline', prompt: 'consent',
    include_granted_scopes: 'true', state: stateValue,
    scope: ['openid', 'email', 'https://www.googleapis.com/auth/analytics.readonly', 'https://www.googleapis.com/auth/webmasters.readonly'].join(' '),
  })
  return json({ authorization_url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`, redirect_uri: redirectUri })
  */
})

