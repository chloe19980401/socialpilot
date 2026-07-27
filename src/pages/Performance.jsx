import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'
import { Award, RefreshCw, Plus, Target, CheckCircle2, TrendingUp, Users, ShoppingCart, RefreshCcw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Card, StatCard } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { Button, Tabs, EmptyState, Badge, Modal, Field, inputClass } from '../components/ui/Common'
import { percent, money, compactEN } from '../lib/format'

// KPI 指标：实际值自动从内容中心（posts）按运营 + 月份计算
const METRICS = ['发帖数', '总播放量', '互动率']
const COLORS = ['#6366f1', '#ec4899', '#22c55e', '#f59e0b', '#06b6d4', '#a855f7']

const ym = (d) => (d ? String(d).slice(0, 7) : '')
const monthLabel = (k) => (k ? `${k.slice(0, 4)}年${Number(k.slice(5, 7))}月` : '')
function nextMonth(k) {
  const [y, m] = k.split('-').map(Number)
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`
}
function recentMonths(n = 6) {
  const out = []
  const d = new Date()
  for (let i = 0; i < n; i++) { out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); d.setMonth(d.getMonth() - 1) }
  // 额外附上下个月，方便「同步到下月」后查看
  const cur = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  return [nextMonth(cur), ...out]
}

export default function Performance() {
  const [posts, setPosts] = useState([])
  const [goals, setGoals] = useState([])
  const [profiles, setProfiles] = useState([])
  const [orders, setOrders] = useState([])
  // 默认展示下个月（当前 KPI 考核月，如 8 月），而非本月
  const [month, setMonth] = useState(nextMonth(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`))
  const [salesBy, setSalesBy] = useState('operator')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ operator: '', metric: '发帖数', target: '', period: month })

  async function load() {
    setLoading(true)
    const [{ data: ps }, { data: gs }, { data: pf }, { data: od }] = await Promise.all([
      supabase.from('posts').select('*'),
      supabase.from('kpi_goals').select('*'),
      supabase.from('profiles').select('*').order('name'),
      supabase.from('store_orders').select('*'),
    ])
    setPosts(ps || []); setGoals(gs || []); setProfiles(pf || []); setOrders(od || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const months = useMemo(() => recentMonths(6), [])

  // 某运营在某月的内容实际数据
  function contentActual(email, metric, mKey) {
    const mine = posts.filter((p) => (p.operator_email === email) && ym(p.published_at) === mKey)
    if (metric === '发帖数') return mine.length
    if (metric === '总播放量') return mine.reduce((s, p) => s + (p.views || 0), 0)
    if (metric === '互动率') {
      const v = mine.reduce((s, p) => s + (p.views || 0), 0)
      const e = mine.reduce((s, p) => s + (p.likes || 0) + (p.comments || 0) + (p.shares || 0) + (p.saves || 0), 0)
      return v > 0 ? Number(((e / v) * 100).toFixed(2)) : 0
    }
    return 0
  }

  // 当月 KPI（目标来自 kpi_goals，实际自动计算）
  const monthGoals = useMemo(
    () => goals.filter((g) => g.period === month).map((g) => {
      const actual = contentActual(g.operator_email, g.metric, month)
      const raw = g.target ? (actual / g.target) * 100 : 0
      return { ...g, actual, raw, rate: Math.min(100, raw) }
    }),
    [goals, month, posts]
  )

  // 按运营分组（看板卡片用）
  const byOperator = useMemo(() => {
    const map = {}
    monthGoals.forEach((x) => {
      const k = x.operator_email || x.operator_name || '未分配'
      if (!map[k]) map[k] = { email: x.operator_email, name: x.operator_name || x.operator_email || '未分配', goals: [] }
      map[k].goals.push(x)
    })
    return Object.values(map).map((o) => ({
      ...o,
      achieved: o.goals.filter((x) => x.target && x.actual >= x.target).length,
      overall: o.goals.length ? o.goals.reduce((s, x) => s + x.raw, 0) / o.goals.length : 0,
    }))
  }, [monthGoals])

  function fmtMetric(metric, v) { return metric === '互动率' ? v + '%' : compactEN(v) }

  const stats = useMemo(() => {
    const total = monthGoals.length
    const achieved = monthGoals.filter((g) => g.target && g.actual >= g.target).length
    const avg = total ? monthGoals.reduce((s, g) => s + g.rate, 0) / total : 0
    const people = new Set(monthGoals.map((g) => g.operator_email).filter(Boolean)).size
    return { total, achieved, avg, people }
  }, [monthGoals])

  // 销售额情况（自建站 store_orders）
  const sales = useMemo(() => {
    const inM = orders.filter((o) => ym(o.order_date) === month)
    const key = salesBy === 'brand' ? 'brand_id' : 'operator_email'
    const g = {}
    inM.forEach((o) => {
      const k = o[key] || '未分配'
      if (!g[k]) g[k] = { key: k, name: (salesBy === 'brand' ? (o.brand_id || '未分配') : (o.operator_name || o.operator_email || '未分配')), count: 0, gross: 0, refund: 0 }
      g[k].count += 1; g[k].gross += Number(o.amount || 0); g[k].refund += Number(o.refund_amount || 0)
    })
    const list = Object.values(g).map((x) => ({ ...x, net: x.gross - x.refund }))
    const gross = list.reduce((s, x) => s + x.gross, 0)
    const refund = list.reduce((s, x) => s + x.refund, 0)
    return { list, gross, refund, net: gross - refund, count: inM.length, refundRate: gross > 0 ? (refund / gross) * 100 : 0 }
  }, [orders, month, salesBy])

  // 每月完成率趋势（各运营）
  const trend = useMemo(() => {
    const ops = [...new Set(goals.map((g) => g.operator_email).filter(Boolean))]
    const series = [...months].reverse().filter((m) => m <= month || m === month)
    const rows = series.map((mKey) => {
      const row = { month: monthLabel(mKey).slice(5) }
      ops.forEach((op) => {
        const gs = goals.filter((g) => g.operator_email === op && g.period === mKey)
        if (!gs.length) { row[op] = null; return }
        const r = gs.reduce((s, g) => s + (g.target ? Math.min(100, (contentActual(op, g.metric, mKey) / g.target) * 100) : 0), 0) / gs.length
        row[op] = Number(r.toFixed(0))
      })
      return row
    })
    const names = {}
    ops.forEach((op) => { names[op] = profiles.find((p) => p.email === op)?.name || op })
    return { rows, ops, names }
  }, [goals, months, month, posts, profiles])

  async function syncToNext() {
    const nm = nextMonth(month)
    if (!monthGoals.length) { alert('当前月没有可复制的 KPI 指标'); return }
    if (!confirm(`把 ${monthLabel(month)} 的 ${monthGoals.length} 条 KPI 目标复制到 ${monthLabel(nm)}？`)) return
    setSaving(true)
    const rows = monthGoals.map((g) => ({ operator_email: g.operator_email, operator_name: g.operator_name, metric: g.metric, target: g.target, period: nm }))
    await supabase.from('kpi_goals').insert(rows)
    setSaving(false)
    setMonth(nm); load()
  }

  async function saveGoal(e) {
    e.preventDefault()
    if (!form.operator || !form.target) return
    const op = profiles.find((p) => p.email === form.operator)
    await supabase.from('kpi_goals').insert({
      operator_email: form.operator, operator_name: op?.name || form.operator.split('@')[0],
      metric: form.metric, target: Number(form.target) || 0, period: form.period || month,
    })
    setModal(false); setForm({ operator: '', metric: '发帖数', target: '', period: month }); load()
  }

  return (
    <div>
      <PageHeader
        icon={<Award size={28} />}
        title="绩效看板"
        subtitle="KPI 指标 · 数据自动关联内容中心"
        actions={<>
          <Button onClick={load}><RefreshCw size={16} /> 刷新</Button>
          <Button variant="primary" onClick={() => { setForm({ operator: '', metric: '发帖数', target: '', period: month }); setModal(true) }}><Plus size={16} /> 设定指标</Button>
        </>}
      />

      <Card className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-500">时间筛选</span>
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
      </Card>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<Target size={20} />} value={stats.total || '—'} label="总指标数" />
        <StatCard icon={<CheckCircle2 size={20} />} value={stats.achieved || '—'} label="已达成" />
        <StatCard icon={<TrendingUp size={20} />} value={stats.total ? percent(stats.avg) : '—'} label="平均完成率" />
        <StatCard icon={<Users size={20} />} value={stats.people || '—'} label="考核人数" />
      </div>

      {/* 销售额情况 */}
      <Card className="mb-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold text-slate-800"><ShoppingCart size={18} /> 销售额情况 <span className="text-xs font-normal text-slate-400">{monthLabel(month).slice(5)}</span></div>
          <div className="flex items-center gap-3">
            <Tabs tabs={[{ value: 'operator', label: '按运营' }, { value: 'brand', label: '按品牌' }]} value={salesBy} onChange={setSalesBy} />
            <span className="text-xs text-slate-400">数据来源：自建站</span>
          </div>
        </div>
        {sales.list.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">{loading ? '加载中…' : '本月暂无自建站订单数据'}</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sales.list.map((s) => (
              <div key={s.key} className="rounded-2xl border border-slate-100 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">{(s.name || '?')[0]}</div>
                  <div><div className="font-semibold text-slate-800">{s.name}</div><div className="text-xs text-slate-400">{monthLabel(month).slice(5)} · {s.count} 笔订单</div></div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div><div className="text-lg font-bold text-emerald-600">{money(s.gross)}</div><div className="text-xs text-slate-400">总销售额</div></div>
                  <div><div className="text-lg font-bold text-rose-500">{money(s.refund)}</div><div className="text-xs text-slate-400">退款金额</div></div>
                  <div><div className="text-lg font-bold text-slate-800">{money(s.net)}</div><div className="text-xs text-slate-400">净销售额</div></div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 md:grid-cols-4">
          <div className="text-center"><div className="text-lg font-bold text-emerald-600">{money(sales.gross)}</div><div className="text-xs text-slate-400">月总销售额</div></div>
          <div className="text-center"><div className="text-lg font-bold text-slate-800">{money(sales.net)}</div><div className="text-xs text-slate-400">月净销售额</div></div>
          <div className="text-center"><div className="text-lg font-bold text-slate-800">{sales.refundRate.toFixed(1)}%</div><div className="text-xs text-slate-400">退款率</div></div>
          <div className="text-center"><div className="text-lg font-bold text-slate-800">{sales.count}</div><div className="text-xs text-slate-400">期间订单数</div></div>
        </div>
      </Card>

      {/* 人员绩效 */}
      <Card className="mb-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="font-semibold text-slate-800">人员绩效</div>
          <Button onClick={syncToNext} disabled={saving}><RefreshCcw size={16} /> 同步到{monthLabel(nextMonth(month)).slice(5)}</Button>
        </div>
        <div className="mb-2 text-xs text-slate-400">各运营人员月度 KPI 平均完成率变化</div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trend.rows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} unit="%" />
            <Tooltip />
            <Legend />
            {trend.ops.map((op, i) => <Line key={op} type="monotone" dataKey={op} name={trend.names[op]} stroke={COLORS[i % COLORS.length]} strokeWidth={2} connectNulls />)}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* 人员绩效卡片 */}
      <div className="mb-2 font-semibold text-slate-800">{monthLabel(month)} · 人员绩效</div>
      {monthGoals.length === 0 ? (
        <Card><EmptyState icon={<Award size={28} />} title={loading ? '加载中…' : '本月暂无 KPI 指标'} hint="点「设定指标」为运营人员创建 KPI 目标，或用「同步到下月」复制上月目标" /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {byOperator.map((o) => (
            <Card key={o.email || o.name}>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">{(o.name || '?')[0]}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-slate-800">{o.name}</div>
                  <div className="truncate text-xs text-slate-400">{o.email}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                    <Badge color="blue">运营</Badge><span>{o.goals.length} 项指标</span>
                    <span className={o.achieved === o.goals.length ? 'text-emerald-600' : 'text-slate-400'}>{o.achieved}/{o.goals.length} 达成</span>
                  </div>
                </div>
                <Ring value={o.overall} />
              </div>
              <div className="space-y-3">
                {o.goals.map((g) => {
                  const color = g.raw >= 100 ? '#22c55e' : g.raw >= 60 ? '#3b82f6' : g.raw >= 30 ? '#f59e0b' : '#ef4444'
                  return (
                    <div key={g.id}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-slate-600">{g.metric}</span>
                        <span className="font-medium" style={{ color }}>{fmtMetric(g.metric, g.actual)}/{fmtMetric(g.metric, g.target)} ({Math.round(g.raw)}%)</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full" style={{ width: Math.min(100, g.raw) + '%', background: color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="设定 KPI 指标"
        footer={<><Button onClick={() => setModal(false)}>取消</Button><Button variant="primary" onClick={saveGoal}>保存</Button></>}>
        <form onSubmit={saveGoal} className="grid grid-cols-2 gap-4">
          <Field label="运营人员">
            <select className={inputClass} value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })}>
              <option value="">选择运营</option>
              {profiles.map((p) => <option key={p.id} value={p.email}>{p.name || p.email}</option>)}
            </select>
          </Field>
          <Field label="指标">
            <select className={inputClass} value={form.metric} onChange={(e) => setForm({ ...form, metric: e.target.value })}>
              {METRICS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="目标值"><input type="number" className={inputClass} value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} placeholder={form.metric === '互动率' ? '如 5（表示 5%）' : '如 20'} /></Field>
          <Field label="考核月份">
            <select className={inputClass} value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })}>
              {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
            </select>
          </Field>
          <div className="col-span-2 text-xs text-slate-400">实际完成值会自动从内容中心按运营 + 月份计算（发帖数 / 总播放量 / 互动率），无需手动填。</div>
        </form>
      </Modal>
    </div>
  )
}

function Ring({ value }) {
  const pct = Math.max(0, Math.min(100, value || 0))
  const R = 26, C = 2 * Math.PI * R
  const color = value >= 100 ? '#22c55e' : value >= 60 ? '#3b82f6' : value >= 30 ? '#f59e0b' : '#ef4444'
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
      <circle cx="32" cy="32" r={R} fill="none" stroke="#f1f5f9" strokeWidth="6" />
      <circle cx="32" cy="32" r={R} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} transform="rotate(-90 32 32)" />
      <text x="32" y="37" textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>{Math.round(value || 0)}%</text>
    </svg>
  )
}
