import type { ReactNode } from 'react'

export function StatCard({
  label, value, hint, icon, action, tone = 'quente',
}: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode; action?: ReactNode; tone?: 'quente' | 'vinho' | 'rosa' | 'oliva' }) {
  const tones = {
    quente: 'bg-px-panel text-tinta',
    vinho: 'bg-vinho-900 text-rosa-50',
    rosa: 'bg-px-soft text-vinho',
    oliva: 'bg-oliva-100 text-oliva-600',
  }
  return (
    <div className={`rounded-px border-2 border-px-line p-4 shadow-pixel transition-transform duration-200 hover:-translate-y-0.5 sm:p-5 ${tones[tone]}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="font-pixel text-[13px] font-semibold uppercase tracking-wide opacity-80">{label}</p>
        {icon && <span className="opacity-90">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-extrabold tracking-tight sm:text-[28px]">{value}</p>
      {hint && <p className="mt-1 text-xs opacity-70">{hint}</p>}
      {action && <div className="mt-3 flex flex-wrap gap-2">{action}</div>}
    </div>
  )
}
