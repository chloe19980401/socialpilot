import { useEffect, useMemo, useState } from 'react'
import { Star, Users, Globe, Plus, CheckCircle2, Clock, Gift, Newspaper, Search, ExternalLink, ShieldCheck, Languages } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Card, StatCard } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { Button, Badge, EmptyState } from '../components/ui/Common'
import { MEDIA_OUTLETS } from '../data/mediaOutlets'

export default function Kol() {
  const [tab, setTab] = useState('kol')
  const [kols, setKols] = useState([])
  const [brands, setBrands] = useState([])
  const [brandFilter, setBrandFilter] = useState('all')
  const [product, setProduct] = useState('all')
  const [loading, setLoading] = useState(true)
  const [mediaSearch, setMediaSearch] = useState('')
  const [mediaRegion, setMediaRegion] = useState('all')
  const [mediaFocus, setMediaFocus] = useState('all')

  async function load() {
    setLoading(true)
    const [{ data: k }, { data: b }] = await Promise.all([
      supabase.from('kols').select('*'),
      supabase.from('brands').select('*'),
    ])
    setKols(k || [])
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

  const mediaRegions = useMemo(() => [...new Set(MEDIA_OUTLETS.map((item) => item.region))], [])
  const mediaFocuses = useMemo(() => [...new Set(MEDIA_OUTLETS.flatMap((item) => item.focus))], [])
  const filteredMedia = useMemo(() => {
    const query = mediaSearch.trim().toLowerCase()
    return MEDIA_OUTLETS.filter((item) => {
      const haystack = [item.name, item.country, item.type, item.contact, item.audience, item.opportunity, ...item.languages, ...item.focus].join(' ').toLowerCase()
      return (!query || haystack.includes(query)) &&
        (mediaRegion === 'all' || item.region === mediaRegion) &&
        (mediaFocus === 'all' || item.focus.includes(mediaFocus))
    })
  }, [mediaFocus, mediaRegion, mediaSearch])

  return (
    <div>
      <PageHeader
        icon={<Star size={28} />}
        title="KOL 管理"
        subtitle="红人合作与全球媒体、杂志资源"
        actions={tab === 'kol' ? <Button variant="primary"><Plus size={16} /> 添加红人</Button> : null}
      />

      <div className="mb-6 inline-flex rounded-xl bg-slate-100 p-1">
        <button onClick={() => setTab('kol')} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${tab === 'kol' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
          <Users size={16} /> KOL 红人管理
        </button>
        <button onClick={() => setTab('media')} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${tab === 'media' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
          <Newspaper size={16} /> 全球媒体与杂志
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

          <Card className="overflow-x-auto p-0">
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
        <>
          <div className="mb-2 font-semibold text-slate-800">全球新闻、杂志与行业媒体资源</div>
          <div className="mb-4 text-sm text-slate-400">官网公开资料核验清单 · 未公开的信息明确标注，不推测邮箱或覆盖规模</div>

          <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={<Newspaper size={20} />} value={MEDIA_OUTLETS.length} label="媒体总数" />
            <StatCard icon={<Globe size={20} />} value={mediaRegions.length} label="覆盖区域" />
            <StatCard icon={<ShieldCheck size={20} />} value={MEDIA_OUTLETS.filter((item) => item.status === 'verified').length} label="官网已核验" />
            <StatCard icon={<Languages size={20} />} value={new Set(MEDIA_OUTLETS.flatMap((item) => item.languages)).size} label="语言" />
          </div>

          <Card className="mb-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500">
                <Search size={16} />
                <input value={mediaSearch} onChange={(event) => setMediaSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" placeholder="搜索媒体、国家、领域、联系人" />
              </label>
              <select value={mediaRegion} onChange={(event) => setMediaRegion(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                <option value="all">全部地区</option>
                {mediaRegions.map((region) => <option key={region} value={region}>{region}</option>)}
              </select>
              <select value={mediaFocus} onChange={(event) => setMediaFocus(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                <option value="all">全部方向</option>
                {mediaFocuses.map((focus) => <option key={focus} value={focus}>{focus}</option>)}
              </select>
            </div>
          </Card>

          <Card className="overflow-x-auto p-0">
            {filteredMedia.length === 0 ? (
              <EmptyState icon={<Newspaper size={28} />} title="没有匹配的媒体" hint="请调整搜索词或筛选条件" />
            ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 text-left text-xs text-slate-400">
                <tr>
                  <th className="px-5 py-3">媒体 / 地区</th><th className="px-5 py-3">方向与受众</th>
                  <th className="px-5 py-3">投稿与联系</th><th className="px-5 py-3">机会判断</th><th className="px-5 py-3">核验</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedia.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 align-top hover:bg-slate-50">
                    <td className="min-w-56 px-5 py-4">
                      <a href={item.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline">{item.name}<ExternalLink size={13} /></a>
                      <div className="mt-1 text-xs text-slate-500">{item.country} · {item.type}</div>
                      <div className="mt-2 flex flex-wrap gap-1">{item.languages.map((language) => <Badge key={language}>{language}</Badge>)}</div>
                    </td>
                    <td className="min-w-64 px-5 py-4 text-slate-600">
                      <div className="flex flex-wrap gap-1">{item.focus.map((focus) => <Badge key={focus} color="blue">{focus}</Badge>)}</div>
                      <div className="mt-2 text-xs leading-5 text-slate-500">{item.audience}</div>
                    </td>
                    <td className="min-w-72 px-5 py-4 text-slate-600">
                      <div className="break-words text-xs leading-5">{item.contact}</div>
                      <a href={item.submissionUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">打开官方投稿/联系入口<ExternalLink size={12} /></a>
                    </td>
                    <td className="min-w-72 px-5 py-4 text-xs leading-5 text-slate-500">{item.opportunity}</td>
                    <td className="min-w-32 px-5 py-4">
                      <Badge color={item.status === 'verified' ? 'green' : item.status === 'review' ? 'orange' : 'slate'}>{item.status === 'verified' ? '官网已核验' : item.status === 'review' ? '投稿前复核' : '待补全'}</Badge>
                      <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 block text-xs text-brand-600 hover:underline">来源</a>
                      <div className="mt-1 text-xs text-slate-400">{item.verifiedAt}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </Card>
        </>
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
