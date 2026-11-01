import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { CustomAchievement } from '@/types'
import { useGame } from '@/game/useGame'
import { db } from '@/store/db'
import { useCollection } from '@/store/collections'
import { CustomAchievementForm } from '@/components/game/CustomAchievementForm'
import { StatCard } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Achievement } from '@/components/game/Achievement'
import { WidgetHeader } from '@/components/widgets/WidgetHeader'

/** Conquistas: as criadas pela Gabi e as automáticas (vindas do que ela faz no MOVA). */
export default function Achievements() {
  const g = useGame()
  const customs = useCollection(db.customAchievements)
  const [editing, setEditing] = useState<CustomAchievement | 'new' | null>(null)
  const unlocked = g.achievements.filter((a) => a.unlocked)
  const mine = g.achievements.filter((a) => a.customId).sort((a, b) => Number(b.unlocked) - Number(a.unlocked))
  const auto = g.achievements.filter((a) => !a.customId)
  const autoSorted = [...auto.filter((a) => a.unlocked), ...auto.filter((a) => !a.unlocked).sort((a, b) => b.current / b.target - a.current / a.target)]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard tone="vinho" label="Desbloqueadas" value={`${unlocked.length} de ${g.achievements.length}`} action={<Button size="sm" variant="light" onClick={() => setEditing('new')}><Plus size={14} /> Nova conquista</Button>} />
        <StatCard tone="rosa" label="Minhas conquistas" value={mine.length} hint={`${mine.filter((a) => a.unlocked).length} já conquistadas`} />
        <StatCard label="Automáticas" value={`${auto.filter((a) => a.unlocked).length} de ${auto.length}`} hint="vêm do que você faz no MOVA" />
      </div>

      <Card>
        <WidgetHeader title="Minhas conquistas" sprite="heart" action={<Button size="sm" variant="soft" onClick={() => setEditing('new')}><Plus size={14} /> Nova</Button>} />
        <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
          {mine.map((a) => <Achievement key={a.id} {...a} onClick={() => setEditing(customs.find((c) => c.id === a.customId) ?? null)} />)}
          <button onClick={() => setEditing('new')} className="group flex flex-col items-center gap-2 text-center">
            <span className="grid h-[72px] w-[72px] place-items-center rounded-full border-2 border-dashed border-queimado/60 text-vinho/60 transition group-hover:-translate-y-0.5 group-hover:text-vinho">
              <Plus size={26} />
            </span>
            <span className="text-sm font-semibold text-tinta/70">Nova conquista</span>
          </button>
        </div>
        {!mine.length && <p className="mt-4 text-sm text-tinta/60">Crie conquistas para o que importa pra você — algo que já conquistou ou uma meta pra desbloquear.</p>}
      </Card>

      <Card>
        <WidgetHeader title="Conquistas automáticas" sprite="trophy" subtitle="desbloqueiam sozinhas com o que você registra" />
        <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
          {autoSorted.map((a) => <Achievement key={a.id} {...a} />)}
        </div>
      </Card>
      {editing && <CustomAchievementForm initial={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
