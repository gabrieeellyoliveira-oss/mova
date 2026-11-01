import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useVault } from '@/hooks/useData'
import { money } from '@/utils/format'
import { tooltipStyle } from '@/components/finance/MonthlyChart'

export function VaultChart() {
  const v = useVault()
  // escala "redonda" que sempre inclui a meta
  const top = Math.max(v.target, ...v.months.map((m) => m.saldo)) * 1.08
  const step = top > 20000 ? 10000 : top > 8000 ? 5000 : 2000
  const max = Math.ceil(top / step) * step
  const ticks = Array.from({ length: max / step + 1 }, (_, i) => i * step)
  return (
    <div className="h-64 min-h-64 flex-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={v.months} margin={{ top: 16, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="vault-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6E2E58" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#6E2E58" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#5B2448" strokeOpacity={0.07} />
          <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#5B2448', opacity: 0.6 }} />
          <YAxis domain={[0, max]} ticks={ticks} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#5B2448', opacity: 0.45 }} tickFormatter={(n: number) => `${Math.round(n / 1000)}k`} />
          <Tooltip formatter={(n: number, name: string) => [money(n), name]} contentStyle={tooltipStyle} />
          <ReferenceLine y={v.target} stroke="#5E9474" strokeDasharray="5 5" label={{ value: `meta ${money(v.target).replace(',00', '')}`, position: 'insideTopRight', fill: '#3F6E52', fontSize: 11 }} />
          <Area type="monotone" dataKey="saldo" name="No cofre" stroke="#6E2E58" strokeWidth={2.5} fill="url(#vault-fill)" dot={{ r: 3, fill: '#6E2E58' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
