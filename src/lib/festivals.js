// 世界节日 & 营销活动日历（出海社媒/电商视角）
// - 固定日期、"第 N 个星期几"、复活节等规则类节日按年份自动推算，长期有效
// - 农历/伊斯兰历/印度历及平台大促日期无法按公历规则推算，写在 DATED 表里，需每年补充
// type: shopping=电商大促  holiday=节日  awareness=国际主题日

const FIXED = [
  { m: 1, d: 1, name: '元旦', en: "New Year's Day", type: 'holiday', region: '全球', tip: '新年目标 / 新品预告' },
  { m: 2, d: 14, name: '情人节', en: "Valentine's Day", type: 'holiday', region: '全球', tip: '礼品向内容，提前 2 周预热' },
  { m: 3, d: 8, name: '国际妇女节', en: "International Women's Day", type: 'awareness', region: '全球', tip: '女性用户故事 / 独居安全话题' },
  { m: 3, d: 17, name: '圣帕特里克节', en: "St. Patrick's Day", type: 'holiday', region: '美国·爱尔兰' },
  { m: 4, d: 1, name: '愚人节', en: "April Fools' Day", type: 'holiday', region: '全球', tip: '品牌趣味互动帖' },
  { m: 4, d: 22, name: '世界地球日', en: 'Earth Day', type: 'awareness', region: '全球', tip: '环保 / 低功耗卖点' },
  { m: 6, d: 5, name: '世界环境日', en: 'World Environment Day', type: 'awareness', region: '全球' },
  { m: 7, d: 1, name: '加拿大国庆日', en: 'Canada Day', type: 'holiday', region: '加拿大' },
  { m: 7, d: 4, name: '美国独立日', en: 'Independence Day', type: 'holiday', region: '美国', tip: '夏季促销节点' },
  { m: 10, d: 31, name: '万圣节', en: 'Halloween', type: 'holiday', region: '欧美', tip: '装饰/变装 UGC，提前 3 周排期' },
  { m: 11, d: 11, name: '双十一 / 退伍军人节', en: "Singles' Day / Veterans Day", type: 'shopping', region: '全球·美国', tip: '独立站折扣 + 联动 KOL' },
  { m: 12, d: 24, name: '平安夜', en: 'Christmas Eve', type: 'holiday', region: '全球' },
  { m: 12, d: 25, name: '圣诞节', en: 'Christmas Day', type: 'holiday', region: '全球', tip: '礼品季主战场，物流截单要提前公告' },
  { m: 12, d: 26, name: '节礼日', en: 'Boxing Day', type: 'shopping', region: '英·加·澳', tip: '年末清仓促销' },
  { m: 12, d: 31, name: '跨年夜', en: "New Year's Eve", type: 'holiday', region: '全球' },
]

// 第 n 个星期 weekday（0=周日）；n=-1 表示最后一个
function nthWeekday(year, month, weekday, n) {
  if (n > 0) {
    const first = new Date(year, month - 1, 1)
    const offset = (weekday - first.getDay() + 7) % 7
    return new Date(year, month - 1, 1 + offset + (n - 1) * 7)
  }
  const last = new Date(year, month, 0)
  const offset = (last.getDay() - weekday + 7) % 7
  return new Date(year, month - 1, last.getDate() - offset)
}

// 复活节（公历，Anonymous Gregorian 算法）
function easter(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

const addDays = (date, n) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n)

