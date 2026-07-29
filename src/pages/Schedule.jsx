import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  CalendarClock, Plus, RefreshCw, ChevronLeft, ChevronRight, LayoutList,
  Columns3, CalendarDays, CalendarRange, Check, X, Send, Rocket, Pencil, Trash2,
  Clock, User, Tag as TagIcon, AlertTriangle, Upload, Loader2,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { Button, Tabs, Badge, Modal, Field, inputClass, EmptyState } from '../components/ui/Common'
import { platformMeta, PLATFORMS } from '../lib/platforms'
import { WEEKDAYS_CN } from '../lib/format'
import {
  PLAN_STATUS, KANBAN_COLUMNS, statusMeta, CONTENT_TYPE_LIST, contentTypeLabel,
  fmtDateTime, toLocalInput, relativeDay,
} from '../lib/plans'

/* ---------------- 工具 ---------------- */
function monthMatrix(year, month) {
  const first = new Date(year, month, 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())
  return [...Array(42)].map((_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}
function weekDays(cursor) {
  const start = new Date(cursor)
  start.setDate(cursor.getDate() - cursor.getDay())
  return [...Array(7)].map((_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}
const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString()
// 账号可多选：优先用 account_ids 数组，兼容老数据的单个 account_id
const planAccountIds = (p) => (p.account_ids?.length ? p.account_ids : (p.account_id ? [p.account_id] : []))
// 平台从所选账号自动推导；无账号时兼容老的 platforms/platform 字段
const planPlatforms = (p, accountMap) => {
  const ids = planAccountIds(p)
  if (ids.length && accountMap) {
    const set = [...new Set(ids.map((id) => accountMap[id]?.platform).filter(Boolean))]
    if (set.length) return set
  }
  return p.platforms?.length ? p.platforms : (p.platform ? [p.platform] : [])
}
const emptyForm = () => ({
  id: null, brand_id: '', account_ids: [], title: '', content: '',
  thumbnail_url: '', asset_url: '', content_type: 'image', topic: '', notes: '',
  assignee_email: '', scheduled_at: '', status: 'draft',
})

/* ---------------- 主组件 ---------------- */
export default function Schedule() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const [plans, setPlans] = useState([])
  const [brands, setBrands] = useState([])
  const [accounts, setAccounts] = useState([])
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)

  const [view, setView] = useState('kanban')
  const [cursor, setCursor] = useState(new Date())

  // 筛选
  const [fBrand, setFBrand] = useState('all')
  const [fPlatform, setFPlatform] = useState('all')
  const [fAssignee, setFAssignee] = useState('all')
  const [fStatus, setFStatus] = useState('all')

  // 表单
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // 审批驳回
  const [rejectFor, setRejectFor] = useState(null)
  const [rejectNote, setRejectNote] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: pl }, { data: br }, { data: ac }, { data: pe }] = await Promise.all([
      supabase.from('content_plans').select('*').order('scheduled_at', { ascending: true }),
      supabase.from('brands').select('id, name, color'),
      supabase.from('accounts').select('id, display_name, handle, platform, brand_id'),
      supabase.from('profiles').select('id, email, name'),
    ])
    setPlans(pl || [])
    setBrands(br || [])
    setAccounts(ac || [])
    setPeople(pe || [])
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const brandMap = useMemo(() => Object.fromEntries(brands.map((b) => [b.id, b])), [brands])
  const accountMap = useMemo(() => Object.fromEntries(accounts.map((a) => [a.id, a])), [accounts])
  // 帖子主题类型下拉选项：汇总所有排期里已有的主题（支持新增：直接输入新值即可）
  const topicOptions = useMemo(() => [...new Set(plans.map((p) => p.topic).filter(Boolean))].sort(), [plans])

  // 上传配图到 Supabase Storage，得到公开链接
  async function uploadImage(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('请选择图片文件'); return }
    setUploading(true)
    const ext = (file.name.split('.').pop() || 'png').toLowerCase()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('plan-images').upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) { alert('上传失败：' + error.message); setUploading(false); return }
    const { data } = supabase.storage.from('plan-images').getPublicUrl(path)
    setForm((f) => ({ ...f, thumbnail_url: data.publicUrl }))
    setUploading(false)
  }

  const filtered = useMemo(() => plans.filter((p) => (
    (fBrand === 'all' || p.brand_id === fBrand) &&
    (fPlatform === 'all' || planPlatforms(p, accountMap).includes(fPlatform)) &&
    (fAssignee === 'all' || p.assignee_email === fAssignee) &&
    (fStatus === 'all' || p.status === fStatus)
  )), [plans, fBrand, fPlatform, fAssignee, fStatus, accountMap])

  /* ---------- 打开表单 ---------- */
  function openNew(prefillDate) {
    const f = emptyForm()
    if (prefillDate) {
      const d = new Date(prefillDate); d.setHours(10, 0, 0, 0)
      f.scheduled_at = toLocalInput(d)
    }
    if (fBrand !== 'all') f.brand_id = fBrand
    if (profile?.email) f.assignee_email = profile.email
    setForm(f); setModalOpen(true)
  }
  function openEdit(p) {
    setForm({
      id: p.id, brand_id: p.brand_id || '', account_ids: planAccountIds(p),
      title: p.title || '', content: p.content || '',
      thumbnail_url: p.thumbnail_url || '', asset_url: p.asset_url || '',
      content_type: p.content_type || 'image', topic: p.topic || '',
      notes: p.notes || '', assignee_email: p.assignee_email || '',
      scheduled_at: toLocalInput(p.scheduled_at), status: p.status || 'draft',
    })
    setModalOpen(true)
  }

  /* ---------- 保存 ---------- */
  async function save() {
    if (!form.title.trim()) { alert('请填写标题'); return }
    setSaving(true)
    const person = people.find((x) => x.email === form.assignee_email)
    const selAccounts = form.account_ids.map((id) => accountMap[id]).filter(Boolean)
    const derivedPlatforms = [...new Set(selAccounts.map((a) => a.platform).filter(Boolean))]
    const payload = {
      brand_id: form.brand_id || null,
      account_ids: form.account_ids || [],
      account_id: form.account_ids?.[0] || null,        // 兼容旧字段
      platforms: derivedPlatforms,                       // 由所选账号推导
      platform: derivedPlatforms[0] || null,             // 兼容旧字段
      title: form.title.trim(),
      content: form.content || null,
      thumbnail_url: form.thumbnail_url || null,
      asset_url: form.asset_url || null,
      content_type: form.content_type || null,
      topic: form.topic?.trim() || null,
      notes: form.notes || null,
      assignee_email: form.assignee_email || null,
      assignee_name: person?.name || (form.assignee_email ? form.assignee_email.split('@')[0] : null),
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
    }
    let error
    if (form.id) {
      ({ error } = await supabase.from('content_plans').update(payload).eq('id', form.id))
    } else {
      payload.status = 'draft'
      payload.created_by = profile?.email || null
      ;({ error } = await supabase.from('content_plans').insert(payload))
    }
    setSaving(false)
    if (error) { alert('保存失败：' + error.message); return }
    setModalOpen(false); load()
  }

  async function remove(p) {
    if (!confirm(`删除排期「${p.title || '未命名'}」？`)) return
    await supabase.from('content_plans').delete().eq('id', p.id)
    load()
  }

  /* ---------- 状态流转 ---------- */
  const patch = useCallback(async (id, fields) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...fields } : p))) // 乐观更新
    const { error } = await supabase.from('content_plans').update(fields).eq('id', id)
    if (error) { alert('操作失败：' + error.message); load() }
  }, [load])

  function submitReview(p) { patch(p.id, { status: 'pending' }) }
  function approve(p) {
    patch(p.id, { status: 'approved', reviewed_by: profile?.email || null, reviewed_at: new Date().toISOString(), review_note: null })
  }
  function doReject() {
    if (!rejectFor) return
    patch(rejectFor.id, { status: 'rejected', reviewed_by: profile?.email || null, reviewed_at: new Date().toISOString(), review_note: rejectNote || null })
    setRejectFor(null); setRejectNote('')
  }
  function reopen(p) { patch(p.id, { status: 'draft', review_note: null }) }

  // 标记已发布：按所选账号各写一条 posts 记录，融入内容中心/日历
  async function markPublished(p) {
    const accs = planAccountIds(p).map((id) => accountMap[id]).filter(Boolean)
    const n = accs.length || 1
    if (!confirm(`把「${p.title || '未命名'}」标记为已发布？将向内容中心写入 ${n} 条发布记录${n > 1 ? '（每个账号各一条）' : ''}。`)) return
    const publishedAt = p.scheduled_at || new Date().toISOString()
    const rows = (accs.length ? accs : [null]).map((a) => ({
      brand_id: p.brand_id, account_id: a?.id || null, platform: a?.platform || p.platform || null,
      title: p.title, content: p.content, thumbnail_url: p.thumbnail_url,
      operator_email: p.assignee_email, operator_name: p.assignee_name,
      published_at: publishedAt, status: 'published',
    }))
    const { data: posts } = await supabase.from('posts').insert(rows).select('id')
    patch(p.id, { status: 'published', post_id: posts?.[0]?.id || null })
  }

  // 拖拽改期（月/周视图）
  function reschedule(id, dateObj, keepTime = true) {
    const p = plans.find((x) => x.id === id)
    const base = p?.scheduled_at ? new Date(p.scheduled_at) : new Date()
    const next = new Date(dateObj)
    if (keepTime) next.setHours(base.getHours(), base.getMinutes(), 0, 0)
    patch(id, { scheduled_at: next.toISOString() })
  }
  // 拖拽切状态（看板）
  function moveStatus(id, status) {
    const p = plans.find((x) => x.id === id)
    if (!p || p.status === status) return
    if (['approved', 'rejected'].includes(status) && !isAdmin) { alert('仅管理员可审批'); return }
    if (status === 'published') { markPublished(p); return }
    if (status === 'approved') { approve(p); return }
    patch(id, { status })
  }

  const accountsForBrand = accounts.filter((a) => !form.brand_id || a.brand_id === form.brand_id)

  const shared = { brandMap, accountMap, openEdit, remove, submitReview, approve, reject: (p) => setRejectFor(p), reopen, markPublished, reopen2: reopen, isAdmin, profile }

  return (
    <div>
      <PageHeader
        icon={<CalendarClock size={26} />}
        title="发布排期"
        subtitle="规划未来的社媒发布，走审批流程，一处排期多视图查看"
        actions={
          <>
            <Button onClick={load}><RefreshCw size={16} /> 刷新</Button>
            <Button variant="primary" onClick={() => openNew()}><Plus size={16} /> 新增排期</Button>
          </>
        }
      />

      {/* 状态统计 */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        {['draft', 'pending', 'approved', 'published', 'rejected'].map((s) => {
          const meta = statusMeta(s)
          const n = filtered.filter((p) => p.status === s).length
          return (
            <button key={s} onClick={() => setFStatus(fStatus === s ? 'all' : s)}
              className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${fStatus === s ? 'border-brand-500 ring-1 ring-brand-500' : 'border-slate-200 hover:border-slate-300'}`}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.dot }} />
              <span>
                <span className="block text-xl font-bold text-slate-900">{n}</span>
                <span className="block text-xs text-slate-500">{meta.label}</span>
              </span>
            </button>
          )
        })}
      </div>

      {/* 筛选 + 视图切换 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select className={inputClass + ' w-auto'} value={fBrand} onChange={(e) => setFBrand(e.target.value)}>
          <option value="all">全部品牌</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select className={inputClass + ' w-auto'} value={fPlatform} onChange={(e) => setFPlatform(e.target.value)}>
          <option value="all">全部平台</option>
          {Object.entries(PLATFORMS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className={inputClass + ' w-auto'} value={fAssignee} onChange={(e) => setFAssignee(e.target.value)}>
          <option value="all">全部运营</option>
          {people.map((p) => <option key={p.id} value={p.email}>{p.name || p.email}</option>)}
        </select>
        {fStatus !== 'all' && (
          <button onClick={() => setFStatus('all')} className="text-xs text-slate-400 hover:text-slate-600">清除状态筛选 ✕</button>
        )}
        <div className="ml-auto">
          <Tabs
            value={view} onChange={setView}
            tabs={[
              { value: 'kanban', label: '看板' },
              { value: 'month', label: '月' },
              { value: 'week', label: '周' },
              { value: 'list', label: '列表' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">加载中…</div>
      ) : plans.length === 0 ? (
        <Card>
          <EmptyState icon={<CalendarClock size={30} />} title="还没有排期计划"
            hint="点右上角「新增排期」，规划下一条要发布的内容。" />
        </Card>
      ) : (
        <>
          {view === 'kanban' && <KanbanView plans={filtered} onMove={moveStatus} {...shared} />}
          {view === 'month' && <MonthView plans={filtered} cursor={cursor} setCursor={setCursor} onReschedule={reschedule} onAdd={openNew} onEdit={openEdit} brandMap={brandMap} />}
          {view === 'week' && <WeekView plans={filtered} cursor={cursor} setCursor={setCursor} onReschedule={reschedule} onAdd={openNew} onEdit={openEdit} brandMap={brandMap} />}
          {view === 'list' && <ListView plans={filtered} {...shared} />}
        </>
      )}

      {/* 新增 / 编辑表单 */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={form.id ? '编辑排期' : '新增排期'}
        footer={<>
          <Button onClick={() => setModalOpen(false)}>取消</Button>
          <Button variant="primary" onClick={save} disabled={saving}>{saving ? '保存中…' : '保存'}</Button>
        </>}>
        <div className="grid max-h-[65vh] grid-cols-2 gap-3 overflow-y-auto pr-1">
          <div className="col-span-2">
            <Field label="标题 *"><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="这条内容的主题" /></Field>
          </div>
          <Field label="品牌">
            <select className={inputClass} value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value, account_ids: [] })}>
              <option value="">未指定</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <div className="col-span-2">
            <Field label="发布账号（可多选，选哪些账号就发到对应平台）">
              {accountsForBrand.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 px-3 py-2 text-sm text-slate-400">
                  {form.brand_id ? '该品牌下暂无账号，去「品牌管理」添加' : '该品牌下暂无账号'}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {accountsForBrand.map((a) => {
                    const on = form.account_ids.includes(a.id)
                    const m = platformMeta(a.platform)
                    return (
                      <button key={a.id} type="button"
                        onClick={() => setForm({ ...form, account_ids: on ? form.account_ids.filter((x) => x !== a.id) : [...form.account_ids, a.id] })}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm transition ${on ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <m.Icon size={14} style={{ color: on ? m.color : undefined }} />{a.display_name || a.handle}
                        {on && <Check size={13} />}
                      </button>
                    )
                  })}
                </div>
              )}
            </Field>
          </div>
          <Field label="内容类型">
            <select className={inputClass} value={form.content_type} onChange={(e) => setForm({ ...form, content_type: e.target.value })}>
              {CONTENT_TYPE_LIST.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="负责运营">
            <select className={inputClass} value={form.assignee_email} onChange={(e) => setForm({ ...form, assignee_email: e.target.value })}>
              <option value="">未分配</option>
              {people.map((p) => <option key={p.id} value={p.email}>{p.name || p.email}</option>)}
            </select>
          </Field>
          <Field label="计划发布时间"><input type="datetime-local" className={inputClass} value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} /></Field>
          <div className="col-span-2">
            <Field label="文案"><textarea rows={3} className={inputClass} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="正文文案…" /></Field>
          </div>
          <Field label="配图">
            {form.thumbnail_url ? (
              <div className="flex items-center gap-3">
                <img src={form.thumbnail_url} alt="配图" className="h-16 w-16 rounded-lg border border-slate-200 object-cover" />
                <button type="button" onClick={() => setForm({ ...form, thumbnail_url: '' })} className="text-xs text-red-600 hover:underline">移除</button>
              </div>
            ) : (
              <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed px-3 py-2.5 text-sm ${uploading ? 'border-brand-300 text-brand-500' : 'border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {uploading ? '上传中…' : '点击上传图片'}
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { uploadImage(e.target.files?.[0]); e.target.value = '' }} />
              </label>
            )}
          </Field>
          <Field label="素材/网盘链接"><input className={inputClass} value={form.asset_url} onChange={(e) => setForm({ ...form, asset_url: e.target.value })} placeholder="https://…" /></Field>
          <div className="col-span-2">
            <Field label="帖子主题类型（可下拉选择或直接输入新主题）">
              <input className={inputClass} list="topic-options" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="如：新品发布、促销活动、节日营销…" />
              <datalist id="topic-options">
                {topicOptions.map((t) => <option key={t} value={t} />)}
              </datalist>
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="备注"><textarea rows={2} className={inputClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
          </div>
        </div>
      </Modal>

      {/* 驳回意见 */}
      <Modal open={!!rejectFor} onClose={() => setRejectFor(null)} title="驳回排期"
        footer={<>
          <Button onClick={() => setRejectFor(null)}>取消</Button>
          <Button variant="primary" className="!bg-red-600 hover:!bg-red-700" onClick={doReject}>确认驳回</Button>
        </>}>
        <div className="text-sm text-slate-500 mb-2">「{rejectFor?.title}」将退回给运营修改。</div>
        <Field label="驳回意见（选填）">
          <textarea rows={3} className={inputClass} value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="说明需要调整的地方…" />
        </Field>
      </Modal>
    </div>
  )
}

/* ---------------- 排期卡片操作区 ---------------- */
function PlanActions({ p, isAdmin, openEdit, remove, submitReview, approve, reject, reopen, markPublished }) {
  const iconBtn = 'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition'
  return (
    <div className="flex flex-wrap items-center gap-1">
      {p.status === 'draft' && (
        <button className={`${iconBtn} bg-orange-50 text-orange-600 hover:bg-orange-100`} onClick={() => submitReview(p)}><Send size={12} /> 提交审核</button>
      )}
      {p.status === 'pending' && isAdmin && (
        <>
          <button className={`${iconBtn} bg-green-50 text-green-600 hover:bg-green-100`} onClick={() => approve(p)}><Check size={12} /> 通过</button>
          <button className={`${iconBtn} bg-red-50 text-red-600 hover:bg-red-100`} onClick={() => reject(p)}><X size={12} /> 驳回</button>
        </>
      )}
      {p.status === 'pending' && !isAdmin && <Badge color="orange">等待管理员审核</Badge>}
      {p.status === 'approved' && (
        <button className={`${iconBtn} bg-brand-50 text-brand-700 hover:bg-brand-100`} onClick={() => markPublished(p)}><Rocket size={12} /> 标记已发布</button>
      )}
      {p.status === 'rejected' && (
        <button className={`${iconBtn} bg-slate-100 text-slate-600 hover:bg-slate-200`} onClick={() => reopen(p)}><Pencil size={12} /> 重新编辑</button>
      )}
      {p.status !== 'published' && (
        <button className={`${iconBtn} text-slate-400 hover:bg-slate-100 hover:text-slate-600`} onClick={() => openEdit(p)}><Pencil size={12} /></button>
      )}
      {p.status !== 'published' && (
        <button className={`${iconBtn} text-slate-400 hover:bg-red-50 hover:text-red-600`} onClick={() => remove(p)}><Trash2 size={12} /></button>
      )}
    </div>
  )
}

function PlanMeta({ p, brandMap, accountMap }) {
  const brand = brandMap[p.brand_id]
  const accs = planAccountIds(p).map((id) => accountMap?.[id]).filter(Boolean)
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
      {brand && <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: brand.color || '#3b6ef6' }} />{brand.name}</span>}
      {accs.map((a) => { const m = platformMeta(a.platform); return <span key={a.id} className="inline-flex items-center gap-1" style={{ color: m.color }} title={m.label}><m.Icon size={12} />{a.display_name || a.handle}</span> })}
      {p.content_type && <span>{contentTypeLabel(p.content_type)}</span>}
      {p.assignee_name && <span className="inline-flex items-center gap-1"><User size={11} />{p.assignee_name}</span>}
    </div>
  )
}

/* ---------------- 看板视图 ---------------- */
function KanbanView({ plans, onMove, brandMap, accountMap, ...actions }) {
  const [dragId, setDragId] = useState(null)
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {KANBAN_COLUMNS.map((col) => {
        const meta = statusMeta(col)
        const items = plans.filter((p) => p.status === col)
        return (
          <div key={col}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (dragId) onMove(dragId, col); setDragId(null) }}
            className="rounded-2xl bg-slate-50/70 p-2">
            <div className="mb-2 flex items-center justify-between px-2 py-1">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.dot }} />{meta.label}
              </span>
              <span className="text-xs text-slate-400">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map((p) => (
                <div key={p.id} draggable onDragStart={() => setDragId(p.id)} onDragEnd={() => setDragId(null)}
                  className="cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing">
                  <div className="mb-1 text-sm font-medium text-slate-800">{p.title || '未命名'}</div>
                  {p.scheduled_at && (
                    <div className="mb-1.5 inline-flex items-center gap-1 text-xs text-slate-500"><Clock size={11} />{fmtDateTime(p.scheduled_at)}
                      <span className="text-slate-300">·</span><span className={relativeDay(p.scheduled_at).startsWith('逾期') && p.status !== 'published' ? 'text-red-500' : 'text-slate-400'}>{relativeDay(p.scheduled_at)}</span>
                    </div>
                  )}
                  <PlanMeta p={p} brandMap={brandMap} accountMap={accountMap} />
                  {p.topic && (
                    <div className="mt-1.5">
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500"><TagIcon size={10} />{p.topic}</span>
                    </div>
                  )}
                  {p.status === 'rejected' && p.review_note && (
                    <div className="mt-1.5 flex items-start gap-1 rounded-lg bg-red-50 px-2 py-1 text-[11px] text-red-600"><AlertTriangle size={11} className="mt-0.5 shrink-0" />{p.review_note}</div>
                  )}
                  <div className="mt-2 border-t border-slate-100 pt-2"><PlanActions p={p} {...actions} /></div>
                </div>
              ))}
              {items.length === 0 && <div className="px-2 py-6 text-center text-xs text-slate-300">拖到这里</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------------- 月视图 ---------------- */
function MonthView({ plans, cursor, setCursor, onReschedule, onAdd, onEdit, brandMap }) {
  const [dragId, setDragId] = useState(null)
  const y = cursor.getFullYear(); const m = cursor.getMonth()
  const cells = monthMatrix(y, m); const today = new Date()
  return (
    <Card className="p-0">
      <div className="flex items-center gap-2 border-b border-slate-100 p-3">
        <Button onClick={() => setCursor(new Date(y, m - 1, 1))}><ChevronLeft size={16} /></Button>
        <Button onClick={() => setCursor(new Date())}>今天</Button>
        <Button onClick={() => setCursor(new Date(y, m + 1, 1))}><ChevronRight size={16} /></Button>
        <div className="ml-2 text-lg font-bold text-slate-900">{y}年{m + 1}月</div>
        <div className="ml-auto text-xs text-slate-400">点空白格新增 · 拖动卡片改期</div>
      </div>
      <div className="grid grid-cols-7 border-b border-slate-100 text-center text-sm text-slate-400">
        {WEEKDAYS_CN.map((w) => <div key={w} className="py-2">{w}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          const inMonth = d.getMonth() === m
          const isToday = sameDay(d, today)
          const items = plans.filter((p) => p.scheduled_at && sameDay(p.scheduled_at, d))
          return (
            <div key={i}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragId) onReschedule(dragId, d); setDragId(null) }}
              onClick={() => onAdd(d)}
              className={`group min-h-[104px] cursor-pointer border-b border-r border-slate-100 p-1.5 hover:bg-brand-50/40 ${inMonth ? '' : 'bg-slate-50/50'}`}>
              <div className="mb-1 flex items-center justify-between">
                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm ${isToday ? 'bg-brand-600 font-semibold text-white' : inMonth ? 'text-slate-700' : 'text-slate-300'}`}>{d.getDate()}</span>
                <Plus size={13} className="text-slate-300 opacity-0 group-hover:opacity-100" />
              </div>
              <div className="space-y-1">
                {items.slice(0, 4).map((p) => {
                  const meta = statusMeta(p.status)
                  return (
                    <div key={p.id} draggable
                      onDragStart={(e) => { e.stopPropagation(); setDragId(p.id) }} onDragEnd={() => setDragId(null)}
                      onClick={(e) => { e.stopPropagation(); onEdit(p) }}
                      className="flex cursor-grab items-center gap-1 truncate rounded px-1.5 py-0.5 text-[11px] active:cursor-grabbing"
                      style={{ background: meta.dot + '22', color: meta.dot }} title={`${p.title}（${meta.label}）`}>
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: meta.dot }} />
                      <span className="truncate">{p.title || '未命名'}</span>
                    </div>
                  )
                })}
                {items.length > 4 && <div className="text-[10px] text-slate-400">+{items.length - 4} 更多</div>}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

/* ---------------- 周视图（按小时） ---------------- */
function WeekView({ plans, cursor, setCursor, onReschedule, onAdd, onEdit, brandMap }) {
  const [dragId, setDragId] = useState(null)
  const days = weekDays(cursor)
  const hours = [...Array(16)].map((_, i) => i + 7) // 7:00 - 22:00
  const today = new Date()
  const first = days[0]; const last = days[6]
  return (
    <Card className="p-0">
      <div className="flex items-center gap-2 border-b border-slate-100 p-3">
        <Button onClick={() => { const d = new Date(cursor); d.setDate(d.getDate() - 7); setCursor(d) }}><ChevronLeft size={16} /></Button>
        <Button onClick={() => setCursor(new Date())}>本周</Button>
        <Button onClick={() => { const d = new Date(cursor); d.setDate(d.getDate() + 7); setCursor(d) }}><ChevronRight size={16} /></Button>
        <div className="ml-2 text-lg font-bold text-slate-900">{first.getMonth() + 1}/{first.getDate()} - {last.getMonth() + 1}/{last.getDate()}</div>
        <div className="ml-auto text-xs text-slate-400">点时间格新增 · 拖动改到具体时段</div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-slate-100">
            <div />
            {days.map((d, i) => (
              <div key={i} className={`py-2 text-center text-sm ${sameDay(d, today) ? 'font-semibold text-brand-600' : 'text-slate-500'}`}>
                周{WEEKDAYS_CN[d.getDay()]}<span className="ml-1 text-xs text-slate-400">{d.getMonth() + 1}/{d.getDate()}</span>
              </div>
            ))}
          </div>
          <div className="max-h-[560px] overflow-y-auto">
            {hours.map((h) => (
              <div key={h} className="grid grid-cols-[56px_repeat(7,1fr)]">
                <div className="border-r border-slate-100 py-3 pr-2 text-right text-xs text-slate-400">{String(h).padStart(2, '0')}:00</div>
                {days.map((d, i) => {
                  const cellDate = new Date(d); cellDate.setHours(h, 0, 0, 0)
                  const items = plans.filter((p) => {
                    if (!p.scheduled_at) return false
                    const t = new Date(p.scheduled_at)
                    return sameDay(t, d) && t.getHours() === h
                  })
                  return (
                    <div key={i}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => { if (dragId) { const dt = new Date(d); dt.setHours(h, 0, 0, 0); onReschedule(dragId, dt, false) } setDragId(null) }}
                      onClick={() => onAdd(cellDate)}
                      className="min-h-[46px] cursor-pointer border-b border-r border-slate-100 p-1 hover:bg-brand-50/40">
                      {items.map((p) => {
                        const meta = statusMeta(p.status)
                        return (
                          <div key={p.id} draggable
                            onDragStart={(e) => { e.stopPropagation(); setDragId(p.id) }} onDragEnd={() => setDragId(null)}
                            onClick={(e) => { e.stopPropagation(); onEdit(p) }}
                            className="mb-0.5 cursor-grab truncate rounded px-1.5 py-0.5 text-[11px] active:cursor-grabbing"
                            style={{ background: meta.dot + '22', color: meta.dot }} title={p.title}>
                            {new Date(p.scheduled_at).getMinutes() ? String(new Date(p.scheduled_at).getMinutes()).padStart(2, '0') + '′ ' : ''}{p.title || '未命名'}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

/* ---------------- 列表视图 ---------------- */
function ListView({ plans, brandMap, accountMap, ...actions }) {
  const sorted = [...plans].sort((a, b) => {
    const ta = a.scheduled_at ? new Date(a.scheduled_at) : Infinity
    const tb = b.scheduled_at ? new Date(b.scheduled_at) : Infinity
    return ta - tb
  })
  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
              <th className="px-4 py-3 font-medium">标题</th>
              <th className="px-4 py-3 font-medium">品牌/账号</th>
              <th className="px-4 py-3 font-medium">类型</th>
              <th className="px-4 py-3 font-medium">负责运营</th>
              <th className="px-4 py-3 font-medium">计划时间</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const meta = statusMeta(p.status)
              const brand = brandMap[p.brand_id]
              const accs = planAccountIds(p).map((id) => accountMap?.[id]).filter(Boolean)
              const overdue = p.scheduled_at && relativeDay(p.scheduled_at).startsWith('逾期') && !['published'].includes(p.status)
              return (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{p.title || '未命名'}</div>
                    {p.topic && <div className="mt-0.5"><span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500"><TagIcon size={10} />{p.topic}</span></div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {brand && <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: brand.color || '#3b6ef6' }} />{brand.name}</span>}
                      {accs.map((a) => { const m = platformMeta(a.platform); return <span key={a.id} className="inline-flex items-center gap-1" style={{ color: m.color }} title={m.label}><m.Icon size={12} />{a.display_name || a.handle}</span> })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{contentTypeLabel(p.content_type)}</td>
                  <td className="px-4 py-3 text-slate-500">{p.assignee_name || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="text-slate-600">{fmtDateTime(p.scheduled_at)}</div>
                    {p.scheduled_at && <div className={`text-xs ${overdue ? 'text-red-500' : 'text-slate-400'}`}>{relativeDay(p.scheduled_at)}</div>}
                  </td>
                  <td className="px-4 py-3"><Badge color={meta.color}>{meta.label}</Badge></td>
                  <td className="px-4 py-3"><div className="flex justify-end"><PlanActions p={p} {...actions} /></div></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
