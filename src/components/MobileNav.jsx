import { NavLink } from 'react-router-dom'
import { CalendarClock, FileText, LayoutGrid, Menu, Palette } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const MAIN_NAV = [
  { to: '/', label: '首页', Icon: LayoutGrid, end: true },
  { to: '/content', label: '内容', Icon: FileText },
  { to: '/schedule', label: '排期', Icon: CalendarClock },
  { to: '/design', label: '设计', Icon: Palette },
]

export default function MobileNav({ onMore }) {
  const { profile } = useAuth()
  const items = profile?.role === 'designer'
    ? MAIN_NAV.filter((item) => ['/schedule', '/design'].includes(item.to))
    : MAIN_NAV

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-2">
        {items.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `flex min-w-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium ${isActive ? 'text-brand-600' : 'text-slate-400'}`}
          >
            <Icon size={21} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
        <button onClick={onMore} className="flex min-w-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium text-slate-400">
          <Menu size={21} strokeWidth={2} />
          <span>更多</span>
        </button>
      </div>
    </nav>
  )
}
