import { useLocation } from 'react-router-dom'
import { Bell, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const TITLES = {
  '/': '仪表盘',
  '/brands': '品牌管理',
  '/content': '内容中心',
  '/calendar': '日历',
  '/schedule': '发布排期',
  '/design': '设计台',
  '/logs': '红人管理',
  '/trends': '自建站看板',
  '/competitors': '竞品分析',
  '/performance': '绩效看板',
  '/settings': '设置',
}

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const { profile } = useAuth()
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:h-16 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{TITLES[pathname] || 'SocialPilot'}</h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-slate-400 hover:text-slate-600">
          <Bell size={20} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-pink-500" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          {profile?.name ? (
            <span className="text-sm font-semibold text-brand-700">{profile.name[0].toUpperCase()}</span>
          ) : (
            <User size={18} />
          )}
        </div>
      </div>
    </header>
  )
}
