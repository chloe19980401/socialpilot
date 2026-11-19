import { useEffect, useMemo, useState } from 'react'
import { ShoppingCart, RefreshCw, Pencil, Plus, Link2, Settings2, Users, Eye, MousePointerClick, Search, Activity, Sparkles, Target, AlertTriangle } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { Button, Tabs } from '../components/ui/Common'
import { money, percent } from '../lib/format'

const WEB_CHART_METRICS = [
  { key: 'users', label: '活跃用户', lines: [{ dataKey: 'users', name: '活跃用户', color: '#3b6ef6' }] },
  { key: 'sessions', label: '会话', lines: [{ dataKey: 'sessions', name: '会话', color: '#8b5cf6' }] },
  { key: 'views', label: '浏览量', lines: [{ dataKey: 'views', name: '浏览量', color: '#0ea5e9' }] },
  { key: 'newUsers', label: '新用户', lines: [{ dataKey: 'newUsers', name: '新用户', color: '#14b8a6' }] },
  { key: 'engagement', label: '参与率', axis: 'rate', lines: [{ dataKey: 'engagement', name: '参与率', color: '#f59e0b', suffix: '%' }] },
  { key: 'clicks', label: '自然点击', lines: [{ dataKey: 'clicks', name: '自然点击', color: '#16a34a' }] },
  { key: 'impressions', label: '自然曝光', lines: [{ dataKey: 'impressions', name: '自然曝光', color: '#64748b' }] },
  { key: 'ctrPosition', label: 'CTR / 排名', axis: 'rate', lines: [{ dataKey: 'ctr', name: 'CTR', color: '#ec4899', suffix: '%' }, { dataKey: 'position', name: '平均排名', color: '#f97316' }] },
]
const WEB_CHART_METRIC_MAP = Object.fromEntries(WEB_CHART_METRICS.map((metric) => [metric.key, metric]))
const GOOGLE_REPORT_CACHE_KEY = 'socialpilot_google_report_cache_v1'

