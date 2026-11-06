import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useVaultEntries } from '@/hooks/useData'
import { monthKey } from '@/utils/date'
import { money } from '@/utils/format'
import { tooltipStyle } from '@/components/finance/MonthlyChart'

/** Movimento do cofre mês a mês: quanto foi guardado e quanto foi retirado em cada mês (não o acumulado). */
export function VaultChart() {
  const entries = useVaultEntries()
  const data = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const list = entries.filter((e) => monthKey(e.date) === key)
      return {
        mes: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        guardado: list.filter((e) => e.type === 'deposito').reduce((a, e) => a + e.amount, 0),
        retirado: list.filter((e) => e.type !== 'deposito').reduce((a, e) => a + e.amount, 0),
      }
    })
  }, [entries])
  const fmt = (v: number) => (v < 1000 ? String(v) : `${(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`)
  return (
    <div className="h-64 min-h-64 flex-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={3} margin={{ top: 16, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#0C0A0E" strokeOpacity={0.07} />
          <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#0C0A0E', opacity: 0.6 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#0C0A0E', opacity: 0.45 }} tickFormatter={fmt} />
          <Tooltip formatter={(n: number, name: string) => [money(n), name]} cursor={{ fill: '#C3AEEC', fillOpacity: 0.2 }} contentStyle={tooltipStyle} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#0C0A0E' }} />
          <Bar dataKey="guardado" name="Guardado" fill="#376139" radius={[8, 8, 3, 3]} maxBarSize={22} />
          <Bar dataKey="retirado" name="Retirado" fill="#702335" radius={[8, 8, 3, 3]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
