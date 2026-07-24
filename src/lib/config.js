// 用户名登录：Supabase Auth 只认邮箱，所以把「用户名」自动补成邮箱再提交。
// 例如输入 chloelee -> chloelee@foreverdoodle.com
// 在 Supabase 后台创建账号时，邮箱也要用「用户名@这个域名」。
export const AUTH_EMAIL_DOMAIN = 'foreverdoodle.com'

// 把用户输入（用户名或完整邮箱）统一成邮箱
export function toEmail(input) {
  const v = (input || '').trim()
  return v.includes('@') ? v : `${v}@${AUTH_EMAIL_DOMAIN}`
}
