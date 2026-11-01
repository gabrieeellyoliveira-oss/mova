import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  ArrowDown, ArrowRight, ArrowUp, BarChart3, BookOpen, CalendarDays, ChevronDown, Cloud, CloudRain, GraduationCap, Home as HomeIcon,
  Layers, Plus, Sun, Target, Wallet, SquareCheckBig,
} from 'lucide-react'
import gabi from '@/assets/gabi-mova.webp'
import { AREAS } from '@/data/constants'
import { useBooks, useFinanceSummary, useGoals, useSettings, useStudyWeek, useTasks, useVault } from '@/hooks/useData'
import { useWeather, weatherKind } from '@/hooks/useWeather'
import { openForm } from '@/hooks/useQuickAdd'
import { toggleTask } from '@/components/tasks/TaskItem'
import { addDays, fromISODate, startOfWeek, today, weekDays, WEEKDAYS_SHORT } from '@/utils/date'
import { money, ratio } from '@/utils/format'
import { Checkbox } from '@/components/ui/Checkbox'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/cn'

export const card = 'rounded-[24px] border border-px-line bg-white p-5 shadow-pixel sm:p-6'
const iconBox = 'grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rosa-50 text-vinho'

/** "Olá, Gabi!" com a ilustração, como na capa da referência. */
export function HeroCard() {
  const { name } = useSettings()
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(120%_120%_at_85%_10%,#F3E6F0_0%,#EADAE6_45%,#E2CFDE_100%)] p-6 shadow-pixel sm:p-9">
      {/* luz e sombra de folhas, bem sutis */}
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-white/50 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute right-[42%] top-0 h-full w-40 -skew-x-12 bg-white/20 blur-2xl" />
      <div className="relative z-10 sm:max-w-[52%]">
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-vinho/80">MOVA <span className="h-px w-10 bg-vinho/40" /></p>
        <h1 className="mt-3 text-[40px] font-extrabold leading-[1.05] tracking-tight text-vinho-900 sm:text-5xl">Olá, {name}!</h1>
        <p className="mt-3 max-w-sm text-[17px] leading-snug text-vinho-900/75">Que tal dar mais um passo em direção aos seus objetivos hoje?</p>
        <Link to="/meu-dia" className="mt-6 inline-flex h-12 items-center gap-3 rounded-full bg-vinho px-7 text-[15px] font-semibold text-white shadow-soft transition hover:bg-vinho-700 active:scale-[0.98]">
          Planejar meu dia <ArrowRight size={18} />
        </Link>
      </div>
      <img src={gabi} alt="Ilustração da Gabi no notebook com a gata" className="pointer-events-none relative -mb-6 mt-4 w-full sm:absolute sm:bottom-0 sm:right-0 sm:z-0 sm:mb-0 sm:mt-0 sm:h-[118%] sm:w-auto sm:max-w-[62%] sm:object-contain sm:object-right-bottom" />
    </section>
  )
}

/** Data de hoje + dia da semana e clima. */
export function DateWeather() {
  const nav = useNavigate()
  const w = useWeather()
  const d = fromISODate(today())
  const date = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  const weekday = d.toLocaleDateString('pt-BR', { weekday: 'long' })
  const WIcon = w ? { sol: Sun, nuvem: Cloud, chuva: CloudRain }[weatherKind(w.code)] : Sun
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button onClick={() => nav('/agenda')} className="flex items-center gap-3 rounded-2xl border border-px-line bg-white px-4 py-3 text-[15px] font-medium text-tinta shadow-pixel-sm hover:bg-rosa-50">
        <CalendarDays size={20} className="text-vinho" /> {date} <ChevronDown size={16} className="text-vinho/60" />
      </button>
      <p className="flex items-center gap-3 pr-2 text-[15px] text-tinta/80">
        <span className="first-letter:uppercase">{weekday}</span>
        {w && <span className="flex items-center gap-1.5"><WIcon size={18} className="text-vinho" /> {w.temp}°C</span>}
      </p>
    </div>
  )
}

