const norm = (value) => (value || '').trim().toLocaleLowerCase()

// 兼容历史帖子：邮箱 > 姓名映射 > 已关联排期。
export function resolvePostOperator(post, profiles = [], plans = []) {
  const email = norm(post?.operator_email)
  let person = email ? profiles.find((p) => norm(p.email) === email) : null

  if (!person && post?.operator_name) {
    person = profiles.find((p) => norm(p.name) === norm(post.operator_name))
  }

  const plan = plans.find((p) =>
    (p.post_id && p.post_id === post?.id) ||
    (post?.plan_id && p.id === post.plan_id)
  )
  const resolvedEmail = person?.email || post?.operator_email || plan?.assignee_email || ''
  const resolvedPerson = profiles.find((p) => norm(p.email) === norm(resolvedEmail))
  const resolvedName = resolvedPerson?.name || person?.name || post?.operator_name || plan?.assignee_name ||
    (resolvedEmail ? resolvedEmail.split('@')[0] : '未分配')

  return {
    email: resolvedEmail,
    name: resolvedName,
    key: resolvedEmail || (resolvedName !== '未分配' ? `name:${norm(resolvedName)}` : '__none__'),
  }
}

export function sameOperator(post, email, profiles = [], plans = []) {
  const owner = resolvePostOperator(post, profiles, plans)
  if (norm(owner.email) === norm(email)) return true
  const target = profiles.find((p) => norm(p.email) === norm(email))
  return !!target?.name && norm(owner.name) === norm(target.name)
}
