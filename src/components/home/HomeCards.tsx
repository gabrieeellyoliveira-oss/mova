import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { ArrowRight, BookOpen, CalendarDays, GraduationCap, Play, Plus, Target, Wallet, Briefcase } from 'lucide-react'
import { useBooks, useCourses, useFocusSessions, useSettings, useTasks, useVault } from '@/hooks/useData'
import { useProjects } from '@/hooks/useProjects'
import { focusTimer } from '@/hooks/useFocusTimer'
import { setFocusMode } from '@/hooks/useFocusMode'
import { openForm } from '@/hooks/useQuickAdd'
import { toggleTask } from '@/components/tasks/TaskItem'
import { addDays, fromISODate, startOfWeek, today, weekDays, WEEKDAYS_SHORT } from '@/utils/date'
import { ratio } from '@/utils/format'
import { Checkbox } from '@/components/ui/Checkbox'
import { Progress, Ring } from '@/components/ui/Progress'
import { cn } from '@/lib/cn'

export const card = 'rounded-[24px] border border-px-line bg-quente p-6'

/** "Oi, Gabi!" — e nada mais. */
export function Greeting() {
  const { name } = useSettings()
  return (
    <section className="flex min-h-[130px] items-center rounded-[24px] bg-rosa px-7 sm:min-h-[170px] sm:px-10">
      <h1 className="text-4xl font-extrabold tracking-tight text-tinta sm:text-[52px]">Oi, {name}!</h1>
    </section>
  )
}

/** "Continue de onde parou": o curso, livro ou projeto em andamento mais recente. */
export function ContinueCard() {
  const nav = useNavigate()
  const courses = useCourses()
  const sessions = useFocusSessions()
  const book = useBooks().find((b) => b.status === 'lendo')
  const project = useProjects().find((p) => p.project.status === 'andamento')
  const item = useMemo(() => {
    const active = courses.filter((c) => c.active && c.lessonsDone < c.lessonsTotal)
    const last = (id: string) => sessions.filter((s) => s.courseId === id).reduce((a, s) => (s.date > a ? s.date : a), '')
    const course = [...active].sort((a, b) => last(b.id).localeCompare(last(a.id)))[0]
    if (course) return { area: 'Estudos', icon: GraduationCap, title: course.name, pct: ratio(course.lessonsDone, course.lessonsTotal), go: () => { focusTimer.setCourse(course.id); setFocusMode(true) }, cta: 'Começar foco' }
    if (book) return { area: 'Leitura', icon: BookOpen, title: book.title, pct: ratio(book.currentPage, book.pages), go: () => nav(`/leitura?livro=${book.id}`), cta: 'Continuar lendo' }
    if (project) return { area: 'Trabalho', icon: Briefcase, title: project.project.name, pct: project.stats.progress, go: () => nav('/trabalho'), cta: 'Abrir projeto' }
    return null
  }, [courses, sessions, book, project, nav])

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-tinta">Continue de onde parou</h2>
      <div className={cn(card, 'flex min-w-0 items-center gap-4 p-5 sm:gap-6')}>
        {item ? (
          <>
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-rosa-100 text-tinta"><item.icon size={26} strokeWidth={1.7} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-tinta/60">{item.area}</p>
              <p className="line-clamp-2 text-lg font-bold leading-tight text-tinta sm:text-xl">{item.title}</p>
              <div className="mt-2 flex items-center gap-3">
                <Progress value={item.pct} color="#3E2723" track="#EFE8DA" height={6} className="max-w-xs flex-1" />
                <span className="text-sm text-tinta/70">{Math.round(item.pct)}%</span>
              </div>
            </div>
            <button onClick={item.go} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-vinho text-white transition hover:bg-vinho-700 active:scale-95" aria-label={item.cta} title={item.cta}>
              <Play size={20} className="ml-0.5 fill-current" />
            </button>
          </>
        ) : (
          <p className="flex-1 py-2 text-tinta/60">Comece um curso, um livro ou um projeto e ele aparece aqui.</p>
        )}
      </div>
    </section>
  )
}

/** "Meus pilares": atalhos para as áreas principais. */
export function Pillars() {
  const items = [
    { title: 'Planejamento', text: 'Organize sua rotina e próximos passos', icon: Target, to: '/agenda' },
    { title: 'Finanças', text: 'Controle seus gastos e evolua seu planejamento', icon: Wallet, to: '/financas' },
    { title: 'Estudos', text: 'Acompanhe sua evolução', icon: GraduationCap, to: '/estudos' },
    { title: 'Leitura', text: 'Registre e mantenha o hábito', icon: BookOpen, to: '/leitura' },
  ]
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-tinta">Meus pilares</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map(({ title, text, icon: I, to }) => (
          <Link key={title} to={to} className="group flex items-start gap-4 rounded-[24px] border border-px-line bg-quente p-5 transition hover:border-rosa hover:bg-rosa-50">
            <I size={28} strokeWidth={1.6} className="shrink-0 text-tinta" />
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold text-tinta">{title}</span>
              <span className="mt-0.5 block text-sm leading-snug text-tinta/65">{text}</span>
            </span>
            <span className="grid h-10 w-10 shrink-0 place-items-center self-center rounded-full text-tinta/70 transition group-hover:translate-x-0.5"><ArrowRight size={18} /></span>
          </Link>
        ))}
      </div>
    </section>
  )
}

