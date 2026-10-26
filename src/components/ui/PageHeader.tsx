import type { ReactNode } from 'react'

/** Barra de ações no topo das telas (sem título: o menu já diz onde a Gabi está). */
export function PageHeader({ actions }: { actions: ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-center justify-end gap-2">{actions}</div>
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
