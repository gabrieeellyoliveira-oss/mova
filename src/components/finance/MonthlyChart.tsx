import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useMonthlySeries } from '@/hooks/useData'
import { money } from '@/utils/format'

export const tooltipStyle = { borderRadius: 14, border: 'none', boxShadow: '0 8px 24px -10px rgba(12,10,14,.18)', fontSize: 12 }

export function MonthlyChart() {
  const data = useMonthlySeries(6)
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#0C0A0E" strokeOpacity={0.07} />
          <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#0C0A0E', opacity: 0.6 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#0C0A0E', opacity: 0.45 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
          <Tooltip formatter={(v: number) => money(v)} cursor={{ fill: '#C3AEEC', fillOpacity: 0.2 }} contentStyle={tooltipStyle} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#0C0A0E' }} />
          <Bar dataKey="receitas" name="Entradas" fill="#376139" radius={[8, 8, 3, 3]} maxBarSize={26} />
          <Bar dataKey="despesas" name="Gastos" fill="#0C0A0E" radius={[8, 8, 3, 3]} maxBarSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