function ruleBased(year) {
  const thanksgiving = nthWeekday(year, 11, 4, 4)
  const ea = easter(year)
  return [
    { date: nthWeekday(year, 2, 0, 2), name: '超级碗', en: 'Super Bowl (约)', type: 'holiday', region: '美国', tip: '体育热点借势，以 NFL 官方公布为准' },
    { date: addDays(ea, -2), name: '耶稣受难日', en: 'Good Friday', type: 'holiday', region: '欧美' },
    { date: ea, name: '复活节', en: 'Easter', type: 'holiday', region: '欧美', tip: '春季家庭场景内容' },
    { date: nthWeekday(year, 5, 0, 2), name: '母亲节', en: "Mother's Day", type: 'holiday', region: '美·加·澳', tip: '礼品向，提前 2~3 周投放' },
    { date: nthWeekday(year, 5, 1, -1), name: '阵亡将士纪念日', en: 'Memorial Day', type: 'shopping', region: '美国', tip: '夏季第一波大促' },
    { date: nthWeekday(year, 6, 0, 3), name: '父亲节', en: "Father's Day", type: 'holiday', region: '美·加', tip: '智能硬件/工具类礼品高峰' },
    { date: nthWeekday(year, 9, 1, 1), name: '美国劳动节', en: 'Labor Day', type: 'shopping', region: '美国', tip: '返校季尾声促销' },
    { date: thanksgiving, name: '感恩节', en: 'Thanksgiving', type: 'holiday', region: '美国' },
    { date: addDays(thanksgiving, 1), name: '黑色星期五', en: 'Black Friday', type: 'shopping', region: '全球', tip: '全年最大促，素材/库存提前 4~6 周准备' },
    { date: addDays(thanksgiving, 4), name: '网络星期一', en: 'Cyber Monday', type: 'shopping', region: '全球', tip: '线上折扣续航，独立站重点' },
  ]
}

// 非公历规则节日 & 平台大促（按年补充；伊斯兰节日以当地月相公告为准）
const DATED = [
  // 2026
  { date: '2026-10-06', end: '2026-10-07', name: '亚马逊秋季会员日', en: 'Prime Big Deal Days', type: 'shopping', region: '亚马逊多站点', tip: '站外引流素材 + 站内优惠券提前备好' },
  { date: '2026-11-08', name: '排灯节', en: 'Diwali', type: 'holiday', region: '印度·海外印裔' },
  // 2027
  { date: '2027-02-06', name: '春节', en: 'Lunar New Year', type: 'holiday', region: '全球华人·东南亚', tip: '海外华人/亚裔市场内容' },
  { date: '2027-03-10', name: '开斋节（约）', en: 'Eid al-Fitr', type: 'holiday', region: '中东·东南亚', tip: '以当地公告为准' },
  { date: '2027-09-15', name: '中秋节', en: 'Mid-Autumn Festival', type: 'holiday', region: '全球华人' },
  { date: '2027-10-29', name: '排灯节', en: 'Diwali', type: 'holiday', region: '印度·海外印裔' },
  // 2028
  { date: '2028-01-26', name: '春节', en: 'Lunar New Year', type: 'holiday', region: '全球华人·东南亚', tip: '海外华人/亚裔市场内容' },
]

const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }

export const FESTIVAL_TYPES = {
  shopping: { label: '电商大促', chip: 'bg-rose-50 text-rose-600', dot: 'bg-rose-500' },
  holiday: { label: '节日', chip: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  awareness: { label: '国际主题日', chip: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
}

const cache = new Map()
export function festivalsOfYear(year) {
  if (cache.has(year)) return cache.get(year)
  const list = [
    ...FIXED.map(({ m, d, ...rest }) => ({ ...rest, date: new Date(year, m - 1, d) })),
    ...ruleBased(year),
    ...DATED.filter((f) => f.date.startsWith(String(year))).map((f) => ({
      ...f, date: parse(f.date), end: f.end ? parse(f.end) : null,
    })),
  ].sort((a, b) => a.date - b.date)
  cache.set(year, list)
  return list
}

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

// 某一天的节日（多日活动覆盖区间内每一天）
export function festivalsOn(day) {
  const t = startOfDay(day).getTime()
  return festivalsOfYear(day.getFullYear()).filter((f) =>
    f.end ? t >= f.date.getTime() && t <= f.end.getTime() : t === f.date.getTime()
  )
}

// 从 from 起（含当天/进行中的活动）接下来的 n 个节日
export function upcomingFestivals(from = new Date(), n = 3) {
  const today = startOfDay(from)
  const list = [...festivalsOfYear(today.getFullYear()), ...festivalsOfYear(today.getFullYear() + 1)]
  return list
    .filter((f) => (f.end || f.date) >= today)
    .slice(0, n)
    .map((f) => ({ ...f, ongoing: f.date < today, daysLeft: Math.max(0, Math.round((f.date - today) / 86400000)) }))
}
