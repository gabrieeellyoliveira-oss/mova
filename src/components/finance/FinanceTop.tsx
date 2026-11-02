import { ArrowUpRight, Plus } from 'lucide-react'
import { useFinanceSummary, useIncome, useVault } from '@/hooks/useData'
import { openForm } from '@/hooks/useQuickAdd'
import { addMonths, daysBetween, fromISODate, toISODate, today } from '@/utils/date'
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

/** Data do próximo pagamento no dia `day` (hoje conta). */
export function nextPayday(day: number, from = today()): string {
  const now = fromISODate(from)
  const at = (y: number, m: number) => new Date(y, m, Math.min(day, new Date(y, m + 1, 0).getDate()))
  let d = at(now.getFullYear(), now.getMonth())
  if (toISODate(d) < from) { const nm = addMonths(now, 1); d = at(nm.getFullYear(), nm.getMonth()) }
  return toISODate(d)
}

/** Próxima receita: o salário fixo de "Minha renda", no dia do pagamento. */
export function NextIncome() {
  const inc = useIncome()
  const date = nextPayday(inc.payday)
  const days = daysBetween(today(), date)
  return (
    <div className="flex min-h-[170px] flex-col rounded-[22px] border-2 border-ink bg-quente p-5 shadow-pixel">
      <p className="font-serif text-xl font-bold text-tinta">Próxima receita</p>
      <p className="mt-2 truncate rounded-full border-2 border-ink px-3 py-1.5 text-sm text-tinta/70">Salário · {money(inc.salary)} ({fromISODate(date).toLocaleDateString('pt-BR')})</p>
      <p className="mt-auto pt-3 text-center font-serif text-5xl font-bold leading-none text-vinho">{days === 0 ? 'Hoje' : days}</p>
      {days !== 0 && <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-tinta/50">{days === 1 ? 'dia' : 'dias'}</p>}
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
      <p className="mb-3 font-serif text-xl font-bold text-tinta">Resumo rápido</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className={`flex flex-col items-center gap-1.5 rounded-[20px] border-2 border-ink px-2 py-4 text-center ${t.bg}`}>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-quente/70 text-xl" aria-hidden>{t.emoji}</span>
            <span className="text-[15px] font-bold text-tinta">{money(t.value)}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-tinta/60">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
