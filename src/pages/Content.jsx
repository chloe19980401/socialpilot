import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import {
  RefreshCw, Upload, FileText, Heart, Eye, MessageCircle, TrendingUp,
  Share2, Bookmark, RefreshCcw, Pencil, Trash2, Plus,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { syncAll } from '../lib/sync'
import { Card, StatCard } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { Button, Tabs, Modal, Field, inputClass, Badge, EmptyState } from '../components/ui/Common'
import { platformMeta, PLATFORMS } from '../lib/platforms'
import { compactEN, formatDate } from '../lib/format'

const PLATFORM_KEYS = Object.keys(PLATFORMS)
const METRICS = [
  { key: 'count', label: '帖子总数', icon: <FileText size={20} />, fmt: (v) => v },
  { key: 'likes', label: '总点赞', icon: <Heart size={20} />, fmt: compactEN },
  { key: 'views', label: '总播放', icon: <Eye size={20} />, fmt: compactEN },
  { key: 'comments', label: '总评论', icon: <MessageCircle size={20} />, fmt: (v) => v },
  { key: 'engagement', label: '平均互动率', icon: <TrendingUp size={20} />, fmt: () => '0.00%' },
]
const RANGES = [{ value: 7, label: '近7天' }, { value: 14, label: '近14天' }, { value: 30, label: '近30天' }]
const emptyPost = { title: '', platform: 'instagram', brand_id: '', published_at: '', operator: '', designer: '', likes: 0, views: 0, comments: 0, thumbnail_url: '' }

export default function Content() {
  const [posts, setPosts] = useState([])
  const [brands, setBrands] = useState([])
  const [profiles, setProfiles] = useState([])
  const [brandTab, setBrandTab] = useState('all')
  const [metric, setMetric] = useState('count')
  const [range, setRange] = useState(30)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyPost)

  async function load() {
    setLoading(true)
    const [{ data: ps }, { data: br }, { data: pf }] = await Promise.all([
      supabase.from('posts').select('*').order('published_at', { ascending: false, nullsFirst: false }),
      supabase.from('brands').select('*'),
      supabase.from('profiles').select('*').order('name'),
    ])
    setPosts(ps || [])
    setBrands(br || [])
    setProfiles(pf || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(
    () => (brandTab === 'all' ? posts : posts.filter((p) => p.brand_id === brandTab)),
    [posts, brandTab]
  )

  const totals = useMemo(() => {
    const t = { count: filtered.length, likes: 0, views: 0, comments: 0, shares: 0, saves: 0 }
    filtered.forEach((p) => { t.likes += p.likes || 0; t.views += p.views || 0; t.comments += p.comments || 0; t.shares += p.shares || 0; t.saves += p.saves || 0 })
    t.engagement = t.views > 0 ? (t.likes + t.comments + t.shares + t.saves) / t.views : 0
    return t
  }, [filtered])

  // 单条帖子互动率 = (赞+评论+转发+收藏) / 播放
  function engRate(p) {
    if (!p.views || p.views <= 0) return null
    return ((p.likes || 0) + (p.comments || 0) + (p.shares || 0) + (p.saves || 0)) / p.views
  }

  const trend = useMemo(() => {
    const sum = { count: () => 1, likes: (p) => p.likes || 0, views: (p) => p.views || 0, comments: (p) => p.comments || 0, engagement: () => 0 }[metric]
    return [...Array(90)].map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (89 - i))
      const dayPosts = filtered.filter((p) => p.published_at && new Date(p.published_at).toDateString() === d.toDateString())
      return { date: `${d.getMonth() + 1}/${d.getDate()}`, value: dayPosts.reduce((s, p) => s + sum(p), 0) }
    })
  }, [filtered, metric])

  const operators = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - range)
    const map = {}
    filtered.filter((p) => !p.published_at || new Date(p.published_at) >= cutoff).forEach((p) => {
      const key = p.operator_email || p.operator_name || '未分配'
      if (!map[key]) map[key] = { name: p.operator_name || key.split('@')[0], email: p.operator_email || '', count: 0, views: 0, likes: 0, comments: 0, shares: 0, saves: 0 }
      map[key].count += 1; map[key].views += p.views || 0; map[key].likes += p.likes || 0
      map[key].comments += p.comments || 0; map[key].shares += p.shares || 0; map[key].saves += p.saves || 0
    })
    return Object.values(map)
  }, [filtered, range])

  async function syncPosts() {
    setSyncing(true)
    try {
      const res = await syncAll('accounts')
      const failed = res.filter((r) => r.error)
      if (failed.length) alert('部分平台未配置或失败：\n' + failed.map((f) => `${f.platform}: ${f.error}`).join('\n'))
      await load()
    } catch (e) { alert('同步失败：' + (e.message || e)) } finally { setSyncing(false) }
  }

  function openNew() { setEditing(null); setForm({ ...emptyPost, brand_id: brands[0]?.id || '' }); setModal(true) }
  function openEdit(p) {
    setEditing(p)
    setForm({
      title: p.title || '', platform: p.platform || 'instagram', brand_id: p.brand_id || '',
      published_at: p.published_at ? p.published_at.slice(0, 10) : '',
      operator: p.operator_email || '', designer: p.designer_email || '',
      likes: p.likes || 0, views: p.views || 0, comments: p.comments || 0, thumbnail_url: p.thumbnail_url || '',
    })
    setModal(true)
  }

  async function savePost(e) {
    e.preventDefault()
    const op = profiles.find((x) => x.email === form.operator)
    const de = profiles.find((x) => x.email === form.designer)
    const row = {
      title: form.title, platform: form.platform, brand_id: form.brand_id || null,
      published_at: form.published_at || null,
      operator_email: form.operator || null, operator_name: op?.name || null,
      designer_email: form.designer || null, designer_name: de?.name || null,
      likes: Number(form.likes) || 0, views: Number(form.views) || 0, comments: Number(form.comments) || 0,
      thumbnail_url: form.thumbnail_url || null,
    }
    if (editing) await supabase.from('posts').update(row).eq('id', editing.id)
    else await supabase.from('posts').insert(row)
    setModal(false)
    load()
  }

  async function removePost(id) {
    if (!confirm('删除该帖子？')) return
    await supabase.from('posts').delete().eq('id', id)
    load()
  }

  const brandTabs = [{ value: 'all', label: '全部品牌' }, ...brands.map((b) => ({ value: b.id, label: b.name }))]
  const activeMetric = METRICS.find((m) => m.key === metric)

  return (
    <div>
      <PageHeader
        title="内容中心"
        subtitle="管理员视图 — 查看所有运营的发布记录"
        actions={
          <>
            <Button onClick={load}><RefreshCw size={16} /> 刷新数据</Button>
            <Button variant="primary" onClick={openNew}><Upload size={16} /> 上传帖子</Button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={brandTabs} value={brandTab} onChange={setBrandTab} />
        <Button onClick={syncPosts} disabled={syncing}><RefreshCcw size={16} className={syncing ? 'animate-spin' : ''} /> {syncing ? '同步中…' : '一键同步互动数据'}</Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {METRICS.map((m) => (
          <StatCard key={m.key} icon={m.icon} value={m.key === 'engagement' ? (totals.engagement * 100).toFixed(2) + '%' : m.fmt(totals[m.key] || 0)} label={m.label} active={metric === m.key} onClick={() => setMetric(m.key)} />
        ))}
      </div>

      <Card className="mb-6">
        <div className="mb-1 font-semibold text-slate-800">{activeMetric.label}趋势</div>
        <div className="mb-4 text-xs text-slate-400">近 90 天每日趋势（点击上方卡片切换指标）</div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={trend}>
            <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={12} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#g)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* 帖子列表 */}
      <Card className="mb-6 p-0">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="font-semibold text-slate-800">帖子列表</div>
          <Button variant="primary" onClick={openNew}><Plus size={16} /> 新增帖子</Button>
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={<FileText size={28} />} title={loading ? '加载中…' : '暂无帖子'} hint="点「上传帖子」录入，或去品牌页绑定账号后一键同步" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-y border-slate-100 text-left text-xs text-slate-400">
                <tr>
                  <th className="px-5 py-3">标题</th><th className="px-3 py-3">平台</th><th className="px-3 py-3">运营</th>
                  <th className="px-3 py-3">设计师</th><th className="px-3 py-3">点赞</th><th className="px-3 py-3">播放</th>
                  <th className="px-3 py-3">评论</th><th className="px-3 py-3">转发</th><th className="px-3 py-3">互动率</th>
                  <th className="px-3 py-3">发布</th><th className="px-3 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const meta = platformMeta(p.platform); const { Icon } = meta
                  return (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="max-w-[220px] truncate px-5 py-3 font-medium">
                        {p.url
                          ? <a href={p.url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline" title={p.title || ''}>{p.title || '（无标题）'}</a>
                          : <span className="text-slate-700">{p.title || '（无标题）'}</span>}
                      </td>
                      <td className="px-3 py-3"><Icon size={16} style={{ color: meta.color }} /></td>
                      <td className="px-3 py-3">{p.operator_name ? <Badge color="blue">{p.operator_name}</Badge> : <span className="text-slate-300">—</span>}</td>
                      <td className="px-3 py-3">{p.designer_name ? <Badge color="green">{p.designer_name}</Badge> : <span className="text-slate-300">—</span>}</td>
                      <td className="px-3 py-3 text-slate-500">{compactEN(p.likes)}</td>
                      <td className="px-3 py-3 text-slate-500">{compactEN(p.views)}</td>
                      <td className="px-3 py-3 text-slate-500">{compactEN(p.comments)}</td>
                      <td className="px-3 py-3 text-slate-500">{compactEN(p.shares)}</td>
                      <td className="px-3 py-3 text-slate-500">{engRate(p) == null ? '—' : (engRate(p) * 100).toFixed(1) + '%'}</td>
                      <td className="px-3 py-3 text-slate-400">{formatDate(p.published_at)}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2 text-slate-400">
                          <button className="hover:text-slate-700" onClick={() => openEdit(p)}><Pencil size={16} /></button>
                          <button className="hover:text-red-500" onClick={() => removePost(p.id)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 运营工作数据 */}
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-slate-800">运营工作数据</div>
            <div className="text-xs text-slate-400">各运营的发布数量与互动数据（点赞 / 评论 / 转发 / 收藏 / 播放）</div>
          </div>
          <Tabs tabs={RANGES} value={range} onChange={setRange} />
        </div>
        {operators.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">{loading ? '加载中…' : '暂无运营数据'}</div>
        ) : (
          <div className="space-y-4">
            {operators.map((op) => (
              <div key={op.name} className="rounded-2xl border border-slate-100 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">{op.name[0]?.toUpperCase()}</div>
                  <div><div className="font-semibold text-slate-800">{op.name}</div><div className="text-xs text-slate-400">{op.email}</div></div>
                </div>
                <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
                  <OpStat icon={<FileText size={16} className="text-slate-400" />} value={op.count} label="发布数" />
                  <OpStat icon={<Eye size={16} className="text-blue-400" />} value={compactEN(op.views)} label="播放量" />
                  <OpStat icon={<Heart size={16} className="text-pink-400" />} value={op.likes} label="点赞数" />
                  <OpStat icon={<MessageCircle size={16} className="text-green-400" />} value={op.comments} label="评论数" />
                  <OpStat icon={<Share2 size={16} className="text-orange-400" />} value={op.shares} label="转发数" />
                  <OpStat icon={<Bookmark size={16} className="text-purple-400" />} value={op.saves} label="收藏数" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 录入/编辑帖子 */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? '编辑帖子' : '上传帖子'}
        footer={<><Button onClick={() => setModal(false)}>取消</Button><Button variant="primary" onClick={savePost}>保存</Button></>}
      >
        <form onSubmit={savePost} className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Field label="标题"><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="帖子标题/文案" /></Field></div>
          <Field label="平台">
            <select className={inputClass} value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
              {PLATFORM_KEYS.map((k) => <option key={k} value={k}>{platformMeta(k).label}</option>)}
            </select>
          </Field>
          <Field label="品牌">
            <select className={inputClass} value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })}>
              <option value="">未指定</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="运营（负责人）">
            <select className={inputClass} value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })}>
              <option value="">未分配</option>
              {profiles.map((p) => <option key={p.id} value={p.email}>{p.name || p.email}</option>)}
            </select>
          </Field>
          <Field label="设计师">
            <select className={inputClass} value={form.designer} onChange={(e) => setForm({ ...form, designer: e.target.value })}>
              <option value="">未分配</option>
              {profiles.map((p) => <option key={p.id} value={p.email}>{p.name || p.email}</option>)}
            </select>
          </Field>
          <Field label="发布日期"><input type="date" className={inputClass} value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} /></Field>
          <Field label="链接/封面URL（可选）"><input className={inputClass} value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} placeholder="帖子链接或封面图" /></Field>
          <Field label="点赞"><input type="number" className={inputClass} value={form.likes} onChange={(e) => setForm({ ...form, likes: e.target.value })} /></Field>
          <Field label="播放"><input type="number" className={inputClass} value={form.views} onChange={(e) => setForm({ ...form, views: e.target.value })} /></Field>
          <Field label="评论"><input type="number" className={inputClass} value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} /></Field>
          <div className="col-span-2 text-xs text-slate-400">运营和设计师从「设置 → 用户管理」里的账号选择。没有可选项时，先去那里创建协作者。</div>
        </form>
      </Modal>
    </div>
  )
}

function OpStat({ icon, value, label }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <div className="mb-1 flex justify-center">{icon}</div>
      <div className="text-lg font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  )
}
