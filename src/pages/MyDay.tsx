import { useMemo, useState } from 'react'
import { CalendarPlus, ChevronLeft, ChevronRight, Hourglass } from 'lucide-react'
import { useAgendaEvents } from '@/hooks/useAgenda'
import { EVENT_CATEGORIES } from '@/data/constants'
import { openForm } from '@/hooks/useQuickAdd'
import { setFocusMode } from '@/hooks/useFocusMode'
import { addDays, formatLong, relativeDay, today } from '@/utils/date'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { MiniCalendar } from '@/components/calendar/MiniCalendar'
import { DayTimelineWidget } from '@/components/widgets/DayTimelineWidget'

/** Meu dia: agenda do dia como timeline de jogo + calendário. */
export default function MyDay() {
  const events = useAgendaEvents()
  const [date, setDate] = useState(today())
  const t = today()
  const isToday = date === t

  const dots = useMemo(() => {
    const m: Record<string, string[]> = {}
    events.forEach((e) => (m[e.date] ??= []).push(e.source ? '#4285F4' : EVENT_CATEGORIES[e.category].color))
    return m
  }, [events])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-1">
        <Button size="icon-sm" variant="ghost" onClick={() => setDate(addDays(date, -1))} aria-label="Dia anterior"><ChevronLeft size={16} /></Button>
        <Button size="sm" variant={isToday ? 'primary' : 'soft'} onClick={() => setDate(t)}>Hoje</Button>
        <Button size="icon-sm" variant="ghost" onClick={() => setDate(addDays(date, 1))} aria-label="Próximo dia"><ChevronRight size={16} /></Button>
        <span className="ml-2 text-sm font-semibold text-vinho first-letter:uppercase">{relativeDay(date)} · {formatLong(date)}</span>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="soft" onClick={() => setFocusMode(true)}><Hourglass size={16} /> Modo foco</Button>
          <Button onClick={() => openForm('event', { date })}><CalendarPlus size={16} /> Compromisso</Button>
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <DayTimelineWidget date={date} title={isToday ? 'Agenda de hoje' : 'Agenda do dia'} />
        <Card><MiniCalendar selected={date} onSelect={setDate} dots={dots} /></Card>
      </div>
    </div>
  )
}
