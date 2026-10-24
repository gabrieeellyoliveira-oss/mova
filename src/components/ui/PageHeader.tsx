import type { ReactNode } from 'react'
import { Underline } from '@/components/doodles/Doodles'

export function PageHeader({
  kicker, title, subtitle, actions, doodle,
}: { kicker?: string; title: string; subtitle?: string; actions?: ReactNode; doodle?: ReactNode }) {
  return (
    <header className="relative mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="relative">
        {kicker && <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-queimado">{kicker}</p>}
        <h1 className="font-display text-[3.2rem] leading-[1.05] text-vinho sm:text-[4.2rem]">{title}</h1>
        <Underline width={150} className="-mt-0.5 text-rosa" />
        {subtitle && <p className="mt-2 max-w-xl text-sm text-vinho/70 sm:text-[15px]">{subtitle}</p>}
        {doodle && <div className="pointer-events-none absolute -right-24 -top-8 hidden sm:block">{doodle}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}

export function StatCard({
  label, value, hint, icon, tone = 'quente',
}: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode; tone?: 'quente' | 'vinho' | 'rosa' | 'oliva' }) {
  const tones = {
    quente: 'bg-quente text-tinta border border-vinho/[0.06]',
    vinho: 'bg-vinho text-rosa-50',
    rosa: 'bg-rosa-100 text-vinho border border-rosa',
    oliva: 'bg-oliva-100 text-oliva-600 border border-oliva/20',
  }
  return (
    <div className={`rounded-3xl p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
        {icon && <span className="opacity-80">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-extrabold tracking-tight sm:text-[28px]">{value}</p>
      {hint && <p className="mt-1 text-xs opacity-70">{hint}</p>}
    </div>
  )
}