/** Meu dia: tarefas de hoje com checkbox. */
export function MyDayCard() {
  const tasks = useTasks()
  const t = today()
  const list = tasks.filter((x) => x.date === t).sort((a, b) => Number(a.done) - Number(b.done) || a.order - b.order)
  const label = fromISODate(t).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
  return (
    <section className={cn(card, 'flex flex-col')}>
      <header className="mb-3 flex items-start gap-4">
        <CalendarDays size={28} strokeWidth={1.6} className="mt-1 shrink-0 text-tinta" />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-tinta">Meu dia</h2>
          <p className="text-[15px] text-tinta/65">Hoje, {label}</p>
        </div>
        <button onClick={() => openForm('task', { date: t })} className="grid h-10 w-10 place-items-center rounded-full bg-rosa text-tinta hover:bg-queimado-300" aria-label="Nova tarefa para hoje"><Plus size={24} /></button>
      </header>
      {list.length === 0 ? (
        <p className="my-auto py-6 text-center text-sm text-tinta/60">Nada marcado para hoje. Toque no + para adicionar.</p>
      ) : (
        <ul className="divide-y divide-px-line sm:pl-11">
          {list.slice(0, 5).map((task) => (
            <li key={task.id} className="flex items-center gap-4 py-2.5">
              <Checkbox checked={task.done} onChange={() => toggleTask(task)} label={task.title} size={22} color="#3E2723" />
              <button onClick={() => openForm('task', task as never)} className={cn('min-w-0 flex-1 truncate text-left text-base', task.done ? 'text-tinta/45 line-through' : 'text-tinta')}>{task.title}</button>
            </li>
          ))}
        </ul>
      )}
      {list.length > 5 && <Link to="/agenda" className="mt-2 sm:pl-11 text-sm font-semibold text-vinho hover:underline">+ {list.length - 5} na agenda</Link>}
    </section>
  )
}

/** Evolução da semana: % das tarefas concluídas por dia + anel com o total da semana. */
export function WeekChart() {
  const tasks = useTasks()
  const [offset, setOffset] = useState(0)
  const days = useMemo(() => weekDays(addDays(startOfWeek(today()), offset * 7)), [offset])
  const data = useMemo(() => {
    return days.map((d, i) => {
      const dayTasks = tasks.filter((x) => x.date === d)
      return { dia: WEEKDAYS_SHORT[i].charAt(0) + WEEKDAYS_SHORT[i].slice(1).toLowerCase(), pct: dayTasks.length ? Math.round(ratio(dayTasks.filter((x) => x.done).length, dayTasks.length)) : null }
    })
  }, [tasks, days])
  const empty = data.every((d) => d.pct === null)
  const week = tasks.filter((x) => x.date && days.includes(x.date))
  const done = week.filter((x) => x.done).length
  const weekPct = ratio(done, week.length)
  return (
    <section className={cn(card, 'flex flex-col')}>
      <header className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-tinta">Evolução da semana</h2>
        <select value={offset} onChange={(e) => setOffset(Number(e.target.value))} className="h-9 rounded-full border border-px-line bg-quente px-3 text-sm text-tinta focus:outline-none" aria-label="Escolher semana">
          <option value={0}>Esta semana</option>
          <option value={-1}>Semana passada</option>
        </select>
      </header>
      <div className="grid flex-1 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="relative h-48 sm:border-r sm:border-px-line sm:pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 16, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="evo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F4C9D6" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#F4C9D6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="dia" tickLine={false} axisLine={{ stroke: '#E8DFD0' }} padding={{ left: 14, right: 14 }} tick={{ fontSize: 12, fill: 'rgba(62,39,35,0.7)' }} />
              <Tooltip formatter={(v: number) => [`${v}%`, 'concluído']} contentStyle={{ borderRadius: 12, border: '1px solid #E8DFD0', fontSize: 12 }} />
              <Area type="monotone" dataKey="pct" connectNulls animationDuration={500} stroke="#3E2723" strokeWidth={2} fill="url(#evo)" dot={{ r: 4, fill: '#FFFDF9', stroke: '#3E2723', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
          {empty && <p className="absolute inset-0 grid place-items-center text-sm text-tinta/50">Conclua tarefas para ver sua evolução.</p>}
        </div>
        <Link to="/agenda" className="flex flex-col items-center gap-2 px-2 text-center">
          <Ring value={weekPct} size={112} stroke={8} color="#3E2723" track="#F4C9D6">
            <span className="text-2xl font-extrabold text-tinta">{Math.round(weekPct)}%</span>
          </Ring>
          <span className="text-sm leading-tight text-tinta/75"><b className="text-tinta">{done} de {week.length}</b><br />tarefas da semana</span>
        </Link>
      </div>
    </section>
  )
}

/** Faixa "Meta principal": o cofre para sair de casa. */
export function MainGoalBanner() {
  const vault = useVault()
  return (
    <section className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-[24px] bg-vinho px-6 py-6 text-creme sm:px-9">
      <div>
        <p className="text-sm text-rosa">Meta principal</p>
        <p className="text-2xl font-bold">Sair de casa</p>
      </div>
      <div className="flex min-w-[220px] flex-1 items-center gap-4 md:max-w-md">
        <Progress value={vault.progress} color="#F4C9D6" track="rgba(245,240,230,0.18)" height={8} className="flex-1" />
        <span className="text-lg font-bold">{Math.round(vault.progress)}%</span>
      </div>
      <Link to="/sair-de-casa" className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-rosa px-5 text-[15px] font-semibold text-tinta transition hover:bg-rosa-100">
        Ver plano <ArrowRight size={18} />
      </Link>
    </section>
  )
}
