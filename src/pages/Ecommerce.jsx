import { useEffect, useMemo, useState } from 'react'
import { ShoppingCart, RefreshCw, Pencil, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { Button, Tabs } from '../components/ui/Common'
import { money, percent } from '../lib/format'

export default function Ecommerce() {
  const [brand, setBrand] = useState('all')
  const [brands, setBrands] = useState([])
  const [orders, setOrders] = useState([])
  const [costs, setCosts] = useState([])
  const [spend, setSpend] = useState([])
  const [mode, setMode] = useState('month')
  const [loading, setLoading] = useState(true)

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
