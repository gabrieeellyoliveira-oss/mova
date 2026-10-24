import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { MiniCalendar } from '@/components/calendar/MiniCalendar'
import { DayAgenda } from '@/components/calendar/DayAgenda'
import { useEvents } from '@/hooks/useData'
import { EVENT_CATEGORIES } from '@/data/constants'
import { openForm } from '@/hooks/useQuickAdd'
import { today } from '@/utils/date'

export function CalendarWidget() {
  const events = useEvents()
  const [selected, setSelected] = useState(today())
  const dots = useMemo(() => {
    const m: Record<string, string[]> = {}
    events.forEach((e) => (m[e.date] ??= []).push(EVENT_CATEGORIES[e.category].color))
    return m
  }, [events])
  return (
    <Card className="space-y-5">
      <MiniCalendar selected={selected} onSelect={setSelected} dots={dots} />
      <div className="border-t border-dashed border-vinho/15 pt-4">
        <DayAgenda date={selected} events={events} />
      </div>
      <button
        onClick={() => openForm('event', { date: selected })}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-vinho text-[15px] font-bold text-rosa-50 shadow-soft transition hover:bg-vinho-700 active:scale-[0.98]"
      >
        <Plus size={18} strokeWidth={2.6} /> Novo compromisso
      </button>
    </Card>
  )
}
