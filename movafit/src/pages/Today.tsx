import { Check, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { WorkoutCard } from '@/components/workouts/WorkoutCard'
import { db, fitSettings } from '@/store/db'
import { useCollection } from '@/store/collections'
import { useStore } from '@/store/createStore'
import { formatLong, monthKey, today, WEEKDAYS_SHORT, weekDays } from '@/utils/date'
import { FOCUS, formatMinutes, monthStats, recentTemplates, sortByDate, streak, weekStats } from '@/utils/workouts'
import { openNewWorkout, repeatWorkout } from '@/hooks/useWorkoutForm'
import { navigate } from '@/hooks/useRoute'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export default function Today() {
  const workouts = useCollection(db.workouts)
  const { weeklyGoal } = useStore(fitSettings)
  const t = today()
  const sorted = sortByDate(workouts)
  const todays = sorted.filter((w) => w.date === t)
  const days = streak(workouts)
  const week = weekStats(workouts)
  const month = monthStats(workouts, monthKey(t))
  const templates = recentTemplates(workouts, 6)
  const done = todays.length > 0
  const goalPct = Math.min(100, Math.round((week.days / weeklyGoal) * 100))

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* capa */}
      <section className="relative overflow-hidden rounded-[2rem] border-2 border-ink bg-ink p-6 text-ink-fg shadow-pixel sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-ink-fg/70">{cap(formatLong(t))}</p>
            <h1 className="mt-2 text-4xl font-bold leading-tight sm:text-5xl">
              {done ? 'Treino de hoje feito!' : 'Bora treinar hoje?'}
            </h1>
            <p className="mt-2 max-w-xl text-ink-fg/80">
              {done
                ? `${todays.map((w) => w.title).join(' + ')} · ${formatMinutes(todays.reduce((s, w) => s + w.minutes, 0))}`
                : days > 0
                  ? `Você está há ${days} ${days === 1 ? 'dia' : 'dias'} seguidos. Mantenha o ritmo!`
                  : 'Fez um treino em casa? Registre aqui em poucos segundos.'}
            </p>
            <button
              type="button"
              onClick={() => openNewWorkout()}
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-full border-2 border-lavanda bg-lavanda px-6 font-semibold text-ink transition hover:brightness-105 active:scale-[0.98]"
            >
              {done ? <Plus size={18} /> : <Check size={18} />}
              {done ? 'Registrar outro treino' : 'Registrar treino de hoje'}
            </button>
          </div>
          <div className="flex shrink-0 items-end gap-3 lg:flex-col lg:items-end lg:gap-1">
            <span className="font-serif text-7xl font-bold leading-none text-salvia sm:text-8xl">{days}</span>
            <span className="pb-2 text-sm text-ink-fg/75 lg:pb-0">{days === 1 ? 'dia seguido' : 'dias seguidos'}</span>
          </div>
        </div>
      </section>

      {/* números */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card tone="rosa" className="!p-5">
          <p className="text-sm font-semibold">Meta da semana</p>
          <p className="mt-1 font-serif text-4xl font-bold">
            {week.days}<span className="text-2xl text-ink/60">/{weeklyGoal}</span>
          </p>
          <div className="mt-3 h-3 overflow-hidden rounded-full border-2 border-ink bg-quente">
            <div className="h-full rounded-full bg-ink transition-[width]" style={{ width: `${goalPct}%` }} />
          </div>
          <p className="mt-2 text-xs text-ink/70">
            {week.days >= weeklyGoal ? 'Meta batida! 🎉' : `Faltam ${weeklyGoal - week.days} ${weeklyGoal - week.days === 1 ? 'dia' : 'dias'} de treino`}
          </p>
        </Card>
        <Card tone="oliva" className="!p-5">
          <p className="text-sm font-semibold">Minutos na semana</p>
          <p className="mt-1 font-serif text-4xl font-bold">{formatMinutes(week.minutes)}</p>
          <p className="mt-2 text-xs text-ink/70">{week.count} {week.count === 1 ? 'treino' : 'treinos'} desde segunda</p>
        </Card>
        <Card tone="creme" className="!p-5">
          <p className="text-sm font-semibold">Este mês</p>
          <p className="mt-1 font-serif text-4xl font-bold">{month.days} <span className="text-2xl text-ink/60">{month.days === 1 ? 'dia' : 'dias'}</span></p>
          <p className="mt-2 text-xs text-ink/70">
            {month.count ? `${formatMinutes(month.minutes)} no total${month.top ? ` · mais feito: ${FOCUS[month.top].label}` : ''}` : 'Nenhum treino ainda neste mês'}
          </p>
        </Card>
      </div>

      {/* semana */}
      <Card>
        <h2 className="px-titlebar">Minha semana</h2>
        <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-3">
          {weekDays(t).map((day, i) => {
            const list = workouts.filter((w) => w.date === day)
            const first = list[0]
            const isToday = day === t
            const future = day > t
            return (
              <button
                key={day}
                type="button"
                disabled={future}
                onClick={() => (list.length ? navigate('historico') : openNewWorkout({ date: day }))}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-2xl py-2 transition disabled:cursor-default',
                  isToday && 'bg-lavanda-100',
                  !future && 'hover:bg-lavanda-100',
                )}
                aria-label={`${WEEKDAYS_SHORT[i]}: ${list.length ? list.map((w) => w.title).join(', ') : 'sem treino'}`}
              >
                <span className={cn('text-[11px] font-bold tracking-wide', isToday ? 'text-ink' : 'text-tinta/55')}>{WEEKDAYS_SHORT[i]}</span>
                <span
                  className={cn(
                    'grid h-11 w-11 place-items-center rounded-full border-2 text-lg sm:h-14 sm:w-14 sm:text-2xl',
                    first ? cn('border-ink', FOCUS[first.focus].bg) : future ? 'border-dashed border-ink/25' : 'border-ink/40 bg-quente',
                  )}
                  aria-hidden
                >
                  {first ? FOCUS[first.focus].emoji : ''}
                </span>
                <span className="font-serif text-sm font-bold">{Number(day.slice(8))}</span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* repetir */}
      {templates.length > 0 && (
        <section>
          <h2 className="px-titlebar">Repetir um treino</h2>
          <p className="mt-1 text-sm text-tinta/60">Toque para registrar de novo, já preenchido.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {templates.map((w) => (
              <Chip key={w.id} onClick={() => repeatWorkout(w)} className="py-2 text-sm">
                {FOCUS[w.focus].emoji} {w.title} <span className="text-ink/50">· {formatMinutes(w.minutes)}</span>
              </Chip>
            ))}
          </div>
        </section>
      )}

      {/* últimos */}
      <section>
        <div className="flex items-end justify-between gap-3">
          <h2 className="px-titlebar">Últimos treinos</h2>
          {sorted.length > 0 && (
            <button type="button" onClick={() => navigate('historico')} className="text-sm font-semibold underline decoration-ink/40 underline-offset-4 hover:decoration-ink">
              Ver histórico
            </button>
          )}
        </div>
        {sorted.length ? (
          <div className="mt-3 grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sorted.slice(0, 6).map((w) => <WorkoutCard key={w.id} w={w} />)}
          </div>
        ) : (
          <Card tone="creme" className="mt-3 text-center">
            <p className="text-4xl" aria-hidden>🏠💪</p>
            <p className="mt-2 font-serif text-xl font-bold">Nenhum treino registrado ainda</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-tinta/70">Terminou um treino em casa? Registre o nome, o foco e quanto tempo durou. Dá para colar o link do vídeo para achar de novo.</p>
            <button type="button" onClick={() => openNewWorkout()} className="mt-4 inline-flex h-11 items-center gap-2 rounded-full border-2 border-ink bg-lavanda px-5 text-sm font-semibold hover:brightness-105">
              <Plus size={16} /> Registrar primeiro treino
            </button>
          </Card>
        )}
      </section>
    </div>
  )
}
