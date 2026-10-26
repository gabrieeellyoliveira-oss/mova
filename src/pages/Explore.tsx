import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import type { PlaceCategory, PlaceStatus } from '@/types'
import { PLACE_CATEGORIES } from '@/data/constants'
import { usePlaces } from '@/hooks/useData'
import { usePlaceActions } from '@/hooks/usePlaceActions'
import { openForm } from '@/hooks/useQuickAdd'
import { XP_VALUES } from '@/game/config'
import { PageHeader, StatCard } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Chip, Segmented } from '@/components/ui/Chip'
import { EmptyState, SectionTitle } from '@/components/ui/Misc'
import { DESTINATION, ExplorationCard } from '@/components/game/ExplorationCard'
import { ExploreMap } from '@/components/places/ExploreMap'
import { RoleGenerator } from '@/components/places/RoleGenerator'

/** Explorar: mapa dos lugares cadastrados + cartas de destino com estados de jogo. */
export default function Explore() {
  const places = usePlaces()
  const { changeStatus, memoryForm } = usePlaceActions()
  const [cat, setCat] = useState<PlaceCategory | 'todas'>('todas')
  const [status, setStatus] = useState<PlaceStatus | 'todos' | 'favoritos'>('todos')
  const [district, setDistrict] = useState<string | null>(null)

  const list = useMemo(
    () => places
      .filter((p) => cat === 'todas' || p.category === cat)
      .filter((p) => status === 'todos' || (status === 'favoritos' ? p.favorite : p.status === status))
      .filter((p) => !district || (p.neighborhood?.trim() || 'Sem bairro') === district)
      .sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.createdAt.localeCompare(a.createdAt)),
    [places, cat, status, district],
  )
  const count = (s: PlaceStatus) => places.filter((p) => p.status === s).length
  const usedCats = PLACE_CATEGORIES.filter((c) => places.some((p) => p.category === c.id) || ['Cafés', 'Parques', 'Restaurantes', 'Cinema', 'Compras', 'Experiências'].includes(c.id))

  return (
    <div className="space-y-8">
      <PageHeader
        icon="map"
        kicker="mapa da aventura"
        title="Explorar"
        subtitle={`Seus lugares viram destinos no mapa. Conhecer um novo vale +${XP_VALUES.role} XP.`}
        actions={<Button onClick={() => openForm('place')}><Plus size={16} /> Novo lugar</Button>}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard tone="vinho" label={DESTINATION.quero.label} value={count('quero')} hint="destinos bloqueados" />
        <StatCard tone="rosa" label={DESTINATION.planejado.label} value={count('planejado')} hint="aventuras marcadas" />
        <StatCard label={DESTINATION.fui.label} value={count('fui')} hint="mapa revelado" />
        <StatCard tone="oliva" label={DESTINATION.voltar.label} value={count('voltar')} hint="favoritos da vida" />
      </div>

      <section>
        <SectionTitle kicker={district ? `bairro: ${district}` : 'toque num bairro pra filtrar'} action={district && <Button size="sm" variant="ghost" onClick={() => setDistrict(null)}>Ver todos</Button>}>Mapa</SectionTitle>
        {places.length === 0 ? (
          <EmptyState title="Seu mapa ainda está em branco" text="Cadastre um lugar e ele aparece aqui, no bairro dele." action={<Button size="sm" onClick={() => openForm('place')}><Plus size={14} /> Adicionar lugar</Button>} />
        ) : (
          <ExploreMap places={places} selected={district} onSelect={setDistrict} />
        )}
      </section>

      <section>
        <SectionTitle kicker="cartas de destino">Lugares</SectionTitle>
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip active={cat === 'todas'} onClick={() => setCat('todas')}>Tudo</Chip>
          {usedCats.map((c) => <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}><c.icon size={13} /> {c.id}</Chip>)}
        </div>
        <div className="-mx-4 mb-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Segmented
            value={status}
            onChange={setStatus}
            options={[
              { value: 'todos', label: 'Todos' },
              ...(Object.keys(DESTINATION) as PlaceStatus[]).map((s) => ({ value: s, label: DESTINATION[s].label })),
              { value: 'favoritos', label: '♥ Favoritos' },
            ]}
          />
        </div>
        {list.length === 0 ? (
          <EmptyState title="Nenhum lugar com esse filtro" text="Que tal anotar um novo destino?" action={<Button size="sm" onClick={() => openForm('place', cat !== 'todas' ? { category: cat } as never : undefined)}><Plus size={14} /> Adicionar lugar</Button>} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {list.map((p) => <ExplorationCard key={p.id} place={p} onStatus={changeStatus} />)}
          </div>
        )}
      </section>

      <RoleGenerator onGo={(p) => changeStatus(p, 'planejado')} />
      {memoryForm}
    </div>
  )
}
