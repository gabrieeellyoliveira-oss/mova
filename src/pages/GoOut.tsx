import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import type { Experience, Place, PlaceCategory, PlaceStatus } from '@/types'
import { PLACE_CATEGORIES, PLACE_STATUS } from '@/data/constants'
import { db } from '@/store/db'
import { useExperiences, useLastExperience, usePlaces } from '@/hooks/useData'
import { daysBetween, monthKey, today } from '@/utils/date'
import { money } from '@/utils/format'
import { openForm } from '@/hooks/useQuickAdd'
import { celebrate } from '@/hooks/useToast'
import { PageHeader, StatCard } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Chip, Segmented } from '@/components/ui/Chip'
import { EmptyState, SectionTitle } from '@/components/ui/Misc'
import { PlaceCard } from '@/components/places/PlaceCard'
import { RoleGenerator } from '@/components/places/RoleGenerator'
import { ExperienceTimeline } from '@/components/places/ExperienceTimeline'
import { ExperienceForm } from '@/components/places/ExperienceForm'
import { Plane } from '@/components/doodles/Doodles'

export default function GoOut() {
  const places = usePlaces()
  const exps = useExperiences()
  const last = useLastExperience()
  const [cat, setCat] = useState<PlaceCategory | 'todas'>('todas')
  const [status, setStatus] = useState<PlaceStatus | 'todos' | 'favoritos'>('todos')
  const [memory, setMemory] = useState<Partial<Experience> | null>(null)

  const list = useMemo(
    () =>
      places
        .filter((p) => cat === 'todas' || p.category === cat)
        .filter((p) => status === 'todos' || (status === 'favoritos' ? p.favorite : p.status === status))
        .sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.createdAt.localeCompare(a.createdAt)),
    [places, cat, status],
  )

  const changeStatus = (p: Place, s: PlaceStatus) => {
    if (s === 'planejado') {
      openForm('place', { ...p, status: 'planejado', plannedFor: p.plannedFor ?? today(), plannedTime: p.plannedTime ?? '17:00' } as never)
      return
    }
    db.places.update(p.id, { status: s })
    if (s === 'fui' && p.status !== 'fui') {
      celebrate.place()
      setMemory({ placeId: p.id, title: p.name, spent: p.price })
    }
  }

  const month = monthKey(today())
  const monthExps = exps.filter((e) => monthKey(e.date) === month)
  const since = last ? daysBetween(last.date, today()) : null

  return (
    <div className="space-y-10">
      <PageHeader
        kicker="sair de casa"
        title="Vamos viver alguma coisa?"
        subtitle="Uma lista de lugares, uma pitada de coragem e um empurrãozinho quando bater a preguiça."
        doodle={<Plane size={70} className="-rotate-6 text-vinho" />}
        actions={<Button onClick={() => openForm('place')}><Plus size={16} /> Novo lugar</Button>}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard tone="vinho" label="Na minha lista" value={places.filter((p) => p.status === 'quero' || p.status === 'voltar').length} hint="lugares esperando por você" />
        <StatCard tone="rosa" label="Vividos no mês" value={monthExps.length} hint={monthExps.length ? 'olha você!' : 'o mês ainda tem espaço'} />
        <StatCard label="Última vez" value={since === null ? '—' : since === 0 ? 'hoje' : `${since} dias`} hint="desde que fiz algo diferente" />
        <StatCard tone="oliva" label="Gasto em rolês" value={money(monthExps.reduce((a, e) => a + e.spent, 0))} hint="neste mês" />
      </div>

      <RoleGenerator onGo={(p) => changeStatus(p, 'planejado')} />

      <section>
        <SectionTitle kicker="coisas que quero fazer">Quero conhecer</SectionTitle>
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip active={cat === 'todas'} onClick={() => setCat('todas')}>Tudo</Chip>
          {PLACE_CATEGORIES.map((c) => (
            <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}><c.icon size={13} /> {c.id}</Chip>
          ))}
        </div>
        <div className="-mx-4 mb-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Segmented
            value={status}
            onChange={setStatus}
            options={[
              { value: 'todos', label: 'Todos' },
              ...(Object.keys(PLACE_STATUS) as PlaceStatus[]).map((s) => ({ value: s, label: PLACE_STATUS[s].label })),
              { value: 'favoritos', label: '♥ Favoritos' },
            ]}
          />
        </div>
        {list.length === 0 ? (
          <EmptyState title="Nenhum lugar aqui ainda" text="Bora anotar aquele lugar que você viu no Instagram?" action={<Button size="sm" onClick={() => openForm('place', cat !== 'todas' ? { category: cat } : undefined)}><Plus size={14} /> Adicionar lugar</Button>} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {list.map((p) => <PlaceCard key={p.id} place={p} onStatus={changeStatus} />)}
          </div>
        )}
      </section>

      <ExperienceTimeline />
      {memory && <ExperienceForm initial={memory} onClose={() => setMemory(null)} />}
    </div>
  )
}