function readGoogleReportCache(config) {
  try {
    const cached = JSON.parse(localStorage.getItem(GOOGLE_REPORT_CACHE_KEY) || 'null')
    if (!cached?.report || cached.ga_property_id !== config.ga_property_id || cached.gsc_site_url !== config.gsc_site_url) return null
    return cached
  } catch {
    return null
  }
}

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
  const [initialGoogleCache] = useState(() => readGoogleReportCache(googleConfig))
  const [googleReport, setGoogleReport] = useState(() => initialGoogleCache?.report || null)
  const [googleDays, setGoogleDays] = useState(() => Number(initialGoogleCache?.days) || 28)
  const [googleReportCachedAt, setGoogleReportCachedAt] = useState(() => initialGoogleCache?.saved_at || '')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState('')
  const [seoAnalysis, setSeoAnalysis] = useState(null)
  const [seoLoading, setSeoLoading] = useState(false)
  const [seoError, setSeoError] = useState('')
  const [selectedWebMetrics, setSelectedWebMetrics] = useState(['users', 'clicks', 'impressions'])

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
    if (error) {
      let detail = error.message
      try {
        const payload = await error.context?.json()
        if (payload?.error) detail = payload.error
      } catch { /* keep the transport error */ }
      throw new Error(detail)
    }
    if (data?.error) throw new Error(data.error)
    return data
  }

  async function loadGoogle(days = googleDays, { refreshReport = true } = {}) {
    setGoogleLoading(true); setGoogleError('')
    try {
      const status = await googleCall('status')
      setGoogleStatus(status)
      if (status.reconnect_required) setGoogleError(`Google 授权已失效，请重新连接。${status.error ? `（${status.error}）` : ''}`)
      if (status.connected && googleConfig.ga_property_id && googleConfig.gsc_site_url && (refreshReport || !googleReport)) {
        const report = await googleCall('report', { days, ...googleConfig })
        const savedAt = new Date().toISOString()
        setGoogleReport(report)
        setGoogleReportCachedAt(savedAt)
        localStorage.setItem(GOOGLE_REPORT_CACHE_KEY, JSON.stringify({ ...googleConfig, days, saved_at: savedAt, report }))
      }
      else if (status.connected && profile?.role === 'admin' && (!googleConfig.ga_property_id || !googleConfig.gsc_site_url)) setGoogleOptions(await googleCall('discover'))
    } catch (e) {
      setGoogleError(e.message || 'Google 数据加载失败')
    } finally { setGoogleLoading(false) }
  }
  useEffect(() => { loadGoogle(googleDays, { refreshReport: !googleReport }) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function connectGoogle() {
    setGoogleLoading(true); setGoogleError('')
    try {
      localStorage.removeItem(GOOGLE_REPORT_CACHE_KEY)
      setGoogleReport(null)
      setGoogleReportCachedAt('')
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

  async function analyzeSEO() {
    if (!googleReport) return
    setSeoLoading(true); setSeoError('')
    try {
      const { data, error } = await supabase.functions.invoke('seo-ai-analysis', {
        body: {
          period: { startDate: googleReport.startDate, endDate: googleReport.endDate, days: googleDays },
          metrics: webKpi,
          gaDaily: googleReport.gaDaily,
          searchDaily: googleReport.searchDaily,
          topQueries: googleReport.topQueries,
          topPages: googleReport.topPages,
        },
      })
      if (error) {
        let detail = error.message
        try { detail = (await error.context?.json())?.error || detail } catch { /* keep transport error */ }
        throw new Error(detail)
      }
      if (data?.error) throw new Error(data.error)
      setSeoAnalysis({ ...data.analysis, generated_at: data.generated_at })
    } catch (e) { setSeoError(e.message || 'AI SEO 分析失败') }
    finally { setSeoLoading(false) }
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
    ;(googleReport?.gaDaily || []).forEach((row) => byDate.set(row.date, {
      date: row.date,
      users: Number(row.activeUsers || 0),
      sessions: Number(row.sessions || 0),
      views: Number(row.views || 0),
      newUsers: Number(row.newUsers || 0),
      engagement: Number(row.sessions || 0) ? (Number(row.engagedSessions || 0) / Number(row.sessions)) * 100 : 0,
      clicks: 0,
      impressions: 0,
      ctr: 0,
      position: 0,
    }))
    ;(googleReport?.searchDaily || []).forEach((row) => {
      const current = byDate.get(row.date) || { date: row.date, users: 0, sessions: 0, views: 0, newUsers: 0, engagement: 0 }
      const clicks = Number(row.clicks || 0)
      const impressions = Number(row.impressions || 0)
      byDate.set(row.date, { ...current, clicks, impressions, ctr: impressions ? (clicks / impressions) * 100 : 0, position: Number(row.position || 0) })
    })
    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
  }, [googleReport])

  const visibleWebMetrics = WEB_CHART_METRICS.filter((metric) => selectedWebMetrics.includes(metric.key))
  const hasCountMetric = visibleWebMetrics.some((metric) => metric.axis !== 'rate')
  const hasRateMetric = visibleWebMetrics.some((metric) => metric.axis === 'rate')

  function toggleWebMetric(key) {
    setSelectedWebMetrics((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key])
  }

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
            {googleReport && <Button variant="primary" onClick={analyzeSEO} disabled={seoLoading}><Sparkles size={15} className={seoLoading ? 'animate-pulse' : ''} />{seoLoading ? '分析中…' : 'AI SEO 分析'}</Button>}
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
              <MiniMetric icon={<Users size={16} />} label="活跃用户" value={webKpi.users.toLocaleString()} colors={WEB_CHART_METRIC_MAP.users.lines.map((line) => line.color)} selected={selectedWebMetrics.includes('users')} onClick={() => toggleWebMetric('users')} />
              <MiniMetric icon={<Activity size={16} />} label="会话" value={webKpi.sessions.toLocaleString()} colors={WEB_CHART_METRIC_MAP.sessions.lines.map((line) => line.color)} selected={selectedWebMetrics.includes('sessions')} onClick={() => toggleWebMetric('sessions')} />
              <MiniMetric icon={<Eye size={16} />} label="浏览量" value={webKpi.views.toLocaleString()} colors={WEB_CHART_METRIC_MAP.views.lines.map((line) => line.color)} selected={selectedWebMetrics.includes('views')} onClick={() => toggleWebMetric('views')} />
              <MiniMetric icon={<Users size={16} />} label="新用户" value={webKpi.newUsers.toLocaleString()} colors={WEB_CHART_METRIC_MAP.newUsers.lines.map((line) => line.color)} selected={selectedWebMetrics.includes('newUsers')} onClick={() => toggleWebMetric('newUsers')} />
              <MiniMetric icon={<Activity size={16} />} label="参与率" value={percent(webKpi.engagement * 100)} colors={WEB_CHART_METRIC_MAP.engagement.lines.map((line) => line.color)} selected={selectedWebMetrics.includes('engagement')} onClick={() => toggleWebMetric('engagement')} />
              <MiniMetric icon={<MousePointerClick size={16} />} label="自然点击" value={webKpi.clicks.toLocaleString()} colors={WEB_CHART_METRIC_MAP.clicks.lines.map((line) => line.color)} selected={selectedWebMetrics.includes('clicks')} onClick={() => toggleWebMetric('clicks')} />
              <MiniMetric icon={<Search size={16} />} label="自然曝光" value={webKpi.impressions.toLocaleString()} colors={WEB_CHART_METRIC_MAP.impressions.lines.map((line) => line.color)} selected={selectedWebMetrics.includes('impressions')} onClick={() => toggleWebMetric('impressions')} />
              <MiniMetric icon={<Search size={16} />} label="CTR / 排名" value={`${percent(webKpi.ctr * 100)} / ${webKpi.position ? webKpi.position.toFixed(1) : '—'}`} colors={WEB_CHART_METRIC_MAP.ctrPosition.lines.map((line) => line.color)} selected={selectedWebMetrics.includes('ctrPosition')} onClick={() => toggleWebMetric('ctrPosition')} />
            </div>
            <div className="mt-5 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
              <div className="relative h-72 rounded-xl border border-slate-100 p-3">
                {visibleWebMetrics.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={trafficSeries}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="date" tickFormatter={(v) => String(v).slice(5).replace('-', '/')} fontSize={11} />{hasCountMetric && <YAxis yAxisId="count" fontSize={11} />}{hasRateMetric && <YAxis yAxisId="rate" orientation={hasCountMetric ? 'right' : 'left'} fontSize={11} />}
                  <Tooltip formatter={(value, name) => [`${Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 })}${name === '参与率' || name === 'CTR' ? '%' : ''}`, name]} /><Legend />
                  {visibleWebMetrics.flatMap((metric) => metric.lines.map((line) => <Line key={line.dataKey} type="monotone" yAxisId={metric.axis === 'rate' ? 'rate' : 'count'} dataKey={line.dataKey} name={line.name} stroke={line.color} strokeWidth={2} dot={false} />))}
                </LineChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-slate-400">点击上方指标卡选择要显示的曲线</div>}
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1"><TopList title="热门搜索词" rows={googleReport.topQueries} /><TopList title="热门落地页" rows={googleReport.topPages} /></div>
            </div>
            <div className="mt-3 text-right text-xs text-slate-400">数据区间 {googleReport.startDate} 至 {googleReport.endDate}{googleReportCachedAt && ` · 上次同步 ${new Date(googleReportCachedAt).toLocaleString('zh-CN')}`} · GA4 与 GSC 数据可能有 1–3 天延迟</div>
            {seoError && <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{seoError}</div>}
            {seoAnalysis && <SeoAnalysis analysis={seoAnalysis} />}
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

function SeoAnalysis({ analysis }) {
  const score = Math.max(0, Math.min(100, Number(analysis.health_score) || 0))
  return (
    <div className="mt-5 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3"><div className="rounded-xl bg-indigo-600 p-2 text-white"><Sparkles size={20} /></div><div><div className="font-semibold text-slate-900">AI SEO 智能分析</div><div className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{analysis.summary}</div></div></div>
        <div className="text-right"><div className="text-xs text-slate-400">SEO 健康分</div><div className="text-3xl font-bold text-indigo-600">{score}<span className="text-sm font-normal text-slate-400">/100</span></div></div>
      </div>
      {!!analysis.highlights?.length && <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{analysis.highlights.map((item, index) => <div key={index} className="rounded-xl border border-white bg-white/80 p-4"><div className="font-medium text-slate-800">{item.title}</div><div className="mt-1 text-xs font-medium text-indigo-600">{item.evidence}</div><div className="mt-2 text-sm leading-5 text-slate-500">{item.meaning}</div></div>)}</div>}
      <div className="mt-5 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div><div className="mb-2 flex items-center gap-2 font-medium text-slate-800"><Target size={17} className="text-indigo-600" />增长机会</div><div className="space-y-2">{(analysis.opportunities || []).map((item, index) => <div key={index} className="rounded-xl border border-slate-100 bg-white p-4"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-0.5 text-xs ${item.priority === '高' ? 'bg-red-50 text-red-600' : item.priority === '中' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{item.priority}优先级</span><span className="text-xs text-indigo-600">{item.type}</span><span className="font-medium text-slate-800">{item.title}</span></div><div className="mt-2 text-xs text-slate-400">证据：{item.evidence}</div><div className="mt-2 text-sm text-slate-600">行动：{item.action}</div>{item.expected_impact && <div className="mt-1 text-xs text-green-600">预期：{item.expected_impact}</div>}</div>)}</div></div>
        <div className="space-y-4">{!!analysis.risks?.length && <div><div className="mb-2 flex items-center gap-2 font-medium text-slate-800"><AlertTriangle size={17} className="text-amber-500" />风险提示</div><div className="space-y-2">{analysis.risks.map((item, index) => <div key={index} className="rounded-xl border border-amber-100 bg-amber-50/60 p-3"><div className="font-medium text-slate-700">{item.title}</div><div className="mt-1 text-xs text-slate-500">{item.evidence}</div><div className="mt-2 text-sm text-slate-600">{item.action}</div></div>)}</div></div>}<div><div className="mb-2 font-medium text-slate-800">下一步执行</div><ol className="space-y-2">{(analysis.next_steps || []).map((item, index) => <li key={index} className="rounded-xl border border-slate-100 bg-white p-3 text-sm"><div className="font-medium text-slate-700">{item.order || index + 1}. {item.action}</div><div className="mt-1 text-xs text-slate-400">负责人：{item.owner} · 验收：{item.success_metric}</div></li>)}</ol></div></div>
      </div>
      {analysis.generated_at && <div className="mt-4 text-right text-xs text-slate-400">生成时间 {new Date(analysis.generated_at).toLocaleString('zh-CN')}</div>}
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

function MiniMetric({ icon, label, value, colors = ['#3b6ef6'], selected = false, onClick }) {
  const primaryColor = colors[0]
  const selectedStyle = selected ? { borderColor: `${primaryColor}99`, backgroundColor: `${primaryColor}12`, boxShadow: `0 0 0 1px ${primaryColor}22` } : undefined
  return <button type="button" aria-pressed={selected} onClick={onClick} style={selectedStyle} className={`relative rounded-xl border p-3 text-left transition ${selected ? 'shadow-sm' : 'border-slate-100 bg-slate-50/60 hover:border-slate-200 hover:bg-white'}`}><div className="flex items-center gap-1.5 text-xs" style={{ color: selected ? primaryColor : '#94a3b8' }}>{icon}<span>{label}</span></div><div className="mt-1 text-lg font-bold text-slate-800">{value}</div>{selected && <span className="absolute right-2 top-2 flex gap-1">{colors.map((color) => <span key={color} className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />)}</span>}</button>
}

function TopList({ title, rows = [] }) {
  return <div className="rounded-xl border border-slate-100 p-3"><div className="mb-2 text-sm font-semibold text-slate-700">{title}</div><div className="space-y-2">{rows.slice(0, 5).map((row, i) => <div key={`${row.key}-${i}`} className="flex items-center justify-between gap-3 text-xs"><span className="min-w-0 truncate text-slate-600" title={row.key}>{row.key}</span><span className="shrink-0 text-slate-400">{row.clicks.toLocaleString()} 点击</span></div>)}{rows.length === 0 && <div className="py-4 text-center text-xs text-slate-300">暂无数据</div>}</div></div>
}
