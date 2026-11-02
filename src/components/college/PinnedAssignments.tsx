import { Link } from 'react-router-dom'
import { ArrowRight, Check, Pin } from 'lucide-react'
import { db } from '@/store/db'
import { useAssignments, useDegrees } from '@/hooks/useData'
import { daysBetween, formatShort, today } from '@/utils/date'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/cn'
import { KINDS, pctSteps } from './CollegeSection'

/** Trabalhos da faculdade fixados na Visão geral (ex.: o trabalho de extensão). */
export function PinnedAssignments() {
  const assignments = useAssignments().filter((a) => a.pinned && a.status !== 'entregue')
  const degrees = useDegrees()
  if (!assignments.length) return null
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 font-serif text-2xl font-bold"><Pin size={20} /> Fixados dos estudos</h2>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {assignments.map((a) => {
          const pct = pctSteps(a)
          const next = a.steps.findIndex((s) => !s.done)
          const left = a.dueDate ? daysBetween(today(), a.dueDate) : null
          const degree = degrees.find((d) => d.id === a.degreeId)
          return (
            <div key={a.id} className="flex flex-col rounded-3xl border-2 border-ink bg-quente p-6 shadow-pixel">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-tinta/55">{KINDS[a.kind]}{degree ? ` · ${degree.name}` : ''}</p>
                  <p className="mt-1 font-serif text-xl font-bold leading-snug">{a.title}</p>
                </div>
                <Link to="/estudos" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-quente transition hover:bg-lavanda" aria-label="Abrir em Estudos"><ArrowRight size={16} /></Link>
              </div>
              <p className={cn('mt-1 text-xs', left !== null && left < 0 ? 'font-semibold text-cereja' : 'text-tinta/60')}>
                {a.dueDate ? `entrega ${formatShort(a.dueDate)}${left !== null ? (left < 0 ? ` · atrasado ${-left} ${-left === 1 ? 'dia' : 'dias'}` : left === 0 ? ' · é hoje!' : ` · faltam ${left} ${left === 1 ? 'dia' : 'dias'}`) : ''}` : 'sem data de entrega'}
              </p>
              <div className="mt-3 flex items-center gap-2"><Progress value={pct} height={8} className="flex-1" /><span className="text-xs font-semibold">{Math.round(pct)}%</span></div>
              {next >= 0 ? (
                <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-lavanda-100 p-3 text-sm">
                  <button onClick={() => db.assignments.update(a.id, { steps: a.steps.map((s, j) => (j === next ? { ...s, done: true } : s)), status: 'fazendo' })} aria-label={`Concluir etapa ${a.steps[next].text}`}
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 border-ink bg-quente hover:bg-lavanda"><Check size={12} strokeWidth={3} className="opacity-0 hover:opacity-100" /></button>
                  <span><span className="block text-[11px] font-semibold uppercase tracking-wide text-tinta/55">próxima etapa</span>{a.steps[next].text}</span>
                </div>
              ) : a.steps.length > 0 && <p className="mt-4 text-sm font-semibold text-oliva-600">Todas as etapas feitas — falta só entregar! 🎉</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
