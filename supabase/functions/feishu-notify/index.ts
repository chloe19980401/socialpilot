// =============================================================
// feishu-notify · 有人在「内容中心」上传新帖子时，即时发到飞书群
// 前端 supabase.functions.invoke('feishu-notify', { body:{...} }) 调用
// 鉴权：函数内部校验用户 JWT（前端 invoke 会带登录用户的 Authorization）
// 飞书 webhook 存在 app_config 表（前端读不到，仅 service_role 可读）
// 部署：verify_jwt=false（改用内部自校验，方便浏览器跨域预检）
// =============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

const PLAT: Record<string, string> = {
  instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok',
  facebook: 'Facebook', twitter: 'Twitter/X', linkedin: 'LinkedIn',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ ok: false, error: 'method not allowed' }, 405)

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const ANON = Deno.env.get('SUPABASE_ANON_KEY')!
  const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // 自定义鉴权：必须是登录用户（前端 invoke 会带上用户 JWT）
  const authz = req.headers.get('Authorization') || ''
  const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authz } }, auth: { persistSession: false } })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return json({ ok: false, error: 'unauthorized' }, 401)

  // 读取飞书 webhook（service_role）
  const db = createClient(SUPABASE_URL, SERVICE, { auth: { persistSession: false } })
  const { data: cfg } = await db.from('app_config').select('value').eq('key', 'feishu_webhook').maybeSingle()
  const webhook = cfg?.value
  if (!webhook) return json({ ok: false, error: '尚未配置 feishu_webhook' }, 400)

  let p: any = {}
  try { p = await req.json() } catch { /* ignore */ }
  const title = (p.title || '未命名帖子').toString().slice(0, 200)
  const platform = PLAT[p.platform] || p.platform || '—'
  const uploader = p.uploader || user.email?.split('@')[0] || '有人'
  const parts = [`平台 ${platform}`]
  if (p.brand) parts.push(`品牌 ${p.brand}`)
  if (p.operator_name) parts.push(`运营 ${p.operator_name}`)
  const link = p.url ? `\n[查看帖子](${p.url})` : ''
  const content = `**📮 新帖上传**\n**${title}**\n${parts.join(' · ')}${link}`

  const body = {
    msg_type: 'interactive',
    card: {
      config: { wide_screen_mode: true },
      header: { template: 'green', title: { tag: 'plain_text', content: '📮 有新帖上传' } },
      elements: [
        { tag: 'div', text: { tag: 'lark_md', content } },
        { tag: 'note', elements: [{ tag: 'lark_md', content: `上传人：${uploader} · SocialPilot 自动提醒` }] },
      ],
    },
  }

  const resp = await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const text = await resp.text()
  return json({ ok: resp.ok, feishu: text })
})
