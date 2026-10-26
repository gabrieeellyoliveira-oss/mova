import { goalProgress, useGoals } from '@/hooks/useData'
import { Card } from '@/components/ui/Card'
import { PixelIcon, type SpriteName } from '@/components/game/PixelIcon'
import type { GoalCategory } from '@/types'
import { WidgetHeader } from './WidgetHeader'

export const GOAL_SPRITES: Record<GoalCategory, SpriteName> = {
  'Saúde & bem-estar': 'dumbbell', 'Vida financeira': 'coins', 'Vida social': 'cherry', Desenvolvimento: 'tree',
  Estudos: 'laptop', Experiências: 'map', Pessoal: 'heart',
}

/** Metas como itens de quest. */
export function GoalsWidget() {
  const goals = useGoals().filter((g) => g.status !== 'concluida').slice(0, 4)
  return (
    <Card>
      <WidgetHeader title="Minhas metas" sprite="target" to="/metas" linkLabel="Ver todas" />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {goals.map((g) => {
          const p = goalProgress(g)
          return (
            <div key={g.id} className="flex flex-col items-center gap-1.5 rounded-lg border-2 border-px-line/30 bg-white/50 p-2.5 text-center">
              <PixelIcon name={GOAL_SPRITES[g.category] ?? 'star'} size={34} />
              <p className="line-clamp-2 min-h-[32px] text-[12px] font-semibold leading-tight text-tinta">{g.name}</p>
              <div className="h-2.5 w-full overflow-hidden rounded-sm border border-px-line bg-[#f3dede]"><div className="h-full bg-queimado" style={{ width: `${p}%` }} /></div>
              <p className="font-pixel text-sm font-semibold text-vinho">{Math.round(p)}%</p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
