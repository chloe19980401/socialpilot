// =============================================================
// tiktok-oauth · TikTok OAuth 回调
//
// TikTok 授权后带 ?code=...&state=... 重定向到这里。
// 用 code 换 access_token + refresh_token，存进 tiktok_tokens（单行, id=1）。
// sync-tiktok 同步前会读这张表并在过期时用 refresh_token 自动续期。
//
// 需要环境变量：TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET
// 部署：supabase functions deploy tiktok-oauth --no-verify-jwt
//   （TikTok 的回调请求不带 JWT，必须 verify_jwt = false）
// Redirect URI 必须与 TikTok 应用里登记的完全一致。
// =============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const REDIRECT_URI = 'https://grogrigybgimvuuunxef.supabase.co/functions/v1/tiktok-oauth'
const CLIENT_KEY = Deno.env.get('TIKTOK_CLIENT_KEY') ?? ''
const CLIENT_SECRET = Deno.env.get('TIKTOK_CLIENT_SECRET') ?? ''

function admin() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
}

function page(title: string, msg: string) {
  return new Response(
    `<!doctype html><meta charset=utf-8><title>${title}</title><body style="font-family:system-ui;max-width:640px;margin:80px auto;padding:0 20px;line-height:1.6"><h2>${title}</h2><p>${msg}</p></body>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )
}

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const err = url.searchParams.get('error')
  if (err) return page('授权未完成', `TikTok 返回错误：${err} - ${url.searchParams.get('error_description') || ''}`)
  if (!code) return page('缺少 code', '未收到授权码。请从 TikTok 授权页重新发起。')
  if (!CLIENT_KEY || !CLIENT_SECRET) return page('未配置密钥', '请先在 Supabase 设置 TIKTOK_CLIENT_KEY 和 TIKTOK_CLIENT_SECRET。')
  try {
    const body = new URLSearchParams({
      client_key: CLIENT_KEY, client_secret: CLIENT_SECRET, code,
      grant_type: 'authorization_code', redirect_uri: REDIRECT_URI,
    })
    const r = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body,
    })
    const d = await r.json()
    if (!d.access_token) return page('换 token 失败', `TikTok 返回：${JSON.stringify(d)}`)
    const now = Date.now()
    await admin().from('tiktok_tokens').upsert({
      id: 1, open_id: d.open_id ?? null, access_token: d.access_token, refresh_token: d.refresh_token ?? null,
      scope: d.scope ?? null,
      expires_at: new Date(now + Number(d.expires_in || 0) * 1000).toISOString(),
      refresh_expires_at: new Date(now + Number(d.refresh_expires_in || 0) * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    return page('✅ 授权成功', 'TikTok 已连接，token 已保存并会自动续期。现在可以回系统点同步。')
  } catch (e) {
    return page('出错', String(e))
  }
})
