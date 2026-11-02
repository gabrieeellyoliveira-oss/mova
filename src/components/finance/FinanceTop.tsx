import { ArrowUpRight, Plus } from 'lucide-react'
import { useFinanceSummary, useMonthFinance, useVault } from '@/hooks/useData'
import { openForm } from '@/hooks/useQuickAdd'
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

/** "Resumo rápido" do mês escolhido: tudo vem das Movimentações daquele mês. */
export function QuickGlance({ month }: { month: string }) {
  const m = useMonthFinance(month)
  const vault = useVault()
  const tiles = [
    { label: 'Entradas', value: m.income, emoji: '💰', bg: 'bg-pastel-pink' },
    { label: 'Contas pagas', value: m.billsPaid, emoji: '🧾', bg: 'bg-pastel-lilac' },
    { label: 'Outros gastos', value: m.expenses - m.billsPaid, emoji: '🛍️', bg: 'bg-pastel-peach' },
    { label: 'No cofre', value: vault.saved, emoji: '🐷', bg: 'bg-pastel-mint' },
    { label: 'Saldo do mês', value: m.income - m.expenses, emoji: '✨', bg: 'bg-pastel-yellow' },
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
