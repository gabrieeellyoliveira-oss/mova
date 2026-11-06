import { useMemo } from 'react'
import { History } from 'lucide-react'
import { useTransactions, useVaultEntries, vaultNet } from '@/hooks/useData'
import { monthKey } from '@/utils/date'
import { money } from '@/utils/format'
import { cn } from '@/lib/cn'
import { monthName } from './MonthPlan'

/** Histórico financeiro: um resumo por mês (o que entrou, o que saiu, contas, cofre e o que sobrou). Tocar abre o mês. */
export function FinanceHistory({ current, onPick }: { current: string; onPick: (m: string) => void }) {
  const tx = useTransactions()
  const vault = useVaultEntries()
  const rows = useMemo(() => {
    const months = [...new Set([...tx.map((t) => monthKey(t.date)), ...vault.map((e) => monthKey(e.date))])].sort().reverse()
    return months.map((m) => {
      const list = tx.filter((t) => monthKey(t.date) === m)
      const income = list.filter((t) => t.type === 'receita').reduce((a, t) => a + t.amount, 0)
      const marked = list.filter((t) => t.type === 'receita' && t.income === 'salario')
      const salary = (marked.length ? marked : list.filter((t) => t.type === 'receita' && t.category === 'Salário' && !t.income)).reduce((a, t) => a + t.amount, 0)
      const thirteenth = list.filter((t) => t.type === 'receita' && (t.income === '13' || t.category === '13º salário')).reduce((a, t) => a + t.amount, 0)
      const out = list.filter((t) => t.type === 'despesa').reduce((a, t) => a + t.amount, 0)
      const bills = list.filter((t) => t.type === 'despesa' && t.billId).reduce((a, t) => a + t.amount, 0)
      const saved = vault.filter((e) => monthKey(e.date) === m).reduce((a, e) => a + vaultNet(e), 0)
      return { m, income, salary, thirteenth, out, bills, saved, left: income - out }
    })
  }, [tx, vault])

  return (
    <div className="rounded-3xl border-2 border-ink bg-quente p-6 shadow-pixel">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-lavanda"><History size={20} /></span>
        <div>
          <h2 className="font-serif text-xl font-bold">Histórico financeiro</h2>
          <p className="text-xs text-tinta/60">mês a mês, com o que realmente entrou e saiu · toque num mês para abrir</p>
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="py-4 text-sm text-tinta/55">Ainda não há movimentações.</p>
      ) : (
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr className="text-left text-[11px] uppercase tracking-wide text-tinta/55">
              <th className="px-2 py-2 font-semibold">Mês</th><th className="px-2 font-semibold">Salário</th><th className="px-2 font-semibold">13º e extras</th><th className="px-2 font-semibold">Entrou</th>
              <th className="px-2 font-semibold">Contas pagas</th><th className="px-2 font-semibold">Saiu</th><th className="px-2 font-semibold">No cofre</th><th className="px-2 font-semibold">Sobrou</th>
            </tr></thead>
            <tbody className="divide-y divide-ink/10">
              {rows.map((r) => (
                <tr key={r.m} onClick={() => onPick(r.m)} className={cn('cursor-pointer hover:bg-lavanda-100/60', r.m === current && 'bg-lavanda-100')}>
                  <td className="px-2 py-2.5 font-semibold first-letter:uppercase">{monthName(r.m)}</td>
                  <td className="px-2 tabular-nums">{r.salary ? money(r.salary) : '—'}</td>
                  <td className="px-2 tabular-nums">{r.income - r.salary ? money(r.income - r.salary) : '—'}{r.thirteenth ? <span className="ml-1 text-[10px] font-bold text-oliva-600">13º</span> : null}</td>
                  <td className="px-2 tabular-nums text-oliva-600">{money(r.income)}</td>
                  <td className="px-2 tabular-nums">{r.bills ? money(r.bills) : '—'}</td>
                  <td className="px-2 tabular-nums text-cereja">{money(r.out)}</td>
                  <td className="px-2 tabular-nums">{r.saved ? money(r.saved) : '—'}</td>
                  <td className={cn('px-2 font-bold tabular-nums', r.left < 0 ? 'text-cereja' : 'text-oliva-600')}>{money(r.left)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
