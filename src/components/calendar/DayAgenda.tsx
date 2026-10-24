import { MapPin, Plus } from 'lucide-react'
import type { CalendarEvent, ISODate } from '@/types'
import { EVENT_CATEGORIES } from '@/data/constants'
import { formatLong, relativeDay } from '@/utils/date'
import { openForm } from '@/hooks/useQuickAdd'
import { Button } from '@/components/ui/Button'
import { Cup } from '@/components/doodles/Doodles'

export function DayAgenda({ date, events }: { date: ISODate; events: CalendarEvent[] }) {
  const list = events.filter((e) => e.date === date).sort((a, b) => a.time.localeCompare(b.time))
  const rel = relativeDay(date)
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[15px] font-bold capitalize text-vinho">{rel === 'hoje' || rel === 'amanhã' || rel === 'ontem' ? rel : 'Agenda'}</p>
          <p className="text-xs text-vinho/55 first-letter:uppercase">{formatLong(date)}</p>
        </div>
        <Button size="icon-sm" variant="soft" onClick={() => openForm('event', { date })} aria-label="Novo compromisso"><Plus size={16} /></Button>
      </div>
      {list.length === 0 ? (
        <div className="flex items-center gap-3 rounded-2xl bg-creme-100 p-4 text-sm text-vinho/70">
          <Cup size={34} />
          <span>Dia livre. Que tal fazer algo diferente?</span>
        </div>
      ) : (
        <ol className="space-y-2">
          {list.map((e) => {
            const cat = EVENT_CATEGORIES[e.category]
            return (
              <li key={e.id}>
                <button
                  onClick={() => openForm('event', e as never)}
                  className="group flex w-full items-stretch gap-3 rounded-2xl p-2 text-left transition hover:bg-creme-100"
                >
                  <span className="w-12 shrink-0 pt-1 text-sm font-bold tabular-nums text-vinho">{e.time}</span>
                  <span className="w-1 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="min-w-0 flex-1 py-0.5">
                    <span className="block truncate text-sm font-semibold text-tinta">{e.title}</span>
                    {(e.notes || e.location) && (
                      <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-vinho/55">
                        {e.location && <MapPin size={11} />}
                        {e.location || e.notes}
                      </span>
                    )}
                  </span>
                  <span className="self-center rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ color: cat.color, backgroundColor: cat.soft }}>{cat.label}</span>
                </button>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
