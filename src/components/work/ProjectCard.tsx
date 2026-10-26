import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import type { WorkProject } from '@/types'
import { db } from '@/store/db'
import { uid } from '@/utils/id'
import { celebrate } from '@/hooks/useToast'
import { PROJECT_STATUS, formatProject, type ProjectStats } from '@/hooks/useProjects'
import { formatShort } from '@/utils/date'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/cn'

const deadlineText = (s: ProjectStats, p: WorkProject) => {
  if (p.status === 'concluido') return 'entregue ✦'
  if (!p.deadline) return 'sem prazo'
  const d = s.calendarDaysLeft!
  if (d < 0) return `prazo era ${formatShort(p.deadline)}`
  if (d === 0) return 'prazo é hoje'
  return `prazo em ${d} ${d === 1 ? 'dia' : 'dias'} · ${s.daysLeft} úteis`
}

/** Cartão de projeto com o mesmo controle da meta do mês: progresso, ritmo, quanto falta. */
export function ProjectCard({ project: p, stats: s, onEdit, onRecord }: { project: WorkProject; stats: ProjectStats; onEdit: () => void; onRecord: () => void }) {
  const [step, setStep] = useState('')
  const st = PROJECT_STATUS[p.status]
  const f = (n: number) => formatProject(n, p)
  const done = p.status === 'concluido'

  const toggleStep = (id: string) => db.workProjects.update(p.id, { steps: p.steps.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) })
  const addStep = () => {
    if (!step.trim()) return
    db.workProjects.update(p.id, { steps: [...p.steps, { id: uid(), title: step.trim(), done: false }] })
    setStep('')
  }
  const finish = () => { db.workProjects.update(p.id, { status: 'concluido' }); celebrate.project(p.name) }

  return (
    <article className={cn('flex flex-col rounded-px border-2 border-px-line bg-px-panel p-4 shadow-pixel transition-transform duration-200 hover:-translate-y-0.5', done && 'opacity-80')}>
      <div className="flex items-start gap-3">
        <span className="mt-1 h-3.5 w-3.5 shrink-0 rotate-45 border-2 border-px-line" style={{ backgroundColor: p.color }} />
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg leading-tight text-vinho">{p.name}</h3>
          <p className="text-xs text-vinho/60">{[p.client, deadlineText(s, p)].filter(Boolean).join(' · ')}</p>
        </div>
        <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold" style={{ color: st.color, backgroundColor: st.soft }}>{st.label}</span>
        <button onClick={onEdit} className="-mr-1 grid h-7 w-7 shrink-0 place-items-center rounded text-vinho/40 hover:bg-vinho/5 hover:text-vinho" aria-label={`Editar ${p.name}`}><Pencil size={13} /></button>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="text-sm font-bold text-tinta">{p.metric === 'etapas' ? s.achieved : f(s.achieved)} <span className="font-medium text-vinho/55">de {f(s.total)}</span></span>
          <span className="font-pixel text-sm font-semibold text-vinho">{Math.round(s.progress)}%</span>
        </div>
        <div className="relative">
          <Progress value={s.progress} color={done ? '#7A7A4A' : p.color} height={9} />
          {s.expectedPct !== null && !done && (
            <span className="absolute -top-1 bottom-[-4px] w-[3px] bg-tinta/70" style={{ left: `calc(${s.expectedPct}% - 1px)` }} title="onde o ritmo esperado diz que você estaria hoje" />
          )}
        </div>
        {!done && (
          <p className="mt-1.5 text-xs text-vinho/70">
            {s.remaining <= 0 ? 'Tudo feito — é só entregar ✦'
              : s.pace === null ? `Faltam ${f(s.remaining)}`
              : s.overdue ? `Faltam ${f(s.remaining)} · que tal combinar um novo prazo?`
              : `${s.pace >= 0 ? 'No ritmo ✓' : `${f(-s.pace)} abaixo do ritmo`} · faltam ${f(s.remaining)}${s.perDay && p.metric !== 'etapas' ? ` · ~${f(s.perDay)} por dia útil` : ''}`}
          </p>
        )}
      </div>

      {p.metric === 'etapas' && !done && (
        <div className="mt-3 space-y-1">
          {p.steps.filter((x) => !x.done).slice(0, 4).map((x) => (
            <div key={x.id} className="flex items-center gap-2 rounded-md px-1 py-0.5 hover:bg-white/60">
              <Checkbox checked={x.done} onChange={() => toggleStep(x.id)} label={x.title} size={18} />
              <span className="truncate text-sm text-tinta">{x.title}</span>
            </div>
          ))}
          {p.steps.filter((x) => !x.done).length > 4 && <button onClick={onEdit} className="pl-1 text-xs font-semibold text-cereja hover:underline">+ {p.steps.filter((x) => !x.done).length - 4} etapas</button>}
          <form onSubmit={(e) => { e.preventDefault(); addStep() }} className="flex items-center gap-1.5 pt-1">
            <input value={step} onChange={(e) => setStep(e.target.value)} placeholder="Nova etapa…" aria-label={`Nova etapa em ${p.name}`} className="h-8 min-w-0 flex-1 rounded-md border-2 border-dashed border-vinho/20 bg-white/50 px-2 text-sm placeholder:text-vinho/40 focus:border-cereja focus:outline-none" />
            <Button type="submit" size="icon-sm" variant="soft" disabled={!step.trim()} aria-label="Adicionar etapa"><Plus size={14} /></Button>
          </form>
        </div>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-3">
        {!done && p.metric !== 'etapas' && <Button size="sm" onClick={onRecord}><Plus size={14} /> Registrar avanço</Button>}
        {!done && s.remaining <= 0 && s.total > 0 && <Button size="sm" variant="olive" onClick={finish}>Marcar como entregue</Button>}
        {done && <Button size="sm" variant="ghost" onClick={() => db.workProjects.update(p.id, { status: 'andamento' })}>Reabrir</Button>}
      </div>
    </article>
  )
}
