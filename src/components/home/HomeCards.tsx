import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDown, ArrowRight, ArrowUp, BarChart3, BookOpen, Calendar, CheckSquare, ChevronDown, Cloud, CloudRain,
  GraduationCap, Home as HomeIcon, Layers, Plus, Sun, Target, Wallet,
} from 'lucide-react'
import { AREAS } from '@/data/constants'
import { useBooks, useFinanceSummary, useGoals, useSettings, useStudyWeek, useTasks, useVault } from '@/hooks/useData'
import { useWeather, weatherKind } from '@/hooks/useWeather'
import { openForm } from '@/hooks/useQuickAdd'
import { toggleTask } from '@/components/tasks/TaskItem'
import { fromISODate, today, weekDays, WEEKDAYS_SHORT } from '@/utils/date'
import { money, ratio } from '@/utils/format'
import { Checkbox } from '@/components/ui/Checkbox'
import { Logo } from '@/components/layout/Logo'
import { cn } from '@/lib/cn'

/** Card padrão do projeto de referência: creme, borda de 2px em tinta e sombra deslocada. */
export const card = 'min-w-0 rounded-3xl border-2 border-ink bg-quente p-6 shadow-pixel'

function IconBtn({ children, label, onClick, to }: { children: ReactNode; label: string; onClick?: () => void; to?: string }) {
  const cls = 'grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-quente text-ink transition hover:bg-lavanda'
  if (to) return <Link to={to} className={cls} aria-label={label}>{children}</Link>
  return <button type="button" onClick={onClick} className={cls} aria-label={label}>{children}</button>
}

/** Barra fina com contorno em tinta. */
function Bar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-2 overflow-hidden rounded-full border border-ink bg-quente', className)} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-ink transition-[width] duration-700" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

/** Capa escura: "Olá, Gabi!" e o convite (sem ilustração, a pedido da Gabi). */
export function HeroCard() {
  const { name } = useSettings()
  return (
    <div className="flex overflow-hidden rounded-[2rem] border-2 border-ink bg-ink text-ink-fg">
      <div className="flex flex-col justify-center p-7 sm:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-lavanda">mova*</p>
        <h1 className="mt-3 font-serif text-5xl font-extrabold leading-none">Olá, {name}!</h1>
        <p className="mt-4 max-w-xs text-ink-fg/80">Que tal dar mais um passo em direção aos seus objetivos hoje?</p>
        <Link to="/agenda" className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-lavanda px-6 py-3 font-semibold text-ink transition hover:brightness-105">
          Planejar meu dia <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}

/** Data de hoje e o clima de Fortaleza. */
export function DateWeather() {
  const w = useWeather()
  const d = fromISODate(today())
  const date = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  const wd = d.toLocaleDateString('pt-BR', { weekday: 'long' }).replace('-feira', '')
  const weekday = wd.charAt(0).toUpperCase() + wd.slice(1)
  const kind = w ? weatherKind(w.code) : null
  const WIcon = kind === 'sol' ? Sun : kind === 'chuva' ? CloudRain : Cloud
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link to="/agenda" className="flex items-center gap-2 rounded-full border-2 border-ink bg-quente px-4 py-2 text-sm font-medium text-ink">
        <Calendar size={16} /> {date} <ChevronDown size={16} />
      </Link>
      <span className="flex items-center gap-1.5 text-sm text-tinta/60">
        {weekday} {w && <><WIcon size={16} /> {w.temp}°C</>}
      </span>
    </div>
  )
}