/** Três números rápidos: metas, tarefas de hoje e foco da semana. */
export function StatTiles() {
  const goals = useGoals()
  const tasks = useTasks()
  const t = today()
  const done = goals.filter((g) => g.status === 'concluida').length
  const pct = ratio(done, goals.length)
  const pending = tasks.filter((x) => x.date === t && !x.done).length
  const focus = useMemo(() => {
    const days = new Set(weekDays(t))
    const count = new Map<string, number>()
    tasks.filter((x) => x.date && days.has(x.date) && x.area !== 'geral').forEach((x) => count.set(x.area, (count.get(x.area) ?? 0) + 1))
    const top = [...count.entries()].sort((a, b) => b[1] - a[1])[0]
    if (top) return AREAS[top[0] as keyof typeof AREAS]?.label ?? '—'
    const main = goals.filter((g) => g.status !== 'concluida').sort((a, b) => (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999'))[0]
    return main?.category ?? '—'
  }, [tasks, goals, t])
  const tile = 'flex min-h-[148px] min-w-0 flex-col rounded-[22px] border border-px-line bg-white p-4 shadow-pixel sm:p-5'
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <Link to="/metas" className={cn(tile, 'hover:shadow-lift')}>
        <Target size={30} strokeWidth={1.6} className="text-vinho" />
        <p className="mt-2 text-sm font-semibold text-tinta">Metas</p>
        <p className="text-tinta"><span className="text-3xl font-extrabold">{done}</span> <span className="text-sm">de {goals.length}</span></p>
        <div className="mt-auto flex items-center gap-2 pt-2"><Progress value={pct} height={6} className="flex-1" /><span className="text-xs font-semibold text-vinho">{Math.round(pct)}%</span></div>
      </Link>
      <Link to="/agenda" className={cn(tile, 'hover:shadow-lift')}>
        <SquareCheckBig size={30} strokeWidth={1.6} className="text-vinho" />
        <p className="mt-2 text-sm font-semibold text-tinta">Tarefas hoje</p>
        <p className="text-3xl font-extrabold text-tinta">{pending}</p>
        <p className="text-sm text-tinta/70">{pending === 1 ? 'pendente' : 'pendentes'}</p>
      </Link>
      <div className={cn(tile, 'bg-gradient-to-br from-rosa-50 to-rosa-100')}>
        <BarChart3 size={30} strokeWidth={1.6} className="text-vinho" />
        <p className="mt-2 text-sm font-semibold text-tinta">Foco da semana</p>
        <p className="mt-auto break-words text-lg font-extrabold leading-tight text-vinho-900 sm:text-2xl">{focus}</p>
      </div>
    </div>
  )
}

/** Meu dia: tarefas de hoje com checkbox. */
export function MyDayCard() {
  const tasks = useTasks()
  const t = today()
  const list = tasks.filter((x) => x.date === t).sort((a, b) => Number(a.done) - Number(b.done) || a.order - b.order)
  const label = fromISODate(t).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  return (
    <section className={cn(card, 'flex flex-col')}>
      <header className="mb-4 flex items-start gap-3">
        <span className={iconBox}><CalendarDays size={22} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-tinta">Meu dia</h2>
          <p className="text-sm text-tinta/60 first-letter:uppercase">{label}</p>
        </div>
        <button onClick={() => openForm('task', { date: t })} className="grid h-10 w-10 place-items-center rounded-full bg-rosa-50 text-vinho hover:bg-rosa-100" aria-label="Nova tarefa para hoje"><Plus size={20} /></button>
      </header>
      {list.length === 0 ? (
        <p className="my-auto py-6 text-center text-sm text-tinta/60">Nada marcado para hoje. Toque no + para adicionar.</p>
      ) : (
        <ul className="divide-y divide-px-line">
          {list.slice(0, 6).map((task) => (
            <li key={task.id} className="flex items-center gap-3 py-2.5">
              <Checkbox checked={task.done} onChange={() => toggleTask(task)} label={task.title} size={22} />
              <button onClick={() => openForm('task', task as never)} className={cn('min-w-0 flex-1 truncate text-left text-[15px]', task.done ? 'text-tinta/45 line-through' : 'text-tinta')}>{task.title}</button>
            </li>
          ))}
        </ul>
      )}
      {list.length > 6 && <Link to="/agenda" className="mt-2 text-sm font-semibold text-vinho hover:underline">+ {list.length - 6} na agenda</Link>}
    </section>
  )
}

/** Evolução da semana: % das tarefas concluídas em cada dia. */
export function WeekChart() {
  const tasks = useTasks()
  const [offset, setOffset] = useState(0)
  const data = useMemo(() => {
    const start = addDays(startOfWeek(today()), offset * 7)
    return weekDays(start).map((d, i) => {
      const dayTasks = tasks.filter((x) => x.date === d)
      return { dia: WEEKDAYS_SHORT[i].charAt(0) + WEEKDAYS_SHORT[i].slice(1).toLowerCase(), pct: dayTasks.length ? Math.round(ratio(dayTasks.filter((x) => x.done).length, dayTasks.length)) : null }
    })
  }, [tasks, offset])
  const empty = data.every((d) => d.pct === null)
  return (
    <section className={cn(card, 'flex flex-col')}>
      <header className="mb-2 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 text-xl font-bold text-tinta"><BarChart3 size={26} className="text-vinho" /> Evolução da semana</h2>
        <select value={offset} onChange={(e) => setOffset(Number(e.target.value))} className="h-9 rounded-full border border-px-line bg-white px-3 text-sm text-tinta focus:outline-none" aria-label="Escolher semana">
          <option value={0}>Esta semana</option>
          <option value={-1}>Semana passada</option>
        </select>
      </header>
      <div className="relative -ml-3 mt-2 h-48 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="evo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B58AA8" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#B58AA8" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#EFE6EE" />
            <XAxis dataKey="dia" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#2B1A26' }} />
            <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} width={44} tick={{ fontSize: 12, fill: '#2B1A26' }} />
            <Tooltip formatter={(v: number) => [`${v}%`, 'concluído']} contentStyle={{ borderRadius: 12, border: '1px solid #EDE4EB', fontSize: 12 }} />
            <Area type="monotone" dataKey="pct" connectNulls animationDuration={500} stroke="#5B2448" strokeWidth={2.5} fill="url(#evo)" dot={{ r: 4, fill: '#fff', stroke: '#5B2448', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
        {empty && <p className="absolute inset-0 grid place-items-center text-sm text-tinta/50">Conclua tarefas para ver sua evolução.</p>}
      </div>
    </section>
  )
}

/** Finanças: saldo, receitas e despesas do mês. */
export function FinanceCard() {
  const s = useFinanceSummary()
  return (
    <section className={cn(card, 'flex flex-col')}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 text-xl font-bold text-tinta"><Wallet size={26} className="text-vinho" /> Finanças</h2>
        <Link to="/financas" className="grid h-9 w-9 place-items-center rounded-full bg-rosa-50 text-vinho hover:bg-rosa-100" aria-label="Abrir finanças"><ArrowRight size={18} /></Link>
      </header>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-sm text-tinta/70">Saldo atual</p>
          <p className="text-[32px] font-extrabold leading-tight tracking-tight text-tinta">{money(s.balance)}</p>
        </div>
        <div aria-hidden className="mb-2 flex items-end gap-1.5">
          {[14, 22, 30, 40].map((h, i) => <span key={i} className="w-2.5 rounded-full bg-queimado/60" style={{ height: h, opacity: 0.4 + i * 0.2 }} />)}
        </div>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-3 pt-5">
        <div className="flex items-center gap-3 rounded-2xl bg-oliva-100/70 p-3.5">
          <ArrowUp size={20} className="shrink-0 text-oliva-600" />
          <div className="min-w-0"><p className="text-sm text-tinta/70">Receitas</p><p className="truncate font-bold text-tinta">{money(s.income)}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-pastel-pink/70 p-3.5">
          <ArrowDown size={20} className="shrink-0 text-[#C0466A]" />
          <div className="min-w-0"><p className="text-sm text-tinta/70">Despesas</p><p className="truncate font-bold text-tinta">{money(s.expenses)}</p></div>
        </div>
      </div>
    </section>
  )
}

/** "Em andamento": estudos, leitura e cofre da mudança. */
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
      <h2 className="mb-4 flex items-center gap-3 text-xl font-bold text-tinta"><Layers size={24} className="text-vinho" /> Em andamento</h2>
      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.6fr)]">
        {items.map(({ label, icon: I, value, to }) => (
          <Link key={label} to={to} className={cn(card, 'group flex flex-col gap-2 hover:shadow-lift')}>
            <div className="flex items-start justify-between">
              <I size={30} strokeWidth={1.6} className="text-vinho" />
              <span className="grid h-9 w-9 place-items-center rounded-full bg-rosa-50 text-vinho transition group-hover:translate-x-0.5"><ArrowRight size={17} /></span>
            </div>
            <p className="mt-1 text-lg font-bold text-tinta">{label}</p>
            <p className="text-sm font-semibold text-tinta/70">{Math.round(value)}%</p>
            <Progress value={value} height={8} className="mt-auto" />
          </Link>
        ))}
        <QuoteCard className="sm:col-span-3 xl:col-span-1" />
      </div>
    </section>
  )
}

