import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Goal, GoalCategory } from '@/types'
import { GOAL_CATEGORIES } from '@/data/constants'
import { goalProgress, useGoals } from '@/hooks/useData'
import { PageHeader, StatCard } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Chip, Segmented } from '@/components/ui/Chip'
import { EmptyState } from '@/components/ui/Misc'
import { GoalCard } from '@/components/goals/GoalCard'
import { GoalForm } from '@/components/goals/GoalForm'
import { Star } from '@/components/doodles/Doodles'

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

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="o que importa pra mim"
        title="Metas"
        subtitle="Conquiste o que importa — uma etapa pequena de cada vez."
        doodle={<Star size={48} className="rotate-12 text-cereja" />}
        actions={<Button onClick={() => setEditing({ category: cat === 'todas' ? 'Pessoal' : cat })}><Plus size={16} /> Nova meta</Button>}
      />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard tone="vinho" label="Em movimento" value={moving.length} hint="metas acontecendo" />
        <StatCard tone="oliva" label="Conquistadas" value={goals.length - moving.length} hint="partes da vida que você moveu" />
        <StatCard label="Caminho andado" value={`${Math.round(avg)}%`} hint="média das metas ativas" />
        <StatCard tone="rosa" label="Etapas feitas" value={`${steps.filter((s) => s.done).length}/${steps.length}`} hint="cada passinho conta" />
      </div>
      <div className="space-y-3">
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
