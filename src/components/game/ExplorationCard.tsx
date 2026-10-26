import { Heart, MapPin, Pencil } from 'lucide-react'
import type { Place, PlaceStatus } from '@/types'
import { PLACE_STATUS, placeCategoryMeta } from '@/data/constants'
import { db } from '@/store/db'
import { openForm } from '@/hooks/useQuickAdd'
import { relativeDay } from '@/utils/date'
import { PlaceCover } from '@/components/places/PlaceCover'
import { Button } from '@/components/ui/Button'
import { PixelIcon, type SpriteName } from './PixelIcon'
import { cn } from '@/lib/cn'

/** Estados de destino no "mapa": 🔒 quero conhecer · 📍 planejado · ✓ conhecido · ♥ quero voltar */
export const DESTINATION: Record<PlaceStatus, { label: string; sprite: SpriteName }> = {
  quero: { label: 'Quero conhecer', sprite: 'lock' },
  planejado: { label: 'Planejado', sprite: 'pin' },
  fui: { label: 'Conhecido', sprite: 'check' },
  voltar: { label: 'Quero voltar', sprite: 'heart' },
}

export function ExplorationCard({ place, onStatus }: { place: Place; onStatus: (p: Place, s: PlaceStatus) => void }) {
  const cat = placeCategoryMeta(place.category)
  const st = DESTINATION[place.status]
  const locked = place.status === 'quero'
  return (
    <article className="group flex flex-col overflow-hidden rounded-px border-2 border-px-line bg-px-panel shadow-pixel transition-transform duration-200 hover:-translate-y-1 hover:shadow-pixel-glow">
      <div className="relative aspect-[16/10] overflow-hidden border-b-2 border-px-line">
        <PlaceCover place={place} className={cn('transition-transform duration-500 group-hover:scale-105', locked && 'saturate-[0.55]')} />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded border-2 border-px-line bg-px-panel px-1.5 py-0.5 font-pixel text-[11px] font-semibold text-vinho">
          <PixelIcon name={st.sprite} size={12} /> {st.label}
        </span>
        <button
          onClick={() => db.places.update(place.id, { favorite: !place.favorite })}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-md border-2 border-px-line bg-px-panel transition hover:scale-110"
          aria-label={place.favorite ? 'Remover dos favoritos' : 'Favoritar'}
        >
          <Heart size={15} className={cn(place.favorite ? 'fill-cereja text-cereja' : 'text-vinho/60')} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-lg leading-tight text-vinho">{place.name}</h3>
          <button onClick={() => openForm('place', place as never)} className="-mr-1 grid h-7 w-7 shrink-0 place-items-center rounded text-vinho/40 hover:bg-vinho/5 hover:text-vinho" aria-label="Editar lugar"><Pencil size={13} /></button>
        </div>
        <p className="flex items-center gap-1 text-xs text-vinho/60"><cat.icon size={12} /> {place.category} · <MapPin size={11} /> {place.neighborhood}</p>
        <p className="text-xs font-semibold text-vinho/70">
          {place.price ? `~ R$ ${place.price}` : 'Grátis'}
          {place.status === 'planejado' && place.plannedFor && ` · ${relativeDay(place.plannedFor)}${place.plannedTime ? ` ${place.plannedTime}` : ''}`}
        </p>
        <div className="mt-auto flex gap-2 pt-2">
          {place.status === 'quero' || place.status === 'voltar' ? (
            <Button size="sm" className="flex-1" onClick={() => onStatus(place, 'planejado')}>Quero ir</Button>
          ) : place.status === 'planejado' ? (
            <Button size="sm" variant="olive" className="flex-1" onClick={() => onStatus(place, 'fui')}>Fui! +20 XP</Button>
          ) : (
            <Button size="sm" variant="soft" className="flex-1" onClick={() => onStatus(place, 'voltar')}>Quero voltar</Button>
          )}
          <select
            value={place.status}
            onChange={(e) => onStatus(place, e.target.value as PlaceStatus)}
            className="h-8 rounded-md border-2 border-vinho/25 bg-white/80 px-1.5 text-[11px] font-semibold text-vinho focus:outline-none"
            aria-label="Status"
          >
            {(Object.keys(PLACE_STATUS) as PlaceStatus[]).map((s) => <option key={s} value={s}>{DESTINATION[s].label}</option>)}
          </select>
        </div>
      </div>
    </article>
  )
}
