import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { Habit } from '@/types'
import { habitStreak, useHabits } from '@/hooks/useData'
import { MONTHS, addDays, formatShort, today, weekDays } from '@/utils/date'
import { PageHeader, StatCard } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Segmented } from '@/components/ui/Chip'
import { Ring } from '@/components/ui/Progress'
import { EmptyState } from '@/components/ui/Misc'
import { WeekGrid } from '@/components/habits/WeekGrid'
import { MonthGrid } from '@/components/habits/MonthGrid'
import { HabitForm } from '@/components/habits/HabitForm'
import { toggleHabit } from '@/components/habits/habitActions'
import { Flower } from '@/components/doodles/Doodles'
import { cn } from '@/lib/cn'

const gentle = (done: number, total: number) => {
  if (!total) return 'Comece com um hábito só. Tá ótimo.'
  if (done === total) return 'Dia completinho. Que orgulho! 🌷'
  if (done === 0) return 'Hoje é um bom dia pra um cuidado pequeno.'
  if (done / total >= 0.5) return 'Mais da metade! Sem pressa pro resto.'
  return 'Cada check é um carinho com você.'
}

export default function Routine() {
  const habits = useHabits()
  const [view, setView] = useState<'semana' | 'mes'>('semana')
  const [ref, setRef] = useState(today())
  const [monthRef, setMonthRef] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() } })
  const [editing, setEditing] = useState<Habit | null | 'new'>(null)

  const t = today()
  const days = weekDays(ref)
  const doneToday = habits.filter((h) => h.log.includes(t)).length
  const best = habits.reduce((a, h) => Math.max(a, habitStreak(h)), 0)
  const weekTotal = habits.reduce((a, h) => a + days.filter((d) => h.log.includes(d)).length, 0)
  const weekTarget = habits.reduce((a, h) => a + h.weeklyTarget, 0)
  const shiftMonth = (n: number) => setMonthRef(({ y, m }) => { const d = new Date(y, m + n, 1); return { y: d.getFullYear(), m: d.getMonth() } })

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="cuidar de mim"
        title="Rotina"
        subtitle="Seus hábitos e bem-estar. Sem cobrança — aqui, recomeçar também conta."
        doodle={<Flower size={50} className="animate-wiggle" />}
        actions={<Button onClick={() => setEditing('new')}><Plus size={16} /> Novo hábito</Button>}
      />
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))]">
        <Card tone="vinho" className="flex items-center gap-5">
          <Ring value={habits.length ? (doneToday / habits.length) * 100 : 0} size={88} stroke={9} color="#EFAFB3" track="rgba(239,175,179,0.16)">
            <span className="text-lg font-extrabold text-rosa-50">{doneToday}/{habits.length}</span>
          </Ring>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rosa/80">Hoje</p>
            <p className="mt-1 text-base font-semibold leading-snug text-rosa-50">{gentle(doneToday, habits.length)}</p>
          </div>
        </Card>
        <StatCard label="Maior sequência" value={`🔥 ${best} ${best === 1 ? 'dia' : 'dias'}`} />
        <StatCard tone="rosa" label="Na semana" value={`${weekTotal}/${weekTarget}`} hint="checks feitos / planejados" />
        <StatCard tone="oliva" label="Hábitos" value={habits.length} hint="cuidados na sua rotina" />
      </div>

      <Card>
        <p className="mb-3 text-sm font-bold text-vinho">Marcar hoje</p>
        <div className="flex flex-wrap gap-2">
          {habits.map((h) => {
            const on = h.log.includes(t)
            return (
              <button key={h.id} onClick={() => toggleHabit(h, t)} className={cn('inline-flex items-center gap-2 rounded-full border-2 px-3.5 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5', on ? cn('animate-pop', h.color === '#EFAFB3' ? 'text-vinho' : 'text-quente') : 'border-vinho/10 bg-quente text-vinho')} style={on ? { backgroundColor: h.color, borderColor: h.color } : undefined}>
                <span>{h.emoji}</span>{h.name}
              </button>
            )
          })}
        </div>
      </Card>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented value={view} onChange={setView} options={[{ value: 'semana', label: 'Semana' }, { value: 'mes', label: 'Mês' }]} />
          {view === 'semana' ? (
            <div className="flex items-center gap-1">
              <Button size="icon-sm" variant="ghost" onClick={() => setRef(addDays(ref, -7))} aria-label="Semana anterior"><ChevronLeft size={16} /></Button>
              <span className="text-sm font-semibold text-vinho">{formatShort(days[0])} – {formatShort(days[6])}</span>
              <Button size="icon-sm" variant="ghost" onClick={() => setRef(addDays(ref, 7))} disabled={days[6] >= t} aria-label="Próxima semana"><ChevronRight size={16} /></Button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Button size="icon-sm" variant="ghost" onClick={() => shiftMonth(-1)} aria-label="Mês anterior"><ChevronLeft size={16} /></Button>
              <span className="text-sm font-semibold capitalize text-vinho">{MONTHS[monthRef.m]} {monthRef.y}</span>
              <Button size="icon-sm" variant="ghost" onClick={() => shiftMonth(1)} aria-label="Próximo mês"><ChevronRight size={16} /></Button>
            </div>
          )}
        </div>
        {habits.length === 0 ? (
          <EmptyState title="Nenhum hábito ainda" text="Beber água já é um ótimo começo 💧" action={<Button size="sm" onClick={() => setEditing('new')}>Criar hábito</Button>} />
        ) : view === 'semana' ? (
          <Card tone="creme" className="p-3 sm:p-4"><WeekGrid habits={habits} days={days} onEdit={setEditing} /></Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {habits.map((h) => <MonthGrid key={h.id} habit={h} year={monthRef.y} month={monthRef.m} />)}
          </div>
        )}
      </section>
      {editing && <HabitForm initial={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
