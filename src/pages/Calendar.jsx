import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, CalendarDays } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Button, Tabs } from '../components/ui/Common'
import { WEEKDAYS_CN, formatDate } from '../lib/format'

function monthMatrix(year, month) {
  const first = new Date(year, month, 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay()) // 从周日开始
  return [...Array(42)].map((_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export default function Calendar() {
  const [cursor, setCursor] = useState(new Date())
  const [posts, setPosts] = useState([])
  const [view, setView] = useState('month')

  async function load() {
    const { data } = await supabase.from('posts').select('id, title, thumbnail_url, published_at, platform, operator_name')
    setPosts(data || [])
  }
  useEffect(() => { load() }, [])

  const y = cursor.getFullYear()
  const m = cursor.getMonth()
  const cells = useMemo(() => monthMatrix(y, m), [y, m])
  const today = new Date()

  function postsOn(d) {
    return posts.filter((p) => p.published_at && new Date(p.published_at).toDateString() === d.toDateString())
  }

  const recent = useMemo(
    () => [...posts].filter((p) => p.published_at).sort((a, b) => new Date(b.published_at) - new Date(a.published_at)).slice(0, 5),
    [posts]
  )

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <Button onClick={() => setCursor(new Date(y, m - 1, 1))}><ChevronLeft size={16} /></Button>
          <Button onClick={() => setCursor(new Date())}>今天</Button>
          <Button onClick={() => setCursor(new Date(y, m + 1, 1))}><ChevronRight size={16} /></Button>
        </div>
        <div className="text-xl font-bold text-slate-900">{y}年{m + 1}月</div>
        <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option>全部平台</option></select>
        <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option>全部运营</option></select>
        <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option>全部品牌</option></select>
        <Tabs tabs={[{ value: 'month', label: '月' }, { value: 'week', label: '周' }]} value={view} onChange={setView} />
        <Button onClick={load}><RefreshCw size={16} /></Button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <Card className="p-0">
          <div className="grid grid-cols-7 border-b border-slate-100 text-center text-sm text-slate-400">
            {WEEKDAYS_CN.map((w) => <div key={w} className="py-3">{w}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              const inMonth = d.getMonth() === m
              const isToday = d.toDateString() === today.toDateString()
              const dayPosts = postsOn(d)
              return (
                <div key={i} className={`min-h-[96px] border-b border-r border-slate-100 p-2 ${inMonth ? '' : 'bg-slate-50/50'}`}>
                  <div className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-sm ${isToday ? 'bg-brand-600 font-semibold text-white' : inMonth ? 'text-slate-700' : 'text-slate-300'}`}>
                    {d.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayPosts.slice(0, 3).map((p) => (
                      <div key={p.id} className="truncate rounded bg-brand-50 px-1.5 py-0.5 text-[11px] text-brand-700">{p.title || '帖子'}</div>
                    ))}
                    {dayPosts.length > 3 && <div className="text-[11px] text-slate-400">+{dayPosts.length - 3}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <div className="font-semibold text-slate-800">月历</div>
              <div className="flex gap-1 text-slate-400">
                <button onClick={() => setCursor(new Date(y, m - 1, 1))}><ChevronLeft size={16} /></button>
                <button onClick={() => setCursor(new Date(y, m + 1, 1))}><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className="mb-1 text-xs text-slate-400">{y}年{m + 1}月</div>
            <div className="grid grid-cols-7 text-center text-xs text-slate-400">
              {WEEKDAYS_CN.map((w) => <div key={w} className="py-1">{w}</div>)}
            </div>
            <div className="grid grid-cols-7 text-center text-sm">
              {cells.map((d, i) => {
                const inMonth = d.getMonth() === m
                const isToday = d.toDateString() === today.toDateString()
                return (
                  <div key={i} className="py-1.5">
                    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${isToday ? 'bg-brand-600 font-semibold text-white' : inMonth ? 'text-slate-600' : 'text-slate-300'}`}>
                      {d.getDate()}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
              <CalendarDays size={18} className="text-brand-600" /> 最近发布
            </div>
            {recent.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-400">暂无发布记录</div>
            ) : (
              <div className="space-y-3">
                {recent.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-100" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-700">{p.title || '帖子'}</div>
                      <div className="text-xs text-slate-400">{p.operator_name} · {formatDate(p.published_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
