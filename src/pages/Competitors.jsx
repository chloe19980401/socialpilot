import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Plus, List, LayoutGrid, Search, Trash2, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { syncAll } from '../lib/sync'
import { Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { Button, EmptyState } from '../components/ui/Common'
import { platformMeta } from '../lib/platforms'
import { compactEN } from '../lib/format'

const PLATFORM_FILTERS = ['all', 'instagram', 'facebook', 'youtube', 'tiktok']

export default function Competitors() {
  const [items, setItems] = useState([])
  const [view, setView] = useState('list')
  const [q, setQ] = useState('')
  const [pf, setPf] = useState('all')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await syncAll('competitors')
      const failed = res.filter((r) => r.error)
      if (failed.length) alert('部分平台未配置或失败：\n' + failed.map((f) => `${f.platform}: ${f.error}`).join('\n'))
      await load()
    } catch (e) {
      alert('同步失败：' + (e.message || e))
    } finally {
      setSyncing(false)
    }
  }

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('competitors').select('*').order('followers', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const byPlatform = useMemo(() => {
    const g = {}
    items.forEach((c) => {
      const p = (c.platform || 'other').toLowerCase()
      if (!g[p]) g[p] = { count: 0, followers: 0 }
      g[p].count += 1
      g[p].followers += c.followers || 0
    })
    return g
  }, [items])

  const filtered = useMemo(
    () => items.filter((c) =>
      (pf === 'all' || (c.platform || '').toLowerCase() === pf) &&
      (!q || (c.name || '').toLowerCase().includes(q.toLowerCase()))
    ),
    [items, pf, q]
  )

  const grouped = useMemo(() => {
    const g = {}
    filtered.forEach((c) => {
      const key = (c.group_name || c.name || '其他').toUpperCase()
      if (!g[key]) g[key] = []
      g[key].push(c)
    })
    return g
  }, [filtered])

  const platformCards = ['instagram', 'facebook', 'youtube']

  return (
    <div>
      <PageHeader
        title="竞品分析"
        subtitle="监控竞品社媒账号数据与内容表现"
        actions={
          <>
            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              <button onClick={() => setView('list')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${view === 'list' ? 'bg-white shadow-sm' : 'text-slate-500'}`}><List size={16} /> 账号列表</button>
              <button onClick={() => setView('compare')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${view === 'compare' ? 'bg-white shadow-sm' : 'text-slate-500'}`}><LayoutGrid size={16} /> 对比看板</button>
            </div>
            <Button onClick={handleSync} disabled={syncing}><RefreshCw size={16} className={syncing ? 'animate-spin' : ''} /> {syncing ? '同步中…' : '同步数据'}</Button>
            <Button variant="primary"><Plus size={16} /> 添加竞品</Button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {platformCards.map((p) => {
          const meta = platformMeta(p)
          const { Icon } = meta
          const d = byPlatform[p] || { count: 0, followers: 0 }
          return (
            <Card key={p} className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50" style={{ color: meta.color }}><Icon size={24} /></div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{d.count}</div>
                <div className="text-sm text-slate-500">{meta.label} 竞品</div>
                <div className="text-xs text-slate-400">{compactEN(d.followers)} 总粉丝</div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索竞品…" className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500" />
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {PLATFORM_FILTERS.map((p) => (
              <button key={p} onClick={() => setPf(p)} className={`rounded-lg px-3 py-1.5 text-sm ${pf === p ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {p === 'all' ? '全部' : platformMeta(p).label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">{loading ? '加载中…' : '暂无竞品'}</div>
          ) : (
            <div className="max-h-[420px] space-y-4 overflow-y-auto">
              {Object.entries(grouped).map(([name, list]) => (
                <div key={name}>
                  <div className="mb-1 text-xs font-medium text-slate-400">{name}</div>
                  {list.map((c) => {
                    const meta = platformMeta(c.platform)
                    const { Icon } = meta
                    return (
                      <button key={c.id} onClick={() => setSelected(c)} className={`flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-slate-50 ${selected?.id === c.id ? 'bg-slate-50' : ''}`}>
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          <span className="text-xs font-semibold">{(c.name || '?')[0]}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-slate-700">{c.name}</div>
                          <div className="truncate text-xs text-slate-400">@{c.handle}</div>
                        </div>
                        <div className="text-right text-xs">
                          <div className="font-semibold text-slate-700">{compactEN(c.followers)}</div>
                          <span style={{ color: meta.color }}><Icon size={12} /></span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          {selected ? (
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600">{selected.name[0]}</div>
                <div>
                  <div className="text-lg font-bold text-slate-900">{selected.name}</div>
                  <div className="text-sm text-slate-400">@{selected.handle} · {platformMeta(selected.platform).label}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-slate-50 p-4 text-center"><div className="text-xl font-bold">{compactEN(selected.followers)}</div><div className="text-xs text-slate-400">粉丝</div></div>
                <div className="rounded-xl bg-slate-50 p-4 text-center"><div className="text-xl font-bold">{selected.posts_count ?? '—'}</div><div className="text-xs text-slate-400">帖子</div></div>
                <div className="rounded-xl bg-slate-50 p-4 text-center"><div className="text-xl font-bold">{selected.engagement ?? '—'}</div><div className="text-xs text-slate-400">互动率</div></div>
              </div>
            </div>
          ) : (
            <EmptyState icon={<BarChart3 size={28} />} title="选择竞品账号" hint="从左侧列表选择一个竞品账号，查看详细数据分析" />
          )}
        </Card>
      </div>
    </div>
  )
}
