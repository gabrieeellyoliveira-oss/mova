import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { Transaction } from '@/types'
import { FINANCE_COLORS } from '@/data/constants'
import { money, pct } from '@/utils/format'
import { tooltipStyle } from './MonthlyChart'

export function CategoryDonut({ transactions }: { transactions: Transaction[] }) {
  const expenses = transactions.filter((t) => t.type === 'despesa')
  const total = expenses.reduce((a, t) => a + t.amount, 0)
  const byCat = Object.entries(
    expenses.reduce<Record<string, number>>((acc, t) => ((acc[t.category] = (acc[t.category] ?? 0) + t.amount), acc), {}),
  )
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value)

  if (!byCat.length) return <p className="py-10 text-center text-sm text-vinho/60">Nenhum gasto neste mês ainda.</p>

  return (
    <div className="grid items-center gap-4 sm:grid-cols-[160px_1fr]">
      <div className="relative mx-auto h-40 w-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={byCat} dataKey="value" innerRadius={52} outerRadius={76} paddingAngle={2} stroke="none">
              {byCat.map((c) => <Cell key={c.name} fill={FINANCE_COLORS[c.name as keyof typeof FINANCE_COLORS]} />)}
            </Pie>
            <Tooltip formatter={(v: number) => money(v)} contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div><p className="text-[10px] font-semibold uppercase text-vinho/50">no mês</p><p className="text-sm font-extrabold text-vinho">{money(total).replace(',00', '')}</p></div>
        </div>
      </div>
      <ul className="space-y-1.5">
        {byCat.map((c) => (
          <li key={c.name} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: FINANCE_COLORS[c.name as keyof typeof FINANCE_COLORS] }} />
            <span className="flex-1 truncate text-tinta">{c.name}</span>
            <span className="text-xs text-vinho/50">{pct((c.value / total) * 100)}</span>
            <span className="w-24 text-right font-semibold tabular-nums text-vinho">{money(c.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
