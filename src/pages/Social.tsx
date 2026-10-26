import { Link } from 'react-router-dom'
import { MapPin, Plus } from 'lucide-react'
import { useExperiences, useLastExperience, useNextOuting, usePlaces } from '@/hooks/useData'
import { usePlaceActions } from '@/hooks/usePlaceActions'
import { openForm } from '@/hooks/useQuickAdd'
import { daysBetween, formatLong, monthKey, relativeDay, today } from '@/utils/date'
import { money } from '@/utils/format'
import { XP_VALUES } from '@/game/config'
import { PageHeader, StatCard } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState, SectionTitle, StarRating } from '@/components/ui/Misc'
import { PixelIcon } from '@/components/game/PixelIcon'
import { ExplorationCard } from '@/components/game/ExplorationCard'
import { RoleGenerator } from '@/components/places/RoleGenerator'
import { ExperienceTimeline } from '@/components/places/ExperienceTimeline'
import { PlaceCover } from '@/components/places/PlaceCover'
import { WidgetHeader } from '@/components/widgets/WidgetHeader'

/** Vida social: aventuras (rolês), lugares e memórias. Cada rolê vale XP. */
export default function Social() {
  const places = usePlaces()
  const exps = useExperiences()
  const last = useLastExperience()
  const next = useNextOuting()
  const { changeStatus, memoryForm } = usePlaceActions()

  const t = today()
  const month = monthKey(t)
  const monthExps = exps.filter((e) => monthKey(e.date) === month)
  const visited = places.filter((p) => p.status === 'fui' || p.status === 'voltar')
  const wishlist = places.filter((p) => p.status === 'quero').sort((a, b) => Number(b.favorite) - Number(a.favorite))
  const since = last ? daysBetween(last.date, t) : null
  const lastPlace = last?.placeId ? places.find((p) => p.id === last.placeId) : undefined

  return (
    <div className="space-y-8">
      <PageHeader
        icon="cherry"
        kicker="aventuras da vida real"
        title="Vida social"
        subtitle={`Cada rolê vivido vale +${XP_VALUES.role} XP e desbloqueia uma memória.`}
        actions={
          <>
            <Button variant="soft" onClick={() => openForm('place')}><MapPin size={16} /> Novo lugar</Button>
            <Button onClick={() => openForm('event', { category: 'role' } as never)}><Plus size={16} /> Marcar rolê</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard tone="vinho" label="Lugares visitados" value={visited.length} hint="já conhecidos" />
        <StatCard tone="rosa" label="Quero conhecer" value={wishlist.length} hint="destinos bloqueados" />
        <StatCard label="Aventuras no mês" value={monthExps.length} hint={`+${monthExps.length * XP_VALUES.role} XP`} />
        <StatCard tone="oliva" label="Gasto em rolês" value={money(monthExps.reduce((a, e) => a + e.spent, 0))} hint="neste mês" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <WidgetHeader title="Última aventura" sprite="star" />
          {last ? (
            <div className="flex gap-4">
              {lastPlace && <div className="h-24 w-28 shrink-0 overflow-hidden rounded-md border-2 border-px-line"><PlaceCover place={lastPlace} /></div>}
              <div className="min-w-0">
                <p className="font-heading text-xl leading-tight text-vinho">{last.title}</p>
                <p className="mt-0.5 text-xs text-vinho/60 first-letter:uppercase">{formatLong(last.date)} · {since === 0 ? 'hoje' : `há ${since} ${since === 1 ? 'dia' : 'dias'}`}</p>
                <div className="mt-1.5"><StarRating value={last.rating} size={14} /></div>
                {last.comment && <p className="mt-1.5 line-clamp-2 text-sm italic text-vinho/80">“{last.comment}”</p>}
              </div>
            </div>
          ) : (
            <p className="text-sm text-vinho/60">Sua primeira aventura ainda está por vir. ✦</p>
          )}
        </Card>
        <Card tone="vinho">
          <div className="mb-3 flex items-center gap-2 font-pixel text-sm font-semibold uppercase tracking-[0.14em] text-rosa"><PixelIcon name="pin" size={18} /> Próxima aventura</div>
          {next ? (
            <div>
              <p className="font-heading text-2xl leading-tight text-rosa-50">{next.kind === 'place' ? next.place.name : next.event.title}</p>
              <p className="mt-1 text-sm text-rosa-50/75 first-letter:uppercase">
                {relativeDay(next.date)}{next.time ? ` · ${next.time}` : ''}
                {next.kind === 'place' ? ` · ${next.place.neighborhood}` : next.event.location ? ` · ${next.event.location}` : ''}
              </p>
              {next.kind === 'place' && (
                <Button size="sm" variant="soft" className="mt-4" onClick={() => changeStatus(next.place, 'fui')}>Fui! +{XP_VALUES.role} XP</Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-rosa-50/75">Nada marcado ainda. Que tal sortear um rolê aí embaixo?</p>
              <Link to="/explorar" className="inline-flex items-center gap-1 text-sm font-bold text-rosa hover:underline">Abrir o mapa →</Link>
            </div>
          )}
        </Card>
      </div>

      <RoleGenerator onGo={(p) => changeStatus(p, 'planejado')} />

      <section>
        <SectionTitle kicker="destinos bloqueados" action={<Link to="/explorar" className="text-sm font-bold text-cereja hover:underline">Ver mapa →</Link>}>Quero conhecer</SectionTitle>
        {wishlist.length === 0 ? (
          <EmptyState title="Lista vazia por enquanto" text="Anota aquele lugar que você viu por aí." action={<Button size="sm" onClick={() => openForm('place')}><Plus size={14} /> Adicionar lugar</Button>} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {wishlist.slice(0, 6).map((p) => <ExplorationCard key={p.id} place={p} onStatus={changeStatus} />)}
          </div>
        )}
      </section>

      {visited.length > 0 && (
        <section>
          <SectionTitle kicker="mapa revelado">Lugares visitados</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {visited.map((p) => (
              <button key={p.id} onClick={() => openForm('place', p as never)} className="inline-flex items-center gap-2 rounded-lg border-2 border-px-line bg-px-panel px-3 py-2 text-sm font-semibold text-vinho shadow-pixel-sm transition hover:-translate-y-0.5">
                <PixelIcon name={p.status === 'voltar' ? 'heart' : 'check'} size={16} /> {p.name}
                <span className="text-[11px] font-medium text-vinho/50">{p.neighborhood}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <ExperienceTimeline />
      {memoryForm}
    </div>
  )
}