function Mug() {
  return (
    <svg viewBox="0 0 140 120" className="h-full w-full" aria-hidden>
      <ellipse cx="70" cy="110" rx="58" ry="7" fill="#2A1022" opacity="0.25" />
      <rect x="6" y="88" width="96" height="16" rx="3" fill="#F3E6F0" />
      <rect x="10" y="80" width="88" height="10" rx="2" fill="#B58AA8" />
      <path d="M48 22h52v58a14 14 0 0 1-14 14H62a14 14 0 0 1-14-14V22z" fill="#6E2E58" />
      <path d="M100 36h8a14 14 0 0 1 0 28h-8" fill="none" stroke="#6E2E58" strokeWidth="8" />
      <ellipse cx="74" cy="22" rx="26" ry="5" fill="#4A1C3B" />
      <text x="74" y="66" textAnchor="middle" fontFamily="DM Sans Variable, sans-serif" fontWeight="800" fontSize="22" fill="#E9D7E5">M</text>
    </svg>
  )
}

/** Frase da semana com a caneca do MOVA. */
export function QuoteCard({ className }: { className?: string }) {
  return (
    <div className={cn('relative flex min-h-[170px] items-center overflow-hidden rounded-[24px] bg-[linear-gradient(120deg,#6E2E58_0%,#8E5A80_55%,#C9A7BF_100%)] p-6 shadow-pixel', className)}>
      <div aria-hidden className="pointer-events-none absolute -right-6 -top-10 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
      <p className="relative z-10 max-w-[62%] text-2xl font-light italic leading-snug text-white sm:text-[26px]">
        <span className="mr-1 text-4xl font-bold not-italic leading-none">“</span>Disciplina hoje, liberdade amanhã.
      </p>
      <div className="absolute bottom-3 right-4 h-28 w-32 sm:h-32 sm:w-36"><Mug /></div>
    </div>
  )
}