/** Três blocos: metas, tarefas de hoje e foco da semana. */
export function StatTiles() {
  const goals = useGoals()
  const tasks = useTasks()
  const t = today()
  const done = goals.filter((g) => g.status === 'concluida').length
  const pending = tasks.filter((x) => x.date === t && !x.done).length
  const focus = useMemo(() => {
    const days = new Set(weekDays(t))
    const count = new Map<string, number>()
    tasks.filter((x) => x.date && days.has(x.date) && x.area !== 'geral').forEach((x) => count.set(x.area, (count.get(x.area) ?? 0) + 1))
    const top = [...count.entries()].sort((a, b) => b[1] - a[1])[0]
    return top ? AREAS[top[0] as keyof typeof AREAS]?.label ?? '—' : '—'
  }, [tasks, t])
  const tile = 'min-w-0 rounded-3xl border-2 border-ink p-3 shadow-pixel sm:p-4'
  return (
    <div className="grid flex-1 grid-cols-3 gap-3 sm:gap-4">
      <div className={cn(tile, 'bg-lavanda')}>
        <Target size={24} />
        <p className="mt-3 text-xs font-medium sm:text-sm">Metas</p>
        <p className="font-serif text-3xl font-bold">{done} <span className="font-sans text-sm font-normal">de {goals.length}</span></p>
        <Bar value={ratio(done, goals.length)} className="mt-2" />
      </div>
      <Link to="/agenda" className={cn(tile, 'bg-salvia')}>
        <CheckSquare size={24} />
        <p className="mt-3 text-xs font-medium sm:text-sm">Tarefas hoje</p>
        <p className="font-serif text-3xl font-bold">{pending}</p>
        <p className="text-xs">{pending === 1 ? 'pendente' : 'pendentes'}</p>
      </Link>
      <div className={cn(tile, 'bg-px-gold-soft')}>
        <BarChart3 size={24} />
        <p className="mt-3 text-xs font-medium sm:text-sm">Foco da semana</p>
        <p className="mt-2 font-serif text-base font-bold leading-tight text-cereja [overflow-wrap:anywhere] sm:text-2xl">{focus}</p>
      </div>
    </div>
  )
}

/** Meu dia: tarefas de hoje com caixa de marcar. */
export function MyDayCard() {
  const tasks = useTasks()
  const t = today()
  const list = tasks.filter((x) => x.date === t).sort((a, b) => Number(a.done) - Number(b.done) || a.order - b.order)
  const raw = fromISODate(t).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).replace('-feira', '')
  const label = raw.charAt(0).toUpperCase() + raw.slice(1)
  return (
    <div className={cn(card, 'flex flex-col')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-lavanda"><Calendar size={20} /></span>
          <div className="min-w-0">
            <h2 className="font-serif text-xl font-bold">Meu dia</h2>
            <p className="text-xs text-tinta/60">{label}</p>
          </div>
        </div>
        <IconBtn label="Nova tarefa para hoje" onClick={() => openForm('task', { date: t })}><Plus size={16} /></IconBtn>
      </div>
      {list.length === 0 ? (
        <p className="my-auto pt-12 text-center text-sm text-tinta/60">Nada marcado para hoje. Toque no + para adicionar.</p>
      ) : (
        <ul className="mt-4 space-y-1">
          {list.slice(0, 5).map((task) => (
            <li key={task.id} className="flex items-center gap-3 py-1.5">
              <Checkbox checked={task.done} onChange={() => toggleTask(task)} label={task.title} size={20} />
              <button onClick={() => openForm('task', task as never)} className={cn('min-w-0 flex-1 truncate text-left text-sm', task.done ? 'text-tinta/45 line-through' : 'text-tinta')}>{task.title}</button>
            </li>
          ))}
          {list.length > 5 && <li><Link to="/agenda" className="text-xs font-semibold underline underline-offset-4">+ {list.length - 5} na agenda</Link></li>}
        </ul>
      )}
    </div>
  )
}

