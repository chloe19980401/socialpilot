import { useEffect, useMemo, useRef, useState } from 'react'
import { Star, Users, Globe, Plus, CheckCircle2, Clock, Gift, Newspaper, Search, ExternalLink, ShieldCheck, Languages, BarChart3, FileSearch, Video, Pencil, Upload, FileText, Trash2, Building2, Handshake, CalendarDays, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Card, StatCard } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { Button, Badge, EmptyState, Modal, Field, inputClass } from '../components/ui/Common'
import { MEDIA_OUTLETS } from '../data/mediaOutlets'
import { AUDIENCE_MARKETS, COMPETITOR_CATEGORIES, COMPETITOR_NAMES, COMPETITOR_ORIGINS, COMPETITOR_PROFILES, COVERAGE_AUDIT_DATE, COVERAGE_OUTLET_MARKETS, MEDIA_COMPETITOR_COVERAGE } from '../data/mediaCompetitorCoverage'
import { COMPETITOR_INFLUENCER_COVERAGE, INFLUENCER_AUDIT_DATE, INFLUENCER_EVIDENCE_TYPES, INFLUENCER_PLATFORMS } from '../data/competitorInfluencerCoverage'
import { ASSOCIATION_AUDIT_DATE, INDUSTRY_ASSOCIATIONS, INDUSTRY_ASSOCIATION_CATEGORIES, INDUSTRY_ASSOCIATION_MARKETS } from '../data/industryAssociations'
import { ASSOCIATION_COVERAGE_AUDIT_DATE, ASSOCIATION_EVENT_ROLES, ASSOCIATION_RELATIONSHIP_TYPES, COMPETITOR_ASSOCIATION_COVERAGE, COMPETITOR_ASSOCIATION_EVENTS, COMPETITOR_EXHIBITION_EVENTS, EXHIBITION_FIT_LEVELS, EXHIBITION_INFLUENCE_LEVELS, EXHIBITION_RELATION_TYPES } from '../data/competitorAssociationCoverage'
import { EXHIBITION_CALENDAR_YEARS, EXHIBITION_INDUSTRY_CATEGORIES, EXHIBITION_REGISTRATION_STATES, EXHIBITION_SCOPE_LEVELS, STRATEGIC_EXHIBITION_AUDIT_DATE } from '../data/strategicExhibitionCalendar'

