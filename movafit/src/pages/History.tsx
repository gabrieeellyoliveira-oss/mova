import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { Input } from '@/components/ui/Form'
import { WorkoutCard } from '@/components/workouts/WorkoutCard'
import { db } from '@/store/db'
import { useCollection } from '@/store/collections'
import type { Focus } from '@/types'
import { MONTHS, WEEKDAYS_MINI, addMonths, monthKey, monthMatrix, toISODate, today } from '@/utils/date'
import { FOCUS, FOCUS_LIST, formatMinutes, monthStats, sortByDate } from '@/utils/workouts'
import { openNewWorkout } from '@/hooks/useWorkoutForm'

export default function History() {
  const workouts = useCollection(db.workouts)
  const t = today()
  const [cursor, setCursor] = useState(() => new Date(Number(t.slice(0, 4)), Number(t.slice(5, 7)) - 1, 1))
  const [focus, setFocus] = useState<Focus | 'todos'>('todos')
  const [query, setQuery] = useState('')
  const [day, setDay] = useState<string | null>(null)

  const month = monthKey(toISODate(cursor))
  const stats = monthStats(workouts, month)
  const byDay = useMemo(() => {
    const m = new Map<string, typeof workouts>()
    stats.list.forEach((w) => m.set(w.date, [...(m.get(w.date) ?? []), w]))
    return m
  }, [stats.list])

  const q = query.trim().toLowerCase()
  const searching = q.length > 0
  // com busca, procura em todos os meses; sem busca, mostra o mês escolhido (ou o dia tocado)
  const list = sortByDate(searching ? workouts : stats.list).filter(
    (w) =>
      (focus === 'todos' || w.focus === focus) &&
      (!day || searching || w.date === day) &&
      (!q || w.title.toLowerCase().includes(q) || (w.notes ?? '').toLowerCase().includes(q)),
  )
  const isCurrentMonth = month === monthKey(t)
  const move = (n: number) => { setCursor((c) => addMonths(c, n)); setDay(null) }

  return (
    <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
      <div className="space-y-5 lg:sticky lg:top-24">
        {/* calendário */}
        <Card>
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={() => move(-1)} className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-quente hover:bg-lavanda-100" aria-label="Mês anterior">
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-serif text-xl font-bold capitalize">{MONTHS[cursor.getMonth()]} {cursor.getFullYear()}</h2>
            <button type="button" onClick={() => move(1)} disabled={isCurrentMonth} className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-quente hover:bg-lavanda-100 disabled:opacity-30" aria-label="Próximo mês">
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-tinta/50">
            {WEEKDAYS_MINI.map((d, i) => <span key={i}>{d}</span>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {monthMatrix(cursor.getFullYear(), cursor.getMonth()).flat().map((d, i) => {
              if (!d) return <span key={i} />
              const ws = byDay.get(d)
              const first = ws?.[0]
              const selected = day === d
              return (
                <button
                  key={d}
                  type="button"
                  disabled={d > t}
                  onClick={() => (ws ? setDay(selected ? null : d) : openNewWorkout({ date: d }))}
                  aria-pressed={selected}
                  aria-label={`${Number(d.slice(8))}: ${ws ? ws.map((w) => w.title).join(', ') : 'sem treino'}`}
                  className={cn(
                    'relative grid aspect-square place-items-center rounded-full text-sm font-semibold transition disabled:opacity-30',
                    first ? cn('border-2 border-ink', FOCUS[first.focus].bg) : 'hover:bg-lavanda-100',
                    d === t && !first && 'ring-2 ring-inset ring-ink',
                    selected && 'ring-4 ring-ink/30',
                  )}
                >
                  {first ? <span aria-hidden className="text-base">{FOCUS[first.focus].emoji}</span> : Number(d.slice(8))}
                  {ws && ws.length > 1 && (
                    <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-ink text-[9px] text-ink-fg">{ws.length}</span>
                  )}
                </button>
              )
            })}
          </div>
        </Card>

        {/* resumo do mês */}
        <div className="grid grid-cols-3 gap-3">
          <Card tone="rosa" className="!p-4">
            <p className="text-xs font-semibold">Dias</p>
            <p className="font-serif text-3xl font-bold">{stats.days}</p>
          </Card>
          <Card tone="oliva" className="!p-4">
            <p className="text-xs font-semibold">Treinos</p>
            <p className="font-serif text-3xl font-bold">{stats.count}</p>
          </Card>
          <Card tone="creme" className="!p-4">
            <p className="text-xs font-semibold">Tempo</p>
            <p className="font-serif text-3xl font-bold">{formatMinutes(stats.minutes)}</p>
          </Card>
        </div>
      </div>

      <section className="min-w-0 space-y-4">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-tinta/50" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar em todos os treinos…" className="h-12 pl-11" aria-label="Buscar treinos" />
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar" aria-label="Filtrar por foco">
          <Chip active={focus === 'todos'} onClick={() => setFocus('todos')}>Todos</Chip>
          {FOCUS_LIST.map((f) => (
            <Chip key={f} active={focus === f} onClick={() => setFocus(f)}>{FOCUS[f].emoji} {FOCUS[f].label}</Chip>
          ))}
        </div>
        {day && !searching && (
          <p className="flex items-center gap-2 text-sm">
            Mostrando só o dia <b>{Number(day.slice(8))}</b>.
            <button type="button" onClick={() => setDay(null)} className="font-semibold underline underline-offset-4">Ver o mês todo</button>
          </p>
        )}
        {list.length ? (
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {list.map((w) => <WorkoutCard key={w.id} w={w} />)}
          </div>
        ) : (
          <Card tone="creme" className="text-center">
            <p className="font-serif text-lg font-bold">{searching ? 'Nenhum treino encontrado' : 'Nenhum treino neste mês'}</p>
            <p className="mt-1 text-sm text-tinta/70">{searching ? 'Tente outra palavra ou outro foco.' : 'Toque num dia do calendário para registrar um treino nele.'}</p>
          </Card>
        )}
      </section>
    </div>
  )
}
