import { useEffect, useMemo, useState } from 'react'
import { Award, RefreshCw, Plus, Target, CheckCircle2, TrendingUp, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Card, StatCard } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { Button, Tabs, EmptyState, Badge } from '../components/ui/Common'
import { percent } from '../lib/format'

export default function Performance() {
  const [goals, setGoals] = useState([])
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('kpi_goals').select('*')
    setGoals(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const stats = useMemo(() => {
    const total = goals.length
    const achieved = goals.filter((g) => (g.actual || 0) >= (g.target || 0) && g.target).length
    const avg = total ? goals.reduce((s, g) => s + (g.target ? Math.min(100, ((g.actual || 0) / g.target) * 100) : 0), 0) / total : 0
    const people = new Set(goals.map((g) => g.operator_email).filter(Boolean)).size
    return { total, achieved, avg, people }
  }, [goals])

  return (
    <div>
      <PageHeader
        icon={<Award size={28} />}
        title="绩效看板"
        subtitle="KPI 指标 · 数据自动关联内容中心"
        actions={
          <>
            <Button onClick={load}><RefreshCw size={16} /> 刷新</Button>
            <Button variant="primary"><Plus size={16} /> 设定指标</Button>
          </>
        }
      />

      <Card className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-500">时间筛选</span>
        <Tabs
          tabs={[
            { value: 'all', label: '全部' },
            { value: 'month', label: '月度' },
            { value: 'quarter', label: '季度' },
            { value: 'year', label: '年度' },
          ]}
          value={period}
          onChange={setPeriod}
        />
        <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option>本月</option></select>
      </Card>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<Target size={20} />} value={stats.total || '—'} label="总指标数" />
        <StatCard icon={<CheckCircle2 size={20} />} value={stats.achieved || '—'} label="已达成" />
        <StatCard icon={<TrendingUp size={20} />} value={stats.total ? percent(stats.avg) : '—'} label="平均完成率" />
        <StatCard icon={<Users size={20} />} value={stats.people || '—'} label="考核人数" />
      </div>

      <Card className="p-0">
        {goals.length === 0 ? (
          <EmptyState icon={<Award size={28} />} title={loading ? '加载中…' : '暂无 KPI 指标'} hint="点击「设定指标」为运营设置考核目标" />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 text-left text-xs text-slate-400">
              <tr>
                <th className="px-5 py-3">考核对象</th><th className="px-5 py-3">指标</th>
                <th className="px-5 py-3">目标</th><th className="px-5 py-3">实际</th><th className="px-5 py-3">完成率</th>
              </tr>
            </thead>
            <tbody>
              {goals.map((g) => {
                const rate = g.target ? Math.min(100, ((g.actual || 0) / g.target) * 100) : 0
                return (
                  <tr key={g.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-700">{g.operator_name || g.operator_email}</td>
                    <td className="px-5 py-3 text-slate-500">{g.metric}</td>
                    <td className="px-5 py-3 text-slate-500">{g.target}</td>
                    <td className="px-5 py-3 text-slate-500">{g.actual || 0}</td>
                    <td className="px-5 py-3"><Badge color={rate >= 100 ? 'green' : rate >= 60 ? 'blue' : 'orange'}>{percent(rate)}</Badge></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
