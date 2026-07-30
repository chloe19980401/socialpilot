import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Palette, Plus, RefreshCw, Upload, Loader2, Pencil, Trash2, Link2,
  User, Tag as TagIcon, Flag, ListChecks,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { Button, Badge, Modal, Field, inputClass, EmptyState } from '../components/ui/Common'
import { platformMeta } from '../lib/platforms'
import { fmtDateTime, contentTypeLabel, CONTENT_TYPE_LIST } from '../lib/plans'
import {
  TASK_STAGES, stageMeta, AUTO_TAG, BASE_TAGS, PLAN_TO_STAGE, STAGE_TO_PLAN,
  tagColor, PRIORITY_LIST, priorityMeta,
} from '../lib/design'

const planAccountIds = (p) => (p.account_ids?.length ? p.account_ids : (p.account_id ? [p.account_id] : []))
const isOverdue = (d) => d && new Date(d) < new Date(new Date().toDateString())

// 用时：已完成算 开始→完成，进行中算 开始→今天（首日计为第 1 天）
function durationLabel(r) {
  if (!r.start_date) return ''
  const start = new Date(r.start_date)
  const end = r.status === 'done' && r.done_at ? new Date(r.done_at) : new Date()
  const days = Math.max(1, Math.round((end - start) / 86400000) + 1)
  return r.status === 'done' ? `用时 ${days} 天` : `已 ${days} 天`
}

const emptyReq = () => ({ id: null, title: '', category: '', brand_id: '', content_type: '', priority: 'normal', status: 'todo', start_date: '', due_date: '', ref_url: '', note: '' })

