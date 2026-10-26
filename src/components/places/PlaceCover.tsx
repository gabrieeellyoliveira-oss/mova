import type { Place } from '@/types'
import { placeCategoryMeta } from '@/data/constants'
import { Cherry, Cup, Flower, Heart, Plane, Sparkle, Star } from '@/components/doodles/Doodles'
import { cn } from '@/lib/cn'

const doodleFor: Record<string, typeof Cup> = {
  'Cafés': Cup, 'Restaurantes': Cherry, 'Museus': Star, 'Parques': Flower, 'Eventos': Sparkle,
  'Cinema': Star, 'Compras': Heart, 'Passeios': Plane, 'Experiências': Sparkle, 'Lugares diferentes': Plane,
}

/** Foto do lugar ou uma capa ilustrada no estilo scrapbook. */
export function PlaceCover({ place, className }: { place: Pick<Place, 'photo' | 'category' | 'name'>; className?: string }) {
  if (place.photo) {
    return <img src={place.photo} alt={place.name} className={cn('h-full w-full object-cover', className)} loading="lazy" />
  }
  const meta = placeCategoryMeta(place.category)
  const Icon = meta.icon
  const D = doodleFor[place.category] ?? Flower
  // variação estável por nome
  const seed = [...place.name].reduce((a, c) => a + c.charCodeAt(0), 0)
  const bgs = ['#f8dcde', '#EFE3D6', '#E6E4CF', '#fcefef', '#DFD1D1']
  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)} style={{ backgroundColor: bgs[seed % bgs.length] }}>
      <svg className="absolute inset-0 h-full w-full opacity-[0.35]" aria-hidden>
        <defs>
          <pattern id={`dots-${seed}`} width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill={meta.color} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dots-${seed})`} />
      </svg>
      <div className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-quente/90 shadow-soft" style={{ color: meta.color }}>
        <Icon size={32} strokeWidth={1.8} />
      </div>
      <D size={38} className="absolute bottom-3 right-4 rotate-12 text-cereja" />
      <Sparkle size={14} className="absolute left-5 top-4 text-queimado" />
    </div>
  )
}
