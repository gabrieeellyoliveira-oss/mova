import { useMemo } from 'react'
import { Area, CartesianGrid, ComposedChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { cn } from '@/lib/cn'
import { useVault } from '@/hooks/useData'
import { monthKey, today } from '@/utils/date'
import { money } from '@/utils/format'

const r0 = (n: number) => money(Math.round(n)).replace(',00', '')
const nextKey = (k: string) => { const [y, m] = k.split('-').map(Number); const d = new Date(y, m, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
const label = (k: string) => { const [y, m] = k.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '') }

const prevKey = (k: string) => { const [y, m] = k.split('-').map(Number); const d = new Date(y, m - 2, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }

/**
 * Trilha do cofre: o guardado acumulado vs. quanto deveria ter em cada mês.
 * A trilha parte do saldo do fim do mês passado (início do plano) e sobe a mesma parcela
 * do topo ("precisa guardar por mês") até a data meta, terminando na meta do cofre.
 */
export function useTrail() {
  const v = useVault()
  return useMemo(() => {
    const now = monthKey(today())
    const planStart = prevKey(now)
    const first = v.entries[0] ? monthKey(v.entries[0].date) : planStart
    const start = first < planStart ? first : planStart
    const end = v.settings.targetDate ? monthKey(v.settings.targetDate) : null
    const last = end && end > now ? end : now
    const keys: string[] = []
    for (let k = start; k <= last && keys.length < 60; k = nextKey(k)) keys.push(k)
    const need = v.neededPerMonth ?? 0
    let acc = 0
    let base = 0
    let step = 0
    const data = keys.map((k) => {
      acc += v.entries.filter((e) => monthKey(e.date) === k).reduce((a, e) => a + (e.type === 'deposito' ? e.amount : -e.amount), 0)
      if (k === planStart) base = acc
      let trilha: number | null = null
      if (end && k >= planStart && k <= end) {
        trilha = k === planStart ? base : k === end ? v.target : Math.min(v.target, base + need * ++step)
        trilha = Math.round(trilha * 100) / 100
      }
      return { key: k, mes: label(k), guardado: k <= now ? Math.round(acc * 100) / 100 : null, trilha }
    })
    const cur = data.find((d) => d.key === now)
    return { data, cur, end, now, targetDate: v.settings.targetDate }
  }, [v.entries, v.settings.targetDate, v.target, v.neededPerMonth])
}

type Point = { key: string; mes: string; guardado: number | null; trilha: number | null }

/** Tooltip no estilo dos cards: mês, quanto tinha e quanto deveria ter. */
function TrailTip({ active, payload }: { active?: boolean; payload?: { payload: Point }[] }) {
  const d = payload?.[0]?.payload
  if (!active || !d) return null
  const diff = d.guardado != null && d.trilha != null ? d.guardado - d.trilha : null
  return (
    <div className="rounded-2xl border-2 border-ink bg-quente px-4 py-3 text-sm shadow-pixel">
      <p className="font-serif text-base font-bold first-letter:uppercase">{monthYear(d.key)}</p>
      {d.guardado != null && <p className="mt-1 flex justify-between gap-6"><span className="text-tinta/60">Guardado</span><b className="text-oliva-600">{money(d.guardado)}</b></p>}
      {d.trilha != null && <p className="flex justify-between gap-6"><span className="text-tinta/60">Deveria ter</span><b>{r0(d.trilha)}</b></p>}
      {diff != null && <p className={cn('mt-1 text-right text-xs font-semibold', diff >= 0 ? 'text-oliva-600' : 'text-cereja')}>{diff >= 0 ? `+${r0(diff)} na frente` : `${r0(-diff)} atrás`}</p>}
    </div>
  )
}

const monthYear = (k: string) => { const [y, m] = k.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) }

export function VaultChart() {
  const { data, cur, end, now } = useTrail()
  const v = useVault()
  const fmt = (n: number) => (n === 0 ? 'R$ 0' : n < 1000 ? `R$ ${n}` : `R$ ${(n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`)
  const diff = cur && cur.trilha != null && cur.guardado != null ? cur.guardado - cur.trilha : null
  const endPoint = end ? data.find((d) => d.key === end) : undefined
  const tile = 'rounded-2xl border-2 border-ink px-3 py-2.5 sm:px-4 sm:py-3'
  // eixo em passos redondos até a meta (ex.: 0, 1k, 2k, 3k, 4k)
  const top = Math.max(v.target, ...data.map((d) => Math.max(d.guardado ?? 0, d.trilha ?? 0)), 1)
  const step = [250, 500, 1000, 2000, 2500, 5000, 10000].find((x) => top / x <= 5) ?? Math.ceil(top / 5000) * 1000
  const ticks = Array.from({ length: Math.ceil(top / step) + 1 }, (_, i) => i * step)
  return (
    <div>
      {cur && (
        <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
          <div className={cn(tile, 'bg-salvia/45')}>
            <p className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.06em] text-tinta/60 sm:text-[11px] sm:tracking-[0.12em]">Você tem</p>
            <p className="mt-0.5 font-serif text-base font-bold sm:text-2xl">{r0(cur.guardado ?? 0)}</p>
          </div>
          <div className={cn(tile, 'bg-lavanda-100')}>
            <p className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.06em] text-tinta/60 sm:text-[11px] sm:tracking-[0.12em]">Deveria ter</p>
            <p className="mt-0.5 font-serif text-base font-bold sm:text-2xl">{cur.trilha != null ? r0(cur.trilha) : '—'}</p>
          </div>
          <div className={cn(tile, diff == null ? 'bg-quente' : diff >= 0 ? 'bg-salvia' : 'bg-[#F6D6DC]')}>
            <p className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.06em] text-tinta/60 sm:text-[11px] sm:tracking-[0.12em]">{diff == null ? 'Diferença' : diff >= 0 ? 'Na frente' : 'Atrás'}</p>
            <p className={cn('mt-0.5 font-serif text-base font-bold sm:text-2xl', diff != null && diff < 0 && 'text-cereja')}>{diff == null ? '—' : r0(Math.abs(diff))}</p>
          </div>
        </div>
      )}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 28, right: 16, left: 4, bottom: 4 }}>
            <defs>
              <linearGradient id="trail-saved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A8CA96" stopOpacity={0.75} />
                <stop offset="100%" stopColor="#A8CA96" stopOpacity={0.08} />
              </linearGradient>
              <linearGradient id="trail-plan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C3AEEC" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#C3AEEC" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#0C0A0E" strokeOpacity={0.06} />
            <XAxis dataKey="mes" tickLine={false} axisLine={{ stroke: '#0C0A0E', strokeOpacity: 0.15 }} tickMargin={8}
              tick={(p: { x: number; y: number; payload: { value: string; index: number } }) => {
                const k = data[p.payload.index]?.key
                const isNow = k === now, isEnd = k === end
                return <text x={p.x} y={p.y + 10} textAnchor="middle" fontSize={12} fontWeight={isNow || isEnd ? 700 : 400} fill="#0C0A0E" opacity={isNow || isEnd ? 1 : 0.55}>{isEnd ? `${p.payload.value} 🔑` : p.payload.value}</text>
              }} />
            <YAxis tickLine={false} axisLine={false} width={56} tick={{ fontSize: 11, fill: '#0C0A0E', opacity: 0.45 }} tickFormatter={fmt} ticks={ticks} domain={[0, ticks[ticks.length - 1]]} interval={0} />
            <Tooltip content={<TrailTip />} cursor={{ stroke: '#0C0A0E', strokeOpacity: 0.15, strokeWidth: 1 }} />
            {v.target > 0 && <ReferenceLine y={v.target} stroke="#702335" strokeDasharray="2 4" strokeWidth={1.5}
              label={{ value: `Meta ${r0(v.target)}`, position: 'insideTopLeft', fill: '#702335', fontSize: 12, fontWeight: 700, dy: -18 }} />}
            {cur && <ReferenceLine x={cur.mes} stroke="#0C0A0E" strokeOpacity={0.35} strokeDasharray="3 3"
              label={{ value: 'hoje', position: 'top', fill: '#0C0A0E', fontSize: 11, fontWeight: 700 }} />}
            <Area type="linear" dataKey="trilha" name="Trilha" stroke="#6A4FB6" strokeWidth={2} strokeDasharray="7 5" fill="url(#trail-plan)" dot={false} activeDot={false} connectNulls isAnimationActive={false} />
            <Area type="monotone" dataKey="guardado" name="Guardado" stroke="#376139" strokeWidth={3} fill="url(#trail-saved)" connectNulls={false}
              dot={{ r: 3.5, fill: '#FEFCF7', stroke: '#376139', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#376139', stroke: '#0C0A0E', strokeWidth: 2 }} />
            {cur?.trilha != null && <ReferenceDot x={cur.mes} y={cur.trilha} r={5} fill="#C3AEEC" stroke="#0C0A0E" strokeWidth={2} />}
            {cur?.guardado != null && <ReferenceDot x={cur.mes} y={cur.guardado} r={7} fill="#376139" stroke="#0C0A0E" strokeWidth={2} />}
            {endPoint?.trilha != null && <ReferenceDot x={endPoint.mes} y={endPoint.trilha} r={6} fill="#702335" stroke="#0C0A0E" strokeWidth={2} />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-tinta/70">
        <span className="inline-flex items-center gap-2"><span className="h-3 w-6 rounded-full border-2 border-oliva-600 bg-salvia" /> Guardado (acumulado)</span>
        <span className="inline-flex items-center gap-2"><span className="h-0 w-6 border-t-2 border-dashed border-[#6A4FB6]" /> Trilha: +{r0(v.neededPerMonth ?? 0)} por mês</span>
        <span className="inline-flex items-center gap-2"><span className="h-0 w-6 border-t-2 border-dotted border-cereja" /> Meta do cofre</span>
      </div>
    </div>
  )
}
