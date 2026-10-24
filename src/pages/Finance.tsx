import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Check, Pencil, PiggyBank, Plus, Wallet } from 'lucide-react'
import { settingsStore } from '@/store/db'
import { useFinanceSummary, useTransactions } from '@/hooks/useData'
import { money } from '@/utils/format'
import { openForm } from '@/hooks/useQuickAdd'
import { PageHeader, StatCard } from '@/components/ui/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { MonthlyChart } from '@/components/finance/MonthlyChart'
import { CategoryDonut } from '@/components/finance/CategoryDonut'
import { TransactionList } from '@/components/finance/TransactionList'
import { FinancialGoals } from '@/components/finance/FinancialGoals'
import { Coin } from '@/components/doodles/Doodles'

function BudgetCard() {
  const s = useFinanceSummary()
  const [edit, setEdit] = useState(false)
  const [v, setV] = useState(String(s.budget))
  return (
    <div className="rounded-3xl border border-oliva/20 bg-oliva-100 p-5 text-oliva-600 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Orçamento disponível</p>
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
      <Progress value={s.budgetUsed} color={s.budgetUsed > 90 ? '#961415' : '#7A7A4A'} className="mt-2" height={6} />
      <p className="mt-1.5 text-xs opacity-70">{Math.round(s.budgetUsed)}% de {money(s.budget)}</p>
    </div>
  )
}

export default function Finance() {
  const s = useFinanceSummary()
  const tx = useTransactions()
  return (
    <div className="space-y-8">
      <PageHeader
        kicker="seu mês"
        title="Finanças"
        subtitle="Saber pra onde o dinheiro vai é o primeiro passo pra ele ir aonde você quer."
        doodle={<Coin size={48} className="rotate-12" />}
        actions={
          <>
            <Button variant="olive" onClick={() => openForm('transaction', { type: 'receita', category: 'Salário' })}><ArrowUpRight size={16} /> Receita</Button>
            <Button onClick={() => openForm('transaction', { type: 'despesa' })}><Plus size={16} /> Despesa</Button>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard tone="vinho" label="Saldo atual" value={money(s.balance)} hint="tudo que entrou menos tudo que saiu" icon={<Wallet size={18} />} />
        <StatCard label="Entradas do mês" value={money(s.income)} icon={<ArrowUpRight size={18} className="text-oliva" />} />
        <StatCard tone="rosa" label="Gastos do mês" value={money(s.expenses)} hint={`${s.monthTx.filter((t) => t.type === 'despesa').length} movimentações`} icon={<ArrowDownRight size={18} />} />
        <BudgetCard />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader icon={<PiggyBank size={18} />} title="Evolução mensal" subtitle="entradas e gastos dos últimos 6 meses" />
          <MonthlyChart />
        </Card>
        <Card>
          <CardHeader icon={<Coin size={20} />} title="Para onde foi o dinheiro" subtitle="gastos do mês por categoria" />
          <CategoryDonut transactions={s.monthTx} />
        </Card>
      </div>
      <FinancialGoals />
      <Card>
        <CardHeader title="Movimentações" subtitle="toque em uma para editar" action={<Button size="sm" variant="soft" onClick={() => openForm('transaction')}><Plus size={14} /> Nova</Button>} />
        <TransactionList transactions={tx} />
      </Card>
    </div>
  )
}
