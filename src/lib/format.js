// 数字压缩：12345 -> 1.2万 / 2000000 -> 2.0M（社媒常用中文单位）
export function compactCN(n) {
  const num = Number(n) || 0
  if (num >= 1e8) return (num / 1e8).toFixed(1) + '亿'
  if (num >= 1e4) return (num / 1e4).toFixed(1) + '万'
  return String(num)
}

// 英文压缩：2000000 -> 2.0M（播放量等）
export function compactEN(n) {
  const num = Number(n) || 0
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
  return String(num)
}

export function money(n) {
  const num = Number(n) || 0
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function percent(n, digits = 1) {
  return (Number(n) || 0).toFixed(digits) + '%'
}

export function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export const WEEKDAYS_CN = ['日', '一', '二', '三', '四', '五', '六']

export function longDateCN(d = new Date()) {
  const date = new Date(d)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日星期${WEEKDAYS_CN[date.getDay()]}`
}
