import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import type { VaultCost } from '@/types'
import { db, vaultSettingsStore } from '@/store/db'
import { useMoveNotes, useVault } from '@/hooks/useData'
import { toast } from '@/hooks/useToast'
import { money, moneyInput, parseMoney } from '@/utils/format'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/cn'
import { CostForm } from './CostForm'

const r0 = (n: number) => money(n).replace(',00', '')

/** Custos da mudança: aluguel alvo + caução 1x/2x/3x alimentam Caução e Primeiro aluguel (AUTO); o saldo cobre os itens na ordem. */
export function CostList() {
  const v = useVault()
  const notes = useMoveNotes()
  // menor preço entre os móveis da pesquisa ligados a cada custo (os descartados não contam)
  const researched = new Map<string, { price: number; title: string; count: number }>()
  notes.filter((n) => n.kind === 'movel' && n.costId && n.price && n.status !== 'descartado').forEach((n) => {
    const cur = researched.get(n.costId!)
    if (!cur || n.price! < cur.price) researched.set(n.costId!, { price: n.price!, title: n.title, count: (cur?.count ?? 0) + 1 })
    else cur.count++
  })
  const [editing, setEditing] = useState<VaultCost | 'new' | null>(null)
  const [rent, setRent] = useState<string | null>(null)
  const saveRent = () => { const n = parseMoney(rent ?? ''); if (Number.isFinite(n) && n > 0) vaultSettingsStore.set((p) => ({ ...p, targetRent: n })); setRent(null) }

  return (
    <div>
      <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="block rounded-2xl border-2 border-ink px-4 py-2.5">
          <span className="block text-xs text-tinta/60">Moradia total (aluguel + condomínio + IPTU)</span>
          <input inputMode="decimal" aria-label="Moradia total" value={rent ?? moneyInput(v.rent)} onFocus={() => setRent(moneyInput(v.rent))} onChange={(e) => setRent(e.target.value)}
            onBlur={saveRent} onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            className="w-full bg-transparent text-xl font-bold focus:outline-none" />
        </label>
        <div className="flex h-12 items-stretch overflow-hidden rounded-2xl border-2 border-ink sm:h-auto" role="group" aria-label="Caução">
          <span className="grid place-items-center px-4 text-sm text-tinta/60">Caução</span>
          {([1, 2, 3] as const).map((m) => (
            <button key={m} onClick={() => vaultSettingsStore.set((p) => ({ ...p, depositMultiplier: m }))} aria-pressed={v.mult === m}
              className={cn('border-l-2 border-ink px-4 text-sm font-semibold transition', v.mult === m ? 'bg-lavanda' : 'hover:bg-lavanda-100')}>{m}x</button>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-ink/10">
        {v.coverage.map(({ cost, covered, progress }) => {
          const full = progress >= 100
          const auto = 'auto' in cost && cost.auto
          return (
            <li key={cost.id} className="py-2.5">
              <button disabled={auto} onClick={() => !auto && setEditing(cost as VaultCost)} className="flex w-full items-center gap-3 text-left disabled:cursor-default">
                <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-md border-2', full ? 'border-oliva-600 bg-oliva-600 text-white' : 'border-ink')} aria-label={full ? 'coberto' : 'falta'}>{full && <Check size={14} strokeWidth={3} />}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{cost.name}{auto && <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-[#6A4FB6]">auto</span>}</span>
                <span className="shrink-0 text-sm tabular-nums text-tinta/70"><b className={cn(covered > 0 ? 'text-tinta' : 'font-normal')}>{r0(covered)}</b> / {r0(cost.amount)}</span>
              </button>
              {covered > 0 && !full && <div className="mt-2 pl-9"><Progress value={progress} height={6} /></div>}
              {!auto && researched.get(cost.id) && (() => {
                const r = researched.get(cost.id)!
                if (Math.round(r.price) === Math.round(cost.amount)) return <p className="mt-1 pl-9 text-xs text-oliva-600">preço pesquisado ✓ ({r.title})</p>
                return (
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 pl-9 text-xs text-tinta/65">
                    <span>pesquisado: <b className="text-tinta">{r0(r.price)}</b> · {r.title}{r.count > 1 ? ` (menor de ${r.count})` : ''}</span>
                    <button onClick={() => { db.vaultCosts.update(cost.id, { amount: r.price }); toast(`${cost.name}: ${r0(r.price)}`, { text: 'A meta do cofre foi recalculada.' }) }}
                      className="rounded-full border-2 border-ink bg-quente px-2 py-0 font-semibold text-tinta hover:bg-lavanda-100">usar</button>
                  </p>
                )
              })()}
            </li>
          )
        })}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t-2 border-ink pt-3">
        <span>Meta do cofre</span>
        <span className="font-serif text-xl font-bold">{money(v.target)}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-tinta/55">✓ fica verde quando o item está 100% coberto · toque num item para editar · móveis da pesquisa ligados a um item mostram o preço achado</p>
        <Button size="sm" variant="light" aria-label="Adicionar custo da mudança" onClick={() => setEditing('new')}><Plus size={14} /> Custo</Button>
      </div>
      {editing && <CostForm initial={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