export default function Kol() {
  const [tab, setTab] = useState('media')
  const [kols, setKols] = useState([])
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
  const [associationActivityScope, setAssociationActivityScope] = useState('exhibitions')
  const [exhibitionRelation, setExhibitionRelation] = useState('all')
  const [exhibitionInfluence, setExhibitionInfluence] = useState('all')
  const [exhibitionRegion, setExhibitionRegion] = useState('all')
  const [exhibitionFit, setExhibitionFit] = useState('all')
  const [exhibitionScope, setExhibitionScope] = useState('all')
  const [exhibitionYear, setExhibitionYear] = useState('all')
  const [exhibitionRegistration, setExhibitionRegistration] = useState('all')
  const [exhibitionDisplayMode, setExhibitionDisplayMode] = useState('regionalComparison')
  const [associationDashboardScope, setAssociationDashboardScope] = useState('exhibitions')
  const [associationOrganizationFilter, setAssociationOrganizationFilter] = useState('all')
  const [mediaContacts, setMediaContacts] = useState({})
  const [mediaContactError, setMediaContactError] = useState('')
  const [mediaContactModal, setMediaContactModal] = useState(false)
  const [mediaContactOutlet, setMediaContactOutlet] = useState(null)
  const [mediaContactForm, setMediaContactForm] = useState(emptyMediaContact())
  const [mediaKitFile, setMediaKitFile] = useState(null)
  const [removeMediaKit, setRemoveMediaKit] = useState(false)
  const [savingMediaContact, setSavingMediaContact] = useState(false)
  const exhibitionScrollRef = useRef(null)

  async function load() {
    setLoading(true)
    const [{ data: k }, mediaResult] = await Promise.all([
      supabase.from('kols').select('*'),
      supabase.from('media_outlet_contacts').select('*'),
    ])
    setKols(k || [])
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
      (k) => product === 'all' || k.product === product
    )
  }, [kols, product])

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
    .filter((item) => associationOrganizationFilter === 'all' || item.association === associationOrganizationFilter)
    .filter((item) => categoryFilter === 'all' || competitorProfileMap.get(item.competitor)?.categories.includes(categoryFilter))
    .filter((item) => marketFilter === 'all' || competitorProfileMap.get(item.competitor)?.market === marketFilter)
    .filter((item) => originFilter === 'all' || getCompetitorOrigin(competitorProfileMap.get(item.competitor)) === originFilter)
    .filter((item) => associationRelationshipType === 'all' || item.relationshipType === associationRelationshipType)
    .sort((a, b) => (b.evidenceDate || '').localeCompare(a.evidenceDate || '')), [associationOrganizationFilter, associationRelationshipType, categoryFilter, competitorFilter, competitorProfileMap, marketFilter, originFilter])
  const filteredAssociationEvents = useMemo(() => (associationActivityScope === 'exhibitions' ? COMPETITOR_EXHIBITION_EVENTS : COMPETITOR_ASSOCIATION_EVENTS)
    .filter((item) => competitorFilter === 'all' || item.competitor === competitorFilter)
    .filter((item) => associationOrganizationFilter === 'all' || item.association === associationOrganizationFilter)
    .filter((item) => categoryFilter === 'all' || (associationActivityScope === 'exhibitions' ? item.categories?.includes(categoryFilter) : competitorProfileMap.get(item.competitor)?.categories.includes(categoryFilter)))
    .filter((item) => marketFilter === 'all' || (associationActivityScope === 'exhibitions' ? item.exhibitionMarket === marketFilter : competitorProfileMap.get(item.competitor)?.market === marketFilter))
    .filter((item) => originFilter === 'all' || (!item.isPlanningRecord && getCompetitorOrigin(competitorProfileMap.get(item.competitor)) === originFilter))
    .filter((item) => associationEventRole === 'all' || item.role === associationEventRole)
    .filter((item) => associationActivityScope !== 'exhibitions' || exhibitionRelation === 'all' || item.exhibitionRelation === exhibitionRelation)
    .filter((item) => associationActivityScope !== 'exhibitions' || exhibitionInfluence === 'all' || item.influenceTier === exhibitionInfluence)
    .filter((item) => associationActivityScope !== 'exhibitions' || exhibitionRegion === 'all' || item.region === exhibitionRegion)
    .filter((item) => associationActivityScope !== 'exhibitions' || exhibitionFit === 'all' || item.wonlyFit === exhibitionFit)
    .filter((item) => associationActivityScope !== 'exhibitions' || exhibitionScope === 'all' || item.scopeLevel === exhibitionScope)
    .filter((item) => associationActivityScope !== 'exhibitions' || exhibitionYear === 'all' || item.eventDate?.startsWith(exhibitionYear))
    .filter((item) => associationActivityScope !== 'exhibitions' || exhibitionRegistration === 'all' || item.registrationState === exhibitionRegistration)
    .sort((a, b) => (b.eventDate || '').localeCompare(a.eventDate || '')), [associationActivityScope, associationEventRole, associationOrganizationFilter, categoryFilter, competitorFilter, competitorProfileMap, exhibitionFit, exhibitionInfluence, exhibitionRegion, exhibitionRegistration, exhibitionRelation, exhibitionScope, exhibitionYear, marketFilter, originFilter])
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
  const exhibitionNames = useMemo(() => new Set(COMPETITOR_EXHIBITION_EVENTS.map((item) => item.exhibition)), [])
  const exhibitionRegions = useMemo(() => [...new Set(COMPETITOR_EXHIBITION_EVENTS.map((item) => item.region).filter(Boolean))], [])
  const exhibitionOrganizations = useMemo(() => [...new Set(COMPETITOR_EXHIBITION_EVENTS.map((item) => item.association).filter(Boolean))].sort(), [])
  const regionalExhibitionComparisons = useMemo(() => {
    if (associationActivityScope !== 'exhibitions') return []
    const unique = new Map()
    filteredAssociationEvents.forEach((item) => {
      const current = unique.get(item.exhibition)
      if (!current || (current.isPlanningRecord && !item.isPlanningRecord)) unique.set(item.exhibition, item)
    })
    const groups = new Map()
    unique.forEach((item) => {
      const region = item.region || '其他地区'
      const score = getExhibitionComparisonScore(item)
      if (!groups.has(region)) groups.set(region, [])
      groups.get(region).push({ ...item, comparisonScore: score })
    })
    return [...groups.entries()]
      .map(([region, items]) => ({ region, items: items.sort((a, b) => b.comparisonScore - a.comparisonScore || a.eventDate.localeCompare(b.eventDate)) }))
      .sort((a, b) => a.region.localeCompare(b.region, 'zh-CN'))
  }, [associationActivityScope, filteredAssociationEvents])
  const associationSummaryRecords = useMemo(() => [...COMPETITOR_ASSOCIATION_COVERAGE, ...COMPETITOR_ASSOCIATION_EVENTS]
    .filter((item) => categoryFilter === 'all' || competitorProfileMap.get(item.competitor)?.categories.includes(categoryFilter))
    .filter((item) => marketFilter === 'all' || competitorProfileMap.get(item.competitor)?.market === marketFilter)
    .filter((item) => originFilter === 'all' || getCompetitorOrigin(competitorProfileMap.get(item.competitor)) === originFilter), [categoryFilter, competitorProfileMap, marketFilter, originFilter])
  const associationCompetitorOptions = useMemo(() => countAssociationValues(associationSummaryRecords
    .filter((item) => associationOrganizationFilter === 'all' || item.association === associationOrganizationFilter), 'competitor'), [associationOrganizationFilter, associationSummaryRecords])
  const associationOrganizationOptions = useMemo(() => countAssociationValues(associationSummaryRecords
    .filter((item) => competitorFilter === 'all' || item.competitor === competitorFilter), 'association'), [associationSummaryRecords, competitorFilter])

  function exportFilteredExhibitions() {
    if (!filteredAssociationEvents.length || associationActivityScope !== 'exhibitions') return
    const rows = filteredAssociationEvents.map(toExhibitionExportRow)
    const regionalSheets = [...new Set(rows.map((row) => row['大区']))]
      .map((region) => ({ name: region, rows: rows.filter((row) => row['大区'] === region) }))
    downloadExcelXml([
      { name: '当前筛选', rows },
      ...regionalSheets,
    ], `展会信息_当前筛选_${new Date().toISOString().slice(0, 10)}.xls`)
  }

  return (
    <div>
      <PageHeader
        icon={<Star size={28} />}
        title="媒体与合作资源"
        subtitle="全球媒体、行业协会、竞品活动与达人合作资源"
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
          <div className="mb-2 font-semibold text-slate-800">红人合作管理</div>
          <div className="mb-4 text-sm text-slate-400">按产品分类</div>

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
            <button onClick={() => { setMediaView('associationCoverage'); setCategoryFilter('门'); setCompetitorFilter('all') }} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${mediaView === 'associationCoverage' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
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
              <StatCard icon={<Handshake size={20} />} value={COMPETITOR_ASSOCIATION_COVERAGE.length} label="协会关系证据" active={associationDashboardScope === 'relationships'} onClick={() => { setAssociationDashboardScope('relationships'); setAssociationActivityScope('all') }} />
              <StatCard icon={<ShieldCheck size={20} />} value={associationCoverageCompetitors.size} label="已核验竞品" active={associationDashboardScope === 'competitors'} onClick={() => setAssociationDashboardScope('competitors')} />
              <StatCard icon={<Building2 size={20} />} value={associationCoverageOrganizations.size} label="涉及协会" active={associationDashboardScope === 'associations'} onClick={() => setAssociationDashboardScope('associations')} />
              <StatCard icon={<CalendarDays size={20} />} value={exhibitionNames.size} label="已核验展会" active={associationDashboardScope === 'exhibitions'} onClick={() => { setAssociationDashboardScope('exhibitions'); setAssociationActivityScope('exhibitions') }} />
            </div>

            <Card className="mb-4">
              <div className="flex flex-col gap-3">
                <div>
                  <div className="font-semibold text-slate-800">竞品协会关系与论坛活动反查</div>
                  <div className="mt-1 text-sm text-slate-400">正式会员、母公司董事会、标准生态和活动参与分别标注；参展或认证不自动等于正式会员 · 频率为当前官方证据样本 · 核验日期 {ASSOCIATION_COVERAGE_AUDIT_DATE}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setAssociationActivityScope('exhibitions')} className={`rounded-xl px-4 py-2 text-sm font-medium ${associationActivityScope === 'exhibitions' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>竞品参加的展会</button>
                  <button type="button" onClick={() => setAssociationActivityScope('all')} className={`rounded-xl px-4 py-2 text-sm font-medium ${associationActivityScope === 'all' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>全部论坛活动</button>
                  {associationActivityScope === 'exhibitions' && <>
                    <select value={exhibitionYear} onChange={(event) => setExhibitionYear(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">全部年份</option>{EXHIBITION_CALENDAR_YEARS.map((year) => <option key={year} value={year}>{year} 年</option>)}</select>
                    <select value={exhibitionScope} onChange={(event) => setExhibitionScope(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">全部展会级别</option>{EXHIBITION_SCOPE_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}</select>
                    <select value={exhibitionRegistration} onChange={(event) => setExhibitionRegistration(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">全部报名状态</option>{EXHIBITION_REGISTRATION_STATES.map((state) => <option key={state} value={state}>{state}</option>)}</select>
                    <select value={exhibitionRelation} onChange={(event) => setExhibitionRelation(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">全部参展性质</option>{EXHIBITION_RELATION_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select>
                    <select value={exhibitionInfluence} onChange={(event) => setExhibitionInfluence(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">全部行业影响力</option>{EXHIBITION_INFLUENCE_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}</select>
                    <select value={exhibitionRegion} onChange={(event) => setExhibitionRegion(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">全部展会地区</option>{exhibitionRegions.map((region) => <option key={region} value={region}>{region}</option>)}</select>
                    <select value={exhibitionFit} onChange={(event) => setExhibitionFit(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">全部 WONLY 适配度</option>{EXHIBITION_FIT_LEVELS.map((level) => <option key={level} value={level}>{level}适配</option>)}</select>
                  </>}
                </div>
                {associationActivityScope === 'exhibitions' && <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                  <span className="text-xs font-medium text-slate-400">展示方式</span>
                  <button type="button" onClick={() => setExhibitionDisplayMode('regionalComparison')} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${exhibitionDisplayMode === 'regionalComparison' ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' : 'text-slate-500 hover:bg-slate-50'}`}>区域综合对比</button>
                  <button type="button" onClick={() => setExhibitionDisplayMode('detailTable')} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${exhibitionDisplayMode === 'detailTable' ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' : 'text-slate-500 hover:bg-slate-50'}`}>全部明细</button>
                </div>}
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
                  <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">全部类目</option>{(associationActivityScope === 'exhibitions' ? EXHIBITION_INDUSTRY_CATEGORIES : COMPETITOR_CATEGORIES).map((category) => <option key={category} value={category}>{category}</option>)}</select>
                  <select value={marketFilter} onChange={(event) => setMarketFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">B2B / B2C 全部</option>{AUDIENCE_MARKETS.map((market) => <option key={market} value={market}>{market}</option>)}</select>
                  <select value={originFilter} onChange={(event) => setOriginFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">全部品牌来源</option>{COMPETITOR_ORIGINS.map((origin) => <option key={origin} value={origin}>{origin}</option>)}</select>
                  <select value={associationRelationshipType} onChange={(event) => setAssociationRelationshipType(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">全部协会关系</option>{ASSOCIATION_RELATIONSHIP_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select>
                  <select value={associationEventRole} onChange={(event) => setAssociationEventRole(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">全部活动角色</option>{ASSOCIATION_EVENT_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}</select>
                  <select value={competitorFilter} onChange={(event) => setCompetitorFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">全部竞品</option>{COMPETITOR_NAMES.filter((name) => categoryFilter === 'all' || competitorProfileMap.get(name)?.categories.includes(categoryFilter)).filter((name) => marketFilter === 'all' || competitorProfileMap.get(name)?.market === marketFilter).filter((name) => originFilter === 'all' || getCompetitorOrigin(competitorProfileMap.get(name)) === originFilter).map((name) => <option key={name} value={name}>{name}{associationCoverageCompetitors.has(name) ? '' : '（本轮未检出）'}</option>)}</select>
                  <select value={associationOrganizationFilter} onChange={(event) => setAssociationOrganizationFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"><option value="all">全部协会 / 主办方</option>{(associationActivityScope === 'exhibitions' ? exhibitionOrganizations.map((value) => ({ value })) : associationOrganizationOptions).map(({ value }) => <option key={value} value={value}>{value}</option>)}</select>
                </div>
              </div>
            </Card>

            {(associationDashboardScope === 'competitors' || associationDashboardScope === 'associations') && <Card className="mb-4">
              <div className="flex items-center justify-between gap-3">
                <div><div className="font-semibold text-slate-800">{associationDashboardScope === 'competitors' ? '按竞品筛选' : '按协会 / 主办方筛选'}</div><div className="mt-1 text-xs text-slate-400">点击卡片筛选下方协会关系与活动记录；再次点击当前项可取消。</div></div>
                <button type="button" onClick={() => associationDashboardScope === 'competitors' ? setCompetitorFilter('all') : setAssociationOrganizationFilter('all')} className="shrink-0 text-sm font-medium text-brand-600 hover:underline">清除筛选</button>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {(associationDashboardScope === 'competitors' ? associationCompetitorOptions : associationOrganizationOptions).map(({ value, count }) => {
                  const selected = associationDashboardScope === 'competitors' ? competitorFilter === value : associationOrganizationFilter === value
                  return <button key={value} type="button" onClick={() => associationDashboardScope === 'competitors' ? setCompetitorFilter(selected ? 'all' : value) : setAssociationOrganizationFilter(selected ? 'all' : value)} className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${selected ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'}`}><span className="truncate font-medium">{value}</span><span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${selected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span></button>
                })}
              </div>
            </Card>}

            {associationDashboardScope !== 'exhibitions' && <Card className="mb-4 overflow-x-auto p-0">
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
            </Card>}

            {associationDashboardScope !== 'relationships' && associationActivityScope === 'exhibitions' && exhibitionDisplayMode === 'regionalComparison' && <div className="space-y-4">
              {regionalExhibitionComparisons.length === 0 ? <Card><EmptyState icon={<CalendarDays size={28} />} title="本轮没有匹配的区域对比" hint="可调整年份、类目、地区、报名状态或适配度筛选" /></Card> : regionalExhibitionComparisons.map(({ region, items }) => <Card key={region} className="overflow-hidden p-0">
                <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><div className="flex items-center gap-2"><Globe size={18} className="text-brand-600" /><div className="font-semibold text-slate-800">{region}展会综合对比</div><Badge color="blue">{items.length} 场</Badge></div><div className="mt-1 text-xs text-slate-400">评分统一考虑行业影响力、WONLY 适配、报名可执行性、历史规模证据和展会成熟度；首届展会单独标示风险。</div></div>
                  <div className="text-xs text-slate-400">同一区域内优先级排序</div>
                </div>
                <RegionComparisonChart region={region} items={items} />
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1380px] text-sm">
                    <thead className="border-b border-slate-100 bg-slate-50/70 text-left text-xs text-slate-400"><tr><th className="px-5 py-3">排名 / 综合分</th><th className="px-5 py-3">展会 / 时间</th><th className="px-5 py-3">地点 / 级别</th><th className="px-5 py-3">规模与成熟度</th><th className="px-5 py-3">WONLY 价值</th><th className="px-5 py-3">报名节点</th><th className="px-5 py-3">建议</th></tr></thead>
                    <tbody>{items.map((item, index) => { const stats = getPreviousEditionStats(item); const recommendation = getExhibitionRecommendation(item, index); return <tr id={`exhibition-${item.id}`} key={item.id || item.exhibition} className="scroll-mt-24 border-b border-slate-50 align-top hover:bg-slate-50">
                      <td className="min-w-32 px-5 py-4"><div className="text-lg font-bold text-slate-800">#{index + 1}</div><div className="mt-1 text-2xl font-bold text-brand-600">{item.comparisonScore}<span className="text-xs font-normal text-slate-400">/100</span></div></td>
                      <td className="min-w-72 px-5 py-4"><a href={item.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1 font-semibold text-brand-600 hover:underline">{item.exhibition}<ExternalLink size={13} className="mt-0.5" /></a><div className="mt-1 text-xs text-slate-500">{item.eventDate}{item.eventDateEnd !== item.eventDate ? ` 至 ${item.eventDateEnd}` : ''}</div><div className="mt-2 flex flex-wrap gap-1">{item.categories?.map((category) => <Badge key={category} color="slate">{category}</Badge>)}</div></td>
                      <td className="min-w-52 px-5 py-4"><div className="font-medium text-slate-700">{item.country} · {item.city}</div><div className="mt-1 text-xs text-slate-500">{item.venue}</div><div className="mt-2 flex gap-1"><Badge color={item.scopeLevel === '区域性' ? 'green' : 'blue'}>{item.scopeLevel}</Badge><Badge color={item.influenceTier === '全球旗舰' ? 'blue' : 'green'}>{item.influenceTier}</Badge></div></td>
                      <td className="min-w-64 px-5 py-4"><div className="text-xs leading-5 text-slate-500">{item.scale}</div><div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-2 text-xs"><div><span className="text-slate-400">展商</span><div className="font-semibold text-slate-700">{stats.exhibitors}</div></div><div><span className="text-slate-400">观众</span><div className="font-semibold text-slate-700">{stats.visitors}</div></div></div><div className="mt-2"><Badge color={isFirstEdition(item) ? 'orange' : 'green'}>{isFirstEdition(item) ? '首届待验证' : '已有往届实绩'}</Badge></div></td>
                      <td className="min-w-80 px-5 py-4 text-xs leading-5 text-slate-500"><Badge color={item.wonlyFit === '高' ? 'blue' : 'orange'}>WONLY {item.wonlyFit}适配</Badge><div className="mt-2"><span className="font-medium text-slate-700">核心受众：</span>{item.audience}</div><div className="mt-1"><span className="font-medium text-slate-700">价值：</span>{item.wonlyUse}</div></td>
                      <td className="min-w-64 px-5 py-4 text-xs leading-5"><div className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800">{item.registrationDeadline}</div>{item.registrationUrl && <a href={item.registrationUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 font-medium text-brand-600 hover:underline">官方报名入口<ExternalLink size={11} /></a>}</td>
                      <td className="min-w-52 px-5 py-4"><Badge color={recommendation.color}>{recommendation.label}</Badge><div className="mt-2 text-xs leading-5 text-slate-500">{recommendation.reason}</div></td>
                    </tr>})}</tbody>
                  </table>
                </div>
              </Card>)}
            </div>}

            {associationDashboardScope !== 'relationships' && (associationActivityScope !== 'exhibitions' || exhibitionDisplayMode === 'detailTable') && <Card className="w-full min-w-0 max-w-full overflow-hidden p-0">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
                <div><div className="font-semibold text-slate-800">{associationActivityScope === 'exhibitions' ? '竞品参展与展会决策看板' : '论坛、峰会、标准会议与展会活动'}</div><div className="mt-1 text-xs text-slate-400">{associationActivityScope === 'exhibitions' ? `已补充 2027–2028 建材与窗展会，区域性优先、国家性为辅；报名开放与截止时间以主办方公开信息为准 · 规划库核验 ${STRATEGIC_EXHIBITION_AUDIT_DATE}` : '按时间倒序；角色区分主办、演讲、赞助、参展、董事会和标准工作组。'}</div></div>
                <div className="flex shrink-0 items-center gap-2">
                  {associationActivityScope === 'exhibitions' && <button type="button" onClick={exportFilteredExhibitions} disabled={!filteredAssociationEvents.length} className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 hover:border-brand-300 hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"><Download size={16} />导出 Excel</button>}
                  <span className="hidden text-xs text-slate-400 sm:inline">左右查看</span>
                  <button type="button" aria-label="向左滚动展会表格" onClick={() => exhibitionScrollRef.current?.scrollBy({ left: -640, behavior: 'smooth' })} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:border-brand-300 hover:text-brand-600"><ChevronLeft size={18} /></button>
                  <button type="button" aria-label="向右滚动展会表格" onClick={() => exhibitionScrollRef.current?.scrollBy({ left: 640, behavior: 'smooth' })} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:border-brand-300 hover:text-brand-600"><ChevronRight size={18} /></button>
                </div>
              </div>
              <div ref={exhibitionScrollRef} className="exhibition-scroll max-h-[70vh] w-full min-w-0 max-w-full overflow-auto overscroll-contain">
              {filteredAssociationEvents.length === 0 ? <EmptyState icon={<CalendarDays size={28} />} title={associationActivityScope === 'exhibitions' ? '本轮没有匹配的展会记录' : '本轮没有匹配的论坛活动'} hint="可调整类目、地区、行业影响力、适配度、参与性质或竞品筛选" /> : <table className={`w-full text-sm ${associationActivityScope === 'exhibitions' ? 'min-w-[1900px]' : 'min-w-[1250px]'}`}>
                <thead className="sticky top-0 z-10 border-b border-slate-100 bg-white text-left text-xs text-slate-400"><tr><th className="px-5 py-3">日期 / {associationActivityScope === 'exhibitions' ? '展会' : '活动'}</th>{associationActivityScope === 'exhibitions' && <><th className="px-5 py-3">地点</th><th className="px-5 py-3">行业影响力</th></>}<th className="px-5 py-3">竞品 / 协会</th><th className="px-5 py-3">{associationActivityScope === 'exhibitions' ? '参与性质' : '活动类型与角色'}</th><th className="px-5 py-3">{associationActivityScope === 'exhibitions' ? '受众 / WONLY 机会' : '参与内容'}</th><th className="px-5 py-3">{associationActivityScope === 'exhibitions' ? '费用 / 报名' : '同协会活动频率'}</th></tr></thead>
                <tbody>{filteredAssociationEvents.map((item) => <tr key={item.id} className="border-b border-slate-50 align-top hover:bg-slate-50">
                  <td className="min-w-72 px-5 py-4"><a href={item.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1 font-semibold text-brand-600 hover:underline">{associationActivityScope === 'exhibitions' ? item.exhibition : item.eventName}<ExternalLink size={13} className="mt-0.5 shrink-0" /></a><div className="mt-1 text-xs text-slate-500">{associationActivityScope === 'exhibitions' && item.eventDateEnd !== item.eventDate ? `${item.eventDate} 至 ${item.eventDateEnd}` : item.eventDate}</div>{associationActivityScope === 'exhibitions' && <><div className="mt-2 flex flex-wrap gap-1">{item.scopeLevel && <Badge color={item.scopeLevel === '区域性' ? 'green' : 'blue'}>{item.scopeLevel}</Badge>}{item.priority && <Badge color="orange">{item.priority}</Badge>}{item.categories?.map((category) => <Badge key={category} color="slate">{category}</Badge>)}</div><div className="mt-2 text-xs font-medium text-slate-700">{item.venueDetail}</div></>}</td>
                  {associationActivityScope === 'exhibitions' && <>
                    <td className="min-w-56 px-5 py-4"><div className="font-medium text-slate-700">{item.country} · {item.city}</div><div className="mt-1 text-xs leading-5 text-slate-500">{item.venue}</div><Badge color="blue">{item.region}</Badge></td>
                    <td className="min-w-80 max-w-[360px] px-5 py-4"><Badge color={item.influenceTier === '全球旗舰' ? 'blue' : item.influenceTier === '区域核心' ? 'green' : 'orange'}>{item.influenceTier}</Badge><div className="mt-2 text-xs leading-5 text-slate-500">{item.influenceBasis}</div><div className="mt-2 text-xs font-medium text-slate-700">规模：{item.scale}</div><div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-2 text-xs"><div><div className="text-slate-400">上一届展商</div><div className="mt-0.5 font-semibold text-slate-700">{getPreviousEditionStats(item).exhibitors}</div></div><div><div className="text-slate-400">上一届观展人数</div><div className="mt-0.5 font-semibold text-slate-700">{getPreviousEditionStats(item).visitors}</div></div></div><a href={item.profileSourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-brand-600 hover:underline">展会画像来源<ExternalLink size={11} /></a></td>
                  </>}
                  <td className="min-w-64 px-5 py-4"><div className="font-semibold text-slate-700">{item.isPlanningRecord ? 'WONLY 目标展会' : item.competitor}</div><div className="mt-1 text-xs text-slate-500">{item.association}</div>{item.isPlanningRecord ? <div className="mt-2"><Badge color="orange">尚未核验竞品参展</Badge></div> : <div className="mt-2 flex flex-wrap gap-1"><Badge color="green">{competitorProfileMap.get(item.competitor)?.market}</Badge><Badge color={getCompetitorOrigin(competitorProfileMap.get(item.competitor)) === '中国出海' ? 'orange' : 'slate'}>{getCompetitorOrigin(competitorProfileMap.get(item.competitor))}</Badge>{competitorProfileMap.get(item.competitor)?.categories.map((category) => <Badge key={category} color="blue">{category}</Badge>)}</div>}</td>
                  <td className="min-w-52 px-5 py-4">{associationActivityScope === 'exhibitions' ? <Badge color={item.exhibitionRelation === '确认参展' ? 'green' : item.exhibitionRelation === '展区赞助' ? 'blue' : 'orange'}>{item.exhibitionRelation}</Badge> : <><Badge>{item.eventType}</Badge><div className="mt-2"><Badge color={item.role === '赞助' ? 'green' : item.role === '主办 / 圆桌' ? 'blue' : 'orange'}>{item.role}</Badge></div></>}</td>
                  <td className="min-w-96 max-w-[460px] px-5 py-4 text-xs leading-5 text-slate-500">{associationActivityScope === 'exhibitions' ? <><div className="flex flex-wrap gap-1"><Badge color="green">{item.exhibitionMarket}</Badge><Badge color={item.wonlyFit === '高' ? 'blue' : item.wonlyFit === '中' ? 'orange' : 'slate'}>WONLY {item.wonlyFit}适配</Badge></div><div className="mt-2"><span className="font-medium text-slate-700">核心受众：</span>{item.audience}</div><div className="mt-1"><span className="font-medium text-slate-700">参展价值：</span>{item.wonlyUse}</div><details className="mt-2"><summary className="cursor-pointer font-medium text-brand-600">查看竞品参与证据</summary><div className="mt-1">{item.participation}</div><div className="mt-1 text-slate-400">{item.confidence}置信度 · 官方来源</div></details></> : <>{item.participation}<div className="mt-2 text-slate-400">{item.confidence}置信度 · 官方来源</div></>}</td>
                  <td className="min-w-64 px-5 py-4 text-xs leading-5 text-slate-500">{associationActivityScope === 'exhibitions' ? <><div className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800"><span className="font-semibold">报名时间：</span>{item.registrationDeadline}</div>{item.registrationUrl && <a href={item.registrationUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 font-medium text-brand-600 hover:underline">官方报名入口<ExternalLink size={11} /></a>}<div className="mt-2"><span className="font-medium text-slate-700">预计费用：</span>{item.estimatedCost}</div><div className="mt-1"><span className="font-medium text-slate-700">竞品样本频率：</span>{item.isPlanningRecord ? '待反查' : `${associationEventFrequency.get(`${item.competitor}::${item.association}`) || 0} 场`}</div><div className="mt-1 text-slate-400">实际报价 / 联系人：未记录</div></> : <span className="font-semibold text-slate-700">{associationEventFrequency.get(`${item.competitor}::${item.association}`)} 场</span>}</td>
                </tr>)}</tbody>
              </table>}
              </div>
            </Card>}
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

function RegionComparisonChart({ region, items }) {
  const maxScore = Math.max(...items.map((item) => item.comparisonScore), 100)
  return <div className="border-b border-slate-100 bg-slate-50/40 px-5 py-5">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div><div className="text-sm font-semibold text-slate-700">{region}优先级对比图</div><div className="mt-1 text-xs text-slate-400">条形长度为综合分；分项标签用于解释得分，不代表公开的第三方评级。</div></div>
      <div className="flex flex-wrap gap-3 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-brand-500" />已有往届实绩</span><span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-amber-400" />首届待验证</span></div>
    </div>
    <div className="space-y-3">{items.map((item, index) => {
      const dimensions = getExhibitionComparisonDimensions(item)
      const firstEdition = isFirstEdition(item)
      return <button key={item.id || item.exhibition} type="button" onClick={() => document.getElementById(`exhibition-${item.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="grid w-full gap-2 rounded-xl border border-transparent px-3 py-2 text-left transition hover:border-brand-200 hover:bg-white lg:grid-cols-[260px_minmax(320px,1fr)_390px] lg:items-center">
        <div className="min-w-0"><div className="flex items-center gap-2"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-500 shadow-sm">{index + 1}</span><span className="truncate text-sm font-semibold text-slate-700">{item.exhibition}</span></div><div className="ml-8 mt-0.5 text-xs text-slate-400">{item.country} · {item.city}</div></div>
        <div className="flex items-center gap-3"><div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-200"><div className={`flex h-full items-center justify-end rounded-full pr-2 text-[10px] font-bold text-white transition-all ${firstEdition ? 'bg-amber-400' : 'bg-brand-500'}`} style={{ width: `${Math.max(12, (item.comparisonScore / maxScore) * 100)}%` }}>{item.comparisonScore}</div></div><span className="w-12 text-right text-sm font-bold text-slate-700">{item.comparisonScore}</span></div>
        <div className="grid grid-cols-4 gap-1 text-center text-[10px]"><DimensionPill label="影响力" value={dimensions.influence} max={28} /><DimensionPill label="适配" value={dimensions.fit} max={25} /><DimensionPill label="证据" value={dimensions.evidence} max={15} /><DimensionPill label="报名" value={dimensions.registration} max={12} /></div>
      </button>
    })}</div>
  </div>
}

function DimensionPill({ label, value, max }) {
  const strong = value / max >= 0.8
  return <span className={`rounded-md px-1.5 py-1 ${strong ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-slate-500'}`}>{label} {value}/{max}</span>
}

function countAssociationValues(records, key) {
  const counts = new Map()
  records.forEach((item) => {
    const value = item[key]
    if (value) counts.set(value, (counts.get(value) || 0) + 1)
  })
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
}

function formatMetric(value) {
  if (value === null || value === undefined) return '未公开'
  return new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

function toExhibitionExportRow(item) {
  return {
    '大区': getExhibitionMajorRegion(item),
    '展会地区': item.region || '',
    '展会名称': item.exhibition || item.eventName || '',
    '开始日期': formatExportDate(item.eventDate),
    '结束日期': formatExportDate(item.eventDateEnd || item.eventDate),
    '国家': item.country || '',
    '城市': item.city || '',
    '场馆': item.venue || '',
    '展位 / 场馆详情': item.venueDetail || '',
    '主办方 / 协会': item.association || '',
    '行业标签': (item.categories || []).join('、'),
    '展会级别': item.scopeLevel || '',
    '行业影响力': item.influenceTier || '',
    '影响力依据': item.influenceBasis || '',
    '核心受众': item.audience || '',
    '市场类型': item.exhibitionMarket || '',
    'WONLY 适配度': item.wonlyFit || '',
    'WONLY 机会': item.wonlyUse || '',
    '规模': item.scale || '',
    '上一届展商数': getPreviousEditionStats(item).exhibitors,
    '上一届观展人数': getPreviousEditionStats(item).visitors,
    '竞品': item.isPlanningRecord ? 'WONLY 目标展会' : (item.competitor || ''),
    '参与性质': item.exhibitionRelation || item.role || '',
    '参与说明': item.evidence || '',
    '报名阶段': item.registrationState || '',
    '报名时间 / 状态': item.registrationDeadline || '',
    '报名入口': item.registrationUrl || '',
    '预计费用': item.estimatedCost || '',
    '官方来源': item.sourceUrl || '',
    '展会画像来源': item.profileSourceUrl || '',
  }
}

function getExhibitionMajorRegion(item) {
  const text = `${item.region || ''} ${item.country || ''} ${item.city || ''}`
  if (/中东|沙特|阿联酋|迪拜|利雅得|卡塔尔|土耳其/.test(text)) return '中东'
  if (/中亚|哈萨克|乌兹别克|吉尔吉斯|塔吉克|土库曼/.test(text)) return '中亚'
  if (/欧洲|欧亚|德国|法国|意大利|英国|瑞士|荷兰|比利时|西班牙|斯洛文尼亚|俄罗斯|芬兰|瑞典|挪威|丹麦/.test(text)) return '欧洲'
  if (/北美|美国|加拿大|墨西哥/.test(text)) return '北美'
  if (/非洲|南非|埃及|肯尼亚|尼日利亚|摩洛哥/.test(text)) return '非洲'
  if (/拉美|南美|巴西|阿根廷|智利|哥伦比亚|秘鲁/.test(text)) return '拉美'
  if (/亚太|东南亚|亚洲|中国|香港|菲律宾|泰国|马来西亚|新加坡|印度尼西亚|澳大利亚|新西兰|日本|韩国/.test(text)) return '亚太'
  return '全球与其他'
}

function formatExportDate(value) {
  return value ? String(value).slice(0, 10) : ''
}

function getPreviousEditionStats(item) {
  if (item.previousEditionExhibitors || item.previousEditionVisitors) {
    return {
      exhibitors: item.previousEditionExhibitors || '未公开',
      visitors: item.previousEditionVisitors || '未公开',
    }
  }
  const scale = String(item.scale || '')
  if (!scale || /预计|两届合计|历史覆盖/.test(scale)) return { exhibitors: '未公开', visitors: '未公开' }
  const exhibitorMatch = scale.match(/([\d,]+\+?)\s*(?:家|个)?(?:企业\/品牌|企业与品牌|品牌\/展商|展商|企业)/)
  const visitorMatch = scale.match(/([\d,]+\+?)\s*(?:名|位)?(?:专业人士|专业观众|观众|人次)/)
  return {
    exhibitors: exhibitorMatch ? `${exhibitorMatch[1]} 家` : '未公开',
    visitors: visitorMatch ? `${visitorMatch[1]} 人` : '未公开',
  }
}

function isFirstEdition(item) {
  return item.maturity === '首届待验证' || /首届|inaugural/i.test(`${item.scale || ''} ${item.influenceBasis || ''}`)
}

function getExhibitionComparisonScore(item) {
  const dimensions = getExhibitionComparisonDimensions(item)
  return Math.min(100, Object.values(dimensions).reduce((total, value) => total + value, 0))
}

function getExhibitionComparisonDimensions(item) {
  const influence = item.influenceTier === '全球旗舰' ? 28 : item.influenceTier === '区域核心' ? 23 : 17
  const fit = item.wonlyFit === '高' ? 25 : item.wonlyFit === '中' ? 17 : 9
  const registration = item.registrationState === '报名已开放' ? 12 : item.registrationState === '报名待开放' ? 8 : 5
  const scope = item.priority === '区域优先' ? 10 : 7
  const stats = getPreviousEditionStats(item)
  const evidence = stats.exhibitors !== '未公开' || stats.visitors !== '未公开' ? 15 : isFirstEdition(item) ? 5 : 8
  const maturity = isFirstEdition(item) ? 8 : 10
  return { influence, fit, registration, scope, evidence, maturity }
}

function getExhibitionRecommendation(item, index) {
  if (isFirstEdition(item)) return { label: '战略观察 / 首届试投', color: 'orange', reason: '国际品牌和区域机会较强，但没有往届实绩；优先争取小展位、演讲或渠道会面，并设置线索成本上限。' }
  if (index === 0 && item.wonlyFit === '高') return { label: '区域首选', color: 'green', reason: '在当前区域和筛选条件下综合得分最高，建议优先锁定展位、报名窗口和当地渠道邀约。' }
  if (item.wonlyFit === '高') return { label: '重点备选', color: 'blue', reason: '品类及受众匹配度高，可与区域首选形成不同国家、季度或渠道层级的组合。' }
  return { label: '考察 / 联合参展', color: 'slate', reason: '具备行业价值，但与门和智能入口的直接匹配有限，优先采用观展、协会合作或联合展位。' }
}

function downloadExcelXml(sheets, fileName) {
  const headers = Object.keys(sheets[0]?.rows[0] || {})
  if (!headers.length) return
  const columns = headers.map((header) => `<Column ss:Width="${getExcelColumnWidth(header)}"/>`).join('')
  const worksheetXml = sheets.map(({ name, rows }) => `
    <Worksheet ss:Name="${escapeExcelXml(name.slice(0, 31))}">
      <Table>${columns}
        <Row ss:StyleID="Header">${headers.map((header) => excelCell(header, 'Header')).join('')}</Row>
        ${rows.map((row) => `<Row>${headers.map((header) => excelCell(row[header])).join('')}</Row>`).join('')}
      </Table>
      <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><FreezePanes/><FrozenNoSplit/><SplitHorizontal>1</SplitHorizontal><TopRowBottomPane>1</TopRowBottomPane><ActivePane>2</ActivePane><ProtectObjects>False</ProtectObjects><ProtectScenarios>False</ProtectScenarios></WorksheetOptions>
    </Worksheet>`).join('')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Top" ss:WrapText="1"/><Font ss:FontName="Arial" ss:Size="10"/></Style>
    <Style ss:ID="Header"><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1"/><Interior ss:Color="#DCE6F1" ss:Pattern="Solid"/></Style>
  </Styles>${worksheetXml}
</Workbook>`
  const blob = new Blob([`\ufeff${xml}`], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function excelCell(value, styleId = '') {
  return `<Cell${styleId ? ` ss:StyleID="${styleId}"` : ''}><Data ss:Type="String">${escapeExcelXml(value)}</Data></Cell>`
}

function escapeExcelXml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character])
}

function getExcelColumnWidth(header) {
  if (/来源|入口/.test(header)) return 220
  if (/依据|受众|机会|说明/.test(header)) return 260
  if (/名称|场馆|主办方/.test(header)) return 180
  if (/日期/.test(header)) return 90
  return 110
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
