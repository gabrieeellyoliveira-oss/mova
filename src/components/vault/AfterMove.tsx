import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { vaultSettingsStore } from '@/store/db'
import { useIncome, useVault } from '@/hooks/useData'
import { money, moneyInput, parseMoney } from '@/utils/format'
import { cn } from '@/lib/cn'

const r0 = (n: number) => money(n).replace(',00', '')

/** Depois que eu sair: salário + VA − moradia total − custos fixos − mercado (editáveis) = sobra no mês. */
export function AfterMove() {
  const v = useVault()
  const inc = useIncome()
  const [edit, setEdit] = useState<{ id: string; v: string } | null>(null)
  const [nw, setNw] = useState({ name: '', amount: '' })
  const setCosts = (fn: (l: typeof v.livingCosts) => typeof v.livingCosts) => vaultSettingsStore.set((p) => ({ ...p, livingCosts: fn(p.livingCosts ?? v.livingCosts) }))
  const save = (id: string) => {
    const n = parseMoney(edit?.v ?? '')
    setEdit(null)
    if (Number.isFinite(n) && n >= 0) setCosts((l) => l.map((c) => (c.id === id ? { ...c, amount: n } : c)))
  }
  const groceries = v.settings.groceries ?? inc.voucher
  const saveGroceries = () => {
    const n = parseMoney(edit?.v ?? '')
    setEdit(null)
    if (Number.isFinite(n) && n >= 0) vaultSettingsStore.set((p) => ({ ...p, groceries: n }))
  }
  const left = inc.total - v.livingTotal - groceries
  const row = 'flex items-center justify-between gap-3 border-b border-dashed border-ink/15 py-2.5'
  return (
    <div>
      <ul>
        <li className={row}><span>Salário</span><span className="shrink-0 whitespace-nowrap font-semibold tabular-nums text-oliva-600">+ {r0(inc.salary)}</span></li>
        <li className={row}><span>Vale-alimentação</span><span className="shrink-0 whitespace-nowrap font-semibold tabular-nums text-oliva-600">+ {r0(inc.voucher)}</span></li>
        <li className={row}><span>Mercado <span className="hidden text-xs text-tinta/50 sm:inline">(comida do mês)</span></span>
          {edit?.id === 'mercado' ? (
            <input autoFocus inputMode="decimal" value={edit.v} onChange={(e) => setEdit({ id: 'mercado', v: e.target.value })} onBlur={saveGroceries} onKeyDown={(e) => e.key === 'Enter' && saveGroceries()}
              aria-label="Valor de Mercado" className="h-8 w-24 rounded-xl border-2 border-ink bg-quente px-2 text-right text-sm focus:outline-none" />
          ) : (
            <button onClick={() => setEdit({ id: 'mercado', v: moneyInput(groceries) })} aria-label="Alterar Mercado" className="shrink-0 whitespace-nowrap tabular-nums underline decoration-dashed decoration-ink/25 underline-offset-4 hover:decoration-ink">− {r0(groceries)}</button>
          )}
        </li>
        <li className={row}><span>Moradia <span className="hidden text-xs text-tinta/50 sm:inline">(aluguel + condomínio + IPTU)</span></span><span className="shrink-0 whitespace-nowrap tabular-nums">− {r0(v.rent)}</span></li>
        {v.livingCosts.map((c) => (
          <li key={c.id} className={cn(row, 'group')}>
            <span className="flex min-w-0 items-center gap-1.5">{c.name}
              <button onClick={() => setCosts((l) => l.filter((x) => x.id !== c.id))} className="text-tinta/30 opacity-0 transition hover:text-cereja group-hover:opacity-100 focus:opacity-100" aria-label={`Remover ${c.name}`}><X size={13} /></button>
            </span>
            {edit?.id === c.id ? (
              <input autoFocus inputMode="decimal" value={edit.v} onChange={(e) => setEdit({ id: c.id, v: e.target.value })} onBlur={() => save(c.id)} onKeyDown={(e) => e.key === 'Enter' && save(c.id)}
                aria-label={`Valor de ${c.name}`} className="h-8 w-24 rounded-xl border-2 border-ink bg-quente px-2 text-right text-sm focus:outline-none" />
            ) : (
              <button onClick={() => setEdit({ id: c.id, v: moneyInput(c.amount) })} aria-label={`Alterar ${c.name}`} className="shrink-0 whitespace-nowrap tabular-nums underline decoration-dashed decoration-ink/25 underline-offset-4 hover:decoration-ink">− {r0(c.amount)}</button>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={(e) => { e.preventDefault(); const n = parseMoney(nw.amount); if (nw.name.trim() && n > 0) { setCosts((l) => [...l, { id: `c${Date.now()}`, name: nw.name.trim(), amount: n }]); setNw({ name: '', amount: '' }) } }}
        className="mt-3 grid grid-cols-[minmax(0,1fr)_88px_auto] gap-2">
        <input className="h-9 min-w-0 rounded-2xl border-2 border-ink bg-quente px-3 text-sm focus:outline-none" placeholder="Outro custo (ex.: academia)" aria-label="Novo custo fixo" value={nw.name} onChange={(e) => setNw({ ...nw, name: e.target.value })} />
        <input className="h-9 min-w-0 rounded-2xl border-2 border-ink bg-quente px-3 text-sm focus:outline-none" inputMode="decimal" placeholder="R$" aria-label="Valor do novo custo" value={nw.amount} onChange={(e) => setNw({ ...nw, amount: e.target.value })} />
        <button type="submit" className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-lavanda" aria-label="Adicionar custo fixo"><Plus size={15} /></button>
      </form>
      <div className={cn('mt-4 flex items-center justify-between rounded-2xl border-2 border-ink px-5 py-4', left < 0 ? 'bg-[#F6D6DC]' : 'bg-salvia')}>
        <span className="font-semibold">Sobra no mês</span>
        <span className="font-serif text-3xl font-bold">{r0(left)}</span>
      </div>
      <p className="mt-3 text-xs text-tinta/55">Conta com salário + vale-alimentação. Toque num valor para editar — a moradia vem do campo “moradia total”, que já inclui o IPTU.</p>
    </div>
  )
}
