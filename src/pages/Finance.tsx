import { useState } from 'react'
import { Check, Pencil, Plus } from 'lucide-react'
import { settingsStore } from '@/store/db'
import { useFinanceSummary, useTransactions } from '@/hooks/useData'
import { money } from '@/utils/format'
import { openForm } from '@/hooks/useQuickAdd'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { MonthlyChart } from '@/components/finance/MonthlyChart'
import { CategoryDonut } from '@/components/finance/CategoryDonut'
import { TransactionList } from '@/components/finance/TransactionList'
import { FinancialGoals } from '@/components/finance/FinancialGoals'
import { Icon } from '@/components/ui/Icon'
import { BalanceCard, NextIncome, QuickGlance } from '@/components/finance/FinanceTop'

function BudgetCard() {
  const s = useFinanceSummary()
  const [edit, setEdit] = useState(false)
  const [v, setV] = useState(String(s.budget))
  return (
    <div className="flex min-h-[170px] flex-col rounded-[22px] bg-oliva-100 p-5 text-oliva-600">
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold">Orçamento disponível</p>
        <button onClick={() => { if (edit) settingsStore.set((p) => ({ ...p, monthlyBudget: Number(v) || p.monthlyBudget })); setEdit(!edit) }} className="opacity-70 hover:opacity-100" aria-label="Editar orçamento">
          {edit ? <Check size={16} /> : <Pencil size={14} />}
        </button>
      </div>
      {edit ? (
        <input autoFocus type="number" value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget.blur(), settingsStore.set((p) => ({ ...p, monthlyBudget: Number(v) || p.monthlyBudget })), setEdit(false))}
          className="mt-2 h-10 w-full rounded-xl border border-oliva/30 bg-quente px-3 text-lg font-bold focus:outline-none" />
      ) : (
        <p className="mt-2 text-2xl font-extrabold tracking-tight sm:text-[28px]">{money(Math.max(0, s.budgetLeft))}</p>
      )}
      <Progress value={s.budgetUsed} color={s.budgetUsed > 90 ? '#C0466A' : '#5E9474'} track="rgba(63,110,82,0.15)" className="mt-auto" height={8} />
      <p className="mt-1.5 text-xs opacity-70">{Math.round(s.budgetUsed)}% de {money(s.budget)}</p>
    </div>
  )
}

export default function Finance() {
  const s = useFinanceSummary()
  const tx = useTransactions()
  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <BalanceCard />
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
            <NextIncome />
            <BudgetCard />
          </div>
          <QuickGlance />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader icon={<Icon name="piggy" size={20} />} title="Evolução mensal" subtitle="entradas e gastos dos últimos 6 meses" />
          <MonthlyChart />
        </Card>
        <Card>
          <CardHeader icon={<Icon name="coins" size={20} />} title="Para onde foi o dinheiro" subtitle="gastos do mês por categoria" />
          <CategoryDonut transactions={s.monthTx} />
        </Card>
      </div>
      <FinancialGoals />
      <Card>
        <CardHeader icon={<Icon name="note" size={20} />} title="Movimentações" subtitle="toque em uma para editar" action={<Button size="sm" variant="soft" onClick={() => openForm('transaction')}><Plus size={14} /> Nova</Button>} />
        <TransactionList transactions={tx} />
      </Card>
    </div>
  )
}
