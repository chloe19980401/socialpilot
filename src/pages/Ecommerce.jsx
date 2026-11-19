import { useEffect, useMemo, useState } from 'react'
import { ShoppingCart, RefreshCw, Pencil, Plus, Link2, Settings2, Users, Eye, MousePointerClick, Search, Activity } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { Button, Tabs } from '../components/ui/Common'
import { money, percent } from '../lib/format'

export default function Ecommerce() {
  const { profile } = useAuth()
  const [brand, setBrand] = useState('all')
  const [brands, setBrands] = useState([])
  const [orders, setOrders] = useState([])
  const [costs, setCosts] = useState([])
  const [spend, setSpend] = useState([])
  const [mode, setMode] = useState('month')
  const [loading, setLoading] = useState(true)
  const [googleStatus, setGoogleStatus] = useState(null)
  const [googleOptions, setGoogleOptions] = useState({ properties: [], sites: [] })
  const [googleConfig, setGoogleConfig] = useState(() => ({
    ga_property_id: localStorage.getItem('socialpilot_ga_property_id') || '',
    gsc_site_url: localStorage.getItem('socialpilot_gsc_site_url') || '',
  }))
  const [googleReport, setGoogleReport] = useState(null)
  const [googleDays, setGoogleDays] = useState(28)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState('')

  async function load() {
    setLoading(true)
    const [{ data: b }, { data: o }, { data: c }, { data: s }] = await Promise.all([
      supabase.from('brands').select('*'),
      supabase.from('store_orders').select('*'),
      supabase.from('product_costs').select('*'),
      supabase.from('marketing_spend').select('*'),
    ])
    setBrands(b || [])
    setOrders(o || [])
    setCosts(c || [])
    setSpend(s || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function googleCall(action, extra = {}) {
    const { data, error } = await supabase.functions.invoke('google-web-data', { body: { action, ...extra } })
    if (error) throw error
    if (data?.error) throw new Error(data.error)
    return data
  }

  async function loadGoogle(days = googleDays) {
    setGoogleLoading(true); setGoogleError('')
    try {
      const status = await googleCall('status')
      setGoogleStatus(status)
      if (status.connected && googleConfig.ga_property_id && googleConfig.gsc_site_url) setGoogleReport(await googleCall('report', { days, ...googleConfig }))
      else if (status.connected && profile?.role === 'admin') setGoogleOptions(await googleCall('discover'))
    } catch (e) {
      setGoogleError(e.message || 'Google 数据加载失败')
    } finally { setGoogleLoading(false) }
  }
  useEffect(() => { loadGoogle() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function connectGoogle() {
    setGoogleLoading(true); setGoogleError('')
    try {
      const { data, error } = await supabase.functions.invoke('google-web-oauth', { body: {} })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      window.location.href = data.authorization_url
    } catch (e) {
      setGoogleError(e.message || '无法发起 Google 授权')
      setGoogleLoading(false)
    }
  }

  async function discoverGoogle() {
    setGoogleLoading(true); setGoogleError('')
    try { setGoogleOptions(await googleCall('discover')) }
    catch (e) { setGoogleError(e.message) }
    finally { setGoogleLoading(false) }
  }

  async function saveGoogleConfig() {
    const property = googleOptions.properties.find((x) => x.id === googleConfig.ga_property_id)
    const site = googleOptions.sites.find((x) => x.url === googleConfig.gsc_site_url)
    setGoogleLoading(true); setGoogleError('')
    try {
      localStorage.setItem('socialpilot_ga_property_id', googleConfig.ga_property_id)
      localStorage.setItem('socialpilot_gsc_site_url', googleConfig.gsc_site_url)
      setGoogleStatus((current) => ({ ...current, ga_property_id: googleConfig.ga_property_id, ga_property_name: property?.name || '', gsc_site_url: googleConfig.gsc_site_url, gsc_permission_level: site?.permission || '' }))
      await loadGoogle(googleDays)
    } catch (e) { setGoogleError(e.message) }
    finally { setGoogleLoading(false) }
  }

  const filtered = useMemo(
    () => (brand === 'all' ? orders : orders.filter((o) => o.brand_id === brand)),
    [orders, brand]
  )

  const k = useMemo(() => {
    const gross = filtered.reduce((s, o) => s + (Number(o.amount) || 0), 0)
    const refund = filtered.reduce((s, o) => s + (Number(o.refund_amount) || 0), 0)
    const net = gross - refund
    const validOrders = filtered.filter((o) => !o.refund_amount || Number(o.refund_amount) === 0).length
    const refundCount = filtered.filter((o) => Number(o.refund_amount) > 0).length
    const newCustomers = filtered.filter((o) => o.is_new_customer).length
    const returning = filtered.filter((o) => !o.is_new_customer).length
    const aov = validOrders ? net / validOrders : 0
    const totalCost = filtered.reduce((s, o) => s + (Number(o.product_cost) || 0), 0)
    const profit = net - totalCost
    const margin = net ? (profit / net) * 100 : 0
    const adSpend = (brand === 'all' ? spend : spend.filter((x) => x.brand_id === brand)).reduce((s, x) => s + (Number(x.amount) || 0), 0)
    const roas = adSpend ? net / adSpend : null
    return { gross, refund, net, validOrders, refundCount, newCustomers, returning, aov, totalCost, profit, margin, roas }
  }, [filtered, spend, brand])

  const brandTabs = [
    ...brands.map((b) => ({ value: b.id, label: b.name })),
    { value: 'all', label: '双品牌对比' },
  ]

  const webKpi = useMemo(() => {
    const ga = googleReport?.gaDaily || []
    const sc = googleReport?.searchDaily || []
    const sum = (rows, key) => rows.reduce((total, row) => total + Number(row[key] || 0), 0)
    const sessions = sum(ga, 'sessions')
    const engaged = sum(ga, 'engagedSessions')
    const clicks = sum(sc, 'clicks')
    const impressions = sum(sc, 'impressions')
    const weightedPosition = impressions ? sc.reduce((total, row) => total + Number(row.position || 0) * Number(row.impressions || 0), 0) / impressions : 0
    return { users: sum(ga, 'activeUsers'), sessions, views: sum(ga, 'views'), newUsers: sum(ga, 'newUsers'), engagement: sessions ? engaged / sessions : 0, clicks, impressions, ctr: impressions ? clicks / impressions : 0, position: weightedPosition }
  }, [googleReport])

  const trafficSeries = useMemo(() => {
    const byDate = new Map()
    ;(googleReport?.gaDaily || []).forEach((row) => byDate.set(row.date, { date: row.date, users: row.activeUsers, sessions: row.sessions, clicks: 0, impressions: 0 }))
    ;(googleReport?.searchDaily || []).forEach((row) => byDate.set(row.date, { ...(byDate.get(row.date) || { date: row.date, users: 0, sessions: 0 }), clicks: row.clicks, impressions: row.impressions }))
    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
  }, [googleReport])

  return (
    <div>
      <PageHeader
        icon={<ShoppingCart size={28} />}
        title="自建站数据看板"
        subtitle="净销售额 · 退款笔数 · 营销 ROI，持续更新中"
        actions={
          <>
            <Button onClick={load}><RefreshCw size={16} /> 刷新</Button>
            <Button><Pencil size={16} /> 编辑产品价格</Button>
            <Button variant="primary"><Plus size={16} /> 添加营销花费</Button>
          </>
        }
      />

      <div className="mb-4">
        <Tabs tabs={brandTabs.length ? brandTabs : [{ value: 'all', label: '全部' }]} value={brand} onChange={setBrand} />
      </div>

      <Card className="mb-6 p-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div><div className="font-semibold text-slate-800">网站流量与自然搜索</div><div className="mt-0.5 text-xs text-slate-400">Google Analytics 4 + Google Search Console · 只读连接</div></div>
          <div className="flex flex-wrap items-center gap-2">
            {googleStatus?.connected && <span className="text-xs text-green-600">已连接 {googleStatus.google_email}</span>}
            {googleStatus?.connected && googleConfig.ga_property_id && googleConfig.gsc_site_url && <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={googleDays} onChange={(e) => { const value = Number(e.target.value); setGoogleDays(value); loadGoogle(value) }}><option value={28}>近 28 天</option><option value={90}>近 90 天</option><option value={180}>近 180 天</option></select>}
            {googleStatus?.connected && <Button onClick={() => loadGoogle()} disabled={googleLoading}><RefreshCw size={15} className={googleLoading ? 'animate-spin' : ''} />同步</Button>}
            {profile?.role === 'admin' && !googleStatus?.connected && <Button variant="primary" onClick={connectGoogle} disabled={googleLoading}><Link2 size={15} />连接 Google</Button>}
            {profile?.role === 'admin' && googleStatus?.connected && (!googleConfig.ga_property_id || !googleConfig.gsc_site_url) && <Button onClick={discoverGoogle} disabled={googleLoading}><Settings2 size={15} />选择数据源</Button>}
          </div>
        </div>
        {googleError && <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">{googleError}</div>}
        {!googleStatus?.connected ? (
          <div className="px-5 py-10 text-center"><div className="text-sm font-medium text-slate-600">尚未连接网站数据</div><div className="mt-1 text-xs text-slate-400">管理员连接拥有 GA4 与 Search Console 权限的 Google 账号后即可展示。</div></div>
        ) : (!googleConfig.ga_property_id || !googleConfig.gsc_site_url) ? (
          <div className="grid gap-3 p-5 md:grid-cols-[1fr_1fr_auto]">
            <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={googleConfig.ga_property_id} onChange={(e) => setGoogleConfig({ ...googleConfig, ga_property_id: e.target.value })}><option value="">选择 GA4 属性</option>{googleOptions.properties.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.account}</option>)}</select>
            <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={googleConfig.gsc_site_url} onChange={(e) => setGoogleConfig({ ...googleConfig, gsc_site_url: e.target.value })}><option value="">选择 GSC 站点</option>{googleOptions.sites.map((s) => <option key={s.url} value={s.url}>{s.url}</option>)}</select>
            <Button variant="primary" onClick={saveGoogleConfig} disabled={googleLoading || !googleConfig.ga_property_id || !googleConfig.gsc_site_url}>保存并同步</Button>
          </div>
        ) : googleLoading && !googleReport ? <div className="px-5 py-12 text-center text-sm text-slate-400">正在读取 Google 数据…</div> : googleReport ? (
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
              <MiniMetric icon={<Users size={16} />} label="活跃用户" value={webKpi.users.toLocaleString()} />
              <MiniMetric icon={<Activity size={16} />} label="会话" value={webKpi.sessions.toLocaleString()} />
              <MiniMetric icon={<Eye size={16} />} label="浏览量" value={webKpi.views.toLocaleString()} />
              <MiniMetric icon={<Users size={16} />} label="新用户" value={webKpi.newUsers.toLocaleString()} />
              <MiniMetric icon={<Activity size={16} />} label="参与率" value={percent(webKpi.engagement * 100)} />
              <MiniMetric icon={<MousePointerClick size={16} />} label="自然点击" value={webKpi.clicks.toLocaleString()} />
              <MiniMetric icon={<Search size={16} />} label="自然曝光" value={webKpi.impressions.toLocaleString()} />
              <MiniMetric icon={<Search size={16} />} label="CTR / 排名" value={`${percent(webKpi.ctr * 100)} / ${webKpi.position ? webKpi.position.toFixed(1) : '—'}`} />
            </div>
            <div className="mt-5 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
              <div className="h-72 rounded-xl border border-slate-100 p-3"><ResponsiveContainer width="100%" height="100%"><LineChart data={trafficSeries}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="date" tickFormatter={(v) => String(v).slice(5).replace('-', '/')} fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Legend /><Line type="monotone" dataKey="users" name="活跃用户" stroke="#3b6ef6" dot={false} /><Line type="monotone" dataKey="clicks" name="自然点击" stroke="#16a34a" dot={false} /></LineChart></ResponsiveContainer></div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1"><TopList title="热门搜索词" rows={googleReport.topQueries} /><TopList title="热门落地页" rows={googleReport.topPages} /></div>
            </div>
            <div className="mt-3 text-right text-xs text-slate-400">数据区间 {googleReport.startDate} 至 {googleReport.endDate} · GA4 与 GSC 数据可能有 1–3 天延迟</div>
          </div>
        ) : null}
      </Card>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Tabs tabs={[{ value: 'month', label: '按月份' }, { value: 'custom', label: '自定义日期' }]} value={mode} onChange={setMode} />
        <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option>全部月份</option></select>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <KCard label="总销售额" value={money(k.gross)} hint="所有订单金额绝对值之和" />
        <KCard label="退款金额" value={money(k.refund)} hint={`${k.refundCount} 笔退款`} />
        <KCard label="净销售额" value={money(k.net)} hint="总销售额 − 退款金额" />
        <KCard label="有效订单" value={k.validOrders} hint={`退款 ${k.refundCount} 笔`} />
        <KCard label="新客户" value={k.newCustomers} hint={`回头客 ${k.returning} 人`} />
        <KCard label="客单价" value={money(k.aov)} hint="净销售额 / 订单数" />
        <KCard label="产品成本合计" value={money(k.totalCost)} hint="按产品成本汇总" />
        <KCard label="毛利润" value={money(k.profit)} hint="净销售额 − 成本" />
        <KCard label="毛利率" value={percent(k.margin)} hint="毛利润 / 净销售额" />
        <KCard label="ROAS" value={k.roas == null ? '—' : k.roas.toFixed(2)} hint="净销售额 / 广告花费" />
      </div>

      {loading && <div className="mt-6 text-center text-sm text-slate-400">加载中…</div>}
      {!loading && orders.length === 0 && (
        <div className="mt-6 text-center text-sm text-slate-400">暂无订单数据，导入订单或添加营销花费后自动计算</div>
      )}
    </div>
  )
}

function KCard({ label, value, hint }) {
  return (
    <Card className="p-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </Card>
  )
}

function MiniMetric({ icon, label, value }) {
  return <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"><div className="flex items-center gap-1.5 text-xs text-slate-400">{icon}{label}</div><div className="mt-1 text-lg font-bold text-slate-800">{value}</div></div>
}

function TopList({ title, rows = [] }) {
  return <div className="rounded-xl border border-slate-100 p-3"><div className="mb-2 text-sm font-semibold text-slate-700">{title}</div><div className="space-y-2">{rows.slice(0, 5).map((row, i) => <div key={`${row.key}-${i}`} className="flex items-center justify-between gap-3 text-xs"><span className="min-w-0 truncate text-slate-600" title={row.key}>{row.key}</span><span className="shrink-0 text-slate-400">{row.clicks.toLocaleString()} 点击</span></div>)}{rows.length === 0 && <div className="py-4 text-center text-xs text-slate-300">暂无数据</div>}</div></div>
}
