import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Goal, GoalCategory } from '@/types'
import { GOAL_CATEGORIES } from '@/data/constants'
import { goalProgress, useGoals } from '@/hooks/useData'
import { StatCard } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Chip, Segmented } from '@/components/ui/Chip'
import { EmptyState } from '@/components/ui/Misc'
import { GoalCard } from '@/components/goals/GoalCard'
import { GoalForm } from '@/components/goals/GoalForm'
import { Quest } from '@/components/game/Quest'
import { GOAL_SPRITES } from '@/components/widgets/GoalsWidget'
import { SectionTitle } from '@/components/ui/Misc'
import { relativeDay } from '@/utils/date'

export default function Goals() {
  const goals = useGoals()
  const [cat, setCat] = useState<GoalCategory | 'todas'>('todas')
  const [view, setView] = useState<'movimento' | 'conquistadas' | 'todas'>('movimento')
  const [editing, setEditing] = useState<Partial<Goal> | null>(null)

  const list = goals
    .filter((g) => cat === 'todas' || g.category === cat)
    .filter((g) => view === 'todas' || (view === 'conquistadas' ? g.status === 'concluida' : g.status !== 'concluida'))
  const moving = goals.filter((g) => g.status !== 'concluida')
  const avg = moving.length ? moving.reduce((a, g) => a + goalProgress(g), 0) / moving.length : 0
  const steps = goals.flatMap((g) => g.steps)
  // Quest principal: a meta ativa com prazo mais próximo (ou a mais avançada, se nenhuma tiver prazo)
  const ranked = [...moving].sort((a, b) =>
    (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999') || goalProgress(b) - goalProgress(a))
  const [main, ...sides] = ranked
  const questProps = (g: Goal) => {
    const done = g.steps.filter((x) => x.done).length
    return {
      title: g.name,
      sprite: GOAL_SPRITES[g.category] ?? 'star',
      progress: goalProgress(g),
      current: g.steps.length ? done : undefined,
      total: g.steps.length || undefined,
      subtitle: <>{g.category}{g.deadline ? ` · prazo ${relativeDay(g.deadline)}` : ''}</>,
      onClick: () => setEditing(g),
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard tone="vinho" label="Em movimento" value={moving.length} hint="metas acontecendo" action={<Button size="sm" variant="light" onClick={() => setEditing({ category: cat === 'todas' ? 'Pessoal' : cat })}><Plus size={14} /> Nova meta</Button>} />
        <StatCard tone="oliva" label="Conquistadas" value={goals.length - moving.length} hint="partes da vida que você moveu" />
        <StatCard label="Caminho andado" value={`${Math.round(avg)}%`} hint="média das metas ativas" />
        <StatCard tone="rosa" label="Etapas feitas" value={`${steps.filter((s) => s.done).length}/${steps.length}`} hint="cada passinho conta" />
      </div>
      {main && (
        <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <Quest kind="main" {...questProps(main)} />
          {sides.length > 0 && (
            <div className="grid content-start gap-3">
              <p className="font-pixel text-sm font-semibold uppercase tracking-[0.14em] text-vinho">Side quests</p>
              {sides.slice(0, 3).map((g) => <Quest key={g.id} {...questProps(g)} />)}
            </div>
          )}
        </section>
      )}
      <SectionTitle kicker="todas as quests, com etapas">Diário de quests</SectionTitle>
      <div className="-mt-2 space-y-3">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip active={cat === 'todas'} onClick={() => setCat('todas')}>Todas as áreas</Chip>
          {GOAL_CATEGORIES.map((c) => <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.emoji} {c.id}</Chip>)}
        </div>
        <Segmented value={view} onChange={setView} options={[{ value: 'movimento', label: 'Em movimento' }, { value: 'conquistadas', label: 'Conquistadas' }, { value: 'todas', label: 'Todas' }]} />
      </div>
      {list.length === 0 ? (
        <EmptyState title={view === 'conquistadas' ? 'As conquistas vão aparecer aqui' : 'Nenhuma meta nesta área'} text="Comece pequeno. Comece hoje." action={<Button size="sm" onClick={() => setEditing({ category: cat === 'todas' ? 'Pessoal' : cat })}>Criar meta</Button>} />
      ) : (
        <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((g) => <GoalCard key={g.id} goal={g} onEdit={() => setEditing(g)} />)}
        </div>
      )}
      {editing && <GoalForm initial={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
