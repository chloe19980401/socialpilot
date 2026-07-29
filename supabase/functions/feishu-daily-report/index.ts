// =============================================================
// feishu-daily-report · 每天 09:00（北京时间）把社媒情况发到飞书群「自定义机器人」
// 无需外部平台密钥；飞书 webhook 与调用 token 存在 app_config 表（前端读不到）
// 部署：supabase functions deploy feishu-daily-report --no-verify-jwt
// 手动测试：POST https://<ref>.supabase.co/functions/v1/feishu-daily-report?token=<token>
// pg_cron 每天调用（见 supabase/feishu_cron.sql）
// =============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OFFSET = 8 * 3600 * 1000 // 北京时间 UTC+8

function admin() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  )
}
const cn = (n: number) =>
  n >= 1e8 ? (n / 1e8).toFixed(1) + '亿' : n >= 1e4 ? (n / 1e4).toFixed(1) + '万' : String(n)
const bj = (s: string) => new Date(new Date(s).getTime() + OFFSET)
const ymBJ = (s: string) => {
  const t = bj(s)
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}`
}

Deno.serve(async (req) => {
  const db = admin()

  // 读取配置
  const { data: cfg } = await db.from('app_config').select('key,value').in('key', ['feishu_webhook', 'feishu_cron_token'])
  const map: Record<string, string> = Object.fromEntries((cfg || []).map((r: any) => [r.key, r.value]))
  const webhook = map['feishu_webhook']
  const token = map['feishu_cron_token']

  // token 校验（防止被随意触发刷屏）
  const url = new URL(req.url)
  const given = url.searchParams.get('token') || req.headers.get('x-cron-token')
  if (token && given !== token) return new Response('unauthorized', { status: 401 })
  if (!webhook) return new Response(JSON.stringify({ ok: false, error: '尚未配置 feishu_webhook' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

  // 时间边界（北京时区）
  const nowBJ = new Date(Date.now() + OFFSET)
  const y = nowBJ.getUTCFullYear(), mo = nowBJ.getUTCMonth(), d = nowBJ.getUTCDate()
  const startToday = new Date(Date.UTC(y, mo, d) - OFFSET)
  const startYest = new Date(startToday.getTime() - 86400000)
  const endToday = new Date(startToday.getTime() + 86400000)
  const monthKey = `${y}-${String(mo + 1).padStart(2, '0')}`
  const dateStr = `${y}年${mo + 1}月${d}日`

  // 拉数据
  const [{ data: posts }, { data: accs }, { data: plans }] = await Promise.all([
    db.from('posts').select('published_at, views, likes, comments, operator_name')
      .gte('published_at', startYest.toISOString()).lt('published_at', startToday.toISOString()),
    db.from('accounts').select('id, followers'),
    db.from('content_plans').select('title, status, scheduled_at, assignee_name, overdue, overdue_cleared'),
  ])
  const P = posts || [], A = accs || [], PL = plans || []

  // 1) 昨日发布
  const totViews = P.reduce((s: number, p: any) => s + (p.views || 0), 0)
  const totLikes = P.reduce((s: number, p: any) => s + (p.likes || 0), 0)
  const totCmt = P.reduce((s: number, p: any) => s + (p.comments || 0), 0)
  const byOp: Record<string, number> = {}
  P.forEach((p: any) => { const k = p.operator_name || '未署名'; byOp[k] = (byOp[k] || 0) + 1 })
  const opLine = Object.entries(byOp).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}条`).join('、') || '—'
  const sec1 = `**📊 昨日发布**\n发帖 **${P.length}** 条 · 播放 ${cn(totViews)} · 点赞 ${cn(totLikes)} · 评论 ${cn(totCmt)}\n运营：${opLine}`

  // 2) 今日排期
  const todayPlans = PL.filter((p: any) =>
    (p.status === 'approved' || p.status === 'published') &&
    p.scheduled_at && new Date(p.scheduled_at) >= startToday && new Date(p.scheduled_at) < endToday)
  const pending = PL.filter((p: any) => p.status === 'pending').length
  const overdueNow = PL.filter((p: any) => p.overdue && !p.overdue_cleared).length
  const fmtTime = (s: string) => { const t = bj(s); return `${String(t.getUTCHours()).padStart(2, '0')}:${String(t.getUTCMinutes()).padStart(2, '0')}` }
  const todayLines = todayPlans.length
    ? todayPlans.sort((a: any, b: any) => +new Date(a.scheduled_at) - +new Date(b.scheduled_at))
        .map((p: any) => `· ${fmtTime(p.scheduled_at)} ${p.title || '未命名'}（${p.assignee_name || '未分配'}）`).join('\n')
    : '· 今日无待发排期'
  const sec2 = `**🗓 今日排期**\n待发 **${todayPlans.length}** 条：\n${todayLines}\n待审核 ${pending} 条 · 当前逾期 ${overdueNow} 条`

  // 3) 本月逾期扣分
  const ovByOp: Record<string, number> = {}
  PL.filter((p: any) => p.overdue && !p.overdue_cleared && p.scheduled_at && ymBJ(p.scheduled_at) === monthKey)
    .forEach((p: any) => { const k = p.assignee_name || '未分配'; ovByOp[k] = (ovByOp[k] || 0) + 1 })
  const ovLines = Object.keys(ovByOp).length
    ? Object.entries(ovByOp).sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `· ${k}：逾期 ${v} 次，得分 ${Math.round((100 - v * 100 / 3) * 10) / 10}%`).join('\n')
    : '· 本月暂无逾期 🎉'
  const sec3 = `**🏆 本月逾期扣分**（初始100%，每次-33.3%）\n${ovLines}`

  const body = {
    msg_type: 'interactive',
    card: {
      config: { wide_screen_mode: true },
      header: { template: 'blue', title: { tag: 'plain_text', content: `📣 社媒日报 · ${dateStr}` } },
      elements: [
        { tag: 'div', text: { tag: 'lark_md', content: sec1 } },
        { tag: 'hr' },
        { tag: 'div', text: { tag: 'lark_md', content: sec2 } },
        { tag: 'hr' },
        { tag: 'div', text: { tag: 'lark_md', content: sec3 } },
        { tag: 'note', elements: [{ tag: 'lark_md', content: `账号 ${A.length} 个 · 由 SocialPilot 自动生成` }] },
      ],
    },
  }

  const resp = await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const text = await resp.text()
  return new Response(JSON.stringify({ ok: resp.ok, sent: { posts: P.length, today: todayPlans.length }, feishu: text }), { headers: { 'Content-Type': 'application/json' } })
})
