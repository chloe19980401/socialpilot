// 排期系统常量：审批状态流转、内容类型
// 状态流转：draft -> pending -> approved -> published，pending 可 -> rejected

export const PLAN_STATUS = {
  draft:     { key: 'draft',     label: '草稿',   color: 'slate',  dot: '#94a3b8' },
  pending:   { key: 'pending',   label: '待审核', color: 'orange', dot: '#f59e0b' },
  approved:  { key: 'approved',  label: '已通过', color: 'blue',   dot: '#3b6ef6' },
  published: { key: 'published', label: '已发布', color: 'green',  dot: '#22c55e' },
  rejected:  { key: 'rejected',  label: '已驳回', color: 'red',    dot: '#ef4444' },
}

// 看板列顺序
export const KANBAN_COLUMNS = ['draft', 'pending', 'approved', 'published']

export function statusMeta(key) {
  return PLAN_STATUS[key] || PLAN_STATUS.draft
}

// 运营可自行推进的状态（提交审核）
// 审批权限（通过/驳回）建议限管理员，在页面里按 role 控制

export const CONTENT_TYPES = {
  image:   { key: 'image',   label: '图文' },
  video:   { key: 'video',   label: '视频' },
  reels:   { key: 'reels',   label: 'Reels/短视频' },
  story:   { key: 'story',   label: 'Story/快拍' },
  live:    { key: 'live',    label: '直播' },
  article: { key: 'article', label: '图文长贴' },
}

export function contentTypeLabel(key) {
  return CONTENT_TYPES[key]?.label || key || '—'
}

export const CONTENT_TYPE_LIST = Object.values(CONTENT_TYPES)

// 时间格式：YYYY-MM-DD HH:mm 便于表格展示
export function fmtDateTime(d) {
  if (!d) return '—'
  const x = new Date(d)
  const p = (n) => String(n).padStart(2, '0')
  return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())} ${p(x.getHours())}:${p(x.getMinutes())}`
}

// 供 <input type="datetime-local"> 用的本地字符串
export function toLocalInput(d) {
  if (!d) return ''
  const x = new Date(d)
  const p = (n) => String(n).padStart(2, '0')
  return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}T${p(x.getHours())}:${p(x.getMinutes())}`
}

// 距今相对提示：逾期 / 今天 / N天后
export function relativeDay(d) {
  if (!d) return ''
  const now = new Date()
  const target = new Date(d)
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const b = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  const diff = Math.round((b - a) / 86400000)
  if (diff < 0) return `逾期${-diff}天`
  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  return `${diff}天后`
}
