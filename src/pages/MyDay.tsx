import { useMemo, useState } from 'react'
import { CalendarPlus, ChevronLeft, ChevronRight, Hourglass, ListPlus } from 'lucide-react'
import { useTasks } from '@/hooks/useData'
import { useAgendaEvents } from '@/hooks/useAgenda'
import { EVENT_CATEGORIES } from '@/data/constants'
import { openForm } from '@/hooks/useQuickAdd'
import { setFocusMode } from '@/hooks/useFocusMode'
import { addDays, formatLong, relativeDay, today } from '@/utils/date'
import { PageHeader, StatCard } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/Misc'
import { MiniCalendar } from '@/components/calendar/MiniCalendar'
import { DailyMission } from '@/components/game/DailyMission'
import { DayTimelineWidget } from '@/components/widgets/DayTimelineWidget'
import { TasksWidget } from '@/components/widgets/TasksWidget'
import { WidgetHeader } from '@/components/widgets/WidgetHeader'
import { XP_VALUES } from '@/game/config'

/** Meu dia: agenda como timeline de jogo + missões do dia + calendário. */
export default function MyDay() {
  const events = useAgendaEvents()
  const tasks = useTasks()
  const [date, setDate] = useState(today())
  const t = today()
  const isToday = date === t

  const dots = useMemo(() => {
    const m: Record<string, string[]> = {}
    events.forEach((e) => (m[e.date] ??= []).push(e.source ? '#4285F4' : EVENT_CATEGORIES[e.category].color))
    return m
  }, [events])
  const missions = useMemo(
    () => tasks
      .filter((x) => x.date === date || (isToday && !!x.date && x.date < t && !x.done))
      .sort((a, b) => Number(a.done) - Number(b.done) || a.order - b.order),
    [tasks, date, isToday, t],
  )
  const done = missions.filter((x) => x.done).length
  const dayEvents = events.filter((e) => e.date === date).length

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Button variant="soft" onClick={() => setFocusMode(true)}><Hourglass size={16} /> Modo foco</Button>
            <Button onClick={() => openForm('event', { date })}><CalendarPlus size={16} /> Compromisso</Button>
          </>
        }
      />
      <div className="flex items-center gap-1">
        <Button size="icon-sm" variant="ghost" onClick={() => setDate(addDays(date, -1))} aria-label="Dia anterior"><ChevronLeft size={16} /></Button>
        <Button size="sm" variant={isToday ? 'primary' : 'soft'} onClick={() => setDate(t)}>Hoje</Button>
        <Button size="icon-sm" variant="ghost" onClick={() => setDate(addDays(date, 1))} aria-label="Próximo dia"><ChevronRight size={16} /></Button>
        <span className="ml-2 text-sm font-semibold text-vinho first-letter:uppercase">{relativeDay(date)} · {formatLong(date)}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard tone="vinho" label="Missões" value={`${done}/${missions.length}`} hint={missions.length && done === missions.length ? 'dia completinho ♥' : 'no seu ritmo'} />
        <StatCard tone="rosa" label="Compromissos" value={dayEvents} hint={dayEvents ? 'na agenda' : 'agenda livre'} />
        <StatCard label="XP das missões" value={`+${done * XP_VALUES.tarefa}`} hint={`${XP_VALUES.tarefa} XP por missão`} />
        <StatCard tone="oliva" label="Abertas" value={missions.length - done} hint="sem pressa" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <DayTimelineWidget date={date} title={isToday ? 'Agenda de hoje' : 'Agenda do dia'} />
          <Card>
            <WidgetHeader
              title={isToday ? 'Missões de hoje' : 'Missões do dia'}
              sprite="check"
              subtitle={missions.length ? `${done} de ${missions.length} concluídas` : undefined}
              action={<button onClick={() => openForm('task', { date })} className="text-rosa-50/80 hover:text-rosa" aria-label="Nova missão"><ListPlus size={15} /></button>}
            />
            {missions.length === 0 ? (
              <EmptyState title="Nenhuma missão pra esse dia" text="Um dia leve também é um bom dia." action={<Button size="sm" onClick={() => openForm('task', { date })}>Adicionar missão</Button>} />
            ) : (
              <ul className="space-y-1.5">{missions.map((task) => <DailyMission key={task.id} task={task} />)}</ul>
            )}
          </Card>
        </div>
        <aside className="grid content-start gap-5 md:grid-cols-2 xl:grid-cols-1">
          <Card><MiniCalendar selected={date} onSelect={setDate} dots={dots} /></Card>
          <TasksWidget />
        </aside>
      </div>
    </div>
  )
}
