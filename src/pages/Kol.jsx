import { useEffect, useMemo, useState } from 'react'
import { Star, Users, Globe, Plus, CheckCircle2, Clock, Gift, Newspaper, Search, ExternalLink, ShieldCheck, Languages, BarChart3, FileSearch, Video, Pencil, Upload, FileText, Trash2, Building2, Handshake, CalendarDays } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Card, StatCard } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { Button, Badge, EmptyState, Modal, Field, inputClass } from '../components/ui/Common'
import { MEDIA_OUTLETS } from '../data/mediaOutlets'
import { AUDIENCE_MARKETS, COMPETITOR_CATEGORIES, COMPETITOR_NAMES, COMPETITOR_ORIGINS, COMPETITOR_PROFILES, COVERAGE_AUDIT_DATE, COVERAGE_OUTLET_MARKETS, MEDIA_COMPETITOR_COVERAGE } from '../data/mediaCompetitorCoverage'
import { COMPETITOR_INFLUENCER_COVERAGE, INFLUENCER_AUDIT_DATE, INFLUENCER_EVIDENCE_TYPES, INFLUENCER_PLATFORMS } from '../data/competitorInfluencerCoverage'
import { ASSOCIATION_AUDIT_DATE, INDUSTRY_ASSOCIATIONS, INDUSTRY_ASSOCIATION_CATEGORIES, INDUSTRY_ASSOCIATION_MARKETS } from '../data/industryAssociations'
import { ASSOCIATION_COVERAGE_AUDIT_DATE, ASSOCIATION_EVENT_ROLES, ASSOCIATION_RELATIONSHIP_TYPES, COMPETITOR_ASSOCIATION_COVERAGE, COMPETITOR_ASSOCIATION_EVENTS } from '../data/competitorAssociationCoverage'

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
  const [mediaView, setMediaView] = useState('directory')
  const [associationSearch, setAssociationSearch] = useState('')
  const [associationRegion, setAssociationRegion] = useState('all')
  const [associationCategory, setAssociationCategory] = useState('all')
  const [associationMarket, setAssociationMarket] = useState('all')
  const [competitorFilter, setCompetitorFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [marketFilter, setMarketFilter] = useState('all')
  const [originFilter, setOriginFilter] = useState('all')
  const [influencerPlatform, setInfluencerPlatform] = useState('all')
  const [influencerEvidence, setInfluencerEvidence] = useState('all')
  const [associationRelationshipType, setAssociationRelationshipType] = useState('all')
  const [associationEventRole, setAssociationEventRole] = useState('all')
  const [mediaContacts, setMediaContacts] = useState({})
  const [mediaContactError, setMediaContactError] = useState('')
  const [mediaContactModal, setMediaContactModal] = useState(false)
  const [mediaContactOutlet, setMediaContactOutlet] = useState(null)
  const [mediaContactForm, setMediaContactForm] = useState(emptyMediaContact())
  const [mediaKitFile, setMediaKitFile] = useState(null)
  const [removeMediaKit, setRemoveMediaKit] = useState(false)
  const [savingMediaContact, setSavingMediaContact] = useState(false)

  async function load() {
    setLoading(true)
    const [{ data: k }, { data: b }, mediaResult] = await Promise.all([
      supabase.from('kols').select('*'),
      supabase.from('brands').select('*'),
      supabase.from('media_outlet_contacts').select('*'),
    ])
    setKols(k || [])
    setBrands(b || [])
    if (mediaResult.error) {
      setMediaContactError(mediaResult.error.message)
    } else {
      setMediaContactError('')
      setMediaContacts(Object.fromEntries((mediaResult.data || []).map((record) => [record.outlet_id, record])))
    }
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
      const record = mediaContacts[item.id] || {}
      const haystack = [item.name, item.country, item.type, item.contact, item.audience, item.opportunity, record.actual_contact_name, record.actual_contact_email, record.contact_notes, record.quote_notes, ...item.languages, ...item.focus].join(' ').toLowerCase()
      return (!query || haystack.includes(query)) &&
        (mediaRegion === 'all' || item.region === mediaRegion) &&
        (mediaFocus === 'all' || item.focus.includes(mediaFocus)) &&
        (categoryFilter === 'all' || getMediaCategories(item).includes(categoryFilter)) &&
        (marketFilter === 'all' || getMediaMarket(item) === marketFilter)
    })
  }, [categoryFilter, marketFilter, mediaContacts, mediaFocus, mediaRegion, mediaSearch])
  const associationRegions = useMemo(() => [...new Set(INDUSTRY_ASSOCIATIONS.map((item) => item.region))], [])
  const filteredAssociations = useMemo(() => {
    const query = associationSearch.trim().toLowerCase()
    return INDUSTRY_ASSOCIATIONS.filter((item) => {
      const record = mediaContacts[item.id] || {}
      const haystack = [item.name, item.acronym, item.region, item.country, item.type, item.audience, item.opportunity, item.contact, record.actual_contact_name, record.actual_contact_email, record.contact_notes, ...item.categories].join(' ').toLowerCase()
      return (!query || haystack.includes(query)) &&
        (associationRegion === 'all' || item.region === associationRegion) &&
        (associationCategory === 'all' || item.categories.includes(associationCategory)) &&
        (associationMarket === 'all' || item.market === associationMarket)
    })
  }, [associationCategory, associationMarket, associationRegion, associationSearch, mediaContacts])

  function openMediaContact(item) {
    const record = mediaContacts[item.id]
    setMediaContactOutlet(item)
    setMediaContactForm(record ? { ...emptyMediaContact(), ...record, quoted_price: record.quoted_price ?? '', last_contacted_at: toLocalDateTime(record.last_contacted_at) } : emptyMediaContact())
    setMediaKitFile(null)
    setRemoveMediaKit(false)
    setMediaContactModal(true)
  }

  async function saveMediaContact(event) {
    event?.preventDefault()
    if (!mediaContactOutlet) return
    if (mediaContactForm.quoted_price !== '' && Number(mediaContactForm.quoted_price) < 0) return alert('报价不能小于 0')
    if (mediaKitFile && mediaKitFile.size > 20 * 1024 * 1024) return alert('Media Kit 不能超过 20MB')
    setSavingMediaContact(true)
    let uploadedPath = null
    let mediaKit = {}
    if (mediaKitFile) {
      const safeName = mediaKitFile.name.replace(/[^a-zA-Z0-9._-]+/g, '_')
      uploadedPath = `${mediaContactOutlet.id}/${crypto.randomUUID()}-${safeName}`
      const { error: uploadError } = await supabase.storage.from('media-kits').upload(uploadedPath, mediaKitFile, { cacheControl: '3600', upsert: false })
      if (uploadError) { setSavingMediaContact(false); return alert(`Media Kit 上传失败：${uploadError.message}`) }
      mediaKit = { media_kit_path: uploadedPath, media_kit_name: mediaKitFile.name, media_kit_type: mediaKitFile.type || null, media_kit_size: mediaKitFile.size }
    } else if (removeMediaKit) {
      mediaKit = { media_kit_path: null, media_kit_name: null, media_kit_type: null, media_kit_size: null }
    }
    const { data: authData } = await supabase.auth.getUser()
    const clean = (value) => String(value || '').trim() || null
    const payload = {
      outlet_id: mediaContactOutlet.id,
      outlet_name: mediaContactOutlet.name,
      quoted_price: mediaContactForm.quoted_price === '' ? null : Number(mediaContactForm.quoted_price),
      quoted_currency: mediaContactForm.quoted_currency || 'USD',
      quote_notes: clean(mediaContactForm.quote_notes),
      actual_contact_name: clean(mediaContactForm.actual_contact_name),
      actual_contact_role: clean(mediaContactForm.actual_contact_role),
      actual_contact_email: clean(mediaContactForm.actual_contact_email),
      actual_contact_phone: clean(mediaContactForm.actual_contact_phone),
      contact_status: mediaContactForm.contact_status,
      last_contacted_at: mediaContactForm.last_contacted_at ? new Date(mediaContactForm.last_contacted_at).toISOString() : null,
      contact_notes: clean(mediaContactForm.contact_notes),
      updated_by: authData?.user?.email || null,
      ...mediaKit,
    }
    const { data, error } = await supabase.from('media_outlet_contacts').upsert(payload, { onConflict: 'outlet_id' }).select().single()
    if (error) {
      if (uploadedPath) await supabase.storage.from('media-kits').remove([uploadedPath])
      setSavingMediaContact(false)
      return alert(`保存失败：${error.message}`)
    }
    if (mediaContactForm.media_kit_path && (uploadedPath || removeMediaKit)) await supabase.storage.from('media-kits').remove([mediaContactForm.media_kit_path])
    setMediaContacts((current) => ({ ...current, [mediaContactOutlet.id]: data }))
    setSavingMediaContact(false)
    setMediaContactModal(false)
  }

  async function openMediaKit(path) {
    const { data, error } = await supabase.storage.from('media-kits').createSignedUrl(path, 60)
    if (error) return alert(`打开 Media Kit 失败：${error.message}`)
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }
  const coverageFrequency = useMemo(() => {
    const counts = new Map()
    MEDIA_COMPETITOR_COVERAGE.forEach((item) => {
      const key = `${item.outlet}::${item.competitor}`
      counts.set(key, (counts.get(key) || 0) + 1)
    })
    return counts
  }, [])
  const commercialFrequency = useMemo(() => {
    const counts = new Map()
    MEDIA_COMPETITOR_COVERAGE.filter((item) => item.collaborationConfirmed).forEach((item) => {
      const key = `${item.outlet}::${item.competitor}`
      counts.set(key, (counts.get(key) || 0) + 1)
    })
    return counts
  }, [])
  const competitorProfileMap = useMemo(() => new Map(COMPETITOR_PROFILES.map((item) => [item.name, item])), [])
  const filteredCoverage = useMemo(() => MEDIA_COMPETITOR_COVERAGE
    .filter((item) => competitorFilter === 'all' || item.competitor === competitorFilter)
    .filter((item) => categoryFilter === 'all' || competitorProfileMap.get(item.competitor)?.categories.includes(categoryFilter))
    .filter((item) => marketFilter === 'all' || COVERAGE_OUTLET_MARKETS[item.outlet] === marketFilter)
    .filter((item) => originFilter === 'all' || getCompetitorOrigin(competitorProfileMap.get(item.competitor)) === originFilter)
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || '')), [categoryFilter, competitorFilter, competitorProfileMap, marketFilter, originFilter])
  const coveredCompetitors = useMemo(() => new Set(MEDIA_COMPETITOR_COVERAGE.map((item) => item.competitor)), [])
  const coveredOutlets = useMemo(() => new Set(MEDIA_COMPETITOR_COVERAGE.map((item) => item.outlet)), [])
  const influencerFrequency = useMemo(() => {
    const counts = new Map()
    COMPETITOR_INFLUENCER_COVERAGE.forEach((item) => {
      const key = `${item.creator}::${item.competitor}`
      counts.set(key, (counts.get(key) || 0) + 1)
    })
    return counts
  }, [])
  const filteredInfluencerCoverage = useMemo(() => COMPETITOR_INFLUENCER_COVERAGE
    .filter((item) => competitorFilter === 'all' || item.competitor === competitorFilter)
    .filter((item) => categoryFilter === 'all' || competitorProfileMap.get(item.competitor)?.categories.includes(categoryFilter))
    .filter((item) => originFilter === 'all' || getCompetitorOrigin(competitorProfileMap.get(item.competitor)) === originFilter)
    .filter((item) => influencerPlatform === 'all' || item.platform === influencerPlatform)
    .filter((item) => influencerEvidence === 'all' || item.evidenceType === influencerEvidence)
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || '')), [categoryFilter, competitorFilter, competitorProfileMap, influencerEvidence, influencerPlatform, originFilter])
  const coveredInfluencers = useMemo(() => new Set(COMPETITOR_INFLUENCER_COVERAGE.map((item) => item.creator)), [])
  const influencerCompetitors = useMemo(() => new Set(COMPETITOR_INFLUENCER_COVERAGE.map((item) => item.competitor)), [])
  const filteredAssociationCoverage = useMemo(() => COMPETITOR_ASSOCIATION_COVERAGE
    .filter((item) => competitorFilter === 'all' || item.competitor === competitorFilter)
    .filter((item) => categoryFilter === 'all' || competitorProfileMap.get(item.competitor)?.categories.includes(categoryFilter))
    .filter((item) => originFilter === 'all' || getCompetitorOrigin(competitorProfileMap.get(item.competitor)) === originFilter)
    .filter((item) => associationRelationshipType === 'all' || item.relationshipType === associationRelationshipType)
    .sort((a, b) => (b.evidenceDate || '').localeCompare(a.evidenceDate || '')), [associationRelationshipType, categoryFilter, competitorFilter, competitorProfileMap, originFilter])
  const filteredAssociationEvents = useMemo(() => COMPETITOR_ASSOCIATION_EVENTS
    .filter((item) => competitorFilter === 'all' || item.competitor === competitorFilter)
    .filter((item) => categoryFilter === 'all' || competitorProfileMap.get(item.competitor)?.categories.includes(categoryFilter))
    .filter((item) => originFilter === 'all' || getCompetitorOrigin(competitorProfileMap.get(item.competitor)) === originFilter)
    .filter((item) => associationEventRole === 'all' || item.role === associationEventRole)
    .sort((a, b) => (b.eventDate || '').localeCompare(a.eventDate || '')), [associationEventRole, categoryFilter, competitorFilter, competitorProfileMap, originFilter])
  const associationCoverageCompetitors = useMemo(() => new Set([...COMPETITOR_ASSOCIATION_COVERAGE, ...COMPETITOR_ASSOCIATION_EVENTS].map((item) => item.competitor)), [])
  const associationCoverageOrganizations = useMemo(() => new Set([...COMPETITOR_ASSOCIATION_COVERAGE, ...COMPETITOR_ASSOCIATION_EVENTS].map((item) => item.association)), [])
  const associationEventFrequency = useMemo(() => {
    const counts = new Map()
    COMPETITOR_ASSOCIATION_EVENTS.forEach((item) => {
      const key = `${item.competitor}::${item.association}`
      counts.set(key, (counts.get(key) || 0) + 1)
    })
    return counts
  }, [])

  return (
    <div>
      <PageHeader
        icon={<Star size={28} />}
        title="KOL 管理"
        subtitle="红人合作与全球媒体、杂志、行业协会资源"
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
          <div className="mb-2 font-semibold text-slate-800">全球新闻、杂志、行业媒体与协会资源</div>
          <div className="mb-4 text-sm text-slate-400">官网公开资料核验清单 · 未公开的信息明确标注，不推测邮箱或覆盖规模</div>

          <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-1">
            <button onClick={() => setMediaView('directory')} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${mediaView === 'directory' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
              <Newspaper size={16} /> 媒体目录
            </button>
            <button onClick={() => setMediaView('associations')} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${mediaView === 'associations' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
              <Building2 size={16} /> 全球行业协会
            </button>
            <button onClick={() => setMediaView('associationCoverage')} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${mediaView === 'associationCoverage' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
              <CalendarDays size={16} /> 竞品协会与论坛
            </button>
            <button onClick={() => setMediaView('coverage')} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${mediaView === 'coverage' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
              <BarChart3 size={16} /> 竞品露出与频率
            </button>
            <button onClick={() => setMediaView('influencers')} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${mediaView === 'influencers' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
              <Video size={16} /> 竞品达人合作
            </button>
          </div>

          {mediaView === 'directory' ? <>

          <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={<Newspaper size={20} />} value={MEDIA_OUTLETS.length} label="媒体总数" />
            <StatCard icon={<Globe size={20} />} value={mediaRegions.length} label="覆盖区域" />
            <StatCard icon={<ShieldCheck size={20} />} value={MEDIA_OUTLETS.filter((item) => item.status === 'verified').length} label="官网已核验" />
            <StatCard icon={<Languages size={20} />} value={new Set(MEDIA_OUTLETS.flatMap((item) => item.languages)).size} label="语言" />
          </div>

          <Card className="mb-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_180px_180px]">
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
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                <option value="all">全部类目</option>
                {COMPETITOR_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
              <select value={marketFilter} onChange={(event) => setMarketFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                <option value="all">B2B / B2C 全部</option>
                {AUDIENCE_MARKETS.map((market) => <option key={market} value={market}>{market}</option>)}
              </select>
            </div>
          </Card>

          <Card className="overflow-x-auto p-0">
            {mediaContactError && <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">联络台账尚未就绪：{mediaContactError}</div>}
            {filteredMedia.length === 0 ? (
              <EmptyState icon={<Newspaper size={28} />} title="没有匹配的媒体" hint="请调整搜索词或筛选条件" />
            ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 text-left text-xs text-slate-400">
                <tr>
                  <th className="px-5 py-3">媒体 / 地区</th><th className="px-5 py-3">方向与受众</th>
                  <th className="px-5 py-3">投稿与联系</th><th className="px-5 py-3">实际联络台账</th><th className="px-5 py-3">机会判断</th><th className="px-5 py-3">核验</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedia.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 align-top hover:bg-slate-50">
                    <td className="min-w-56 px-5 py-4">
                      <a href={item.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline">{item.name}<ExternalLink size={13} /></a>
                      <div className="mt-1 text-xs text-slate-500">{item.country} · {item.type}</div>
                      <div className="mt-2 flex flex-wrap gap-1">{item.languages.map((language) => <Badge key={language}>{language}</Badge>)}</div>
                      <div className="mt-2 flex flex-wrap gap-1"><Badge color="green">{getMediaMarket(item)}</Badge>{getMediaCategories(item).map((category) => <Badge key={category} color="blue">{category}</Badge>)}</div>
                    </td>
                    <td className="min-w-64 px-5 py-4 text-slate-600">
                      <div className="flex flex-wrap gap-1">{item.focus.map((focus) => <Badge key={focus} color="blue">{focus}</Badge>)}</div>
                      <div className="mt-2 text-xs leading-5 text-slate-500">{item.audience}</div>
                    </td>
                    <td className="min-w-72 px-5 py-4 text-slate-600">
                      <div className="break-words text-xs leading-5">{item.contact}</div>
                      <a href={item.submissionUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">打开官方投稿/联系入口<ExternalLink size={12} /></a>
                    </td>
                    <td className="min-w-72 px-5 py-4 text-xs leading-5 text-slate-500">
                      {mediaContacts[item.id] ? <>
                        <div className="flex flex-wrap items-center gap-1"><Badge color={contactStatusMeta(mediaContacts[item.id].contact_status).color}>{contactStatusMeta(mediaContacts[item.id].contact_status).label}</Badge>{mediaContacts[item.id].media_kit_path && <Badge color="blue">Media Kit</Badge>}</div>
                        <div className="mt-2 font-medium text-slate-700">{mediaContacts[item.id].actual_contact_name || '未填写实际联系人'}{mediaContacts[item.id].actual_contact_role ? ` · ${mediaContacts[item.id].actual_contact_role}` : ''}</div>
                        {mediaContacts[item.id].actual_contact_email && <div className="break-all">{mediaContacts[item.id].actual_contact_email}</div>}
                        <div className="mt-1">报价：{formatQuote(mediaContacts[item.id])}</div>
                        <div>最近联系：{formatContactDate(mediaContacts[item.id].last_contacted_at)}</div>
                        {mediaContacts[item.id].contact_notes && <div className="mt-1 line-clamp-2 text-slate-400">{mediaContacts[item.id].contact_notes}</div>}
                      </> : <div className="text-slate-400">尚未记录实际联络</div>}
                      <button type="button" onClick={() => openMediaContact(item)} className="mt-2 inline-flex items-center gap-1 font-medium text-brand-600 hover:underline"><Pencil size={12} />{mediaContacts[item.id] ? '编辑联络记录' : '记录联系与报价'}</button>
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
          </> : mediaView === 'associations' ? <>
            <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard icon={<Building2 size={20} />} value={INDUSTRY_ASSOCIATIONS.length} label="协会总数" />
              <StatCard icon={<Globe size={20} />} value={associationRegions.length} label="覆盖区域" />
              <StatCard icon={<FileSearch size={20} />} value={INDUSTRY_ASSOCIATION_CATEGORIES.length} label="行业类目" />
              <StatCard icon={<ShieldCheck size={20} />} value={INDUSTRY_ASSOCIATIONS.filter((item) => item.status === 'verified').length} label="官网已核验" />
            </div>

            <Card className="mb-4">
              <div className="mb-3">
                <div className="font-semibold text-slate-800">全球相关行业协会目录</div>
                <div className="mt-1 text-sm text-slate-400">按智能锁、门、智能家居、安防分类；会员资格与费用以协会官网最新信息为准 · 核验日期 {ASSOCIATION_AUDIT_DATE}</div>
              </div>
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_180px_180px]">
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500"><Search size={16} /><input value={associationSearch} onChange={(event) => setAssociationSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" placeholder="搜索协会、地区、类目或联系人" /></label>
                <select value={associationRegion} onChange={(event) => setAssociationRegion(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">全部地区</option>{associationRegions.map((region) => <option key={region} value={region}>{region}</option>)}</select>
                <select value={associationCategory} onChange={(event) => setAssociationCategory(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">全部类目</option>{INDUSTRY_ASSOCIATION_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select>
                <select value={associationMarket} onChange={(event) => setAssociationMarket(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">B2B / B2C 全部</option>{INDUSTRY_ASSOCIATION_MARKETS.map((market) => <option key={market}>{market}</option>)}</select>
              </div>
            </Card>

            <Card className="overflow-x-auto p-0">
              {filteredAssociations.length === 0 ? <EmptyState icon={<Building2 size={28} />} title="没有匹配的协会" hint="请调整搜索词或筛选条件" /> : <table className="w-full min-w-[1320px] text-sm">
                <thead className="border-b border-slate-100 text-left text-xs text-slate-400"><tr><th className="px-5 py-3">协会 / 地区</th><th className="px-5 py-3">类目与会员群体</th><th className="px-5 py-3">官方入口</th><th className="px-5 py-3">实际联络台账</th><th className="px-5 py-3">WONLY 机会</th><th className="px-5 py-3">核验</th></tr></thead>
                <tbody>{filteredAssociations.map((item) => <tr key={item.id} className="border-b border-slate-50 align-top hover:bg-slate-50">
                  <td className="min-w-60 px-5 py-4"><a href={item.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline">{item.name}<ExternalLink size={13} /></a><div className="mt-1 text-xs text-slate-500">{item.acronym} · {item.country}</div><div className="mt-2 flex flex-wrap gap-1"><Badge color="green">{item.region}</Badge><Badge>{item.type}</Badge></div></td>
                  <td className="min-w-72 px-5 py-4"><div className="flex flex-wrap gap-1"><Badge color="green">{item.market}</Badge>{item.categories.map((category) => <Badge key={category} color="blue">{category}</Badge>)}</div><div className="mt-2 text-xs leading-5 text-slate-500">{item.audience}</div></td>
                  <td className="min-w-72 px-5 py-4 text-xs leading-5 text-slate-500"><div>{item.contact}</div><div className="mt-2 flex flex-col items-start gap-1"><a href={item.membershipUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-brand-600 hover:underline">会员 / 加入入口<ExternalLink size={12} /></a><a href={item.contactUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-brand-600 hover:underline">官方联系入口<ExternalLink size={12} /></a></div></td>
                  <td className="min-w-72 px-5 py-4 text-xs leading-5 text-slate-500">{mediaContacts[item.id] ? <><div className="flex flex-wrap items-center gap-1"><Badge color={contactStatusMeta(mediaContacts[item.id].contact_status).color}>{contactStatusMeta(mediaContacts[item.id].contact_status).label}</Badge>{mediaContacts[item.id].media_kit_path && <Badge color="blue">Media Kit</Badge>}</div><div className="mt-2 font-medium text-slate-700">{mediaContacts[item.id].actual_contact_name || '未填写实际联系人'}{mediaContacts[item.id].actual_contact_role ? ` · ${mediaContacts[item.id].actual_contact_role}` : ''}</div>{mediaContacts[item.id].actual_contact_email && <div className="break-all">{mediaContacts[item.id].actual_contact_email}</div>}<div className="mt-1">报价：{formatQuote(mediaContacts[item.id])}</div><div>最近联系：{formatContactDate(mediaContacts[item.id].last_contacted_at)}</div>{mediaContacts[item.id].contact_notes && <div className="mt-1 line-clamp-2 text-slate-400">{mediaContacts[item.id].contact_notes}</div>}</> : <div className="text-slate-400">尚未记录实际联络</div>}<button type="button" onClick={() => openMediaContact(item)} className="mt-2 inline-flex items-center gap-1 font-medium text-brand-600 hover:underline"><Handshake size={12} />{mediaContacts[item.id] ? '编辑联络记录' : '记录联系与报价'}</button></td>
                  <td className="min-w-72 px-5 py-4 text-xs leading-5 text-slate-500">{item.opportunity}</td>
                  <td className="min-w-32 px-5 py-4"><Badge color="green">官网已核验</Badge><a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 block text-xs text-brand-600 hover:underline">来源</a><div className="mt-1 text-xs text-slate-400">{item.verifiedAt}</div></td>
                </tr>)}</tbody>
              </table>}
            </Card>
          </> : mediaView === 'associationCoverage' ? <>
            <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard icon={<Handshake size={20} />} value={COMPETITOR_ASSOCIATION_COVERAGE.length} label="协会关系证据" />
              <StatCard icon={<ShieldCheck size={20} />} value={associationCoverageCompetitors.size} label="已核验竞品" />
              <StatCard icon={<Building2 size={20} />} value={associationCoverageOrganizations.size} label="涉及协会" />
              <StatCard icon={<CalendarDays size={20} />} value={COMPETITOR_ASSOCIATION_EVENTS.length} label="论坛 / 活动记录" />
            </div>

            <Card className="mb-4">
              <div className="flex flex-col gap-3">
                <div>
                  <div className="font-semibold text-slate-800">竞品协会关系与论坛活动反查</div>
                  <div className="mt-1 text-sm text-slate-400">正式会员、母公司董事会、标准生态和活动参与分别标注；参展或认证不自动等于正式会员 · 频率为当前官方证据样本 · 核验日期 {ASSOCIATION_COVERAGE_AUDIT_DATE}</div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">全部类目</option>{COMPETITOR_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</select>
                  <select value={originFilter} onChange={(event) => setOriginFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">全部品牌来源</option>{COMPETITOR_ORIGINS.map((origin) => <option key={origin} value={origin}>{origin}</option>)}</select>
                  <select value={associationRelationshipType} onChange={(event) => setAssociationRelationshipType(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">全部协会关系</option>{ASSOCIATION_RELATIONSHIP_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select>
                  <select value={associationEventRole} onChange={(event) => setAssociationEventRole(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">全部活动角色</option>{ASSOCIATION_EVENT_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}</select>
                  <select value={competitorFilter} onChange={(event) => setCompetitorFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">全部竞品</option>{COMPETITOR_NAMES.filter((name) => categoryFilter === 'all' || competitorProfileMap.get(name)?.categories.includes(categoryFilter)).filter((name) => originFilter === 'all' || getCompetitorOrigin(competitorProfileMap.get(name)) === originFilter).map((name) => <option key={name} value={name}>{name}{associationCoverageCompetitors.has(name) ? '' : '（本轮未检出）'}</option>)}</select>
                </div>
              </div>
            </Card>

            <Card className="mb-4 overflow-x-auto p-0">
              <div className="border-b border-slate-100 px-5 py-4"><div className="font-semibold text-slate-800">协会关系</div><div className="mt-1 text-xs text-slate-400">“母公司”范围不会被描述成品牌直接入会；认证生态也不会被描述成董事会或正式会员。</div></div>
              {filteredAssociationCoverage.length === 0 ? <EmptyState icon={<Handshake size={28} />} title="本轮没有匹配的协会关系" hint="可调整类目、品牌来源、关系类型或竞品筛选" /> : <table className="w-full min-w-[1180px] text-sm">
                <thead className="border-b border-slate-100 text-left text-xs text-slate-400"><tr><th className="px-5 py-3">竞品 / 类目</th><th className="px-5 py-3">协会</th><th className="px-5 py-3">关系类型</th><th className="px-5 py-3">官方证据</th><th className="px-5 py-3">活动样本频率</th></tr></thead>
                <tbody>{filteredAssociationCoverage.map((item) => <tr key={item.id} className="border-b border-slate-50 align-top hover:bg-slate-50">
                  <td className="min-w-56 px-5 py-4"><div className="font-semibold text-slate-700">{item.competitor}</div><div className="mt-2 flex flex-wrap gap-1"><Badge color={getCompetitorOrigin(competitorProfileMap.get(item.competitor)) === '中国出海' ? 'orange' : 'slate'}>{getCompetitorOrigin(competitorProfileMap.get(item.competitor))}</Badge>{competitorProfileMap.get(item.competitor)?.categories.map((category) => <Badge key={category} color="blue">{category}</Badge>)}</div></td>
                  <td className="min-w-64 px-5 py-4"><div className="font-medium text-slate-700">{item.association}</div><div className="mt-1 text-xs text-slate-400">{item.associationId}</div></td>
                  <td className="min-w-52 px-5 py-4"><Badge color={item.relationshipType === '正式会员' ? 'green' : item.relationshipType === '董事会 / 行业伙伴' ? 'blue' : 'orange'}>{item.relationshipType}</Badge><div className="mt-2 text-xs text-slate-500">关系范围：{item.scope}</div></td>
                  <td className="max-w-[460px] px-5 py-4"><div className="text-xs leading-5 text-slate-500">{item.evidence}</div><a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">官方来源<ExternalLink size={12} /></a><div className="mt-1 text-xs text-slate-400">{item.evidenceDate} · {item.confidence}置信度</div></td>
                  <td className="min-w-32 px-5 py-4 font-semibold text-slate-700">{associationEventFrequency.get(`${item.competitor}::${item.association}`) || 0} 场</td>
                </tr>)}</tbody>
              </table>}
            </Card>

            <Card className="overflow-x-auto p-0">
              <div className="border-b border-slate-100 px-5 py-4"><div className="font-semibold text-slate-800">论坛、峰会、标准会议与展会活动</div><div className="mt-1 text-xs text-slate-400">按时间倒序；角色区分主办、演讲、赞助、参展、董事会和标准工作组。</div></div>
              {filteredAssociationEvents.length === 0 ? <EmptyState icon={<CalendarDays size={28} />} title="本轮没有匹配的论坛活动" hint="可调整类目、品牌来源、活动角色或竞品筛选" /> : <table className="w-full min-w-[1250px] text-sm">
                <thead className="border-b border-slate-100 text-left text-xs text-slate-400"><tr><th className="px-5 py-3">日期 / 活动</th><th className="px-5 py-3">竞品 / 协会</th><th className="px-5 py-3">活动类型与角色</th><th className="px-5 py-3">参与内容</th><th className="px-5 py-3">同协会活动频率</th></tr></thead>
                <tbody>{filteredAssociationEvents.map((item) => <tr key={item.id} className="border-b border-slate-50 align-top hover:bg-slate-50">
                  <td className="min-w-72 px-5 py-4"><a href={item.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1 font-semibold text-brand-600 hover:underline">{item.eventName}<ExternalLink size={13} className="mt-0.5 shrink-0" /></a><div className="mt-1 text-xs text-slate-400">{item.eventDate}</div></td>
                  <td className="min-w-64 px-5 py-4"><div className="font-semibold text-slate-700">{item.competitor}</div><div className="mt-1 text-xs text-slate-500">{item.association}</div><div className="mt-2 flex flex-wrap gap-1"><Badge color={getCompetitorOrigin(competitorProfileMap.get(item.competitor)) === '中国出海' ? 'orange' : 'slate'}>{getCompetitorOrigin(competitorProfileMap.get(item.competitor))}</Badge>{competitorProfileMap.get(item.competitor)?.categories.map((category) => <Badge key={category} color="blue">{category}</Badge>)}</div></td>
                  <td className="min-w-52 px-5 py-4"><Badge>{item.eventType}</Badge><div className="mt-2"><Badge color={item.role === '赞助' ? 'green' : item.role === '主办 / 圆桌' ? 'blue' : 'orange'}>{item.role}</Badge></div></td>
                  <td className="max-w-[460px] px-5 py-4 text-xs leading-5 text-slate-500">{item.participation}<div className="mt-2 text-slate-400">{item.confidence}置信度 · 官方来源</div></td>
                  <td className="min-w-32 px-5 py-4 font-semibold text-slate-700">{associationEventFrequency.get(`${item.competitor}::${item.association}`)} 场</td>
                </tr>)}</tbody>
              </table>}
            </Card>
          </> : mediaView === 'coverage' ? <>
            <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard icon={<FileSearch size={20} />} value={MEDIA_COMPETITOR_COVERAGE.length} label="已核验露出" />
              <StatCard icon={<Newspaper size={20} />} value={coveredOutlets.size} label="出现媒体" />
              <StatCard icon={<ShieldCheck size={20} />} value={coveredCompetitors.size} label="出现竞品" />
              <StatCard icon={<CheckCircle2 size={20} />} value={MEDIA_COMPETITOR_COVERAGE.filter((item) => item.collaborationConfirmed).length} label="商业合作已确认" />
            </div>

            <Card className="mb-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="font-semibold text-slate-800">竞品媒体露出审计</div>
                  <div className="mt-1 text-sm text-slate-400">频率 = 本次已核验页面数，不等同媒体完整历史或付费合作次数 · 核验日期 {COVERAGE_AUDIT_DATE}</div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                    <option value="all">全部类目</option>
                    {COMPETITOR_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                  <select value={marketFilter} onChange={(event) => setMarketFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                    <option value="all">B2B / B2C 全部</option>
                    {AUDIENCE_MARKETS.map((market) => <option key={market} value={market}>{market}</option>)}
                  </select>
                  <select value={originFilter} onChange={(event) => setOriginFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                    <option value="all">全部品牌来源</option>
                    {COMPETITOR_ORIGINS.map((origin) => <option key={origin} value={origin}>{origin}</option>)}
                  </select>
                  <select value={competitorFilter} onChange={(event) => setCompetitorFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                    <option value="all">全部竞品</option>
                    {COMPETITOR_NAMES.filter((name) => categoryFilter === 'all' || competitorProfileMap.get(name)?.categories.includes(categoryFilter)).filter((name) => originFilter === 'all' || getCompetitorOrigin(competitorProfileMap.get(name)) === originFilter).map((name) => <option key={name} value={name}>{name}{coveredCompetitors.has(name) ? '' : '（本轮未检出）'}</option>)}
                  </select>
                </div>
              </div>
            </Card>

            <Card className="overflow-x-auto p-0">
              <table className="w-full min-w-[1100px] text-sm">
                <thead className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <tr>
                    <th className="px-5 py-3">媒体 / 竞品</th><th className="px-5 py-3">新闻或页面</th>
                    <th className="px-5 py-3">露出性质</th><th className="px-5 py-3">合作判断</th><th className="px-5 py-3">核验频率（商业 / 总露出）</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoverage.map((item) => (
                    <tr key={item.id} className="border-b border-slate-50 align-top hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-700">{item.outlet}</div>
                        <div className="mt-1 text-slate-500">{item.competitor}</div>
                        <div className="mt-2 flex flex-wrap gap-1"><Badge color="green">媒体 {COVERAGE_OUTLET_MARKETS[item.outlet] || '待分类'}</Badge><Badge>{competitorProfileMap.get(item.competitor)?.market}</Badge><Badge color={getCompetitorOrigin(competitorProfileMap.get(item.competitor)) === '中国出海' ? 'orange' : 'slate'}>{getCompetitorOrigin(competitorProfileMap.get(item.competitor))}</Badge>{competitorProfileMap.get(item.competitor)?.categories.map((category) => <Badge key={category} color="blue">{category}</Badge>)}</div>
                      </td>
                      <td className="max-w-[420px] px-5 py-4">
                        <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1 font-medium text-brand-600 hover:underline">
                          {item.title} <ExternalLink size={13} className="mt-0.5 shrink-0" />
                        </a>
                        <div className="mt-1 text-xs text-slate-400">{item.publishedAt || '页面未标发布日期'}</div>
                      </td>
                      <td className="px-5 py-4"><Badge color={item.evidenceType === '编辑报道' || item.evidenceType === '编辑采访' ? 'blue' : 'slate'}>{item.evidenceType}</Badge></td>
                      <td className="max-w-[360px] px-5 py-4">
                        <Badge color={item.collaborationConfirmed ? 'green' : 'orange'}>{item.collaborationConfirmed ? '商业合作已确认' : '内容露出，未确认商业合作'}</Badge>
                        <div className="mt-2 text-xs leading-5 text-slate-500">{item.relationship}</div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700">{commercialFrequency.get(`${item.outlet}::${item.competitor}`) || 0} / {coverageFrequency.get(`${item.outlet}::${item.competitor}`)} 条</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </> : <>
            <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard icon={<FileSearch size={20} />} value={COMPETITOR_INFLUENCER_COVERAGE.length} label="已核验内容" />
              <StatCard icon={<Users size={20} />} value={coveredInfluencers.size} label="合作达人" />
              <StatCard icon={<ShieldCheck size={20} />} value={influencerCompetitors.size} label="出现竞品" />
              <StatCard icon={<Video size={20} />} value={new Set(COMPETITOR_INFLUENCER_COVERAGE.map((item) => item.platform)).size} label="已取证平台" />
            </div>

            <Card className="mb-4">
              <div className="flex flex-col gap-3">
                <div>
                  <div className="font-semibold text-slate-800">竞品达人合作反查</div>
                  <div className="mt-1 text-sm text-slate-400">仅收录公开页面可验证的赞助、PR 或商业披露；频率为当前核验样本，不代表全网完整合作次数 · 指标为 {INFLUENCER_AUDIT_DATE} 快照</div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  <select value={influencerPlatform} onChange={(event) => setInfluencerPlatform(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                    <option value="all">全部平台</option>
                    {INFLUENCER_PLATFORMS.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
                  </select>
                  <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                    <option value="all">全部类目</option>
                    {COMPETITOR_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                  <select value={originFilter} onChange={(event) => setOriginFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                    <option value="all">全部品牌来源</option>
                    {COMPETITOR_ORIGINS.map((origin) => <option key={origin} value={origin}>{origin}</option>)}
                  </select>
                  <select value={influencerEvidence} onChange={(event) => setInfluencerEvidence(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                    <option value="all">全部合作证据</option>
                    {INFLUENCER_EVIDENCE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <select value={competitorFilter} onChange={(event) => setCompetitorFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                    <option value="all">全部竞品</option>
                    {COMPETITOR_NAMES.filter((name) => categoryFilter === 'all' || competitorProfileMap.get(name)?.categories.includes(categoryFilter)).filter((name) => originFilter === 'all' || getCompetitorOrigin(competitorProfileMap.get(name)) === originFilter).map((name) => <option key={name} value={name}>{name}{influencerCompetitors.has(name) ? '' : '（本轮未检出）'}</option>)}
                  </select>
                </div>
              </div>
            </Card>

            <Card className="overflow-x-auto p-0">
              {filteredInfluencerCoverage.length === 0 ? <EmptyState icon={<Video size={28} />} title="本轮没有匹配的达人合作证据" hint="可切换平台、类目、品牌来源或竞品；未检出不代表没有合作" /> : (
              <table className="w-full min-w-[1180px] text-sm">
                <thead className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <tr>
                    <th className="px-5 py-3">达人 / 平台</th><th className="px-5 py-3">竞品 / 类目</th><th className="px-5 py-3">合作内容</th>
                    <th className="px-5 py-3">证据与判断</th><th className="px-5 py-3">公开指标快照</th><th className="px-5 py-3">核验频率</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInfluencerCoverage.map((item) => (
                    <tr key={item.id} className="border-b border-slate-50 align-top hover:bg-slate-50">
                      <td className="min-w-52 px-5 py-4">
                        <div className="font-semibold text-slate-700">{item.creator}</div>
                        <div className="mt-1 text-xs text-slate-500">{item.handle}</div>
                        <div className="mt-2"><Badge color="blue">{item.platform}</Badge></div>
                      </td>
                      <td className="min-w-56 px-5 py-4">
                        <div className="font-semibold text-slate-700">{item.competitor}</div>
                        <div className="mt-2 flex flex-wrap gap-1"><Badge color={getCompetitorOrigin(competitorProfileMap.get(item.competitor)) === '中国出海' ? 'orange' : 'slate'}>{getCompetitorOrigin(competitorProfileMap.get(item.competitor))}</Badge>{competitorProfileMap.get(item.competitor)?.categories.map((category) => <Badge key={category} color="blue">{category}</Badge>)}</div>
                      </td>
                      <td className="max-w-[360px] px-5 py-4">
                        <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1 font-medium text-brand-600 hover:underline">{item.title}<ExternalLink size={13} className="mt-0.5 shrink-0" /></a>
                        <div className="mt-1 text-xs text-slate-400">{item.publishedAt}</div>
                      </td>
                      <td className="max-w-[390px] px-5 py-4">
                        <div className="flex flex-wrap gap-1"><Badge color={item.evidenceType === '明确赞助' ? 'green' : item.evidenceType === 'PR / 商业内容' ? 'orange' : 'slate'}>{item.evidenceType}</Badge><Badge color={item.confidence === '高' ? 'green' : 'orange'}>{item.confidence}置信度</Badge></div>
                        <div className="mt-2 text-xs leading-5 text-slate-500">{item.relationship}</div>
                      </td>
                      <td className="min-w-44 px-5 py-4 text-xs leading-6 text-slate-500">
                        <div>粉丝 {formatMetric(item.followers)}</div><div>播放 {formatMetric(item.views)}</div><div className="text-slate-400">截至 {item.metricsAsOf}</div>
                      </td>
                      <td className="min-w-32 px-5 py-4 font-semibold text-slate-700">{influencerFrequency.get(`${item.creator}::${item.competitor}`)} 条</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </Card>
          </>}
        </>
      )}

      <Modal open={mediaContactModal} onClose={() => !savingMediaContact && setMediaContactModal(false)} title={`${mediaContactOutlet?.name || ''} · 联络记录`} footer={<><Button type="button" onClick={() => setMediaContactModal(false)} disabled={savingMediaContact}>取消</Button><Button type="submit" form="media-contact-form" variant="primary" disabled={savingMediaContact}>{savingMediaContact ? '保存中…' : '保存记录'}</Button></>}>
        <form id="media-contact-form" onSubmit={saveMediaContact} className="space-y-5">
          <section>
            <div className="mb-3 font-medium text-slate-800">报价</div>
            <div className="grid grid-cols-[120px_1fr] gap-3">
              <Field label="币种"><select className={inputClass} value={mediaContactForm.quoted_currency} onChange={(e) => setMediaContactForm((v) => ({ ...v, quoted_currency: e.target.value }))}>{['USD','EUR','GBP','CNY','CAD','AUD'].map((currency) => <option key={currency}>{currency}</option>)}</select></Field>
              <Field label="报价金额"><input className={inputClass} type="number" min="0" step="0.01" value={mediaContactForm.quoted_price} onChange={(e) => setMediaContactForm((v) => ({ ...v, quoted_price: e.target.value }))} placeholder="例如 2500" /></Field>
            </div>
            <div className="mt-3"><Field label="报价说明"><textarea className={inputClass} rows="2" value={mediaContactForm.quote_notes} onChange={(e) => setMediaContactForm((v) => ({ ...v, quote_notes: e.target.value }))} placeholder="套餐内容、刊例价、折扣、有效期、是否含税等" /></Field></div>
          </section>
          <section>
            <div className="mb-3 font-medium text-slate-800">实际联系人</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="姓名"><input className={inputClass} value={mediaContactForm.actual_contact_name} onChange={(e) => setMediaContactForm((v) => ({ ...v, actual_contact_name: e.target.value }))} placeholder="实际对接人" /></Field>
              <Field label="职位 / 部门"><input className={inputClass} value={mediaContactForm.actual_contact_role} onChange={(e) => setMediaContactForm((v) => ({ ...v, actual_contact_role: e.target.value }))} placeholder="编辑、商务、广告销售等" /></Field>
              <Field label="邮箱"><input className={inputClass} type="email" value={mediaContactForm.actual_contact_email} onChange={(e) => setMediaContactForm((v) => ({ ...v, actual_contact_email: e.target.value }))} /></Field>
              <Field label="电话 / WhatsApp"><input className={inputClass} value={mediaContactForm.actual_contact_phone} onChange={(e) => setMediaContactForm((v) => ({ ...v, actual_contact_phone: e.target.value }))} /></Field>
            </div>
          </section>
          <section>
            <div className="mb-3 font-medium text-slate-800">联系情况</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="联系状态"><select className={inputClass} value={mediaContactForm.contact_status} onChange={(e) => setMediaContactForm((v) => ({ ...v, contact_status: e.target.value }))}>{Object.entries(CONTACT_STATUSES).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}</select></Field>
              <Field label="最近联系时间"><input className={inputClass} type="datetime-local" value={mediaContactForm.last_contacted_at} onChange={(e) => setMediaContactForm((v) => ({ ...v, last_contacted_at: e.target.value }))} /></Field>
            </div>
            <div className="mt-3"><Field label="联系备注"><textarea className={inputClass} rows="3" value={mediaContactForm.contact_notes} onChange={(e) => setMediaContactForm((v) => ({ ...v, contact_notes: e.target.value }))} placeholder="沟通结果、下一步、回访时间、对方需求等" /></Field></div>
          </section>
          <section>
            <div className="mb-2 font-medium text-slate-800">Media Kit</div>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600"><Upload size={16} />{mediaKitFile ? mediaKitFile.name : '上传 PDF、PPT、Word、Excel、图片或 ZIP（不超过 20MB）'}<input className="hidden" type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.zip" onChange={(e) => { setMediaKitFile(e.target.files?.[0] || null); setRemoveMediaKit(false) }} /></label>
            {mediaContactForm.media_kit_path && !removeMediaKit && <div className="mt-2 flex items-center justify-between rounded-xl bg-blue-50 px-3 py-2 text-sm"><button type="button" className="inline-flex min-w-0 items-center gap-2 text-brand-600 hover:underline" onClick={() => openMediaKit(mediaContactForm.media_kit_path)}><FileText size={15} className="shrink-0" /><span className="truncate">{mediaContactForm.media_kit_name || '查看现有 Media Kit'}</span></button><button type="button" className="ml-3 text-red-500" title="移除附件" onClick={() => { setRemoveMediaKit(true); setMediaKitFile(null) }}><Trash2 size={15} /></button></div>}
            {removeMediaKit && <div className="mt-2 text-xs text-red-500">保存后将移除现有 Media Kit</div>}
          </section>
        </form>
      </Modal>
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

function getMediaCategories(item) {
  if (item.categories?.length) return item.categories
  const text = [...(item.focus || []), item.type || ''].join(' ')
  const categories = []
  if (/智能锁|锁具/.test(text)) categories.push('智能锁')
  if (/门窗|门业|住宅建造|建筑|室内/.test(text)) categories.push('门')
  if (/智能家居|消费科技|家居/.test(text)) categories.push('智能家居')
  if (/安防|门禁|消防|安全/.test(text)) categories.push('安防')
  return [...new Set(categories)]
}

function getMediaMarket(item) {
  if (item.market) return item.market
  return /B2B|行业|专业|工程|建筑产品/.test(`${item.type} ${(item.focus || []).join(' ')}`) ? 'B2B' : 'B2B+B2C'
}

function getCompetitorOrigin(profile) {
  return profile?.origin || '海外品牌'
}

function formatMetric(value) {
  if (value === null || value === undefined) return '未公开'
  return new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

const CONTACT_STATUSES = {
  not_contacted: { label: '未联系', color: 'slate' },
  contacted: { label: '已联系', color: 'blue' },
  follow_up: { label: '待跟进', color: 'orange' },
  negotiating: { label: '洽谈中', color: 'blue' },
  cooperated: { label: '已合作', color: 'green' },
  declined: { label: '暂不合作', color: 'red' },
}

function emptyMediaContact() {
  return { quoted_price: '', quoted_currency: 'USD', quote_notes: '', actual_contact_name: '', actual_contact_role: '', actual_contact_email: '', actual_contact_phone: '', contact_status: 'not_contacted', last_contacted_at: '', contact_notes: '', media_kit_path: null, media_kit_name: null }
}

function contactStatusMeta(status) {
  return CONTACT_STATUSES[status] || CONTACT_STATUSES.not_contacted
}

function toLocalDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function formatContactDate(value) {
  return value ? new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '未记录'
}

function formatQuote(record) {
  if (record.quoted_price === null || record.quoted_price === undefined || record.quoted_price === '') return '未报价'
  try { return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: record.quoted_currency || 'USD', maximumFractionDigits: 2 }).format(Number(record.quoted_price)) } catch { return `${record.quoted_currency || ''} ${record.quoted_price}`.trim() }
}
