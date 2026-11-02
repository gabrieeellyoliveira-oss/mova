import { useMemo, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Camera, Dumbbell, Plus } from 'lucide-react'
import type { BodyCheckin, Workout } from '@/types'
import { useBodyCheckins, useWorkouts } from '@/hooks/useData'
import { formatShort, monthKey, today, weekDays, WEEKDAYS_MINI } from '@/utils/date'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/Misc'
import { StatCard } from '@/components/ui/PageHeader'
import { CheckinForm, WORKOUT_KINDS, WorkoutForm } from '@/components/evolution/forms'
import { cn } from '@/lib/cn'

const kg = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
const MEASURES: { key: 'waist' | 'hip' | 'arm' | 'thigh'; label: string }[] = [
  { key: 'waist', label: 'Cintura' }, { key: 'hip', label: 'Quadril' }, { key: 'arm', label: 'Braço' }, { key: 'thigh', label: 'Coxa' },
]

/** Evolução: treinos feitos, fotos de antes e depois, peso e medidas. */
export default function Evolution() {
  const workouts = useWorkouts()
  const checkins = useBodyCheckins()
  const [editWorkout, setEditWorkout] = useState<Workout | 'new' | null>(null)
  const [editCheckin, setEditCheckin] = useState<BodyCheckin | 'new' | null>(null)

  const t = today()
  const week = weekDays(t)
  const s = useMemo(() => {
    const inWeek = workouts.filter((w) => week.includes(w.date))
    const inMonth = workouts.filter((w) => monthKey(w.date) === monthKey(t))
    const byDate = [...checkins].sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))
    const photos = byDate.filter((c) => c.photo)
    const weights = byDate.filter((c) => c.weight)
    return {
      weekCount: inWeek.length,
      weekMinutes: inWeek.reduce((a, w) => a + w.minutes, 0),
      monthCount: inMonth.length,
      monthMinutes: inMonth.reduce((a, w) => a + w.minutes, 0),
      photos,
      weights,
      byDate,
      first: weights[0],
      last: weights[weights.length - 1],
    }
  }, [workouts, checkins, week, t])
  const recent = [...workouts].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, 8)
  const diff = s.first && s.last && s.first !== s.last ? s.last.weight! - s.first.weight! : null
  const before = s.photos[0]
  const after = s.photos.length > 1 ? s.photos[s.photos.length - 1] : undefined
  const latestOf = (k: (typeof MEASURES)[number]['key']) => [...s.byDate].reverse().find((c) => c[k])?.[k]
  const firstOf = (k: (typeof MEASURES)[number]['key']) => s.byDate.find((c) => c[k])?.[k]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard tone="vinho" label="Treinos na semana" value={s.weekCount} hint={`${s.weekMinutes} min nesta semana`}
          action={<Button size="sm" onClick={() => setEditWorkout('new')}><Plus size={14} /> Novo treino</Button>} />
        <StatCard tone="rosa" label="Neste mês" value={`${s.monthCount} ${s.monthCount === 1 ? 'treino' : 'treinos'}`} hint={`${kg(s.monthMinutes / 60)} h de treino`} />
        <StatCard tone="oliva" label="Peso atual" value={s.last ? `${kg(s.last.weight!)} kg` : '—'}
          hint={diff !== null ? `${diff > 0 ? '+' : ''}${kg(diff)} kg desde ${formatShort(s.first!.date)}` : 'registre seu peso para acompanhar'} />
        <StatCard label="Fotos de evolução" value={s.photos.length} hint="registros com foto"
          action={<Button size="sm" variant="light" onClick={() => setEditCheckin('new')}><Camera size={14} /> Registrar evolução</Button>} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Antes e depois" icon={<Camera />} subtitle={after ? `${formatShort(before!.date)} → ${formatShort(after.date)}` : 'a primeira e a última foto lado a lado'} />
          {before && after ? (
            <div className="grid grid-cols-2 gap-4">
              {[{ c: before, label: 'Antes' }, { c: after, label: 'Agora' }].map(({ c, label }) => (
                <button key={label} onClick={() => setEditCheckin(c)} className="text-left">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border-2 border-ink bg-creme-100">
                    <img src={c.photo} alt={`${label} — ${formatShort(c.date)}`} className="h-full w-full object-cover" />
                    <span className="absolute left-2 top-2 rounded-full border-2 border-ink bg-lavanda px-2.5 py-0.5 text-xs font-semibold text-ink">{label}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{formatShort(c.date)}{c.weight ? <span className="font-normal text-tinta/60"> · {kg(c.weight)} kg</span> : null}</p>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState title={before ? 'Falta só mais uma foto' : 'Nenhuma foto ainda'} text="Registre fotos de tempos em tempos para comparar sua evolução."
              action={<Button size="sm" onClick={() => setEditCheckin('new')}><Camera size={14} /> Adicionar foto</Button>} />
          )}
        </Card>

        <Card className="flex flex-col">
          <CardHeader title="Peso e medidas" icon={<Dumbbell />} subtitle={s.weights.length ? `${s.weights.length} ${s.weights.length === 1 ? 'registro' : 'registros'} de peso` : 'acompanhe peso e medidas ao longo do tempo'} />
          {s.weights.length >= 2 ? (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={s.weights.map((c) => ({ dia: formatShort(c.date), peso: c.weight }))} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="peso" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C3AEEC" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#C3AEEC" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="dia" tickLine={false} axisLine={{ stroke: '#0C0A0E' }} tick={{ fontSize: 11, fill: 'rgba(12,10,14,0.6)' }} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'rgba(12,10,14,0.6)' }} tickFormatter={(v: number) => kg(v)} />
                  <Tooltip formatter={(v: number) => [`${kg(v)} kg`, 'Peso']} contentStyle={{ borderRadius: 14, border: '2px solid #0C0A0E', fontSize: 12 }} />
                  <Area type="monotone" dataKey="peso" stroke="#0C0A0E" strokeWidth={2} fill="url(#peso)" dot={{ r: 3.5, fill: '#FEFCF7', stroke: '#0C0A0E', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="rounded-2xl border-2 border-dashed border-ink/25 px-4 py-8 text-center text-sm text-tinta/60">Registre o peso pelo menos duas vezes para ver o gráfico.</p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {MEASURES.map(({ key, label }) => {
              const now = latestOf(key)
              const start = firstOf(key)
              const d = now && start && now !== start ? now - start : null
              return (
                <div key={key} className="rounded-2xl border-2 border-ink bg-quente p-3">
                  <p className="text-xs text-tinta/60">{label}</p>
                  <p className="font-serif text-xl font-bold">{now ? `${kg(now)} cm` : '—'}</p>
                  {d !== null && <p className="text-[11px] text-tinta/60">{d > 0 ? '+' : ''}{kg(d)} cm</p>}
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader title="Fotos de evolução" icon={<Camera />} subtitle="toque numa foto para editar"
            action={<Button size="sm" variant="light" onClick={() => setEditCheckin('new')}><Plus size={14} /> Foto</Button>} />
          {s.photos.length === 0 ? (
            <EmptyState title="Sua galeria começa aqui" text="Tire uma foto no mesmo lugar e na mesma luz a cada poucas semanas." />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {[...s.photos].reverse().map((c) => (
                <button key={c.id} onClick={() => setEditCheckin(c)} className="text-left">
                  <div className="aspect-[3/4] overflow-hidden rounded-2xl border-2 border-ink bg-creme-100">
                    <img src={c.photo} alt={`Foto de ${formatShort(c.date)}`} className="h-full w-full object-cover transition hover:scale-[1.03]" />
                  </div>
                  <p className="mt-1.5 text-xs font-semibold">{formatShort(c.date)}{c.weight ? <span className="font-normal text-tinta/60"> · {kg(c.weight)} kg</span> : null}</p>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Treinos" icon={<Dumbbell />} subtitle="esta semana"
            action={<Button size="sm" variant="light" onClick={() => setEditWorkout('new')}><Plus size={14} /> Treino</Button>} />
          <div className="mb-5 grid grid-cols-7 gap-2">
            {week.map((d, i) => {
              const mins = workouts.filter((w) => w.date === d).reduce((a, w) => a + w.minutes, 0)
              return (
                <div key={d} className="flex flex-col items-center gap-1.5" title={mins ? `${mins} min` : 'Sem treino'}>
                  <span className={cn('grid aspect-square w-full max-w-[44px] place-items-center rounded-xl border-2 text-[11px] font-semibold', mins ? 'border-ink bg-salvia' : 'border-dashed border-ink/25', d === t && 'ring-2 ring-lavanda ring-offset-2 ring-offset-quente')}>
                    {mins ? `${mins}′` : ''}
                  </span>
                  <span className="text-[11px] text-tinta/60">{WEEKDAYS_MINI[i]}</span>
                </div>
              )
            })}
          </div>
          {recent.length === 0 ? (
            <EmptyState title="Nenhum treino ainda" text="Registre cada treino para ver sua constância." />
          ) : (
            <ul className="divide-y divide-ink/10">
              {recent.map((w) => (
                <li key={w.id}>
                  <button onClick={() => setEditWorkout(w)} className="flex w-full items-center gap-3 py-2.5 text-left">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-lavanda"><Dumbbell size={18} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{WORKOUT_KINDS[w.kind]}</span>
                      <span className="block truncate text-xs text-tinta/60">{formatShort(w.date)}{w.note ? ` · ${w.note}` : ''}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold">{w.minutes} min</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {editWorkout && <WorkoutForm initial={editWorkout === 'new' ? undefined : editWorkout} onClose={() => setEditWorkout(null)} />}
      {editCheckin && <CheckinForm initial={editCheckin === 'new' ? undefined : editCheckin} onClose={() => setEditCheckin(null)} />}
    </div>
  )
}
