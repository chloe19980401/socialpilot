import { useEffect, useMemo, useState } from 'react'
import { Star, Users, Globe, Plus, FlaskConical, CheckCircle2, Clock, Gift } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Card, StatCard } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { Button, Badge, EmptyState } from '../components/ui/Common'

export default function Kol() {
  const [tab, setTab] = useState('kol')
  const [kols, setKols] = useState([])
  const [reviews, setReviews] = useState([])
  const [brands, setBrands] = useState([])
  const [brandFilter, setBrandFilter] = useState('all')
  const [product, setProduct] = useState('all')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const [{ data: k }, { data: r }, { data: b }] = await Promise.all([
      supabase.from('kols').select('*'),
      supabase.from('kol_alpha_reviews').select('*'),
      supabase.from('brands').select('*'),
    ])
    setKols(k || [])
    setReviews(r || [])
    setBrands(b || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const products = useMemo(() => [...new Set(kols.map((k) => k.product).filter(Boolean))], [kols])

  const filtered = useMemo(() => {
    return kols.filter(
      (k) =>
        (brandFilter === 'all' || k.brand_id === brandFilter) &&
        (product === 'all' || k.product === product)
    )
  }, [kols, brandFilter, product])

  const stats = useMemo(() => ({
    total: filtered.length,
    published: filtered.filter((k) => k.status === 'published').length,
    unpublished: filtered.filter((k) => k.status !== 'published').length,
    freeSwap: filtered.filter((k) => k.free_swap).length,
  }), [filtered])

  return (
    <div>
      <PageHeader
        icon={<Star size={28} />}
        title="KOL 管理"
        subtitle="红人合作与 Alpha 测评记录"
        actions={<Button variant="primary"><Plus size={16} /> 添加红人</Button>}
      />

      <div className="mb-6 inline-flex rounded-xl bg-slate-100 p-1">
        <button onClick={() => setTab('kol')} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${tab === 'kol' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
          <Users size={16} /> KOL 红人管理
        </button>
        <button onClick={() => setTab('alpha')} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${tab === 'alpha' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
          <FlaskConical size={16} /> MileFlask Alpha 测评
        </button>
      </div>

      {tab === 'kol' ? (
        <>
          <div className="mb-2 font-semibold text-slate-800">品牌红人合作管理</div>
          <div className="mb-4 text-sm text-slate-400">按品牌和产品分类</div>

          <div className="mb-4 flex flex-wrap gap-3">
            <button onClick={() => setBrandFilter('all')} className={`rounded-2xl border px-5 py-3 text-left ${brandFilter === 'all' ? 'border-brand-500 ring-1 ring-brand-500' : 'border-slate-200'}`}>
              <span className="flex items-center gap-2 font-semibold text-slate-800"><Globe size={16} /> 全部品牌 <Badge>{kols.length}</Badge></span>
            </button>
            {brands.map((b) => (
              <button key={b.id} onClick={() => setBrandFilter(b.id)} className={`rounded-2xl border px-5 py-3 text-left ${brandFilter === b.id ? 'border-brand-500 ring-1 ring-brand-500' : 'border-slate-200'}`}>
                <span className="flex items-center gap-2 font-semibold text-slate-800"><Globe size={16} /> {b.name} <Badge>{kols.filter((k) => k.brand_id === b.id).length}</Badge></span>
              </button>
            ))}
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            <FilterChip active={product === 'all'} onClick={() => setProduct('all')}>全部产品</FilterChip>
            {products.map((p) => (
              <FilterChip key={p} active={product === p} onClick={() => setProduct(p)}>
                {p} <Badge>{kols.filter((k) => k.product === p).length}</Badge>
              </FilterChip>
            ))}
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={<Users size={20} />} value={stats.total} label="红人总数" />
            <StatCard icon={<CheckCircle2 size={20} />} value={stats.published} label="已发布" />
            <StatCard icon={<Clock size={20} />} value={stats.unpublished} label="未发布" />
            <StatCard icon={<Gift size={20} />} value={stats.freeSwap} label="免费置换" />
          </div>

          <Card className="p-0">
            {filtered.length === 0 ? (
              <EmptyState icon={<Star size={28} />} title={loading ? '加载中…' : '暂无红人记录'} hint="点击「添加红人」录入合作红人" />
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <tr>
                    <th className="px-5 py-3">红人</th><th className="px-5 py-3">平台</th>
                    <th className="px-5 py-3">产品</th><th className="px-5 py-3">粉丝</th><th className="px-5 py-3">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((k) => (
                    <tr key={k.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-700">{k.name}</td>
                      <td className="px-5 py-3 text-slate-500">{k.platform}</td>
                      <td className="px-5 py-3 text-slate-500">{k.product}</td>
                      <td className="px-5 py-3 text-slate-500">{k.followers}</td>
                      <td className="px-5 py-3">
                        <Badge color={k.status === 'published' ? 'green' : 'slate'}>{k.status === 'published' ? '已发布' : '未发布'}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      ) : (
        <Card className="p-0">
          {reviews.length === 0 ? (
            <EmptyState icon={<FlaskConical size={28} />} title={loading ? '加载中…' : '暂无 Alpha 测评记录'} />
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 text-left text-xs text-slate-400">
                <tr><th className="px-5 py-3">红人</th><th className="px-5 py-3">产品</th><th className="px-5 py-3">状态</th></tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-700">{r.kol_name}</td>
                    <td className="px-5 py-3 text-slate-500">{r.product}</td>
                    <td className="px-5 py-3"><Badge>{r.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  )
}

function FilterChip({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${active ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-500'}`}>
      {children}
    </button>
  )
}
