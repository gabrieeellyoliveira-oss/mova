import { useGame } from '@/game/useGame'
import { Card } from '@/components/ui/Card'
import { Achievement } from '@/components/game/Achievement'
import { WidgetHeader } from './WidgetHeader'

export function AchievementsWidget({ limit = 4 }: { limit?: number }) {
  const g = useGame()
  const list = [...g.achievements].sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || b.current / b.target - a.current / a.target).slice(0, limit)
  return (
    <Card>
      <WidgetHeader title="Conquistas" sprite="trophy" to="/conquistas" linkLabel="Ver todas" subtitle={`${g.achievements.filter((a) => a.unlocked).length} de ${g.achievements.length} desbloqueadas`} />
      <div className="grid grid-cols-4 gap-2">
        {list.map((a) => <Achievement key={a.id} {...a} size="sm" />)}
      </div>
    </Card>
  )
}
