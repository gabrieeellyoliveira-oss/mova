import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import { usePlaces } from '@/hooks/useData'
import { openForm } from '@/hooks/useQuickAdd'
import { ratio } from '@/utils/format'
import { PageHeader, StatCard } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { EmptyState } from '@/components/ui/Misc'
import { PixelIcon } from '@/components/game/PixelIcon'
import { DESTINATION } from '@/components/game/ExplorationCard'
import { groupDistricts } from '@/components/places/ExploreMap'

/** Minha cidade: bairros a partir dos lugares cadastrados, com quanto de cada um já foi explorado. */
export default function City() {
  const places = usePlaces()
  const districts = useMemo(() => groupDistricts(places), [places])
  const known = districts.reduce((a, d) => a + d.known, 0)
  const explored = districts.filter((d) => d.known > 0).length
  const cities = [...new Set(places.map((p) => p.city?.trim()).filter(Boolean))]

  return (
    <div className="space-y-8">
      <PageHeader
        icon="city"
        kicker={cities.length ? cities.join(' · ') : 'bairro a bairro'}
        title="Minha cidade"
        subtitle="Os bairros dos seus lugares. Cada lugar conhecido revela um pouco mais do mapa."
        actions={<Button onClick={() => openForm('place')}><Plus size={16} /> Novo lugar</Button>}
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard tone="vinho" label="Bairros no mapa" value={districts.length} />
        <StatCard tone="rosa" label="Bairros explorados" value={explored} hint="com pelo menos um lugar conhecido" />
        <StatCard label="Lugares conhecidos" value={`${known}/${places.length}`} />
        <StatCard tone="oliva" label="Cidade revelada" value={`${Math.round(ratio(known, places.length))}%`} />
      </div>
      {districts.length === 0 ? (
        <EmptyState title="Nenhum bairro ainda" text="Cadastre lugares com o bairro e eles aparecem aqui." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {districts.map((d) => {
            const p = ratio(d.known, d.places.length)
            return (
              <Card key={d.name} hover>
                <div className="px-titlebar mb-3 justify-between">
                  <span className="flex min-w-0 items-center gap-2"><PixelIcon name={p === 100 ? 'star' : 'city'} size={18} /><span className="truncate">{d.name}</span></span>
                  <span className="font-sans text-xs normal-case tracking-normal text-rosa-50/75">{d.known}/{d.places.length}</span>
                </div>
                <div className="mb-3 flex items-center gap-2">
                  <Progress value={p} color="#961415" height={8} className="flex-1" />
                  <span className="font-pixel text-sm font-semibold text-vinho">{Math.round(p)}%</span>
                </div>
                <ul className="space-y-1">
                  {d.places.map((pl) => (
                    <li key={pl.id}>
                      <button onClick={() => openForm('place', pl as never)} className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-white/60">
                        <PixelIcon name={DESTINATION[pl.status].sprite} size={14} />
                        <span className="min-w-0 flex-1 truncate font-medium text-tinta">{pl.name}</span>
                        <span className="shrink-0 text-[11px] text-vinho/55">{DESTINATION[pl.status].label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
