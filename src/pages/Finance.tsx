import { useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Pencil, Plus } from 'lucide-react'
import { settingsStore } from '@/store/db'
import { useMonthFinance, useSettings, useTransactions } from '@/hooks/useData'
import { monthKey, today } from '@/utils/date'
import { money, parseMoney } from '@/utils/format'
import { openForm } from '@/hooks/useQuickAdd'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { MonthlyChart } from '@/components/finance/MonthlyChart'
import { TransactionList } from '@/components/finance/TransactionList'
import { Icon } from '@/components/ui/Icon'
import { BalanceCard, QuickGlance } from '@/components/finance/FinanceTop'
import { IncomeCard } from '@/components/finance/IncomeCard'
import { FoodCard } from '@/components/finance/FoodCard'
import { BillsCard, ProjectionCard, monthName } from '@/components/finance/MonthPlan'

function BudgetCard({ month }: { month: string }) {
  const settings = useSettings()
  const m = useMonthFinance(month)
  const s = { budget: settings.monthlyBudget, budgetLeft: settings.monthlyBudget - m.expenses, budgetUsed: settings.monthlyBudget ? Math.min(100, (m.expenses / settings.monthlyBudget) * 100) : 0 }
  const [edit, setEdit] = useState(false)
  const [v, setV] = useState(String(settings.monthlyBudget))
  return (
    <div className="flex min-h-[170px] flex-col rounded-[22px] bg-oliva-100 p-5 text-oliva-600">
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold">Orçamento disponível</p>
        <button onClick={() => { if (edit) settingsStore.set((p) => ({ ...p, monthlyBudget: parseMoney(v) || p.monthlyBudget })); setEdit(!edit) }} className="opacity-70 hover:opacity-100" aria-label="Editar orçamento">
          {edit ? <Check size={16} /> : <Pencil size={14} />}
        </button>
      </div>
      {edit ? (
        <input autoFocus inputMode="decimal" value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget.blur(), settingsStore.set((p) => ({ ...p, monthlyBudget: parseMoney(v) || p.monthlyBudget })), setEdit(false))}
          className="mt-2 h-10 w-full rounded-xl border border-oliva/30 bg-quente px-3 text-lg font-bold focus:outline-none" />
      ) : (
        <p className="mt-2 text-2xl font-extrabold tracking-tight sm:text-[28px]">{money(Math.max(0, s.budgetLeft))}</p>
      )}
      <Progress value={s.budgetUsed} color={s.budgetUsed > 90 ? '#C0466A' : '#376139'} track="rgba(63,110,82,0.15)" className="mt-auto" height={8} />
      <p className="mt-1.5 text-xs opacity-70">{Math.round(s.budgetUsed)}% de {money(s.budget)}</p>
    </div>
  )
}

export default function Finance() {
  const tx = useTransactions()
  const now = monthKey(today())
  const [month, setMonth] = useState(now)
  const m = useMonthFinance(month)
  const shift = (n: number) => { const [y, mm] = month.split('-').map(Number); const d = new Date(y, mm - 1 + n, 1); setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`) }
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-full border-2 border-ink bg-quente p-1">
          <Button size="icon-sm" variant="ghost" onClick={() => shift(-1)} aria-label="Mês anterior"><ChevronLeft size={16} /></Button>
          <span className="min-w-[160px] px-2 text-center font-serif text-lg font-bold capitalize">{monthName(month)}</span>
          <Button size="icon-sm" variant="ghost" onClick={() => shift(1)} aria-label="Próximo mês"><ChevronRight size={16} /></Button>
        </div>
        {month !== now ? <Button size="sm" variant="light" onClick={() => setMonth(now)}>Voltar para o mês atual</Button> : <span className="text-sm text-tinta/60">mês atual</span>}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <BalanceCard />
        <IncomeCard />
        <BudgetCard month={month} />
      </div>
      <QuickGlance month={month} />
      <div className="grid gap-6 lg:grid-cols-2">
        <BillsCard month={month} />
        <ProjectionCard month={month} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader icon={<Icon name="note" size={20} />} title="Movimentações" subtitle={`${m.monthTx.length} em ${monthName(month)} · toque para editar`} action={<Button size="sm" variant="soft" onClick={() => openForm('transaction')}><Plus size={14} /> Nova</Button>} />
          <TransactionList transactions={tx} month={month} />
        </Card>
        <FoodCard month={month} />
      </div>
      <Card className="flex flex-col">
        <CardHeader icon={<Icon name="piggy" size={20} />} title="Evolução mensal" subtitle={`entradas e gastos até ${monthName(month)} · contas pagas em lavanda`} />
        <MonthlyChart month={month} />
      </Card>
    </div>
  )
}
