import { useState, type DragEvent } from 'react'
import { Check, Plus } from 'lucide-react'
import type { AreaId, ISODate } from '@/types'
import { WEEKDAYS_SHORT, fromISODate, today, weekdayIndex } from '@/utils/date'
import { db } from '@/store/db'
import { openForm } from '@/hooks/useQuickAdd'
import { cn } from '@/lib/cn'
import type { PlannerEntry } from './types'
import { toggleTask } from '@/components/tasks/TaskItem'

const KINDS: { id: 'tarefa' | 'estudo' | 'role' | 'habito' | 'compromisso'; label: string; area?: AreaId }[] = [
  { id: 'tarefa', label: 'Tarefa', area: 'geral' },
  { id: 'estudo', label: 'Estudo', area: 'estudos' },
  { id: 'role', label: 'Mudança', area: 'sair' },
  { id: 'habito', label: 'Hábito', area: 'rotina' },
  { id: 'compromisso', label: 'Compromisso' },
]

export function DayColumn({
  date, entries, onDrop, dragging, onDragStart, days,
}: {
  date: ISODate
  entries: PlannerEntry[]
  onDrop: (date: ISODate) => void
  dragging: boolean
  onDragStart: (e: PlannerEntry) => void
  days: ISODate[]
}) {
  const [over, setOver] = useState(false)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<(typeof KINDS)[number]['id']>('tarefa')
  const isToday = date === today()
  const d = fromISODate(date)

  const add = () => {
    if (!title.trim()) return
    const k = KINDS.find((x) => x.id === kind)!
    if (kind === 'compromisso') openForm('event', { title: title.trim(), date })
    else {
      const max = Math.max(-1, ...db.tasks.store.get().map((t) => t.order))
      db.tasks.add({ title: title.trim(), date, area: k.area!, priority: 'media', done: false, order: max + 1 })
    }
    setTitle('')
    setAdding(false)
  }

  const move = (e: PlannerEntry, to: ISODate) => {
    onDragStart(e)
    onDrop(to)
  }

  return (
    <div
      onDragOver={(e: DragEvent) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={() => { setOver(false); onDrop(date) }}
      className={cn(
        'flex min-h-[220px] flex-col rounded-px border-2 p-3 transition-all xl:min-h-[calc(100dvh-200px)] xl:p-2',
        isToday ? 'border-px-line bg-px-panel shadow-pixel-sm' : 'border-px-line/25 bg-px-panel/70',
        over && 'border-dashed border-queimado bg-rosa-50',
        dragging && !over && 'border-dashed border-vinho/10',
      )}
    >
      <div className="mb-3 flex items-baseline justify-between px-1">
        <p className={cn('text-base font-extrabold tracking-wide', isToday ? 'text-cereja' : 'text-vinho')}>{WEEKDAYS_SHORT[weekdayIndex(date)]}</p>
        <p className={cn('text-sm font-bold', isToday ? 'grid h-7 w-7 place-items-center rounded-full bg-cereja text-quente' : 'text-vinho/50')}>{d.getDate()}</p>
      </div>
      <ul className="flex-1 space-y-1.5">
        {entries.map((e) => (
          <li
            key={e.key}
            draggable={!e.locked}
            onDragStart={() => onDragStart(e)}
            className={cn('group cursor-grab rounded-2xl border-l-4 bg-creme-100 px-2.5 py-2 text-[13px] shadow-sm transition hover:-translate-y-0.5 hover:shadow-pixel-sm active:cursor-grabbing', e.done && 'opacity-50', e.locked && 'cursor-default active:cursor-default')}
            style={{ borderLeftColor: e.color }}
          >
            <div className="flex items-start gap-1.5">
              {e.kind === 'task' && (
                <button onClick={() => toggleTask(e.task)} className={cn('mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border-2', e.done && 'text-quente')} style={{ borderColor: e.color, backgroundColor: e.done ? e.color : undefined }} aria-label="Concluir">
                  {e.done && <Check size={10} strokeWidth={3.5} />}
                </button>
              )}
              <button onClick={e.onOpen} className="min-w-0 flex-1 text-left">
                {e.time && <span className="mr-1 font-bold tabular-nums text-vinho">{e.time}</span>}
                <span className={cn('font-semibold text-tinta', e.done && 'line-through')}>{e.title}</span>
                <span className="block text-[10px] font-bold uppercase tracking-wide" style={{ color: e.color }}>{e.label}</span>
              </button>
            </div>
            {/* alternativa ao arrastar (toque/teclado) */}
            {!e.locked && <select
              value={date}
              onChange={(ev) => move(e, ev.target.value)}
              className="mt-1 w-full rounded-lg bg-transparent text-[10px] text-vinho/50 focus:outline-none lg:hidden"
              aria-label="Mover para outro dia"
            >
              {days.map((x, i) => <option key={x} value={x}>{x === date ? 'mover para…' : WEEKDAYS_SHORT[i]}</option>)}
            </select>}
          </li>
        ))}
      </ul>
      {adding ? (
        <form onSubmit={(e) => { e.preventDefault(); add() }} className="mt-2 space-y-2 rounded-2xl bg-creme-100 p-2">
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && setAdding(false)} placeholder="O quê?" className="h-8 w-full rounded-xl border border-vinho/10 bg-quente px-2.5 text-xs focus:outline-none" />
          <div className="flex flex-wrap gap-1">
            {KINDS.map((k) => (
              <button type="button" key={k.id} onClick={() => setKind(k.id)} className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', kind === k.id ? 'bg-vinho text-rosa-50' : 'bg-quente text-vinho')}>{k.label}</button>
            ))}
          </div>
          <div className="flex justify-end gap-1">
            <button type="button" onClick={() => setAdding(false)} className="px-2 text-[11px] font-semibold text-vinho/60">cancelar</button>
            <button type="submit" className="rounded-full bg-cereja px-3 py-1 text-[11px] font-bold text-quente">adicionar</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="mt-2 flex items-center justify-center gap-1 rounded-2xl py-1.5 text-xs font-semibold text-vinho/45 transition hover:bg-rosa-50 hover:text-cereja">
          <Plus size={14} /> adicionar
        </button>
      )}
    </div>
  )
}
