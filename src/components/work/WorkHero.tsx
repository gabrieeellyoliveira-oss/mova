import { useState } from 'react'
import { Check, Pencil, Plus } from 'lucide-react'
import { db } from '@/store/db'
import { formatWork, monthLabel, type useWork } from '@/hooks/useWork'
import { Ring } from '@/components/ui/Progress'
import { Button } from '@/components/ui/Button'

type Work = ReturnType<typeof useWork>

function GoalEditor({ w }: { w: Work }) {
  const [edit, setEdit] = useState(false)
  const [v, setV] = useState(String(w.target || ''))
  const save = () => {
    const target = Number(v.replace(',', '.'))
    if (target > 0) {
      if (w.goal) db.workGoals.update(w.goal.id, { target })
      else db.workGoals.add({ month: w.month, target })
    }
    setEdit(false)
  }
  if (!edit)
    return (
      <button onClick={() => { setV(String(w.target || '')); setEdit(true) }} className="inline-flex items-center gap-1.5 text-sm text-rosa-50/80 hover:text-rosa-50">
        meta de {formatWork(w.target, w.settings)} <Pencil size={13} />
      </button>
    )
  return (
    <form onSubmit={(e) => { e.preventDefault(); save() }} className="flex items-center gap-1.5">
      <input autoFocus inputMode="decimal" value={v} onChange={(e) => setV(e.target.value)} aria-label="Meta do mês"
        className="h-8 w-32 rounded-full border border-rosa-50/30 bg-vinho-900/50 px-3 text-sm text-rosa-50 focus:outline-none" />
      <Button type="submit" size="icon-sm" variant="light" aria-label="Salvar meta"><Check size={14} /></Button>
    </form>
  )
}

export function WorkHero({ w, onAdd }: { w: Work; onAdd: () => void }) {
  const f = (n: number) => formatWork(n, w.settings)
  const hit = w.target > 0 && w.achieved >= w.target
  const ahead = w.pace >= 0
  return (
    <section className="relative overflow-hidden rounded-px border-2 border-px-line bg-vinho p-6 text-rosa-50 shadow-pixel sm:p-8">
      <div className="grid items-center gap-8 lg:grid-cols-[auto_minmax(0,1fr)]">
        <div className="flex flex-col items-center gap-5 sm:flex-row lg:flex-col xl:flex-row">
          <Ring value={w.progress} size={190} stroke={14} color="#EFAFB3" track="rgba(239,175,179,0.16)">
            <div className="text-center">
              <p className="text-5xl font-extrabold tracking-tight">{Math.round(w.progress)}%</p>
              <p className="text-xs text-rosa-50/70">da meta</p>
            </div>
          </Ring>
          <div className="text-center sm:text-left lg:text-center xl:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-rosa first-letter:uppercase">{w.settings.metricName} · {monthLabel(w.month)}</p>
            <p className="text-4xl font-extrabold tracking-tight sm:text-5xl">{f(w.achieved)}</p>
            <div className="mt-1"><GoalEditor key={w.month + w.target} w={w} /></div>
            {w.inherited && <p className="text-xs text-rosa-50/60">mesma meta do mês anterior</p>}
            <p className="mt-3 text-base font-semibold text-rosa">
              {w.target <= 0 ? 'Defina a meta do mês' : hit ? 'Meta do mês batida! ✨' : `Faltam ${f(w.remaining)}`}
            </p>
            <div className="mt-4 flex justify-center sm:justify-start lg:justify-center xl:justify-start">
              <Button variant="light" onClick={onAdd}><Plus size={16} strokeWidth={2.6} /> Registrar resultado</Button>
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-black/25 bg-vinho-900/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-rosa-50/70">{w.status === 'passado' ? 'Resultado do mês' : 'Ritmo até hoje'}</p>
            {w.status === 'passado' ? (
              <p className="mt-1 text-2xl font-extrabold">{hit ? 'Meta batida' : `${Math.round(w.progress)}% da meta`}</p>
            ) : (
              <>
                <p className="mt-1 text-2xl font-extrabold">{ahead ? 'Adiantada' : 'Um pouco atrás'}</p>
                <p className="text-xs text-rosa-50/60">{ahead ? '+' : '−'}{f(Math.abs(w.pace))} em relação ao esperado ({f(w.expected)})</p>
              </>
            )}
          </div>
          <div className="rounded-lg border-2 border-black/25 bg-vinho-900/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-rosa-50/70">{w.status === 'passado' ? 'Total do mês' : 'Projeção do mês'}</p>
            <p className="mt-1 text-2xl font-extrabold">{f(w.projection)}</p>
            {w.status !== 'passado' && w.target > 0 && <p className="text-xs text-rosa-50/60">{Math.round((w.projection / w.target) * 100)}% da meta no ritmo atual</p>}
          </div>
          <div className="rounded-lg border-2 border-black/25 bg-rosa p-4 text-vinho">
            <p className="text-xs font-semibold uppercase tracking-wide text-vinho/70">Por dia útil para bater</p>
            <p className="mt-1 text-2xl font-extrabold">{hit ? '—' : w.neededPerDay !== null ? f(w.neededPerDay) : '—'}</p>
            <p className="text-xs text-vinho/70">{hit ? 'já bateu a meta' : w.daysLeft ? `nos próximos ${w.daysLeft} dias úteis` : 'mês encerrado'}</p>
          </div>
          <div className="rounded-lg border-2 border-black/25 bg-vinho-900/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-rosa-50/70">Dias úteis</p>
            <p className="mt-1 text-2xl font-extrabold">{w.doneDays} de {w.workDaysTotal}</p>
            <p className="text-xs text-rosa-50/60">{w.daysLeft} restantes</p>
          </div>
        </div>
      </div>
    </section>
  )
}
