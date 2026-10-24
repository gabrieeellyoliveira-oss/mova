import { Area, Bar, BarChart, CartesianGrid, ComposedChart, LabelList, Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatWork, type useWork } from '@/hooks/useWork'
import { tooltipStyle } from '@/components/finance/MonthlyChart'

type Work = ReturnType<typeof useWork>
const axis = { tickLine: false, axisLine: false, tick: { fontSize: 11, fill: '#520215', opacity: 0.55 } }
const compact = (n: number) => (n >= 1000 ? `${Math.round(n / 100) / 10}k`.replace('.', ',') : String(Math.round(n)))

/** Acumulado do mês x ritmo ideal para bater a meta */
export function DailyChart({ w }: { w: Work }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={w.daily} margin={{ top: 16, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="work-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#961415" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#961415" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#520215" strokeOpacity={0.07} />
          <XAxis dataKey="dia" {...axis} interval="preserveStartEnd" minTickGap={14} />
          <YAxis {...axis} tickFormatter={compact} />
          <Tooltip labelFormatter={(d) => `Dia ${d}`} formatter={(n: number, name: string) => [formatWork(n, w.settings), name]} contentStyle={tooltipStyle} />
          {w.target > 0 && <ReferenceLine y={w.target} ifOverflow="extendDomain" stroke="#7A7A4A" strokeDasharray="5 5" label={{ value: 'meta', position: 'insideTopRight', fill: '#5f5f37', fontSize: 11 }} />}
          <Line type="linear" dataKey="ideal" name="Ritmo para a meta" stroke="#CB757C" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          <Area type="monotone" dataKey="feito" name="Feito" stroke="#961415" strokeWidth={2.5} fill="url(#work-fill)" connectNulls={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Meta x resultado nos últimos meses */
export function HistoryChart({ w }: { w: Work }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={w.history} barGap={4} margin={{ top: 20, right: 4, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#520215" strokeOpacity={0.07} />
          <XAxis dataKey="mes" {...axis} tick={{ fontSize: 12, fill: '#520215', opacity: 0.6 }} />
          <YAxis {...axis} tickFormatter={compact} />
          <Tooltip formatter={(n: number, name: string) => [formatWork(n, w.settings), name]} cursor={{ fill: '#EFAFB3', fillOpacity: 0.2 }} contentStyle={tooltipStyle} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#520215' }} />
          <Bar dataKey="meta" name="Meta" fill="#DFD1D1" radius={[8, 8, 3, 3]} maxBarSize={24} />
          <Bar dataKey="feito" name="Feito" fill="#961415" radius={[8, 8, 3, 3]} maxBarSize={24}>
            <LabelList dataKey="pct" position="top" formatter={(v: number) => `${v}%`} style={{ fontSize: 10, fill: '#520215', fontWeight: 700 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
