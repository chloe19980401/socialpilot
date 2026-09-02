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

  const { data: caller } = await admin.from('profiles').select('role, disabled_at').eq('id', user.id).maybeSingle()
  if (!caller || caller.role !== 'admin' || caller.disabled_at) return json({ error: '仅管理员可操作' }, 403)

  const { user_id: userId, disabled } = await req.json().catch(() => ({}))
  if (!userId || typeof disabled !== 'boolean') return json({ error: '参数不正确' }, 400)
  if (userId === user.id) return json({ error: '不能禁用自己的账号' }, 400)

  const { data: target } = await admin.from('profiles').select('id').eq('id', userId).maybeSingle()
  if (!target) return json({ error: '账号不存在' }, 404)

  // Supabase Auth 原生封禁会让后续密码登录返回 user_banned。
  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: disabled ? '876000h' : 'none',
  })
  if (authError) return json({ error: `更新登录状态失败：${authError.message}` }, 400)

  const { error: profileError } = await admin.from('profiles')
    .update({ disabled_at: disabled ? new Date().toISOString() : null })
    .eq('id', userId)
  if (profileError) {
    // 保持 Auth 和资料状态一致；资料写入失败时回滚封禁。
    await admin.auth.admin.updateUserById(userId, { ban_duration: disabled ? 'none' : '876000h' })
    return json({ error: `保存账号状态失败：${profileError.message}` }, 500)
  }

  return json({ user_id: userId, disabled })
})
