import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutGrid, Globe, FileText, Calendar, CalendarClock, Star, ShoppingCart,
  BarChart3, Award, Settings as SettingsIcon, ChevronDown, ChevronsUpDown, LogOut, Palette,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { platformMeta } from '../lib/platforms'
import { compactCN } from '../lib/format'

const NAV = [
  { to: '/', label: '仪表盘', Icon: LayoutGrid, end: true },
  { to: '/brands', label: '品牌管理', Icon: Globe },
  { to: '/content', label: '内容中心', Icon: FileText },
  { to: '/calendar', label: '日历', Icon: Calendar },
  { to: '/schedule', label: '发布排期', Icon: CalendarClock },
  { to: '/design', label: '设计台', Icon: Palette },
  { to: '/logs', label: 'KOL 红人管理', Icon: Star },
  { to: '/trends', label: '自建站看板', Icon: ShoppingCart },
  { to: '/competitors', label: '竞品分析', Icon: BarChart3 },
  { to: '/performance', label: '绩效看板', Icon: Award },
  { to: '/settings', label: '设置', Icon: SettingsIcon },
]

// 设计师只看「设计台 + 发布排期」，其余角色看全部
const DESIGNER_NAV = ['/design', '/schedule']

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [brandCount, setBrandCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    supabase
      .from('accounts')
      .select('id, display_name, handle, platform, connected')
      .order('created_at', { ascending: true })
      .then(({ data }) => setAccounts(data || []))
    supabase
      .from('brands')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => setBrandCount(count || 0))
  }, [])

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 text-white">
          <LayoutGrid size={20} />
        </div>
        <div>
          <div className="text-base font-bold leading-tight text-slate-900">SocialPilot</div>
          <div className="text-xs text-slate-400">AI 社媒管理</div>
        </div>
      </div>

      {/* 可滚动区：品牌工作区 + 导航 + 账号（整体可滚动，避免导航变长时底部被裁掉） */}
      <div className="min-h-0 flex-1 overflow-y-auto">
      {/* 品牌工作区 */}
      <div className="px-4 pb-2 pt-4">
        <div className="mb-2 text-xs font-medium text-slate-400">品牌工作区</div>
        <button className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-left hover:bg-slate-100">
          <span className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 text-xs font-bold text-white">全</span>
            <span>
              <span className="block text-sm font-semibold text-slate-800">全部品牌</span>
              <span className="block text-xs text-slate-400">{brandCount} 个品牌</span>
            </span>
          </span>
          <ChevronDown size={16} className="text-slate-400" />
        </button>
      </div>

      {/* 导航 */}
      <nav className="px-3 py-2">
        {(profile?.role === 'designer' ? NAV.filter((n) => DESIGNER_NAV.includes(n.to)) : NAV).map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* 全部账号 */}
      <div className="px-4 py-2">
        <div className="mb-2 text-xs font-medium text-slate-400">全部账号</div>
        {accounts.length === 0 && (
          <div className="px-1 py-2 text-xs text-slate-300">暂无账号，去「品牌管理」添加</div>
        )}
        <div className="space-y-1">
          {accounts.map((a) => {
            const meta = platformMeta(a.platform)
            const { Icon } = meta
            return (
              <div key={a.id} className="flex items-center gap-2 rounded-lg px-1 py-1.5 hover:bg-slate-50">
                <div className="relative">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <Icon size={16} />
                  </div>
                  {a.connected && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-700">{a.display_name}</div>
                  <div className="truncate text-xs text-slate-400">@{a.handle}</div>
                </div>
                <span className="text-[10px]" style={{ color: meta.color }}>●</span>
              </div>
            )
          })}
        </div>
      </div>
      </div>

      {/* 用户菜单 */}
      <div className="relative border-t border-slate-100 p-3">
        {menuOpen && (
          <div className="absolute bottom-16 left-3 right-3 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} /> 退出登录
            </button>
          </div>
        )}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex w-full items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-left hover:bg-slate-100"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
            {(profile?.name || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-slate-800">{profile?.name || '用户'}</div>
            <div className="text-xs text-slate-400">{profile?.role === 'admin' ? '管理员' : profile?.role === 'designer' ? '设计师' : '协作者'}</div>
          </div>
          <ChevronsUpDown size={16} className="text-slate-400" />
        </button>
      </div>
    </aside>
  )
}
