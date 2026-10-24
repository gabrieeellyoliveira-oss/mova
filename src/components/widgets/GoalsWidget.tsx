import { goalProgress, useGoals } from '@/hooks/useData'
import { goalCategoryMeta } from '@/data/constants'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { WidgetHeader } from './WidgetHeader'

export function GoalsWidget() {
  const goals = useGoals().filter((g) => g.status !== 'concluida').slice(0, 4)
  return (
    <Card className="p-4 sm:p-5">
      <WidgetHeader title="Minhas metas" to="/metas" linkLabel="Ver todas" />
      <ul className="space-y-3.5">
        {goals.map((g) => {
          const meta = goalCategoryMeta(g.category)
          const p = goalProgress(g)
          return (
            <li key={g.id} className="flex items-center gap-3">
              <meta.icon size={22} strokeWidth={1.9} className="shrink-0" style={{ color: meta.color }} />
              <div className="min-w-0 flex-1">
                <p className="mb-1 truncate text-[13px] font-medium text-tinta">{g.name}</p>
                <Progress value={p} color={meta.color} height={8} />
              </div>
              <span className="w-10 shrink-0 text-right text-[13px] font-semibold text-vinho/70">{Math.round(p)}%</span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
