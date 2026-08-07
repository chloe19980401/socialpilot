export function Card({ children, className = '', ...rest }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export function StatCard({ icon, label, value, sub, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition sm:gap-4 sm:p-5 ${
        active
          ? 'border-brand-500 ring-1 ring-brand-500 bg-white'
          : 'border-slate-200 bg-white hover:border-slate-300'
      } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {icon && (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div className="truncate text-xl font-bold text-slate-900 sm:text-2xl">{value}</div>
        <div className="mt-0.5 text-sm text-slate-500">{label}</div>
        {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
      </div>
    </button>
  )
}
