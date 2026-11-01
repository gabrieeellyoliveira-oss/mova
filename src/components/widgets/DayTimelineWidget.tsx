import { useAgendaEvents } from '@/hooks/useAgenda'
import { EVENT_CATEGORIES } from '@/data/constants'
import { openForm } from '@/hooks/useQuickAdd'
import { today } from '@/utils/date'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import type { EventCategory } from '@/types'
import { Plus } from 'lucide-react'
import { WidgetHeader } from './WidgetHeader'

export const EVENT_SPRITES: Record<EventCategory, IconName> = {
  trabalho: 'briefcase', estudos: 'laptop', role: 'cherry', saude: 'dumbbell', pessoal: 'heart', casa: 'home',
}

/** Agenda do dia como timeline de jogo. */
export function DayTimelineWidget({ date = today(), title = 'Meu dia' }: { date?: string; title?: string }) {
  const events = useAgendaEvents().filter((e) => e.date === date).sort((a, b) => a.time.localeCompare(b.time))
  const now = new Date().toTimeString().slice(0, 5)
  return (
    <Card className="flex flex-col">
      <WidgetHeader title={title} sprite="day" to="/agenda" linkLabel="Semana" action={<button onClick={() => openForm('event', { date })} className="text-rosa-50/80 hover:text-rosa" aria-label="Novo compromisso"><Plus size={15} /></button>} />
      {events.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
          <Icon name="cup" size={36} />
          <p className="text-sm text-vinho/65">Nada na agenda. Que tal fazer algo diferente?</p>
          <Button size="sm" variant="soft" onClick={() => openForm('event', { date })}><Plus size={14} /> Compromisso</Button>
        </div>
      ) : (
        <ol className="relative ml-[54px] space-y-1 border-l-2 border-dashed border-vinho/25">
          {events.map((e) => {
            const cat = EVENT_CATEGORIES[e.category]
            const past = date === today() && !e.allDay && (e.endTime ?? e.time) < now
            return (
              <li key={e.id} className="relative">
                <span className="absolute -left-[58px] top-2 w-11 text-right text-[13px] font-semibold tabular-nums text-vinho">{e.allDay ? 'dia' : e.time}</span>
                <span className={`absolute -left-[7px] top-3 h-3 w-3 rounded-full ring-4 ring-white ${past ? 'bg-oliva' : 'bg-rosa'}`} />
                <button onClick={() => { if (!e.source) openForm('event', e as never) }} title={e.source ? 'Evento do Google Agenda (edite no Google)' : undefined} className={`ml-3 flex w-[calc(100%-12px)] items-center gap-2.5 rounded-lg border-2 border-transparent px-2 py-1.5 text-left transition hover:border-px-line/30 hover:bg-white/60 ${past ? 'opacity-60' : ''}`}>
                  <Icon name={e.source ? 'day' : EVENT_SPRITES[e.category]} size={18} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-tinta">{e.title}</span>
                    {(e.endTime || e.location || e.notes) && <span className="block truncate text-[11px] text-vinho/55">{[e.endTime && `até ${e.endTime}`, e.location || e.notes].filter(Boolean).join(' · ')}</span>}
                  </span>
                  {e.source ? <span className="shrink-0 rounded bg-[#E8F0FE] px-1.5 py-0.5 text-[10px] font-bold text-[#1a56c4]">Google</span> : <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold" style={{ color: cat.color, backgroundColor: cat.soft }}>{cat.label}</span>}
                </button>
              </li>
            )
          })}
        </ol>
      )}
    </Card>
  )
}
