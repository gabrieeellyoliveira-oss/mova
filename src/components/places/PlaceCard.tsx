import { CalendarCheck, Heart, MapPin, Pencil } from 'lucide-react'
import type { Place, PlaceStatus } from '@/types'
import { PLACE_STATUS, placeCategoryMeta } from '@/data/constants'
import { db } from '@/store/db'
import { openForm } from '@/hooks/useQuickAdd'
import { relativeDay } from '@/utils/date'
import { PlaceCover } from './PlaceCover'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

export function PlaceCard({ place, onStatus }: { place: Place; onStatus: (p: Place, s: PlaceStatus) => void }) {
  const cat = placeCategoryMeta(place.category)
  const st = PLACE_STATUS[place.status]
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-vinho/[0.06] bg-quente shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[16/10] overflow-hidden">
        <PlaceCover place={place} className="transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-quente/95 px-2.5 py-1 text-[11px] font-bold shadow-sm" style={{ color: cat.color }}>
          <cat.icon size={12} /> {place.category}
        </span>
        <button
          onClick={() => db.places.update(place.id, { favorite: !place.favorite })}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-quente/95 shadow-sm transition hover:scale-110"
          aria-label={place.favorite ? 'Remover dos favoritos' : 'Favoritar'}
        >
          <Heart size={17} className={cn(place.favorite ? 'fill-cereja text-cereja animate-pop' : 'text-vinho/60')} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold leading-snug text-vinho">{place.name}</h3>
          <button onClick={() => openForm('place', place as never)} className="-mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-vinho/40 hover:bg-vinho/5 hover:text-vinho" aria-label="Editar lugar"><Pencil size={13} /></button>
        </div>
        <p className="flex items-center gap-1 text-xs text-vinho/60"><MapPin size={12} /> {place.neighborhood}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-creme-200 px-2.5 py-0.5 text-[11px] font-bold text-vinho">{place.price ? `~ R$ ${place.price}` : 'Grátis'}</span>
          <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ color: st.color, backgroundColor: st.soft }}>{st.label}</span>
          {place.status === 'planejado' && place.plannedFor && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-vinho/70"><CalendarCheck size={11} />{relativeDay(place.plannedFor)}{place.plannedTime && ` ${place.plannedTime}`}</span>
          )}
        </div>
        <div className="mt-auto flex gap-2 pt-2">
          {place.status === 'quero' || place.status === 'voltar' ? (
            <Button size="sm" className="flex-1" onClick={() => onStatus(place, 'planejado')}>Quero ir ✨</Button>
          ) : place.status === 'planejado' ? (
            <Button size="sm" variant="olive" className="flex-1" onClick={() => onStatus(place, 'fui')}>Fui!</Button>
          ) : (
            <Button size="sm" variant="soft" className="flex-1" onClick={() => onStatus(place, 'voltar')}>Quero voltar</Button>
          )}
          <select
            value={place.status}
            onChange={(e) => onStatus(place, e.target.value as PlaceStatus)}
            className="h-8 rounded-full border border-vinho/15 bg-quente px-2 text-[11px] font-semibold text-vinho focus:outline-none"
            aria-label="Status"
          >
            {(Object.keys(PLACE_STATUS) as PlaceStatus[]).map((s) => <option key={s} value={s}>{PLACE_STATUS[s].label}</option>)}
          </select>
        </div>
      </div>
    </article>
  )
}
