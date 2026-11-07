import { useMemo } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useVault } from '@/hooks/useData'
import { monthKey, today } from '@/utils/date'
import { money } from '@/utils/format'

const tooltipStyle = { borderRadius: 14, border: '2px solid #0C0A0E', fontSize: 12 }
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

export function VaultChart() {
  const { data, cur, targetDate } = useTrail()
  const tName = targetDate ? `Trilha para sair em ${targetDate.slice(8, 10)}/${targetDate.slice(5, 7)}` : 'Trilha'
  const fmt = (n: number) => (n < 1000 ? String(n) : `${(n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`)
  const diff = cur && cur.trilha != null && cur.guardado != null ? cur.guardado - cur.trilha : null
  return (
    <div>
      {cur && (
        <div className="mb-3 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border-2 border-ink bg-quente px-4 py-2 text-sm">
          <span className="font-semibold capitalize">{cur.mes} (agora)</span>
          <span>Você: <b>{money(cur.guardado ?? 0)}</b></span>
          {cur.trilha != null && <span>Deveria ter: <b>{r0(cur.trilha)}</b></span>}
          {diff != null && <span className={diff >= 0 ? 'font-semibold text-oliva-600' : 'font-semibold text-cereja'}>{diff >= 0 ? '+' : '−'}{r0(Math.abs(diff))}</span>}
        </div>
      )}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#0C0A0E" strokeOpacity={0.07} />
            <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#0C0A0E', opacity: 0.6 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#0C0A0E', opacity: 0.45 }} tickFormatter={fmt} />
            <Tooltip formatter={(n: number, name: string) => [money(n), name]} contentStyle={tooltipStyle} />
            <Legend iconType="plainline" iconSize={16} wrapperStyle={{ fontSize: 12, color: '#0C0A0E' }} />
            {cur && <ReferenceLine x={cur.mes} stroke="#C3AEEC" strokeWidth={2} />}
            <Line type="linear" dataKey="trilha" name={tName} stroke="#0C0A0E" strokeDasharray="6 5" strokeWidth={2} dot={false} connectNulls />
            <Line type="monotone" dataKey="guardado" name="Guardado (acumulado)" stroke="#376139" strokeWidth={3} dot={{ r: 3, fill: '#376139' }} connectNulls={false} />
            {cur?.guardado != null && <ReferenceDot x={cur.mes} y={cur.guardado} r={7} fill="#C3AEEC" stroke="#0C0A0E" strokeWidth={2} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
