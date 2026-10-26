import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { useFinanceSummary, useMonthlySeries } from '@/hooks/useData'
import { money } from '@/utils/format'
import { Card } from '@/components/ui/Card'
import { PixelIcon } from '@/components/game/PixelIcon'
import { WidgetHeader } from './WidgetHeader'

const BAR_COLORS = ['#EFAFB3', '#CB757C', '#b8565e', '#961415', '#a8977f', '#a9b98a', '#CB757C']

export function FinanceWidget() {
  const s = useFinanceSummary()
  const series = useMonthlySeries(7)
  const cur = series[series.length - 1]
  const prev = series[series.length - 2]
  const diff = prev && prev.saldo ? ((cur.saldo - prev.saldo) / Math.abs(prev.saldo)) * 100 : 0
  const up = diff >= 0

  return (
    <Card className="flex flex-col p-4 sm:p-5">
      <WidgetHeader sprite="piggy" title="Minhas finanças" to="/financas" />
      <div className="flex items-center gap-3">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-md border-2 border-px-line bg-px-gold-soft shadow-pixel-sm"><PixelIcon name="coins" size={36} /></span>
        <div>
          <p className="text-sm text-vinho/60">Saldo atual</p>
          <p className="text-[28px] font-extrabold leading-tight tracking-tight text-cereja">{money(s.balance)}</p>
        </div>
      </div>
      <p className={`mt-1 inline-flex items-center gap-1 text-[13px] font-semibold ${up ? 'text-oliva-600' : 'text-cereja'}`}>
        {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {Math.abs(Math.round(diff))}% este mês
      </p>
      <div className="-mx-2 mt-auto h-32 shrink-0 pt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 4, right: 6, left: 6, bottom: 0 }}>
            <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#520215' }} tickFormatter={(m: string) => m.charAt(0).toUpperCase() + m.slice(1)} />
            <Tooltip
              formatter={(v: number) => money(v)}
              cursor={{ fill: '#EFAFB3', fillOpacity: 0.25 }}
              contentStyle={{ borderRadius: 8, border: '2px solid #4a1220', boxShadow: '3px 3px 0 #4a1220', fontSize: 12 }}
            />
            <Bar dataKey="saldo" name="Sobrou no mês" radius={0} maxBarSize={18}>
              {series.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
