import { useMemo } from 'react'
import type { Place } from '@/types'
import { PixelIcon } from '@/components/game/PixelIcon'
import { DESTINATION } from '@/components/game/ExplorationCard'
import { cn } from '@/lib/cn'

export interface District { name: string; places: Place[]; known: number }

/** Agrupa os lugares cadastrados por bairro (nada é inventado: só o que existe nos dados). */
export function groupDistricts(places: Place[]): District[] {
  const map = new Map<string, Place[]>()
  places.forEach((p) => {
    const key = p.neighborhood?.trim() || 'Sem bairro'
    map.set(key, [...(map.get(key) ?? []), p])
  })
  return [...map.entries()]
    .map(([name, list]) => ({ name, places: list, known: list.filter((p) => p.status === 'fui' || p.status === 'voltar').length }))
    .sort((a, b) => b.places.length - a.places.length || a.name.localeCompare(b.name))
}

// Variações de terreno pra cada "ilha" de bairro (determinístico pelo índice).
const TERRAIN = ['bg-[#d9dcb4]', 'bg-[#efd9c4]', 'bg-[#f3dede]', 'bg-[#dfe6c8]', 'bg-[#ead7d7]']

/** Mapa estilo jogo: cada bairro cadastrado vira uma região com seus pinos. */
export function ExploreMap({ places, selected, onSelect }: { places: Place[]; selected: string | null; onSelect: (d: string | null) => void }) {
  const districts = useMemo(() => groupDistricts(places), [places])
  if (districts.length === 0) return null
  return (
    <div className="relative overflow-hidden rounded-px border-2 border-px-line bg-[#c9d3a4] p-3 shadow-pixel sm:p-4">
      {/* textura de grama em pixels */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(#9a9a5c_1px,transparent_1.5px)] [background-size:14px_14px]" />
      <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {districts.map((d, i) => {
          const active = selected === d.name
          return (
            <button
              key={d.name}
              onClick={() => onSelect(active ? null : d.name)}
              aria-pressed={active}
              className={cn(
                'group relative flex min-h-[112px] flex-col rounded-lg border-2 border-px-line p-2.5 text-left shadow-pixel-sm transition-[transform,box-shadow] duration-150 hover:-translate-y-[2px] hover:shadow-pixel-glow',
                TERRAIN[i % TERRAIN.length],
                active && 'ring-4 ring-cereja/60',
                selected && !active && 'opacity-60',
              )}
            >
              <span className="flex items-center justify-between gap-1">
                <span className="truncate rounded bg-vinho-900 px-1.5 py-0.5 font-pixel text-[11px] font-semibold text-rosa-50">{d.name}</span>
                <span className="font-pixel text-[11px] font-semibold text-vinho/70">{d.known}/{d.places.length}</span>
              </span>
              <span className="mt-2 flex flex-1 flex-wrap content-end gap-1.5">
                {d.places.map((p) => (
                  <span key={p.id} title={`${p.name} · ${DESTINATION[p.status].label}`} className={cn('grid h-7 w-7 place-items-center rounded-md border-2 border-px-line bg-px-panel', p.status === 'quero' && 'opacity-70')}>
                    <PixelIcon name={DESTINATION[p.status].sprite} size={16} />
                  </span>
                ))}
              </span>
            </button>
          )
        })}
      </div>
      <div className="relative mt-3 flex flex-wrap gap-x-4 gap-y-1 rounded-md bg-px-panel/85 px-3 py-1.5 text-[11px] font-semibold text-vinho">
        {Object.values(DESTINATION).map((s) => <span key={s.label} className="inline-flex items-center gap-1"><PixelIcon name={s.sprite} size={12} /> {s.label}</span>)}
      </div>
    </div>
  )
}
