import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Palette, Plus, RefreshCw, Upload, Loader2, Check, Play, RotateCcw,
  Clock, Tag as TagIcon, User, Pencil, Trash2, CalendarClock, ListChecks, Flag, Link2,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { Button, Tabs, Badge, Modal, Field, inputClass, EmptyState } from '../components/ui/Common'
import { platformMeta } from '../lib/platforms'
import { fmtDateTime, relativeDay, contentTypeLabel, CONTENT_TYPE_LIST } from '../lib/plans'
import {
  DESIGN_COLUMNS, designStatusMeta, REQ_COLUMNS, reqStatusMeta, PRIORITY_LIST, priorityMeta,
} from '../lib/design'

const planAccountIds = (p) => (p.account_ids?.length ? p.account_ids : (p.account_id ? [p.account_id] : []))
const isOverdue = (d) => d && new Date(d) < new Date(new Date().toDateString())

/* ================= 主组件 ================= */
export default function DesignStudio() {
  const { profile } = useAuth()
  const me = profile?.email || ''
  const myName = profile?.name || (me ? me.split('@')[0] : '设计师')
  const isAdmin = profile?.role === 'admin'   // 管理员：查看全部设计师的任务

  const [tab, setTab] = useState('tasks')
  const [plans, setPlans] = useState([])
  const [requests, setRequests] = useState([])
  const [brands, setBrands] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadingId, setUploadingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: pl }, { data: rq }, { data: br }, { data: ac }] = await Promise.all([
      supabase.from('content_plans').select('*').order('scheduled_at', { ascending: true }),
      supabase.from('design_requests').select('*').order('due_date', { ascending: true, nullsFirst: false }),
      supabase.from('brands').select('id, name, color'),
      supabase.from('accounts').select('id, display_name, handle, platform, brand_id'),
    ])
    // 管理员看全部已指派设计师的任务；设计师只看指派给自己的。已发布的设计已无意义，不再进设计台
    setPlans((pl || []).filter((p) => (isAdmin ? !!p.designer_email : p.designer_email === me) && p.status !== 'published'))
    setRequests(rq || [])
    setBrands(br || [])
    setAccounts(ac || [])
    setLoading(false)
  }, [me, isAdmin])
  useEffect(() => { load() }, [load])

  const brandMap = useMemo(() => Object.fromEntries(brands.map((b) => [b.id, b])), [brands])
  const accountMap = useMemo(() => Object.fromEntries(accounts.map((a) => [a.id, a])), [accounts])

  /* -------- 排期设计任务：状态推进 -------- */
  const patchPlan = useCallback(async (id, fields) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...fields } : p)))
    const { error } = await supabase.from('content_plans').update(fields).eq('id', id)
    if (error) { alert('操作失败：' + error.message); load() }
  }, [load])

  function startDesign(p) {
    patchPlan(p.id, { design_status: 'doing' })
  }
  function reopenDesign(p) {
    patchPlan(p.id, { design_status: 'pending', design_delivered_at: null })
  }
  function markDelivered(p) {
    patchPlan(p.id, { design_status: 'done', design_delivered_at: new Date().toISOString() })
  }

  // 上传交付配图 → 写回排期的配图，并标记已交付
  async function deliverImage(p, file) {
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('请选择图片文件'); return }
    setUploadingId(p.id)
    const ext = (file.name.split('.').pop() || 'png').toLowerCase()
    const path = `design-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: upErr } = await supabase.storage.from('plan-images').upload(path, file, { cacheControl: '3600', upsert: false })
    if (upErr) { alert('上传失败：' + upErr.message); setUploadingId(null); return }
    const { data } = supabase.storage.from('plan-images').getPublicUrl(path)
    // 写入独立的交付图字段，不覆盖运营的参考配图（thumbnail_url）
    await patchPlan(p.id, {
      design_image_url: data.publicUrl, design_status: 'done',
      design_delivered_at: new Date().toISOString(),
    })
    setUploadingId(null)
  }

  const taskCounts = useMemo(() => {
    const c = { pending: 0, doing: 0, done: 0 }
    plans.forEach((p) => { c[p.design_status || 'pending'] = (c[p.design_status || 'pending'] || 0) + 1 })
    return c
  }, [plans])

  return (
    <div>
      <PageHeader
        icon={<Palette size={26} />}
        title="设计台"
        subtitle={isAdmin ? '查看设计师的排期设计任务与需求清单' : `${myName}，这里有运营排期派给你的设计任务，也有你自己维护的需求清单`}
        actions={<Button onClick={load}><RefreshCw size={16} /> 刷新</Button>}
      />

      <div className="mb-4">
        <Tabs
          value={tab} onChange={setTab}
          tabs={[
            { value: 'tasks', label: `排期设计任务${plans.length ? `（${plans.length}）` : ''}` },
            { value: 'requests', label: `${isAdmin ? '设计需求' : '我的需求'}${requests.length ? `（${requests.length}）` : ''}` },
          ]}
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">加载中…</div>
      ) : tab === 'tasks' ? (
        <TaskBoard
          plans={plans} counts={taskCounts} brandMap={brandMap} accountMap={accountMap}
          uploadingId={uploadingId} onStart={startDesign} onReopen={reopenDesign}
          onDeliver={markDelivered} onUpload={deliverImage} showDesigner={isAdmin}
        />
      ) : (
        <RequestSection requests={requests} brands={brands} brandMap={brandMap} me={me} reload={load} />
      )}
    </div>
  )
}

/* ================= 排期设计任务看板 ================= */
function TaskBoard({ plans, counts, brandMap, accountMap, uploadingId, onStart, onReopen, onDeliver, onUpload, showDesigner }) {
  if (plans.length === 0) {
    return (
      <Card>
        <EmptyState icon={<CalendarClock size={30} />} title="暂无排期设计任务"
          hint="运营在「发布排期」里把某条排期指派给你之后，会自动出现在这里。" />
      </Card>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      {DESIGN_COLUMNS.map((col) => {
        const meta = designStatusMeta(col)
        const items = plans.filter((p) => (p.design_status || 'pending') === col)
        return (
          <div key={col} className="rounded-2xl bg-slate-50/70 p-2">
            <div className="mb-2 flex items-center justify-between px-2 py-1">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.dot }} />{meta.label}
              </span>
              <span className="text-xs text-slate-400">{counts[col] || 0}</span>
            </div>
            <div className="space-y-2">
              {items.map((p) => (
                <TaskCard key={p.id} p={p} brandMap={brandMap} accountMap={accountMap}
                  uploading={uploadingId === p.id} onStart={onStart} onReopen={onReopen}
                  onDeliver={onDeliver} onUpload={onUpload} showDesigner={showDesigner} />
              ))}
              {items.length === 0 && <div className="px-2 py-6 text-center text-xs text-slate-300">暂无</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TaskCard({ p, brandMap, accountMap, uploading, onStart, onReopen, onDeliver, onUpload, showDesigner }) {
  const st = p.design_status || 'pending'
  const brand = brandMap[p.brand_id]
  const accs = planAccountIds(p).map((id) => accountMap?.[id]).filter(Boolean)
  const overdueDeadline = p.scheduled_at && new Date(p.scheduled_at) < new Date() && st !== 'done'
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-1 text-sm font-medium text-slate-800">{p.title || '未命名'}</div>
      {p.scheduled_at && (
        <div className="mb-1.5 inline-flex items-center gap-1 text-xs">
          <Clock size={11} className="text-slate-400" />
          <span className="text-slate-500">发布 {fmtDateTime(p.scheduled_at)}</span>
          <span className="text-slate-300">·</span>
          <span className={overdueDeadline ? 'text-red-500' : 'text-slate-400'}>{relativeDay(p.scheduled_at)}</span>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
        {brand && <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: brand.color || '#3b6ef6' }} />{brand.name}</span>}
        {accs.map((a) => { const m = platformMeta(a.platform); return <span key={a.id} className="inline-flex items-center gap-1" style={{ color: m.color }} title={m.label}><m.Icon size={12} />{a.display_name || a.handle}</span> })}
        {p.content_type && <span>{contentTypeLabel(p.content_type)}</span>}
        {p.assignee_name && <span className="inline-flex items-center gap-1" title="排期运营"><User size={11} />{p.assignee_name}</span>}
        {showDesigner && p.designer_name && <span className="inline-flex items-center gap-1 text-brand-500" title="设计师"><Palette size={11} />{p.designer_name}</span>}
      </div>
      {p.topic && (
        <div className="mt-1.5"><span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500"><TagIcon size={10} />{p.topic}</span></div>
      )}
      {p.content && <div className="mt-1.5 line-clamp-2 text-xs text-slate-500">{p.content}</div>}
      {p.asset_url && (
        <a href={p.asset_url} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"><Link2 size={11} /> 素材链接</a>
      )}
      {(p.thumbnail_url || p.design_image_url) && (
        <div className="mt-2 flex gap-2">
          {p.thumbnail_url && (
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 text-[10px] text-slate-400">运营参考图</div>
              <img src={p.thumbnail_url} alt="运营参考图" className="h-20 w-full rounded-lg border border-slate-200 object-cover" />
            </div>
          )}
          {p.design_image_url && (
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 text-[10px] text-green-600">我的交付</div>
              <img src={p.design_image_url} alt="我的交付" className="h-20 w-full rounded-lg border border-green-300 object-cover" />
            </div>
          )}
        </div>
      )}
      {p.designer_name && st !== 'pending' && (
        <div className="mt-1.5 text-[11px] text-slate-400">设计：{p.designer_name}{p.design_delivered_at ? ` · 交付 ${fmtDateTime(p.design_delivered_at)}` : ''}</div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2">
        {st === 'pending' && (
          <button onClick={() => onStart(p)} className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100"><Play size={12} /> 开始设计</button>
        )}
        {st !== 'done' && (
          <label className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${uploading ? 'bg-slate-100 text-slate-400' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            {uploading ? '上传中…' : '上传交付'}
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { onUpload(p, e.target.files?.[0]); e.target.value = '' }} />
          </label>
        )}
        {st === 'doing' && (
          <button onClick={() => onDeliver(p)} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"><Check size={12} /> 标记已交付</button>
        )}
        {st === 'done' && (
          <button onClick={() => onReopen(p)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-600"><RotateCcw size={12} /> 退回重做</button>
        )}
      </div>
    </div>
  )
}

/* ================= 我的需求 ================= */
const emptyReq = () => ({ id: null, title: '', brand_id: '', content_type: '', priority: 'normal', status: 'todo', start_date: '', due_date: '', ref_url: '', note: '' })

// 用时：已完成算 开始→完成，进行中算 开始→今天（首日计为第 1 天）
function durationLabel(r) {
  if (!r.start_date) return ''
  const start = new Date(r.start_date)
  const end = r.status === 'done' && r.done_at ? new Date(r.done_at) : new Date()
  const days = Math.max(1, Math.round((end - start) / 86400000) + 1)
  return r.status === 'done' ? `用时 ${days} 天` : `已 ${days} 天`
}

function RequestSection({ requests, brands, brandMap, me, reload }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyReq())
  const [saving, setSaving] = useState(false)

  function openNew() { setForm(emptyReq()); setModalOpen(true) }
  function openEdit(r) {
    setForm({
      id: r.id, title: r.title || '', brand_id: r.brand_id || '', content_type: r.content_type || '',
      priority: r.priority || 'normal', status: r.status || 'todo',
      start_date: r.start_date || '', due_date: r.due_date || '', ref_url: r.ref_url || '', note: r.note || '',
    })
    setModalOpen(true)
  }

  async function save() {
    if (!form.title.trim()) { alert('请填写需求标题'); return }
    setSaving(true)
    const orig = requests.find((x) => x.id === form.id)
    const payload = {
      title: form.title.trim(), brand_id: form.brand_id || null, content_type: form.content_type || null,
      priority: form.priority, status: form.status,
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
    setModalOpen(false); reload()
  }

  async function setStatus(r, status) {
    const patch = { status, updated_at: new Date().toISOString() }
    patch.done_at = status === 'done' ? (r.done_at || new Date().toISOString()) : null
    await supabase.from('design_requests').update(patch).eq('id', r.id)
    reload()
  }
  async function remove(r) {
    if (!confirm(`删除需求「${r.title}」？`)) return
    await supabase.from('design_requests').delete().eq('id', r.id)
    reload()
  }

  const counts = useMemo(() => {
    const c = { todo: 0, doing: 0, done: 0 }
    requests.forEach((r) => { c[r.status || 'todo'] = (c[r.status || 'todo'] || 0) + 1 })
    return c
  }, [requests])

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {REQ_COLUMNS.map((s) => {
            const m = reqStatusMeta(s)
            return <span key={s} className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: m.dot }} />{m.label} {counts[s] || 0}</span>
          })}
        </div>
        <Button variant="primary" onClick={openNew}><Plus size={16} /> 新增需求</Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <EmptyState icon={<ListChecks size={30} />} title="还没有需求"
            hint="点右上角「新增需求」，把你要做的设计需求记下来。" />
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="px-4 py-3 font-medium">需求</th>
                  <th className="px-4 py-3 font-medium">优先级</th>
                  <th className="px-4 py-3 font-medium">开始 · 用时</th>
                  <th className="px-4 py-3 font-medium">截止</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const pm = priorityMeta(r.priority)
                  const sm = reqStatusMeta(r.status)
                  const brand = brandMap[r.brand_id]
                  const overdue = isOverdue(r.due_date) && r.status !== 'done'
                  return (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{r.title}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          {brand && <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: brand.color || '#3b6ef6' }} />{brand.name}</span>}
                          {r.content_type && <span>{contentTypeLabel(r.content_type)}</span>}
                          {r.note && <span>{r.note}</span>}
                          {r.ref_url && <a href={r.ref_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline"><Link2 size={10} />参考</a>}
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge color={pm.color}><Flag size={10} className="mr-1" />{pm.label}</Badge></td>
                      <td className="px-4 py-3 text-xs">
                        {r.start_date ? (
                          <>
                            <div className="text-slate-600">{r.start_date}</div>
                            <div className="text-slate-400">{durationLabel(r)}</div>
                          </>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {r.due_date ? <span className={overdue ? 'text-red-500' : 'text-slate-600'}>{r.due_date}</span> : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <select value={r.status || 'todo'} onChange={(e) => setStatus(r, e.target.value)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-brand-500">
                          {REQ_COLUMNS.map((s) => <option key={s} value={s}>{reqStatusMeta(s).label}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(r)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><Pencil size={14} /></button>
                          <button onClick={() => remove(r)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={form.id ? '编辑需求' : '新增需求'}
        footer={<>
          <Button onClick={() => setModalOpen(false)}>取消</Button>
          <Button variant="primary" onClick={save} disabled={saving}>{saving ? '保存中…' : '保存'}</Button>
        </>}>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Field label="需求标题 *"><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例如：王力工程画册61P" /></Field>
          </div>
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