/** Evolução da semana: uma coluna por dia com o % de tarefas concluídas. */
export function WeekChart() {
  const tasks = useTasks()
  const data = useMemo(() => weekDays(today()).map((d, i) => {
    const day = tasks.filter((x) => x.date === d)
    return { dia: WEEKDAYS_SHORT[i].charAt(0) + WEEKDAYS_SHORT[i].slice(1).toLowerCase(), pct: day.length ? Math.round(ratio(day.filter((x) => x.done).length, day.length)) : null }
  }), [tasks])
  const empty = data.every((d) => !d.pct)
  return (
    <div className={card}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-serif text-xl font-bold"><BarChart3 size={20} /> Evolução da semana</h2>
        <span className="shrink-0 rounded-full border-2 border-ink px-3 py-1 text-xs">Esta semana</span>
      </div>
      <div className="mt-6 flex h-32 items-end justify-between gap-2">
        {data.map(({ dia, pct }) => (
          <div key={dia} className="flex flex-1 flex-col items-center gap-2" title={pct === null ? 'Sem tarefas' : `${pct}% concluído`}>
            <div className="relative h-24 w-full rounded-xl border-2 border-dashed border-ink/25">
              {!!pct && <div className="absolute inset-x-[-2px] bottom-[-2px] rounded-xl border-2 border-ink bg-lavanda" style={{ height: `calc(${pct}% + 2px)` }} />}
            </div>
            <span className="text-xs text-tinta/60">{dia}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-tinta/60">{empty ? 'Conclua tarefas para ver sua evolução.' : '% das tarefas concluídas em cada dia.'}</p>
    </div>
  )
}

/** Finanças: saldo atual e o mês em receitas/despesas. */
export function FinanceCard() {
  const f = useFinanceSummary()
  return (
    <div className={card}>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-serif text-xl font-bold"><Wallet size={20} /> Finanças</h2>
        <IconBtn label="Abrir finanças" to="/financas"><ArrowRight size={16} /></IconBtn>
      </div>
      <p className="mt-4 text-xs text-tinta/60">Saldo atual</p>
      <p className="font-serif text-4xl font-bold text-cereja">{money(f.balance)}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-ink bg-salvia p-3">
          <p className="flex items-center gap-1 text-xs"><ArrowUp size={12} /> Receitas</p>
          <p className="font-bold">{money(f.income)}</p>
        </div>
        <div className="rounded-2xl border-2 border-ink bg-lavanda p-3">
          <p className="flex items-center gap-1 text-xs"><ArrowDown size={12} /> Despesas</p>
          <p className="font-bold">{money(f.expenses)}</p>
        </div>
      </div>
    </div>
  )
}

/** Em andamento: Estudos, Leitura e Sair de casa + a frase. */
export function InProgress() {
  const study = useStudyWeek()
  const book = useBooks().find((b) => b.status === 'lendo')
  const vault = useVault()
  const items = [
    { label: 'Estudos', icon: GraduationCap, value: study.progress, to: '/estudos' },
    { label: 'Leitura', icon: BookOpen, value: book ? ratio(book.currentPage, book.pages) : 0, to: '/leitura' },
    { label: 'Sair de casa', icon: HomeIcon, value: vault.progress, to: '/sair-de-casa' },
  ]
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 font-serif text-2xl font-bold"><Layers size={20} /> Em andamento</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {items.map(({ label, icon: I, value, to }) => (
          <Link key={label} to={to} className={cn(card, 'group block transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-lift')}>
            <div className="flex items-center justify-between">
              <I size={24} />
              <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-quente transition group-hover:bg-lavanda"><ArrowRight size={16} /></span>
            </div>
            <p className="mt-4 font-serif text-xl font-bold">{label}</p>
            <p className="text-sm text-tinta/60">{Math.round(value)}%</p>
            <Bar value={value} className="mt-3 bg-nevoa" />
          </Link>
        ))}
        <div className="flex flex-col justify-between rounded-3xl border-2 border-ink bg-ink p-6 text-ink-fg shadow-lavanda">
          <p className="font-serif text-2xl italic leading-snug">“Disciplina hoje, liberdade amanhã.”</p>
          <Logo light className="mt-6 !text-xl" />
        </div>
      </div>
    </section>
  )
}
