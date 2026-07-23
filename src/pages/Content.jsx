import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import {
  RefreshCw, Upload, FileText, Heart, Eye, MessageCircle, TrendingUp,
  Share2, Bookmark, RefreshCcw,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Card, StatCard } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { Button, Tabs } from '../components/ui/Common'
import { compactEN } from '../lib/format'

const METRICS = [
  { key: 'count', label: '帖子总数', icon: <FileText size={20} />, sum: (p) => 1, fmt: (v) => v },
  { key: 'likes', label: '总点赞', icon: <Heart size={20} />, sum: (p) => p.likes || 0, fmt: compactEN },
  { key: 'views', label: '总播放', icon: <Eye size={20} />, sum: (p) => p.views || 0, fmt: compactEN },
  { key: 'comments', label: '总评论', icon: <MessageCircle size={20} />, sum: (p) => p.comments || 0, fmt: (v) => v },
  { key: 'engagement', label: '平均互动率', icon: <TrendingUp size={20} />, sum: () => 0, fmt: () => '0.00%' },
]

const RANGES = [
  { value: 7, label: '近7天' },
  { value: 14, label: '近14天' },
  { value: 30, label: '近30天' },
]

export default function Content() {
  const [posts, setPosts] = useState([])
  const [brands, setBrands] = useState([])
  const [brandTab, setBrandTab] = useState('all')
  const [metric, setMetric] = useState('count')
  const [range, setRange] = useState(30)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const [{ data: ps }, { data: br }] = await Promise.all([
      supabase.from('posts').select('*'),
      supabase.from('brands').select('*'),
    ])
    setPosts(ps || [])
    setBrands(br || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(
    () => (brandTab === 'all' ? posts : posts.filter((p) => p.brand_id === brandTab)),
    [posts, brandTab]
  )

  const totals = useMemo(() => {
    const t = { count: filtered.length, likes: 0, views: 0, comments: 0 }
    filtered.forEach((p) => {
      t.likes += p.likes || 0
      t.views += p.views || 0
      t.comments += p.comments || 0
    })
    return t
  }, [filtered])

  const trend = useMemo(() => {
    const m = METRICS.find((x) => x.key === metric)
    const days = [...Array(90)].map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (89 - i))
      return d
    })
    return days.map((d) => {
      const dayPosts = filtered.filter((p) => p.published_at && new Date(p.published_at).toDateString() === d.toDateString())
      return { date: `${d.getMonth() + 1}/${d.getDate()}`, value: dayPosts.reduce((s, p) => s + m.sum(p), 0) }
    })
  }, [filtered, metric])

  const operators = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - range)
    const map = {}
    filtered
      .filter((p) => !p.published_at || new Date(p.published_at) >= cutoff)
      .forEach((p) => {
        const key = p.operator_email || '未分配'
        if (!map[key]) map[key] = { email: key, name: p.operator_name || key.split('@')[0], count: 0, views: 0, likes: 0, comments: 0, shares: 0, saves: 0 }
        map[key].count += 1
        map[key].views += p.views || 0
        map[key].likes += p.likes || 0
        map[key].comments += p.comments || 0
        map[key].shares += p.shares || 0
        map[key].saves += p.saves || 0
      })
    return Object.values(map)
  }, [filtered, range])

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
            <Button variant="primary"><Upload size={16} /> 上传帖子</Button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={brandTabs} value={brandTab} onChange={setBrandTab} />
        <Button><RefreshCcw size={16} /> 一键同步历史帖子运营</Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {METRICS.map((m) => (
          <StatCard
            key={m.key}
            icon={m.icon}
            value={m.key === 'engagement' ? '0.00%' : m.fmt(totals[m.key] || 0)}
            label={m.label}
            active={metric === m.key}
            onClick={() => setMetric(m.key)}
          />
        ))}
      </div>

      <Card className="mb-6">
        <div className="mb-1 font-semibold text-slate-800">{activeMetric.label}趋势</div>
        <div className="mb-4 text-xs text-slate-400">近 90 天每日趋势（点击上方卡片切换指标）</div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={trend}>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={12} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#g)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

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
              <div key={op.email} className="rounded-2xl border border-slate-100 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                    {op.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{op.name}</div>
                    <div className="text-xs text-slate-400">{op.email}</div>
                  </div>
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
