import { useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import type { ISODate } from '@/types'
import { db } from '@/store/db'
import { useEvents, useTasks } from '@/hooks/useData'
import { AREAS, EVENT_CATEGORIES } from '@/data/constants'
import { addDays, formatShort, startOfWeek, today, weekDays } from '@/utils/date'
import { openForm } from '@/hooks/useQuickAdd'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { DayColumn } from '@/components/planner/DayColumn'
import { WeeklyPriorities } from '@/components/planner/WeeklyPriorities'
import type { PlannerEntry } from '@/components/planner/types'
import { Heart } from '@/components/doodles/Doodles'
import { cn } from '@/lib/cn'

export default function Planning() {
  const [ref, setRef] = useState(today())
  const tasks = useTasks()
  const events = useEvents()
  const dragged = useRef<PlannerEntry | null>(null)
  const [dragging, setDragging] = useState(false)
  const days = weekDays(ref)
  const ws = startOfWeek(ref)

  const byDay = useMemo(() => {
    const map: Record<ISODate, PlannerEntry[]> = Object.fromEntries(days.map((d) => [d, []]))
    events.filter((e) => map[e.date]).forEach((e) => {
      const c = EVENT_CATEGORIES[e.category]
      map[e.date].push({ kind: 'event', key: `e${e.id}`, event: e, title: e.title, time: e.time, color: c.color, label: c.label, onOpen: () => openForm('event', e as never) })
    })
    tasks.filter((t) => t.date && map[t.date]).forEach((t) => {
      const a = AREAS[t.area]
      map[t.date!].push({ kind: 'task', key: `t${t.id}`, task: t, title: t.title, color: a.color, label: a.id === 'geral' ? 'Tarefa' : a.label, done: t.done, onOpen: () => openForm('task', t as never) })
    })
    for (const d of days) map[d].sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'))
    return map
  }, [days, events, tasks])

  const unscheduled = tasks.filter((t) => !t.date && !t.done)

  const drop = (date: ISODate | null) => {
    const e = dragged.current
    dragged.current = null
    setDragging(false)
    if (!e) return
    if (e.kind === 'task') db.tasks.update(e.task.id, { date: date ?? undefined })
    else if (date && e.kind === 'event') db.events.update(e.event.id, { date })
  }
  const start = (e: PlannerEntry) => { dragged.current = e; setDragging(true) }

  const total = days.reduce((a, d) => a + byDay[d].length, 0)

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="minha semana"
        title="Planejamento"
        subtitle="Arraste as coisas entre os dias até a semana caber direitinho em você."
        doodle={<Heart size={42} className="rotate-12 fill-rosa text-cereja" />}
        actions={
          <div className="flex items-center gap-1 rounded-full bg-quente p-1 shadow-soft">
            <Button size="icon-sm" variant="ghost" onClick={() => setRef(addDays(ref, -7))} aria-label="Semana anterior"><ChevronLeft size={16} /></Button>
            <button onClick={() => setRef(today())} className="px-2 text-sm font-bold text-vinho">{formatShort(days[0])} – {formatShort(days[6])}</button>
            <Button size="icon-sm" variant="ghost" onClick={() => setRef(addDays(ref, 7))} aria-label="Próxima semana"><ChevronRight size={16} /></Button>
          </div>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <WeeklyPriorities weekStart={ws} />
        <Card
          tone="creme"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => drop(null)}
          className={cn('transition', dragging && 'outline-dashed outline-2 outline-queimado/60')}
        >
          <CardHeader icon={<Inbox size={17} />} title="Sem dia definido" subtitle={`${unscheduled.length} tarefas · arraste para um dia`} />
          <ul className="max-h-48 space-y-1.5 overflow-y-auto">
            {unscheduled.map((t) => (
              <li key={t.id} draggable onDragStart={() => start({ kind: 'task', key: t.id, task: t, title: t.title, color: AREAS[t.area].color, label: '', onOpen: () => {} })}
                className="flex cursor-grab items-center gap-2 rounded-xl bg-quente px-3 py-2 text-sm shadow-sm">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: AREAS[t.area].color }} />
                <span className="flex-1 truncate">{t.title}</span>
                <select value="" onChange={(e) => db.tasks.update(t.id, { date: e.target.value })} className="bg-transparent text-[11px] text-vinho/50 focus:outline-none lg:hidden" aria-label="Escolher dia">
                  <option value="">dia…</option>
                  {days.map((d) => <option key={d} value={d}>{formatShort(d)}</option>)}
                </select>
              </li>
            ))}
            {!unscheduled.length && <li className="text-sm text-vinho/55">Tudo encaixado na semana ✨</li>}
          </ul>
        </Card>
      </div>
      <section>
        <p className="mb-3 text-sm text-vinho/60">{total} coisas planejadas nesta semana</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 xl:gap-2">
          {days.map((d) => (
            <DayColumn key={d} date={d} days={days} entries={byDay[d]} onDrop={drop} dragging={dragging} onDragStart={start} />
          ))}
        </div>
      </section>
    </div>
  )
}
