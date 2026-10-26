import { Check } from 'lucide-react'
import { useVault } from '@/hooks/useData'
import { money } from '@/utils/format'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { WidgetHeader } from './WidgetHeader'

export function CostsWidget() {
  const v = useVault()
  const items = v.coverage.slice(0, 4)
  return (
    <Card className="p-4 sm:p-5">
      <WidgetHeader sprite="planner" title="Custos da mudança" to="/sair-de-casa" linkLabel="Ver todos" />
      {items.length === 0 ? (
        <p className="text-sm text-vinho/60">Liste o que precisa para sair de casa e acompanhe o que o cofre já cobre.</p>
      ) : (
        <ul className="space-y-3">
          {items.map(({ cost, covered, progress }) => (
            <li key={cost.id}>
              <div className="mb-1 flex items-center justify-between gap-2 text-[13px]">
                <span className="flex min-w-0 items-center gap-1.5 font-medium text-tinta">
                  {progress >= 100 && <Check size={13} strokeWidth={3} className="shrink-0 text-oliva-600" />}
                  <span className="truncate">{cost.name}</span>
                </span>
                <span className="shrink-0 tabular-nums text-vinho/60">{money(covered).replace(',00', '')} / {money(cost.amount).replace(',00', '')}</span>
              </div>
              <Progress value={progress} color={progress >= 100 ? '#7A7A4A' : '#CB757C'} height={7} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
