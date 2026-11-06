import { Check } from 'lucide-react'
import { useIncome, useMonthFinance, useTransactions } from '@/hooks/useData'
import { monthKey, today } from '@/utils/date'
import { money } from '@/utils/format'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/cn'
import { refOf, shiftMonth, useItems, usePaidFor } from './MonthPlan'

const VA = 'Vale-alimentação'
const name = (m: string) => new Date(Number(m.slice(0, 4)), Number(m.slice(5, 7)) - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })

/**
 * O salário do mês, passo a passo: salário − contas do mês passado (pagas com ele) = sobrou;
 * sobrou − gastos do mês = disponível agora. O vale-alimentação fica à parte.
 */
export function SalaryFlow() {
  const month = monthKey(today())
  const prev = shiftMonth(month, -1)
  const inc = useIncome()
  const m = useMonthFinance(month)
  const tx = useTransactions()
  const items = useItems()
  const paidPrev = usePaidFor(prev)

  const salary = m.salaryReceived || inc.salary
  const estimated = !m.salaryReceived
  const extras = m.monthTx.filter((t) => t.type === 'receita' && !(t.income === 'salario' || (!m.monthTx.some((x) => x.income === 'salario') && t.category === 'Salário' && !t.income)) && !/vale|alimenta/i.test(t.description)).reduce((a, t) => a + t.amount, 0)
  const prevPaidTx = tx.filter((t) => t.billId && t.type === 'despesa' && refOf(t) === prev)
  const prevPaid = prevPaidTx.reduce((a, t) => a + t.amount, 0)
  const prevPending = items.filter((i) => !paidPrev.has(i.id)).reduce((a, i) => a + i.amount, 0)
  const bills = prevPaid + prevPending
  const leftAfterBills = salary + extras - bills
  const prevIds = new Set(prevPaidTx.map((t) => t.id))
  const spent = m.monthTx.filter((t) => t.type === 'despesa' && !prevIds.has(t.id) && t.method !== VA).reduce((a, t) => a + t.amount, 0)
  const available = leftAfterBills - spent
  const used = leftAfterBills > 0 ? Math.min(100, (spent / leftAfterBills) * 100) : 100
  const vaUsed = m.monthTx.filter((t) => t.type === 'despesa' && t.method === VA).reduce((a, t) => a + t.amount, 0)

  const row = (label: React.ReactNode, value: number, sign: '+' | '−' | '', strong = false) => (
    <li className={cn('flex items-baseline justify-between gap-3', strong ? 'border-t border-ink/15 pt-2 font-semibold text-tinta' : 'text-tinta/75')}>
      <span>{sign && `${sign} `}{label}</span><span className="tabular-nums">{money(value)}</span>
    </li>
  )

  return (
    <div className="mt-4 rounded-2xl border-2 border-ink bg-quente p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-tinta/60">Seu salário de {name(month)}</p>
      <ul className="mt-2 space-y-1.5 text-sm">
        {row(<>Salário {estimated ? <span className="text-tinta/50">(estimado — lance o valor em Finanças)</span> : 'recebido'}</>, salary, '')}
        {extras > 0 && row('Extras e 13º', extras, '+')}
        {row(<>Contas de {name(prev)} {prevPending === 0 && bills > 0 ? <span className="inline-flex items-center gap-0.5 text-oliva-600"><Check size={12} strokeWidth={3} /> pagas</span> : prevPaid > 0 ? <span className="text-tinta/50">(falta {money(prevPending)})</span> : <span className="text-tinta/50">(a pagar)</span>}</>, bills, '−')}
        {row('Sobrou do salário', leftAfterBills, '', true)}
        {row(`Gastos de ${name(month)} até agora`, spent, '−')}
      </ul>
      <div className="mt-3 flex items-end justify-between gap-3 rounded-2xl bg-lavanda-100 px-3 py-2.5">
        <span className="text-sm font-semibold">Disponível agora</span>
        <span className={cn('font-serif text-3xl font-bold', available < 0 ? 'text-cereja' : 'text-tinta')}>{money(available)}</span>
      </div>
      <Progress value={used} height={6} className="mt-2" color={used > 90 ? '#702335' : '#0C0A0E'} />
      <p className="mt-1 text-[11px] text-tinta/55">{Math.round(used)}% do que sobrou já foi gasto · vale-alimentação: {money(inc.voucher - vaUsed)} ainda no vale</p>
    </div>
  )
}
