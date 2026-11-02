import { useState } from 'react'
import { Plus, Utensils } from 'lucide-react'
import { db } from '@/store/db'
import { useIncome, useMonthFinance } from '@/hooks/useData'
import { monthKey, today, toISODate } from '@/utils/date'
import { money, parseMoney } from '@/utils/format'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/cn'

const field = 'h-10 min-w-0 rounded-2xl border-2 border-ink bg-quente px-3 text-sm focus:outline-none focus:ring-4 focus:ring-lavanda/60'
export const VA = 'Vale-alimentação' as const

/** Alimentação: quanto do vale-alimentação já foi usado no mês e quanto ainda tem. */
export function FoodCard({ month }: { month: string }) {
  const inc = useIncome()
  const m = useMonthFinance(month)
  const [f, setF] = useState({ description: '', amount: '' })
  const spent = m.monthTx.filter((t) => t.type === 'despesa' && t.method === VA)
  const used = spent.reduce((a, t) => a + t.amount, 0)
  const left = inc.voucher - used
  const add = () => {
    const amount = parseMoney(f.amount)
    if (!(amount > 0)) return
    const [y, mm] = month.split('-').map(Number)
    const date = month === monthKey(today()) ? today() : toISODate(new Date(y, mm, 0))
    db.transactions.add({ type: 'despesa', description: f.description.trim() || 'Mercado', amount, category: 'Alimentação', date, method: VA, recurring: false })
    setF({ description: '', amount: '' })
  }
  return (
    <div className="flex flex-col rounded-3xl border-2 border-ink bg-quente p-6 shadow-pixel">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-salvia"><Utensils size={20} /></span>
        <div>
          <h2 className="font-serif text-xl font-bold">Alimentação</h2>
          <p className="text-xs text-tinta/60">gastos no vale-alimentação ({money(inc.voucher)} por mês)</p>
        </div>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-tinta/60">Ainda tem no vale</p>
          <p className={cn('font-serif text-3xl font-bold', left < 0 ? 'text-cereja' : 'text-oliva-600')}>{money(left)}</p>
        </div>
        <p className="text-right text-sm text-tinta/70">usado <b className="text-tinta">{money(used)}</b></p>
      </div>
      <Progress value={inc.voucher ? (used / inc.voucher) * 100 : 0} color={left < 0 ? '#702335' : '#376139'} height={10} className="mt-3" />

      <form onSubmit={(e) => { e.preventDefault(); add() }} className="mt-4 grid grid-cols-[minmax(0,1fr)_96px_auto] gap-2">
        <input className={field} placeholder="Mercado, padaria, iFood…" aria-label="O que comprou" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        <input className={field} placeholder="R$" inputMode="decimal" aria-label="Valor no vale" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
        <button type="submit" className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-salvia" aria-label="Adicionar gasto no vale"><Plus size={16} /></button>
      </form>

      <p className="mt-3 text-xs text-tinta/55">{spent.length ? `${spent.length} ${spent.length === 1 ? 'gasto' : 'gastos'} no vale este mês — aparecem em Movimentações com a etiqueta “Vale-alimentação”.` : 'Os gastos no vale aparecem em Movimentações com a etiqueta “Vale-alimentação”.'}</p>
    </div>
  )
}
