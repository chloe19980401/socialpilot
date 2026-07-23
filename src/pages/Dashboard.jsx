import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts'
import { RefreshCw, Plus, Users, TrendingUp, Target, Activity } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { StatCard, Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { Button, Tabs, Badge } from '../components/ui/Common'
import { platformMeta } from '../lib/platforms'
import { compactCN, longDateCN } from '../lib/format'

const COLORS = ['#E1306C', '#FF0000', '#1877F2', '#0f172a', '#0A66C2']

export default function Dashboard() {
  const [accounts, setAccounts] = useState([])
  const [brands, setBrands] = useState([])
  const [posts, setPosts] = useState([])
  const [brandTab, setBrandTab] = useState('all')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const [{ data: acc }, { data: br }, { data: ps }] = await Promise.all([
      supabase.from('accounts').select('*'),
      supabase.from('brands').select('*'),
      supabase.from('posts').select('platform, published_at, brand_id'),
    ])
    setAccounts(acc || [])
    setBrands(br || [])
    setPosts(ps || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filteredAccounts = useMemo(() => {
    if (brandTab === 'all') return accounts
    return accounts.filter((a) => a.brand_id === brandTab)
  }, [accounts, brandTab])

  const totalFollowers = filteredAccounts.reduce((s, a) => s + (a.followers || 0), 0)
  const connected = filteredAccounts.filter((a) => a.connected).length

  const platformShare = useMemo(() => {
    const map = {}
    filteredAccounts.forEach((a) => {
      map[a.platform] = (map[a.platform] || 0) + (a.followers || 0)
    })
    return Object.entries(map).map(([k, v]) => ({ name: platformMeta(k).label, value: v }))
  }, [filteredAccounts])

  const publishSeries = useMemo(() => {
    // 近 7 天发布数量按平台
    const days = [...Array(7)].map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d
    })
    return days.map((d) => {
      const key = `${d.getMonth() + 1}-${d.getDate()}`
      const dayPosts = posts.filter((p) => {
        if (!p.published_at) return false
        const pd = new Date(p.published_at)
        return pd.toDateString() === d.toDateString()
      })
      return {
        date: key,
        Instagram: dayPosts.filter((p) => p.platform === 'instagram').length,
        YouTube: dayPosts.filter((p) => p.platform === 'youtube').length,
      }
    })
  }, [posts])

  const reachSeries = useMemo(
    () => [...Array(4)].map((_, i) => ({ name: `第${i + 1}周`, Instagram: 0, YouTube: 0 })),
    []
  )

  const brandTabs = [
    { value: 'all', label: '全部汇总' },
    ...brands.map((b) => ({ value: b.id, label: b.name })),
  ]

  return (
    <div>
      <PageHeader
        title="全品牌汇总"
        subtitle={`${longDateCN()} · 汇总 ${brands.length} 个品牌`}
        actions={
          <>
            <Button onClick={load}><RefreshCw size={16} /> 刷新</Button>
            <Button variant="primary"><Plus size={16} /> 新建内容</Button>
          </>
        }
      />

      <div className="mb-6"><Tabs tabs={brandTabs} value={brandTab} onChange={setBrandTab} /></div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Users size={20} />} value={filteredAccounts.length} label="绑定账号" sub={`${connected} 已连接`} />
        <StatCard icon={<TrendingUp size={20} />} value={compactCN(totalFollowers)} label="总粉丝数" sub="全平台合计" />
        <StatCard icon={<Target size={20} />} value="暂无" label="总触达人数" sub="来自触达指标" />
        <StatCard icon={<Activity size={20} />} value="暂无" label="平均互动率" sub="全量号均值" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 font-semibold text-slate-800">发布数量（近 7 天）</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={publishSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Instagram" stroke="#E1306C" strokeWidth={2} />
              <Line type="monotone" dataKey="YouTube" stroke="#FF0000" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="mb-4 font-semibold text-slate-800">平台粉丝占比</div>
          {platformShare.length === 0 ? (
            <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">暂无数据</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={platformShare} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {platformShare.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 font-semibold text-slate-800">近 4 周触达趋势</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={reachSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Instagram" fill="#E1306C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="YouTube" fill="#FF0000" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="mb-4 font-semibold text-slate-800">账号概览</div>
          {filteredAccounts.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              {loading ? '加载中…' : '暂无账号'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAccounts.map((a) => {
                const meta = platformMeta(a.platform)
                const brand = brands.find((b) => b.id === a.brand_id)
                const { Icon } = meta
                return (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-50">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-slate-800">{a.display_name}</span>
                        {brand && <Badge color="blue">{brand.name}</Badge>}
                      </div>
                      <div className="truncate text-xs text-slate-400">@{a.handle}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-800">{compactCN(a.followers)}</div>
                      <div className="text-xs text-slate-400">粉丝</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
