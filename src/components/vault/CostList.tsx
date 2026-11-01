import { useState } from 'react'
import { Check, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import type { VaultCost } from '@/types'
import { db } from '@/store/db'
import { useVault } from '@/hooks/useData'
import { money } from '@/utils/format'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { EmptyState } from '@/components/ui/Misc'
import { CostForm } from './CostForm'

/** Custos da mudança: o saldo do cofre vai cobrindo cada item na ordem da lista. */
export function CostList() {
  const v = useVault()
  const [editing, setEditing] = useState<VaultCost | 'new' | null>(null)

  const move = (index: number, dir: -1 | 1) => {
    const list = [...v.costs]
    const j = index + dir
    if (j < 0 || j >= list.length) return
    ;[list[index], list[j]] = [list[j], list[index]]
    list.forEach((c, order) => db.vaultCosts.update(c.id, { order }))
  }

  return (
    <div>
      {v.costs.length === 0 ? (
        <EmptyState title="Nenhum custo cadastrado" text="Liste o que precisa para sair de casa (caução, móveis…) e o total vira a meta." action={<Button size="sm" onClick={() => setEditing('new')}><Plus size={14} /> Adicionar custo</Button>} />
      ) : (
        <ul className="space-y-3">
          {v.coverage.map(({ cost, covered, progress }, i) => (
            <li key={cost.id} className="group flex items-center gap-2">
              <div className="flex flex-col opacity-40 transition group-hover:opacity-100">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="disabled:opacity-20" aria-label={`Subir ${cost.name}`}><ChevronUp size={14} /></button>
                <button onClick={() => move(i, 1)} disabled={i === v.costs.length - 1} className="disabled:opacity-20" aria-label={`Descer ${cost.name}`}><ChevronDown size={14} /></button>
              </div>
              <button onClick={() => setEditing(cost)} className="min-w-0 flex-1 rounded-2xl px-2 py-1.5 text-left transition hover:bg-creme-100">
                <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-1.5 font-semibold text-tinta">
                    {progress >= 100 && <Check size={14} strokeWidth={3} className="shrink-0 text-oliva-600" />}
                    <span className="truncate">{cost.name}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-vinho/70"><b className="text-vinho">{money(covered).replace(',00', '')}</b> / {money(cost.amount).replace(',00', '')}</span>
                </div>
                <Progress value={progress} color={progress >= 100 ? '#5E9474' : '#6E2E58'} height={7} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {v.costs.length > 0 && (
        <div className="mt-4 flex items-center justify-between border-t border-dashed border-vinho/15 pt-3 text-sm">
          <span className="text-vinho/70">Total (meta do cofre)</span>
          <span className="font-extrabold text-vinho">{money(v.target)}</span>
        </div>
      )}
      {v.costs.length > 0 && <Button size="sm" variant="soft" className="mt-3" onClick={() => setEditing('new')}><Plus size={14} /> Adicionar custo</Button>}
      {editing && <CostForm initial={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
