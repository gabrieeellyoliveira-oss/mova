import type { ReactNode } from 'react'

export function StatCard({
  label, value, hint, icon, action, tone = 'quente',
}: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode; action?: ReactNode; tone?: 'quente' | 'vinho' | 'rosa' | 'oliva' }) {
  const tones = {
    quente: 'bg-quente text-tinta',
    vinho: 'bg-ink text-ink-fg',
    rosa: 'bg-lavanda text-ink',
    oliva: 'bg-salvia text-ink',
  }
  return (
    <div className={`rounded-px border-2 border-ink p-5 shadow-pixel ${tones[tone]}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold opacity-80">{label}</p>
        {icon && <span className="opacity-90">{icon}</span>}
      </div>
      <p className="mt-2 font-serif text-3xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs opacity-70">{hint}</p>}
      {action && <div className="mt-3 flex flex-wrap gap-2">{action}</div>}
    </div>
  )
}
