import type { Program } from '@/data/programs'
import { cn } from '@/lib/cn'

const PARTS: { key: keyof Program['mix']; label: string; color: string }[] = [
  { key: 'pernas', label: 'Pernas/glúteos', color: 'bg-lavanda' },
  { key: 'bracos', label: 'Superiores', color: 'bg-salvia' },
  { key: 'corpo', label: 'Corpo todo', color: 'bg-salvia-deep' },
  { key: 'cardio', label: 'Cardio', color: 'bg-cereja' },
  { key: 'abdomen', label: 'Abdômen', color: 'bg-px-gold' },
  { key: 'alongamento', label: 'Mobilidade', color: 'bg-creme-200' },
]

/** Do que o programa é feito (dias de treino por foco) + nota para emagrecer. */
export function MixBar({ p, className }: { p: Program; className?: string }) {
  const parts = PARTS.map((x) => ({ ...x, n: p.mix[x.key] })).filter((x) => x.n > 0)
  const total = parts.reduce((s, x) => s + x.n, 0) || 1
  const score = p.fatLossScore
  return (
    <div className={cn('mt-3 flex-1', className)}>
      <div className="flex items-center justify-between gap-2 text-xs font-semibold">
        <span className="text-tinta/60">Para emagrecer</span>
        <span className={cn('rounded-full border-2 border-ink px-2 py-0.5', score >= 8.5 ? 'bg-salvia' : score >= 7 ? 'bg-salvia-200' : 'bg-quente')}>{score.toLocaleString('pt-BR')}/10</span>
      </div>
      <div className="mt-2 flex h-3 overflow-hidden rounded-full border-2 border-ink" role="img" aria-label={parts.map((x) => `${x.label}: ${x.n} dias`).join(', ')}>
        {parts.map((x) => <span key={x.key} className={x.color} style={{ width: `${(x.n / total) * 100}%` }} />)}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-tinta/65">
        {parts.map((x) => (
          <span key={x.key} className="inline-flex items-center gap-1"><span className={cn('h-2 w-2 rounded-full border border-ink', x.color)} />{x.label} {x.n}</span>
        ))}
        {p.mix.comCardio > p.mix.cardio && <span>· cardio dentro de {p.mix.comCardio} treinos</span>}
      </div>
    </div>
  )
}
