import { fmt } from '@/utils/body'
import { formatShort } from '@/utils/date'

/** Linha do peso ao longo do tempo (SVG simples), com a meta tracejada. */
export function WeightChart({ points, goal }: { points: { date: string; value: number }[]; goal?: number }) {
  if (points.length < 2)
    return (
      <p className="mt-3 rounded-2xl border-2 border-dashed border-ink/25 p-6 text-center text-sm text-tinta/60">
        {points.length ? `Primeiro peso: ${fmt(points[0].value)} kg em ${formatShort(points[0].date)}. Pese de novo daqui a uma semana para ver a linha.` : 'Registre seu peso uma vez por semana, sempre no mesmo dia e horário.'}
      </p>
    )
  const W = 600, H = 220, L = 44, R = 12, T = 14, B = 28
  const t0 = Date.parse(points[0].date), t1 = Date.parse(points[points.length - 1].date)
  const vals = points.map((p) => p.value).concat(goal ? [goal] : [])
  const min = Math.floor(Math.min(...vals) - 1), max = Math.ceil(Math.max(...vals) + 1)
  const x = (d: string) => L + ((Date.parse(d) - t0) / Math.max(1, t1 - t0)) * (W - L - R)
  const y = (v: number) => T + (1 - (v - min) / Math.max(1, max - min)) * (H - T - B)
  const ticks = Array.from({ length: 4 }, (_, i) => Math.round((min + ((max - min) * i) / 3) * 10) / 10)
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.date).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ')
  const last = points[points.length - 1]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full" role="img" aria-label={`Peso de ${fmt(points[0].value)} kg para ${fmt(last.value)} kg`}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#0C0A0E" strokeOpacity={0.08} />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#0C0A0E" fillOpacity={0.55}>{fmt(t)}</text>
        </g>
      ))}
      {goal && (
        <g>
          <line x1={L} x2={W - R} y1={y(goal)} y2={y(goal)} stroke="#376139" strokeWidth={2} strokeDasharray="6 5" />
          <text x={W - R} y={y(goal) - 6} textAnchor="end" fontSize="11" fontWeight="600" fill="#376139">meta {fmt(goal)} kg</text>
        </g>
      )}
      <path d={path} fill="none" stroke="#0C0A0E" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p) => <circle key={p.date + p.value} cx={x(p.date)} cy={y(p.value)} r={4.5} fill="#C3AEEC" stroke="#0C0A0E" strokeWidth={2} />)}
      <text x={L} y={H - 8} fontSize="11" fill="#0C0A0E" fillOpacity={0.55}>{formatShort(points[0].date)}</text>
      <text x={W - R} y={H - 8} textAnchor="end" fontSize="11" fill="#0C0A0E" fillOpacity={0.55}>{formatShort(last.date)}</text>
    </svg>
  )
}
