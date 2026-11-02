import { useMemo } from 'react'
import { ArrowUpRight, Plus } from 'lucide-react'
import { useFinanceSummary, useTransactions, useVault } from '@/hooks/useData'
import { openForm } from '@/hooks/useQuickAdd'
import { addMonths, daysBetween, fromISODate, monthKey, toISODate, today } from '@/utils/date'
import { money } from '@/utils/format'
import { Button } from '@/components/ui/Button'

/** Cartão escuro com o saldo atual (no estilo da capa do painel). */
export function BalanceCard() {
  const s = useFinanceSummary()
  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-h-[170px] flex-col rounded-3xl border-2 border-ink bg-ink p-6 text-ink-fg shadow-lavanda">
        <div className="flex items-start justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-lavanda">Saldo atual</p>
          <span className="font-serif text-lg font-extrabold">mova<span className="text-lavanda">*</span></span>
        </div>
        <p className="mt-auto pt-6 font-serif text-4xl font-bold leading-none">{money(s.balance)}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="olive" onClick={() => openForm('transaction', { type: 'receita', category: 'Salário' })}><ArrowUpRight size={16} /> Receita</Button>
        <Button onClick={() => openForm('transaction', { type: 'despesa' })}><Plus size={16} /> Despesa</Button>
      </div>
    </div>
  )
}

/** Próxima receita: a próxima entrada já lançada no futuro, ou a próxima de uma receita fixa. */
export function NextIncome() {
  const tx = useTransactions()
  const next = useMemo(() => {
    const t = today()
    const future = tx.filter((x) => x.type === 'receita' && x.date > t).sort((a, b) => a.date.localeCompare(b.date))[0]
    if (future) return { name: future.description, date: future.date }
    const fixed = tx.filter((x) => x.type === 'receita' && x.recurring).sort((a, b) => b.date.localeCompare(a.date))[0]
    if (!fixed) return null
    const day = fromISODate(fixed.date).getDate()
    const now = fromISODate(t)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), Math.min(day, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()))
    const paidThisMonth = tx.some((x) => x.type === 'receita' && x.description === fixed.description && monthKey(x.date) === monthKey(t))
    let when = thisMonth
    if (toISODate(thisMonth) < t || paidThisMonth) {
      const nm = addMonths(now, 1)
      when = new Date(nm.getFullYear(), nm.getMonth(), Math.min(day, new Date(nm.getFullYear(), nm.getMonth() + 1, 0).getDate()))
    }
    return { name: fixed.description, date: toISODate(when) }
  }, [tx])
  const days = next ? daysBetween(today(), next.date) : null
  return (
    <div className="flex min-h-[170px] flex-col rounded-[22px] border-2 border-ink bg-quente p-5 shadow-pixel">
      <p className="text-lg font-bold text-tinta">Próxima receita</p>
      {next ? (
        <>
          <p className="mt-2 truncate rounded-full border-2 border-ink px-3 py-1.5 text-sm text-tinta/70">{next.name} ({fromISODate(next.date).toLocaleDateString('pt-BR')})</p>
          <p className="mt-auto pt-3 text-center text-5xl font-extrabold leading-none text-vinho">{days === 0 ? 'Hoje' : days}</p>
          {days !== 0 && <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-tinta/50">{days === 1 ? 'dia' : 'dias'}</p>}
        </>
      ) : (
        <p className="mt-auto text-sm text-tinta/60">Marque uma receita como fixa (ex.: salário) para ver a contagem aqui.</p>
      )}
    </div>
  )
}

/** "Resumo rápido": blocos coloridos com os números do mês. */
export function QuickGlance() {
  const s = useFinanceSummary()
  const vault = useVault()
  const fixed = s.monthTx.filter((x) => x.type === 'despesa' && x.recurring).reduce((a, x) => a + x.amount, 0)
  const tiles = [
    { label: 'Receitas', value: s.income, emoji: '💰', bg: 'bg-pastel-pink' },
    { label: 'Contas fixas', value: fixed, emoji: '🧾', bg: 'bg-pastel-lilac' },
    { label: 'Gastos', value: s.expenses - fixed, emoji: '🛍️', bg: 'bg-pastel-peach' },
    { label: 'No cofre', value: vault.saved, emoji: '🐷', bg: 'bg-pastel-mint' },
    { label: 'Livre no mês', value: Math.max(0, s.budgetLeft), emoji: '✨', bg: 'bg-pastel-yellow' },
  ]
  return (
    <div>
      <p className="mb-3 text-lg font-bold text-tinta">Resumo rápido</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className={`flex flex-col items-center gap-1.5 rounded-[20px] px-2 py-4 text-center ${t.bg}`}>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-quente/70 text-xl" aria-hidden>{t.emoji}</span>
            <span className="text-[15px] font-bold text-tinta">{money(t.value)}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-tinta/60">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