export default function DesignStudio() {
  const { profile } = useAuth()
  const me = profile?.email || ''
  const myName = profile?.name || (me ? me.split('@')[0] : '设计师')
  const isAdmin = profile?.role === 'admin'

  const [plans, setPlans] = useState([])
  const [requests, setRequests] = useState([])
  const [brands, setBrands] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadingId, setUploadingId] = useState(null)

  const [fTag, setFTag] = useState('all')
  const [fStage, setFStage] = useState('all')
  const [extraTags, setExtraTags] = useState([])

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyReq())
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: pl }, { data: rq }, { data: br }, { data: ac }] = await Promise.all([
      supabase.from('content_plans').select('*').order('scheduled_at', { ascending: true }),
      supabase.from('design_requests').select('*').order('due_date', { ascending: true, nullsFirst: false }),
      supabase.from('brands').select('id, name, color'),
      supabase.from('accounts').select('id, display_name, handle, platform, brand_id'),
    ])
    // 管理员看全部已指派设计师的排期；设计师只看指派给自己的。已发布的设计已无意义，不再进设计台
    setPlans((pl || []).filter((p) => (isAdmin ? !!p.designer_email : p.designer_email === me) && p.status !== 'published'))
    setRequests(rq || [])
    setBrands(br || [])
    setAccounts(ac || [])
    setLoading(false)
  }, [me, isAdmin])
  useEffect(() => { load() }, [load])

  const brandMap = useMemo(() => Object.fromEntries(brands.map((b) => [b.id, b])), [brands])
  const accountMap = useMemo(() => Object.fromEntries(accounts.map((a) => [a.id, a])), [accounts])

  /* ---------- 排期任务：更新 ---------- */
  const patchPlan = useCallback(async (id, fields) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...fields } : p)))
    const { error } = await supabase.from('content_plans').update(fields).eq('id', id)
    if (error) { alert('操作失败：' + error.message); load() }
  }, [load])

  function setPlanStage(p, stage) {
    const ds = STAGE_TO_PLAN[stage] || 'pending'
    patchPlan(p.id, { design_status: ds, design_delivered_at: ds === 'done' ? new Date().toISOString() : null })
  }
  // 设计师改「设计交付日」（不动运营发布时间）
  function setPlanDue(p, val) {
    patchPlan(p.id, { design_due: val || null })
  }

  async function deliverImage(p, file) {
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('请选择图片文件'); return }
    setUploadingId(p.id)
    const ext = (file.name.split('.').pop() || 'png').toLowerCase()
    const path = `design-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: upErr } = await supabase.storage.from('plan-images').upload(path, file, { cacheControl: '3600', upsert: false })
    if (upErr) { alert('上传失败：' + upErr.message); setUploadingId(null); return }
    const { data } = supabase.storage.from('plan-images').getPublicUrl(path)
    // 写入独立的交付图字段，不覆盖运营参考配图（thumbnail_url）
    await patchPlan(p.id, { design_image_url: data.publicUrl, design_status: 'done', design_delivered_at: new Date().toISOString() })
    setUploadingId(null)
  }

  /* ---------- 手动需求：增删改 ---------- */
  function openNew() { setForm(emptyReq()); setModalOpen(true) }
  function openEdit(r) {
    setForm({
      id: r.id, title: r.title || '', category: r.category || '', brand_id: r.brand_id || '',
      content_type: r.content_type || '', priority: r.priority || 'normal', status: r.status || 'todo',
      start_date: r.start_date || '', due_date: r.due_date || '', ref_url: r.ref_url || '', note: r.note || '',
    })
    setModalOpen(true)
  }
  async function saveRequest() {
    if (!form.title.trim()) { alert('请填写标题'); return }
    setSaving(true)
    const orig = requests.find((x) => x.id === form.id)
    const payload = {
      title: form.title.trim(), category: form.category || null, brand_id: form.brand_id || null,
      content_type: form.content_type || null, priority: form.priority, status: form.status,
      start_date: form.start_date || null, due_date: form.due_date || null,
      done_at: form.status === 'done' ? (orig?.done_at || new Date().toISOString()) : null,
      ref_url: form.ref_url || null, note: form.note || null, updated_at: new Date().toISOString(),
    }
    let error
    if (form.id) {
      ({ error } = await supabase.from('design_requests').update(payload).eq('id', form.id))
    } else {
      payload.created_by = me
      payload.assignee_email = me
      ;({ error } = await supabase.from('design_requests').insert(payload))
    }
    setSaving(false)
    if (error) { alert('保存失败：' + error.message); return }
    setModalOpen(false); load()
  }
  async function setReqStage(r, status) {
    const patch = { status, updated_at: new Date().toISOString() }
    patch.done_at = status === 'done' ? (r.done_at || new Date().toISOString()) : null
    setRequests((prev) => prev.map((x) => (x.id === r.id ? { ...x, ...patch } : x)))
    await supabase.from('design_requests').update(patch).eq('id', r.id)
  }
  async function removeRequest(r) {
    if (!confirm(`删除需求「${r.title}」？`)) return
    await supabase.from('design_requests').delete().eq('id', r.id)
    load()
  }

  // 标签「新增」：选择「➕ 新增标签」时输入
  function handleCategoryChange(v) {
    if (v === '__add__') {
      const name = (window.prompt('新增标签：') || '').trim()
      if (!name) return
      if (name === AUTO_TAG) { alert('“运营自动”为系统标签，请换一个名字'); return }
      if (!extraTags.includes(name)) setExtraTags((prev) => [...prev, name])
      setForm((f) => ({ ...f, category: name }))
      return
    }
    setForm((f) => ({ ...f, category: v }))
  }

  /* ---------- 统一任务行 ---------- */
  const rows = useMemo(() => {
    const planRows = plans.map((p) => {
      const deadline = p.design_due || p.scheduled_at   // 优先按设计交付日排序/判逾期
      return {
        _src: 'plan', id: p.id, raw: p, title: p.title || '未命名', tag: AUTO_TAG,
        stage: PLAN_TO_STAGE[p.design_status || 'pending'] || 'todo',
        priority: null, start_date: null, done_at: null, due: deadline,
        dueOverdue: deadline && new Date(deadline) < new Date() && (p.design_status || 'pending') !== 'done',
      }
    })
    const reqRows = requests.map((r) => ({
      _src: 'request', id: r.id, raw: r, title: r.title, tag: r.category || '未分类',
      stage: r.status || 'todo', priority: r.priority, start_date: r.start_date, done_at: r.done_at,
      due: r.due_date, dueOverdue: isOverdue(r.due_date) && r.status !== 'done',
    }))
    return [...planRows, ...reqRows]
  }, [plans, requests])

  const allTags = useMemo(() => {
    const s = new Set(BASE_TAGS)
    requests.forEach((r) => { if (r.category) s.add(r.category) })
    extraTags.forEach((t) => s.add(t))
    return [...s]
  }, [requests, extraTags])

  const tagFilteredRows = rows.filter((r) => fTag === 'all' || r.tag === fTag)
  const stageCounts = useMemo(() => {
    const c = { todo: 0, doing: 0, done: 0 }
    tagFilteredRows.forEach((r) => { c[r.stage] = (c[r.stage] || 0) + 1 })
    return c
  }, [tagFilteredRows])
  const stageOrder = { todo: 0, doing: 1, done: 2 }
  const visibleRows = tagFilteredRows
    .filter((r) => fStage === 'all' || r.stage === fStage)
    .sort((a, b) => (stageOrder[a.stage] - stageOrder[b.stage]) || ((a.due ? new Date(a.due) : Infinity) - (b.due ? new Date(b.due) : Infinity)))

  const catOptions = allTags.filter((t) => t !== AUTO_TAG)

  return (
    <div>
      <PageHeader
        icon={<Palette size={26} />}
        title="设计台"
        subtitle={isAdmin ? '设计师的全部设计任务，一表统管，按标签筛选' : `${myName}，运营派来的排期和你自己的需求都在这，按标签筛选`}
        actions={<>
          <Button onClick={load}><RefreshCw size={16} /> 刷新</Button>
          <Button variant="primary" onClick={openNew}><Plus size={16} /> 新增需求</Button>
        </>}
      />

      {/* 阶段统计（可点筛选） */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button onClick={() => setFStage('all')}
          className={`rounded-xl border px-3 py-1.5 text-sm transition ${fStage === 'all' ? 'border-brand-500 ring-1 ring-brand-500' : 'border-slate-200 hover:border-slate-300'}`}>
          全部 {tagFilteredRows.length}
        </button>
        {TASK_STAGES.map((s) => {
          const m = stageMeta(s)
          return (
            <button key={s} onClick={() => setFStage(fStage === s ? 'all' : s)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition ${fStage === s ? 'border-brand-500 ring-1 ring-brand-500' : 'border-slate-200 hover:border-slate-300'}`}>
              <span className="h-2 w-2 rounded-full" style={{ background: m.dot }} />{m.label} {stageCounts[s] || 0}
            </button>
          )
        })}
      </div>

      {/* 标签筛选 */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 inline-flex items-center gap-1 text-xs text-slate-400"><TagIcon size={12} /> 标签</span>
        <button onClick={() => setFTag('all')}
          className={`rounded-full px-3 py-1 text-xs transition ${fTag === 'all' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>全部</button>
        {allTags.map((t) => (
          <button key={t} onClick={() => setFTag(fTag === t ? 'all' : t)}
            className={`rounded-full px-3 py-1 text-xs transition ${fTag === t ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">加载中…</div>
      ) : visibleRows.length === 0 ? (
        <Card>
          <EmptyState icon={<ListChecks size={30} />} title="暂无任务"
            hint="运营在「发布排期」指派给设计师的帖子会自动进来（运营自动）；点右上角「新增需求」可自己加任务并打标签。" />
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="px-4 py-3 font-medium">任务</th>
                  <th className="px-4 py-3 font-medium">标签</th>
                  <th className="px-4 py-3 font-medium">优先级</th>
                  <th className="px-4 py-3 font-medium">开始 · 用时</th>
                  <th className="px-4 py-3 font-medium">计划 / 截止</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <TaskRow key={`${row._src}-${row.id}`} row={row} brandMap={brandMap} accountMap={accountMap}
                    isAdmin={isAdmin} uploading={uploadingId === row.id}
                    onPlanStage={setPlanStage} onPlanDue={setPlanDue} onReqStage={setReqStage} onUpload={deliverImage}
                    onEdit={openEdit} onRemove={removeRequest} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 新增 / 编辑需求 */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={form.id ? '编辑需求' : '新增需求'}
        footer={<>
          <Button onClick={() => setModalOpen(false)}>取消</Button>
          <Button variant="primary" onClick={saveRequest} disabled={saving}>{saving ? '保存中…' : '保存'}</Button>
        </>}>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Field label="标题 *"><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例如：王力工程画册61P" /></Field>
          </div>
          <Field label="标签">
            <select className={inputClass} value={form.category} onChange={(e) => handleCategoryChange(e.target.value)}>
              <option value="">未分类</option>
              {catOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              <option value="__add__">➕ 新增标签…</option>
            </select>
          </Field>
          <Field label="品牌">
            <select className={inputClass} value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })}>
              <option value="">未指定</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="类型">
            <select className={inputClass} value={form.content_type} onChange={(e) => setForm({ ...form, content_type: e.target.value })}>
              <option value="">未指定</option>
              {CONTENT_TYPE_LIST.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="优先级">
            <select className={inputClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {PRIORITY_LIST.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </Field>
          <Field label="开始日期">
            <input type="date" className={inputClass} value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </Field>
          <Field label="截止日期">
            <input type="date" className={inputClass} value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </Field>
          <div className="col-span-2">
            <Field label="参考链接"><input className={inputClass} value={form.ref_url} onChange={(e) => setForm({ ...form, ref_url: e.target.value })} placeholder="https://…" /></Field>
          </div>
          <div className="col-span-2">
            <Field label="备注"><textarea rows={2} className={inputClass} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="分组、需求说明等" /></Field>
          </div>
        </div>
      </Modal>
    </div>
  )
}

/* ---------------- 任务行 ---------------- */
function TaskRow({ row, brandMap, accountMap, isAdmin, uploading, onPlanStage, onPlanDue, onReqStage, onUpload, onEdit, onRemove }) {
  const p = row.raw
  const isPlan = row._src === 'plan'
  const brand = brandMap[isPlan ? p.brand_id : p.brand_id]
  const accs = isPlan ? planAccountIds(p).map((id) => accountMap?.[id]).filter(Boolean) : []
  const pm = !isPlan ? priorityMeta(p.priority) : null

  return (
    <tr className="border-b border-slate-50 align-top hover:bg-slate-50/60">
      {/* 任务 */}
      <td className="px-4 py-3">
        <div className="font-medium text-slate-800">{row.title}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
          {brand && <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: brand.color || '#3b6ef6' }} />{brand.name}</span>}
          {isPlan && accs.map((a) => { const m = platformMeta(a.platform); return <span key={a.id} className="inline-flex items-center gap-1" style={{ color: m.color }} title={m.label}><m.Icon size={11} />{a.display_name || a.handle}</span> })}
          {p.content_type && <span>{contentTypeLabel(p.content_type)}</span>}
          {isPlan && p.assignee_name && <span className="inline-flex items-center gap-1" title="排期运营"><User size={10} />{p.assignee_name}</span>}
          {isPlan && isAdmin && p.designer_name && <span className="inline-flex items-center gap-1 text-brand-500" title="设计师"><Palette size={10} />{p.designer_name}</span>}
          {!isPlan && p.note && <span>{p.note}</span>}
          {p.ref_url && <a href={p.ref_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline"><Link2 size={10} />参考</a>}
          {isPlan && p.asset_url && <a href={p.asset_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline"><Link2 size={10} />素材</a>}
        </div>
        {isPlan && (p.thumbnail_url || p.design_image_url) && (
          <div className="mt-1.5 flex gap-2">
            {p.thumbnail_url && <img src={p.thumbnail_url} alt="运营参考图" title="运营参考图" className="h-10 w-10 rounded border border-slate-200 object-cover" />}
            {p.design_image_url && <img src={p.design_image_url} alt="我的交付" title="我的交付" className="h-10 w-10 rounded border border-green-300 object-cover" />}
          </div>
        )}
      </td>
      {/* 标签 */}
      <td className="px-4 py-3"><Badge color={tagColor(row.tag)}>{row.tag}</Badge></td>
      {/* 优先级 */}
      <td className="px-4 py-3">{isPlan ? <span className="text-slate-300">—</span> : <Badge color={pm.color}><Flag size={10} className="mr-1" />{pm.label}</Badge>}</td>
      {/* 开始 · 用时 */}
      <td className="px-4 py-3 text-xs">
        {!isPlan && row.start_date ? (
          <><div className="text-slate-600">{row.start_date}</div><div className="text-slate-400">{durationLabel(p)}</div></>
        ) : <span className="text-slate-300">—</span>}
      </td>
      {/* 计划 / 截止 */}
      <td className="px-4 py-3 text-xs">
        {isPlan ? (
          <>
            <div className="text-slate-500" title="运营定的发布时间，不可改">发布 {p.scheduled_at ? fmtDateTime(p.scheduled_at) : '—'}</div>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[10px] text-slate-400">交付</span>
              <input type="date" value={p.design_due || ''} onChange={(e) => onPlanDue(p, e.target.value)}
                className={`rounded border px-1.5 py-0.5 text-xs outline-none focus:border-brand-500 ${row.dueOverdue ? 'border-red-300 text-red-500' : 'border-slate-200 text-slate-600'}`} />
            </div>
          </>
        ) : (
          row.due ? <span className={row.dueOverdue ? 'text-red-500' : 'text-slate-600'}>{row.due}</span> : <span className="text-slate-300">—</span>
        )}
      </td>
      {/* 状态 */}
      <td className="px-4 py-3">
        <select value={row.stage}
          onChange={(e) => (isPlan ? onPlanStage(p, e.target.value) : onReqStage(p, e.target.value))}
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-brand-500">
          {TASK_STAGES.map((s) => <option key={s} value={s}>{stageMeta(s).label}</option>)}
        </select>
      </td>
      {/* 操作 */}
      <td className="px-4 py-3">
        <div className="flex justify-end gap-1">
          {isPlan ? (
            <label className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${uploading ? 'bg-slate-100 text-slate-400' : 'bg-green-50 text-green-600 hover:bg-green-100'}`} title="上传交付图">
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              {uploading ? '上传中…' : '交付'}
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { onUpload(p, e.target.files?.[0]); e.target.value = '' }} />
            </label>
          ) : (
            <>
              <button onClick={() => onEdit(p)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><Pencil size={14} /></button>
              <button onClick={() => onRemove(p)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}
