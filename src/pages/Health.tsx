import { useMemo, useState } from 'react'
import { CalendarPlus, Plus } from 'lucide-react'
import type { Habit } from '@/types'
import { goalProgress, habitStreak, useEvents, useGoals, useHabits, useTransactions } from '@/hooks/useData'
import { openForm } from '@/hooks/useQuickAdd'
import { toggleHabit } from '@/components/habits/habitActions'
import { isTraining } from '@/game/achievements'
import { XP_VALUES } from '@/game/config'
import { monthKey, relativeDay, today, weekDays } from '@/utils/date'
import { money, ratio } from '@/utils/format'
import { PageHeader, StatCard } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { EmptyState, SectionTitle } from '@/components/ui/Misc'
import { PixelIcon } from '@/components/game/PixelIcon'
import { Quest } from '@/components/game/Quest'
import { HabitForm } from '@/components/habits/HabitForm'
import { WidgetHeader } from '@/components/widgets/WidgetHeader'
import { cn } from '@/lib/cn'

/** Saúde: hábitos de cuidado, treinos, consultas, metas de bem-estar e gastos com saúde. */
export default function Health() {
  const habits = useHabits()
  const events = useEvents()
  const goals = useGoals()
  const transactions = useTransactions()
  const [editing, setEditing] = useState<Habit | null | 'new'>(null)

  const t = today()
  const week = useMemo(() => new Set(weekDays(t)), [t])
  const care = habits.filter((h) => h.health || isTraining(h))
  const weekDone = care.reduce((a, h) => a + h.log.filter((d) => week.has(d)).length, 0)
  const weekTarget = care.reduce((a, h) => a + h.weeklyTarget, 0)
  const trainings = care.filter(isTraining).reduce((a, h) => a + h.log.filter((d) => week.has(d)).length, 0)
  const upcoming = events.filter((e) => e.category === 'saude' && e.date >= t).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).slice(0, 5)
  const healthGoals = goals.filter((g) => g.category === 'Saúde & bem-estar')
  const spent = transactions.filter((x) => x.type === 'despesa' && x.category === 'Saúde' && monthKey(x.date) === monthKey(t)).reduce((a, x) => a + x.amount, 0)

  return (
    <div className="space-y-8">
      <PageHeader
        icon="heart"
        kicker="cuidar de mim"
        title="Saúde"
        subtitle="Corpo, mente e descanso. Cada cuidado conta, no seu ritmo."
        actions={
          <>
            <Button variant="soft" onClick={() => openForm('event', { category: 'saude' } as never)}><CalendarPlus size={16} /> Consulta / treino</Button>
            <Button onClick={() => setEditing('new')}><Plus size={16} /> Novo cuidado</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard tone="vinho" label="Bem-estar na semana" value={`${Math.round(ratio(weekDone, weekTarget))}%`} hint={`${weekDone} de ${weekTarget} cuidados`} />
        <StatCard tone="rosa" label="Treinos na semana" value={trainings} hint={`+${XP_VALUES.treino} XP cada`} />
        <StatCard label="Próxima consulta" value={upcoming[0] ? relativeDay(upcoming[0].date) : '—'} hint={upcoming[0]?.title ?? 'nada marcado'} />
        <StatCard tone="oliva" label="Gasto com saúde" value={money(spent)} hint="neste mês" />
      </div>

      <Card>
        <WidgetHeader title="Cuidados de hoje" sprite="drop" subtitle="Toque pra marcar. Recomeçar também conta." />
        {care.length === 0 ? (
          <EmptyState title="Nenhum cuidado marcado como saúde" text="Ao criar ou editar um hábito, ligue “Conta pra Saúde & bem-estar”." action={<Button size="sm" onClick={() => setEditing('new')}>Criar cuidado</Button>} />
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {care.map((h) => {
              const on = h.log.includes(t)
              const done = h.log.filter((d) => week.has(d)).length
              const streak = habitStreak(h)
              return (
                <div key={h.id} className={cn('flex items-center gap-3 rounded-lg border-2 p-2.5 transition', on ? 'border-px-line bg-rosa-100' : 'border-px-line/25 bg-white/50')}>
                  <button onClick={() => toggleHabit(h, t)} aria-pressed={on} aria-label={`Marcar ${h.name}`} className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-md border-2 border-px-line text-xl shadow-pixel-sm transition active:translate-y-px', on ? 'animate-pop bg-cereja' : 'bg-px-panel hover:bg-rosa-50')}>
                    {on ? <PixelIcon name="check" size={22} /> : h.emoji}
                  </button>
                  <button onClick={() => setEditing(h)} className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-bold text-tinta">{h.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Progress value={ratio(done, h.weeklyTarget)} color={h.color} height={6} className="flex-1" />
                      <span className="text-[11px] tabular-nums text-vinho/60">{done}/{h.weeklyTarget}</span>
                    </div>
                  </button>
                  <span className="shrink-0 text-right font-pixel text-[11px] font-semibold leading-tight text-vinho/70">
                    {streak > 0 ? <>🔥 {streak}</> : null}
                    <span className="block text-[10px] text-cereja">+{isTraining(h) ? XP_VALUES.treino : XP_VALUES.habito} XP</span>
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <WidgetHeader title="Consultas e treinos" sprite="dumbbell" to="/meu-dia" linkLabel="Agenda" />
          {upcoming.length === 0 ? (
            <p className="text-sm text-vinho/60">Nada marcado por enquanto.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((e) => (
                <li key={e.id}>
                  <button onClick={() => openForm('event', e as never)} className="flex w-full items-center gap-3 rounded-lg border-2 border-transparent bg-white/50 px-3 py-2 text-left transition hover:border-px-line/30">
                    <PixelIcon name="heart" size={18} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-tinta">{e.title}</span>
                      <span className="block text-[11px] text-vinho/55 first-letter:uppercase">{relativeDay(e.date)} · {e.time}{e.location ? ` · ${e.location}` : ''}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <section>
          <SectionTitle kicker="metas de bem-estar">Quests de saúde</SectionTitle>
          {healthGoals.length === 0 ? (
            <EmptyState title="Nenhuma meta de saúde" text="Crie uma em Metas, na categoria Saúde & bem-estar." />
          ) : (
            <div className="space-y-3">
              {healthGoals.map((g) => <Quest key={g.id} title={g.name} sprite="dumbbell" progress={goalProgress(g)} done={g.status === 'concluida'} subtitle={g.description} />)}
            </div>
          )}
        </section>
      </div>
      {editing && <HabitForm initial={editing === 'new' ? { health: true } : editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
