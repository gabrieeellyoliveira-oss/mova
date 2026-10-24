import { Link } from 'react-router-dom'
import { Clock, MapPin } from 'lucide-react'
import { useLastExperience, useNextOuting } from '@/hooks/useData'
import { WEEKDAYS_SHORT, daysBetween, fromISODate, today, weekdayIndex } from '@/utils/date'
import { openForm } from '@/hooks/useQuickAdd'
import { Card } from '@/components/ui/Card'
import { PlaceCover } from '@/components/places/PlaceCover'
import { Plane } from '@/components/doodles/Doodles'
import { WidgetHeader } from './WidgetHeader'

export function NextOutingWidget() {
  const next = useNextOuting()
  const last = useLastExperience()
  const since = last ? daysBetween(last.date, today()) : null

  return (
    <Card className="flex flex-col p-4 sm:p-5">
      <WidgetHeader title="Próximo rolê" to="/sair-de-casa" linkLabel="Ver todos" />
      {next ? (
        <div className="flex flex-1 gap-4">
          <div className="relative min-h-[150px] w-[42%] shrink-0 overflow-hidden rounded-2xl">
            {next.kind === 'place' ? <PlaceCover place={next.place} /> : <div className="grid h-full place-items-center bg-rosa-100"><Plane size={56} className="text-vinho" /></div>}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-col items-start gap-2 min-[1500px]:flex-row min-[1500px]:gap-2.5">
              <span className="shrink-0 rounded-xl bg-rosa-100 px-2.5 py-1.5 text-center leading-none text-vinho">
                <span className="block text-[11px] font-bold">{WEEKDAYS_SHORT[weekdayIndex(next.date)]}</span>
                <span className="mt-0.5 block text-xl font-extrabold">{fromISODate(next.date).getDate()}</span>
              </span>
              <div className="min-w-0">
                <p className="line-clamp-2 text-[15px] font-extrabold leading-tight text-vinho">{next.kind === 'place' ? next.place.name : next.event.title}</p>
                <p className="truncate text-sm text-vinho/70">{next.kind === 'place' ? next.place.neighborhood : next.event.location}</p>
              </div>
            </div>
            <div className="mt-2 space-y-1 text-[13px] text-vinho/65">
              <p className="flex items-center gap-1.5"><MapPin size={14} className="shrink-0 text-queimado" />{next.kind === 'place' ? next.place.city ?? 'Fortaleza, CE' : next.event.location ?? '—'}</p>
              {next.time && <p className="flex items-center gap-1.5"><Clock size={14} className="shrink-0 text-queimado" />{next.time}</p>}
            </div>
            <button
              onClick={() => (next.kind === 'place' ? openForm('place', next.place as never) : openForm('event', next.event as never))}
              className="mt-3 h-9 whitespace-nowrap rounded-full bg-rosa px-3 text-sm font-bold text-vinho transition hover:bg-queimado hover:text-quente"
            >
              Ver detalhes
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-start justify-center gap-2">
          <p className="font-extrabold text-vinho">Nenhum rolê marcado</p>
          <p className="text-sm text-vinho/65">Que tal fazer algo diferente hoje?</p>
          <Link to="/sair-de-casa" className="mt-1 rounded-full bg-rosa px-4 py-2 text-sm font-bold text-vinho">Vamos sair?</Link>
        </div>
      )}
      <p className="mt-3 border-t border-dashed border-vinho/10 pt-2.5 text-xs text-vinho/60">
        {since === null ? 'Seu primeiro rolê está te esperando.' : since === 0 ? 'Você viveu algo novo hoje.' : <>Última vez que fiz algo diferente: <b className="text-vinho">{since === 1 ? 'ontem' : `há ${since} dias`}</b></>}
      </p>
    </Card>
  )
}
