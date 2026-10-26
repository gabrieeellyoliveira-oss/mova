import { Bookmark } from 'lucide-react'
import { usePlaces } from '@/hooks/useData'
import { db } from '@/store/db'
import { openForm } from '@/hooks/useQuickAdd'
import { Card } from '@/components/ui/Card'
import { PlaceCover } from '@/components/places/PlaceCover'
import { cn } from '@/lib/cn'
import { WidgetHeader } from './WidgetHeader'

/** Lugares que quero conhecer (destinos ainda bloqueados no mapa). */
export function PlacesWidget() {
  const places = usePlaces().filter((p) => p.status === 'quero' || p.status === 'voltar').sort((a, b) => Number(b.favorite) - Number(a.favorite)).slice(0, 3)
  return (
    <Card>
      <WidgetHeader title="Lugares que quero conhecer" sprite="pin" to="/explorar" linkLabel="Ver todos" />
      {places.length === 0 ? (
        <p className="text-sm text-vinho/60">Nenhum destino na lista ainda.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          {places.map((p) => (
            <div key={p.id} className="group min-w-0 overflow-hidden rounded-lg border-2 border-px-line bg-white/60">
              <button onClick={() => openForm('place', p as never)} className="block aspect-[4/3] w-full overflow-hidden border-b-2 border-px-line">
                <PlaceCover place={p} className="transition-transform duration-500 group-hover:scale-105" />
              </button>
              <div className="flex items-start justify-between gap-1 p-1.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-tinta">{p.name}</p>
                  <p className="truncate text-[10px] text-vinho/55">{p.neighborhood}</p>
                </div>
                <button onClick={() => db.places.update(p.id, { favorite: !p.favorite })} aria-label={p.favorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'} className="shrink-0">
                  <Bookmark size={15} className={cn('text-vinho', p.favorite && 'fill-vinho')} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
