import { useState } from 'react'
import { ArrowUpRight, Check, Pencil, Plus } from 'lucide-react'
import { settingsStore } from '@/store/db'
import { useFinanceSummary, useTransactions } from '@/hooks/useData'
import { money } from '@/utils/format'
import { openForm } from '@/hooks/useQuickAdd'
import { StatCard } from '@/components/ui/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { MonthlyChart } from '@/components/finance/MonthlyChart'
import { CategoryDonut } from '@/components/finance/CategoryDonut'
import { TransactionList } from '@/components/finance/TransactionList'
import { FinancialGoals } from '@/components/finance/FinancialGoals'
import { PixelIcon } from '@/components/game/PixelIcon'

function BudgetCard() {
  const s = useFinanceSummary()
  const [edit, setEdit] = useState(false)
  const [v, setV] = useState(String(s.budget))
  return (
    <div className="rounded-px border-2 border-px-line bg-oliva-100 p-5 text-oliva-600 shadow-pixel-sm">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 font-pixel text-xs font-semibold uppercase tracking-wide opacity-80"><PixelIcon name="piggy" size={18} /> Orçamento disponível</p>
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          tone="vinho" label="Saldo atual" value={money(s.balance)} hint="tudo que entrou menos tudo que saiu" icon={<PixelIcon name="coins" size={22} />}
          action={<>
            <Button size="sm" variant="light" onClick={() => openForm('transaction', { type: 'receita', category: 'Salário' })}><ArrowUpRight size={14} /> Receita</Button>
            <Button size="sm" variant="light" onClick={() => openForm('transaction', { type: 'despesa' })}><Plus size={14} /> Despesa</Button>
          </>}
        />
        <StatCard label="Entradas do mês" value={money(s.income)} icon={<PixelIcon name="star" size={22} />} />
        <StatCard tone="rosa" label="Gastos do mês" value={money(s.expenses)} hint={`${s.monthTx.filter((t) => t.type === 'despesa').length} movimentações`} icon={<PixelIcon name="cup" size={22} />} />
        <BudgetCard />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader icon={<PixelIcon name="piggy" size={20} />} title="Evolução mensal" subtitle="entradas e gastos dos últimos 6 meses" />
          <MonthlyChart />
        </Card>
        <Card>
          <CardHeader icon={<PixelIcon name="coins" size={20} />} title="Para onde foi o dinheiro" subtitle="gastos do mês por categoria" />
          <CategoryDonut transactions={s.monthTx} />
        </Card>
      </div>
      <FinancialGoals />
      <Card>
        <CardHeader icon={<PixelIcon name="note" size={20} />} title="Movimentações" subtitle="toque em uma para editar" action={<Button size="sm" variant="soft" onClick={() => openForm('transaction')}><Plus size={14} /> Nova</Button>} />
        <TransactionList transactions={tx} />
      </Card>
    </div>
  )
}
