import type { ReactNode } from 'react'
import { PixelIcon, type SpriteName } from '@/components/game/PixelIcon'

/** Cabeçalho das telas: plaquinha com ícone pixel, título em fonte de jogo. */
export function PageHeader({
  kicker, title, subtitle, actions, doodle, icon,
}: { kicker?: string; title: string; subtitle?: string; actions?: ReactNode; doodle?: ReactNode; icon?: SpriteName }) {
  return (
    <header className="relative mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        {icon && (
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-px border-2 border-px-line bg-px-panel shadow-pixel">
            <PixelIcon name={icon} size={40} />
          </span>
        )}
        <div className="min-w-0">
          {kicker && <p className="mb-1 font-pixel text-[13px] font-semibold uppercase tracking-[0.14em] text-cereja">{kicker}</p>}
          <h1 className="font-display text-[2.4rem] leading-none text-vinho sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-xl text-sm text-vinho/70 sm:text-[15px]">{subtitle}</p>}
        </div>
        {doodle && !icon && <div className="pointer-events-none hidden sm:block">{doodle}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}

export function StatCard({
  label, value, hint, icon, tone = 'quente',
}: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode; tone?: 'quente' | 'vinho' | 'rosa' | 'oliva' }) {
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
    </div>
  )
}
