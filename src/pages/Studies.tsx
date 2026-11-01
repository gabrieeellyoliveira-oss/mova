import { useState } from 'react'
import { Check, Clock, Pencil, Plus } from 'lucide-react'
import type { Course } from '@/types'
import { settingsStore } from '@/store/db'
import { useCourses, useEvents, useFocusSessions, useStudyWeek, useTasks } from '@/hooks/useData'
import { WEEKDAYS_SHORT, formatShort, relativeDay, today } from '@/utils/date'
import { ratio } from '@/utils/format'
import { openForm } from '@/hooks/useQuickAdd'
import { StatCard } from '@/components/ui/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Segmented } from '@/components/ui/Chip'
import { EmptyState, SectionTitle } from '@/components/ui/Misc'
import { FocusTimer } from '@/components/studies/FocusTimer'
import { CourseCard } from '@/components/studies/CourseCard'
import { CourseForm } from '@/components/studies/CourseForm'
import { TaskItem } from '@/components/tasks/TaskItem'

function WeeklyGoal() {
  const w = useStudyWeek()
  const [edit, setEdit] = useState(false)
  const [v, setV] = useState(String(w.goalHours))
  const save = () => { settingsStore.set((p) => ({ ...p, weeklyStudyHours: Number(v) || p.weeklyStudyHours })); setEdit(false) }
  const max = Math.max(60, ...w.perDay.map((d) => d.minutes))
  return (
    <Card tone="oliva">
      <CardHeader
        title="Minha semana de estudos"
        subtitle={`${w.hours.toFixed(1).replace('.', ',')}h de ${w.goalHours}h`}
        icon={<Clock size={18} />}
        action={edit ? (
          <form onSubmit={(e) => { e.preventDefault(); save() }} className="flex items-center gap-1">
            <input autoFocus type="number" value={v} onChange={(e) => setV(e.target.value)} className="h-8 w-16 rounded-full border border-oliva/30 bg-quente px-3 text-sm" aria-label="Meta semanal em horas" />
            <Button size="icon-sm" variant="olive" type="submit" aria-label="Salvar"><Check size={14} /></Button>
          </form>
        ) : (
          <Button size="icon-sm" variant="ghost" onClick={() => setEdit(true)} aria-label="Editar meta semanal"><Pencil size={14} /></Button>
        )}
      />
      <Progress value={w.progress} color="#3F6E52" track="#ffffff99" height={10} />
      <p className="mt-1.5 text-xs">{w.progress >= 100 ? 'Meta da semana batida! 🌱' : `faltam ${Math.max(0, w.goalHours - w.hours).toFixed(1).replace('.', ',')}h — no seu ritmo`}</p>
      <div className="mt-5 flex h-28 items-end gap-2">
        {w.perDay.map((d, i) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-[10px] font-bold opacity-70">{d.minutes ? `${d.minutes}′` : ''}</span>
            <div className="w-full rounded-xl bg-oliva transition-all" style={{ height: `${Math.max(6, (d.minutes / max) * 72)}px`, opacity: d.minutes ? 1 : 0.18 }} />
            <span className={`text-[10px] font-bold ${d.date === today() ? 'text-oliva-600' : 'opacity-50'}`}>{WEEKDAYS_SHORT[i]}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function Studies() {
  const courses = useCourses()
  const sessions = useFocusSessions()
  const tasks = useTasks()
  const events = useEvents()
  const w = useStudyWeek()
  const [filter, setFilter] = useState<'ativos' | 'todos'>('ativos')
  const [editing, setEditing] = useState<Course | null | 'new'>(null)

  const active = courses.filter((c) => c.active)
  const avg = active.length ? active.reduce((a, c) => a + ratio(c.lessonsDone, c.lessonsTotal), 0) / active.length : 0
  const minutesBy = (id: string) => sessions.filter((s) => s.courseId === id).reduce((a, s) => a + s.minutes, 0)
  const studyTasks = tasks.filter((t) => t.area === 'estudos' && !t.done).sort((a, b) => (a.date ?? '9').localeCompare(b.date ?? '9'))
  const studyEvents = events.filter((e) => e.category === 'estudos' && e.date >= today()).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).slice(0, 4)
  const recent = [...sessions].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, 5)
  const shown = filter === 'ativos' ? active : courses

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard tone="vinho" label="Nesta semana" value={`${w.hours.toFixed(1).replace('.', ',')}h`} hint="de estudo focado" />
        <StatCard label="Cursos ativos" value={active.length} hint={`${courses.length - active.length} concluídos/pausados`} />
        <StatCard tone="rosa" label="Progresso médio" value={`${Math.round(avg)}%`} hint="dos cursos ativos" />
        <StatCard tone="oliva" label="Desde o começo" value={`${Math.round(w.totalMinutes / 60)}h`} hint={`${sessions.length} sessões de foco`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <WeeklyGoal />
          <section>
            <SectionTitle action={<div className="flex flex-wrap items-center gap-2"><Segmented value={filter} onChange={setFilter} options={[{ value: 'ativos', label: 'Ativos' }, { value: 'todos', label: 'Todos' }]} /><Button size="sm" onClick={() => setEditing('new')}><Plus size={14} /> Novo curso</Button></div>}>Meus cursos</SectionTitle>
            {shown.length === 0 ? (
              <EmptyState title="Nenhum curso por aqui" action={<Button size="sm" onClick={() => setEditing('new')}>Adicionar curso</Button>} />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {shown.map((c) => <CourseCard key={c.id} course={c} minutes={minutesBy(c.id)} onEdit={() => setEditing(c)} />)}
              </div>
            )}
          </section>
        </div>
        <aside className="space-y-6">
          <FocusTimer />
          <Card>
            <CardHeader title="Próximas atividades" subtitle="tarefas e aulas marcadas" action={<Button size="icon-sm" variant="soft" onClick={() => openForm('task', { area: 'estudos' })} aria-label="Nova tarefa de estudo"><Plus size={15} /></Button>} />
            {studyEvents.map((e) => (
              <button key={e.id} onClick={() => openForm('event', e as never)} className="mb-1 flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left hover:bg-creme-100">
                <span className="rounded-xl bg-oliva-100 px-2 py-1 text-center text-[11px] font-bold leading-tight text-oliva-600">{formatShort(e.date)}<br />{e.time}</span>
                <span className="text-sm font-semibold">{e.title}<span className="block text-xs font-normal text-vinho/55">{relativeDay(e.date)}</span></span>
              </button>
            ))}
            <ul className="-mx-2">{studyTasks.map((t) => <TaskItem key={t.id} task={t} compact />)}</ul>
            {!studyTasks.length && !studyEvents.length && <p className="text-sm text-vinho/60">Nada marcado. Que tal planejar a próxima aula?</p>}
          </Card>
          <Card tone="creme">
            <CardHeader title="Sessões recentes" />
            <ul className="space-y-2 text-sm">
              {recent.map((s) => (
                <li key={s.id} className="flex justify-between gap-2">
                  <span className="truncate">{courses.find((c) => c.id === s.courseId)?.name ?? 'Estudo livre'}</span>
                  <span className="shrink-0 text-vinho/60">{s.minutes} min · {relativeDay(s.date)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
      {editing && <CourseForm initial={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
