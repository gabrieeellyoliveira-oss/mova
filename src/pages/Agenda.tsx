import { useAgendaEvents } from '@/hooks/useAgenda'
import { useMemo, useRef, useState } from 'react'
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ISODate } from '@/types'
import { db } from '@/store/db'
import { useTasks } from '@/hooks/useData'
import { areaMeta, EVENT_CATEGORIES } from '@/data/constants'
import { addDays, formatShort, today, weekDays } from '@/utils/date'
import { openForm } from '@/hooks/useQuickAdd'
import { Button } from '@/components/ui/Button'
import { DayColumn } from '@/components/planner/DayColumn'
import type { PlannerEntry } from '@/components/planner/types'

/** Agenda da semana: compromissos, tarefas com dia e eventos do Google, arrastáveis entre os dias. */
export default function Agenda() {
  const [ref, setRef] = useState(today())
  const tasks = useTasks()
  const events = useAgendaEvents()
  const dragged = useRef<PlannerEntry | null>(null)
  const [dragging, setDragging] = useState(false)
  const days = weekDays(ref)

  const byDay = useMemo(() => {
    const map: Record<ISODate, PlannerEntry[]> = Object.fromEntries(days.map((d) => [d, []]))
    events.filter((e) => map[e.date]).forEach((e) => {
      const c = EVENT_CATEGORIES[e.category]
      if (e.source) map[e.date].push({ kind: 'event', key: `g${e.id}`, event: e, title: e.title, time: e.allDay ? undefined : e.time, color: '#4285F4', label: 'Google Agenda', locked: true, onOpen: () => {} })
      else map[e.date].push({ kind: 'event', key: `e${e.id}`, event: e, title: e.title, time: e.time, color: c.color, label: c.label, onOpen: () => openForm('event', e as never) })
    })
    tasks.filter((t) => t.date && map[t.date]).forEach((t) => {
      const a = areaMeta(t.area)
      map[t.date!].push({ kind: 'task', key: `t${t.id}`, task: t, title: t.title, color: a.color, label: a.id === 'geral' ? 'Tarefa' : a.label, done: t.done, onOpen: () => openForm('task', t as never) })
    })
    for (const d of days) map[d].sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'))
    return map
  }, [days, events, tasks])

  const drop = (date: ISODate | null) => {
    const e = dragged.current
    dragged.current = null
    setDragging(false)
    if (!e || e.locked) return
    if (e.kind === 'task') db.tasks.update(e.task.id, { date: date ?? undefined })
    else if (date && e.kind === 'event') db.events.update(e.event.id, { date })
  }
  const start = (e: PlannerEntry) => { dragged.current = e; setDragging(true) }

  const total = days.reduce((a, d) => a + byDay[d].length, 0)

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-vinho/60">{total} na agenda nesta semana</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border-2 border-px-line bg-px-panel p-1">
              <Button size="icon-sm" variant="ghost" onClick={() => setRef(addDays(ref, -7))} aria-label="Semana anterior"><ChevronLeft size={16} /></Button>
              <button onClick={() => setRef(today())} className="px-2 text-sm font-bold text-vinho">{formatShort(days[0])} – {formatShort(days[6])}</button>
              <Button size="icon-sm" variant="ghost" onClick={() => setRef(addDays(ref, 7))} aria-label="Próxima semana"><ChevronRight size={16} /></Button>
            </div>
            <Button size="sm" onClick={() => openForm('event', { date: today() } as never)}><CalendarPlus size={14} /> Compromisso</Button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 xl:gap-2">
          {days.map((d) => (
            <DayColumn key={d} date={d} days={days} entries={byDay[d]} onDrop={drop} dragging={dragging} onDragStart={start} />
          ))}
        </div>
      </section>
    </div>
  )
}
