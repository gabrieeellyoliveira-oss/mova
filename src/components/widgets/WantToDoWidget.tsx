import { Bookmark } from 'lucide-react'
import { usePlaces } from '@/hooks/useData'
import { db } from '@/store/db'
import { openForm } from '@/hooks/useQuickAdd'
import { Card } from '@/components/ui/Card'
import { PlaceCover } from '@/components/places/PlaceCover'
import { cn } from '@/lib/cn'
import { WidgetHeader } from './WidgetHeader'

export function WantToDoWidget() {
  const places = usePlaces()
    .filter((p) => p.status === 'quero' || p.status === 'voltar')
    .sort((a, b) => Number(b.favorite) - Number(a.favorite))
    .slice(0, 3)
  return (
    <Card className="p-4 sm:p-5">
      <WidgetHeader title="Quero fazer" to="/sair-de-casa" linkLabel="Ver todas" />
      <div className="grid grid-cols-3 gap-2.5">
        {places.map((p) => (
          <div key={p.id} className="group min-w-0">
            <button onClick={() => openForm('place', p as never)} className="block aspect-[4/3] w-full overflow-hidden rounded-xl">
              <PlaceCover place={p} className="transition-transform duration-500 group-hover:scale-105" />
            </button>
            <div className="mt-1.5 flex items-start justify-between gap-1">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-tinta">{p.name}</p>
                <p className="truncate text-[11px] text-vinho/55">{p.category}</p>
              </div>
              <button onClick={() => db.places.update(p.id, { favorite: !p.favorite })} aria-label={p.favorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'} className="shrink-0 pt-0.5">
                <Bookmark size={17} className={cn('text-vinho', p.favorite && 'fill-vinho')} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
