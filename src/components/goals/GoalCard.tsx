import { useState } from 'react'
import { CalendarClock, ChevronDown, Pencil, Plus } from 'lucide-react'
import type { Goal } from '@/types'
import { db } from '@/store/db'
import { GOAL_STATUS, goalCategoryMeta } from '@/data/constants'
import { goalProgress } from '@/hooks/useData'
import { relativeDay } from '@/utils/date'
import { uid } from '@/utils/id'
import { celebrate } from '@/hooks/useToast'
import { Checkbox } from '@/components/ui/Checkbox'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/cn'
import { Sparkle } from '@/components/doodles/Doodles'

export function updateGoal(goal: Goal, patch: Partial<Goal>) {
  const next = { ...goal, ...patch }
  const p = goalProgress({ ...next, status: next.status === 'concluida' ? 'andamento' : next.status })
  if (p >= 100 && goal.status !== 'concluida') {
    next.status = 'concluida'
    celebrate.goal()
  } else if (p < 100 && goal.status === 'concluida' && patch.status === undefined) {
    next.status = 'andamento'
  } else if (p > 0 && next.status === 'comecando') {
    next.status = 'andamento'
  }
  db.goals.update(goal.id, { ...patch, status: next.status })
}

export function GoalCard({ goal, onEdit }: { goal: Goal; onEdit: () => void }) {
  const meta = goalCategoryMeta(goal.category)
  const p = goalProgress(goal)
  const [open, setOpen] = useState(goal.steps.length > 0 && goal.steps.length <= 5)
  const [step, setStep] = useState('')
  const done = goal.status === 'concluida'

  return (
    <article className={cn('relative flex flex-col overflow-hidden rounded-px border-2 border-px-line border bg-quente p-5 shadow-pixel-sm transition-all hover:-translate-y-0.5 hover:shadow-pixel', done ? 'border-oliva/30' : 'border-vinho/[0.06]')}>
      {done && <Sparkle size={22} className="absolute right-12 top-4 text-oliva" />}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl" style={{ backgroundColor: `${meta.color}1f` }}>{meta.emoji}</span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: meta.color }}>{goal.category}</p>
            <h3 className={cn('font-extrabold leading-snug text-vinho', done && 'line-through decoration-oliva decoration-2')}>{goal.name}</h3>
          </div>
        </div>
        <button onClick={onEdit} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-vinho/50 hover:bg-vinho/5" aria-label="Editar meta"><Pencil size={14} /></button>
      </div>
      {goal.description && <p className="mt-2 text-sm text-vinho/65">{goal.description}</p>}
      <div className="mt-4 flex items-center gap-3">
        <Progress value={p} color={done ? '#5E9474' : meta.color} height={10} className="flex-1" />
        <span className="text-sm font-extrabold" style={{ color: done ? '#3F6E52' : meta.color }}>{Math.round(p)}%</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-vinho/60">
        <span className={cn('rounded-full px-2.5 py-0.5 font-bold', done ? 'bg-oliva-100 text-oliva-600' : 'bg-creme-200 text-vinho')}>{GOAL_STATUS[goal.status]}</span>
        {goal.deadline && <span className="inline-flex items-center gap-1"><CalendarClock size={12} /> {relativeDay(goal.deadline)}</span>}
      </div>

      {goal.steps.length > 0 ? (
        <div className="mt-4 border-t border-dashed border-vinho/10 pt-3">
          <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-xs font-bold text-vinho/70">
            {goal.steps.filter((s) => s.done).length} de {goal.steps.length} etapas
            <ChevronDown size={15} className={cn('transition', open && 'rotate-180')} />
          </button>
          {open && (
            <ul className="mt-2 space-y-1.5">
              {goal.steps.map((s) => (
                <li key={s.id} className="flex items-center gap-2.5">
                  <Checkbox size={19} color={meta.color} checked={s.done} label={s.title}
                    onChange={(v) => updateGoal(goal, { steps: goal.steps.map((x) => (x.id === s.id ? { ...x, done: v } : x)) })} />
                  <span className={cn('text-sm', s.done && 'text-vinho/40 line-through')}>{s.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="mt-4 border-t border-dashed border-vinho/10 pt-3">
          <input type="range" min={0} max={100} step={5} value={goal.manualProgress} onChange={(e) => updateGoal(goal, { manualProgress: Number(e.target.value) })} className="w-full accent-cereja" aria-label="Progresso" />
        </div>
      )}
      {open || !goal.steps.length ? (
        <form onSubmit={(e) => { e.preventDefault(); if (step.trim()) { updateGoal(goal, { steps: [...goal.steps, { id: uid(), title: step.trim(), done: false }] }); setStep('') } }} className="mt-3 flex items-center gap-2 rounded-full border border-dashed border-vinho/15 py-0.5 pl-3 pr-0.5">
          <input value={step} onChange={(e) => setStep(e.target.value)} placeholder="nova etapa…" className="h-8 flex-1 bg-transparent text-xs focus:outline-none" />
          <button type="submit" className="grid h-7 w-7 place-items-center rounded-full bg-rosa-100 text-vinho" aria-label="Adicionar etapa"><Plus size={13} /></button>
        </form>
      ) : null}
    </article>
  )
}
