import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/util.ts'

const URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const authorization = req.headers.get('Authorization') || ''
  if (!authorization.startsWith('Bearer ')) return json({ error: '未登录' }, 401)

  const admin = createClient(URL, SERVICE_KEY, { auth: { persistSession: false } })
  const token = authorization.slice(7)
  const { data: { user }, error: userError } = await admin.auth.getUser(token)
  if (userError || !user) return json({ error: '登录状态无效' }, 401)

  const { data: caller } = await admin
    .from('profiles')
    .select('role, disabled_at')
    .eq('id', user.id)
    .maybeSingle()
  if (!caller || caller.role !== 'admin' || caller.disabled_at) {
    return json({ error: '仅管理员可重置密码' }, 403)
  }

  const { user_id: userId, password } = await req.json().catch(() => ({}))
  if (!userId || typeof password !== 'string') return json({ error: '参数不正确' }, 400)
  if (password.length < 8 || password.length > 72) {
    return json({ error: '密码长度必须为 8–72 位' }, 400)
  }

  const { data: target } = await admin
    .from('profiles')
    .select('id, email, disabled_at')
    .eq('id', userId)
    .maybeSingle()
  if (!target) return json({ error: '账号不存在' }, 404)

  const { error: authError } = await admin.auth.admin.updateUserById(userId, { password })
  if (authError) return json({ error: `重置密码失败：${authError.message}` }, 400)

  // 旧版管理页会向管理员展示初始密码，同步更新记录，避免显示已失效的旧密码。
  const { error: credentialError } = await admin
    .from('staff_credentials')
    .upsert({ id: userId, init_password: password }, { onConflict: 'id' })

  return json({
    user_id: userId,
    email: target.email,
    disabled: Boolean(target.disabled_at),
    credentials_updated: !credentialError,
    warning: credentialError ? '密码已重置，但管理页的密码记录未同步' : null,
  })
})
