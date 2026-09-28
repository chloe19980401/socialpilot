import { useMemo } from 'react'
import { PartyPopper, MapPin } from 'lucide-react'
import { upcomingFestivals, FESTIVAL_TYPES } from '../lib/festivals'
import { WEEKDAYS_CN } from '../lib/format'

function countdown(days, ongoing) {
  if (ongoing) return '进行中'
  if (days === 0) return '今天'
  if (days === 1) return '明天'
  return `${days} 天后`
}

// 日历顶部横幅：提醒接下来 3 个世界节日 / 营销活动（手机端只显示最近 1 个）
export default function FestivalBanner({ count = 3 }) {
  const list = useMemo(() => upcomingFestivals(new Date(), count), [count])
  if (list.length === 0) return null

  return (
    <div className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 p-4 text-white shadow-sm sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <PartyPopper size={18} />
        <div className="font-semibold">近期世界节日 & 营销节点</div>
        <div className="hidden text-xs text-white/70 sm:block">· 提前排期内容，别错过流量窗口</div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {list.map((f, i) => {
          const type = FESTIVAL_TYPES[f.type]
          const d = f.date
          const range = f.end ? `${d.getMonth() + 1}/${d.getDate()}–${f.end.getMonth() + 1}/${f.end.getDate()}` : null
          return (
            <div
              key={f.name + d.toISOString()}
              className={`${i === 0 ? 'flex' : 'hidden md:flex'} gap-3 rounded-xl p-3 ${i === 0 ? 'bg-white text-slate-800' : 'bg-white/10 text-white'}`}
            >
              <div className={`flex w-14 shrink-0 flex-col items-center justify-center rounded-lg py-1.5 ${i === 0 ? 'bg-brand-50 text-brand-700' : 'bg-white/15'}`}>
                <div className="text-[11px] leading-none opacity-80">{d.getMonth() + 1}月</div>
                <div className="text-2xl font-bold leading-tight">{d.getDate()}</div>
                <div className="text-[11px] leading-none opacity-80">周{WEEKDAYS_CN[d.getDay()]}</div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate font-semibold">{f.name}</div>
                  <div className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${i === 0 ? 'bg-rose-500 text-white' : 'bg-white/20'}`}>
                    {countdown(f.daysLeft, f.ongoing)}
                  </div>
                </div>
                <div className={`truncate text-xs ${i === 0 ? 'text-slate-400' : 'text-white/70'}`}>{f.en}{range ? ` · ${range}` : ''}</div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className={`rounded px-1.5 py-0.5 ${i === 0 ? type.chip : 'bg-white/15'}`}>{type.label}</span>
                  <span className={`inline-flex items-center gap-0.5 ${i === 0 ? 'text-slate-500' : 'text-white/80'}`}>
                    <MapPin size={11} />{f.region}
                  </span>
                </div>
                {f.tip && <div className={`mt-1 truncate text-xs ${i === 0 ? 'text-slate-500' : 'text-white/70'}`} title={f.tip}>{f.tip}</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
