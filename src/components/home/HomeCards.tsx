import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, BookOpen, Calendar, ChevronDown, Cloud, CloudRain,
  GraduationCap, Home as HomeIcon, Layers, Sun,
} from 'lucide-react'
import { useBooks, useIncome, useSettings, useStudyWeek, useVault } from '@/hooks/useData'
import { useWeather, weatherKind } from '@/hooks/useWeather'
import { fromISODate, today } from '@/utils/date'
import { money, ratio } from '@/utils/format'
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

/** Capa escura: "Olá, Gabi!", o convite, a data e o clima (sem ilustração, a pedido da Gabi). */
export function HeroCard() {
  const { name } = useSettings()
  return (
    <div className="flex flex-col gap-6 rounded-[2rem] border-2 border-ink bg-ink p-7 text-ink-fg sm:p-10 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.3em] text-lavanda">mova*</p>
        <h1 className="mt-3 font-serif text-5xl font-extrabold leading-none">Olá, {name}!</h1>
        <p className="mt-4 text-ink-fg/80">Que tal dar mais um passo em direção aos seus objetivos hoje?</p>
        <Link to="/agenda" className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-lavanda px-6 py-3 font-semibold text-ink transition hover:brightness-105">
          Planejar meu dia <ArrowRight size={16} />
        </Link>
      </div>
      <DateWeather />
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
    <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-end">
      <Link to="/agenda" className="flex items-center gap-2 rounded-full border-2 border-ink-fg/80 px-4 py-2 text-sm font-medium text-ink-fg transition hover:bg-ink-fg/10">
        <Calendar size={16} /> {date} <ChevronDown size={16} />
      </Link>
      <span className="flex items-center gap-1.5 text-sm text-ink-fg/70">
        {weekday} {w && <><WIcon size={16} /> {w.temp}°C</>}
      </span>
    </div>
  )
}

/** Sair de casa: quanto já tem no cofre, a parcela do mês e se está no ritmo (a aba de Finanças foi removida). */
export function VaultCard() {
  const v = useVault()
  const inc = useIncome()
  const need = v.neededPerMonth
  const done = v.remaining <= 0 && v.target > 0
  const status = done ? { label: 'Meta batida', cls: 'bg-salvia' } : v.onTrack === null ? { label: 'Defina a data', cls: 'bg-lavanda-100' } : v.onTrack ? { label: 'No ritmo', cls: 'bg-salvia' } : { label: 'Fora do ritmo', cls: 'bg-[#F6D6DC] text-cereja' }
  const parcelLeft = need ? Math.max(0, need - Math.max(0, v.thisMonth)) : 0
  const r0 = (n: number) => money(Math.round(n)).replace(',00', '')
  return (
    <div className={card}>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-serif text-xl font-bold"><HomeIcon size={20} /> Sair de casa</h2>
        <IconBtn label="Abrir Sair de casa" to="/sair-de-casa"><ArrowRight size={16} /></IconBtn>
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-tinta/60">No cofre</p>
          <p className="font-serif text-4xl font-bold">{money(v.saved)}</p>
          <p className="text-sm text-tinta/60">de {r0(v.target)} · {Math.round(v.progress)}%</p>
        </div>
        <span className={cn('rounded-full border-2 border-ink px-3 py-1 text-sm font-semibold', status.cls)}>{status.label}</span>
      </div>
      <Bar value={v.progress} className="mt-4 bg-nevoa" />
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-ink bg-lavanda-100 px-4 py-3">
          <p className="text-xs text-tinta/60">Guardar por mês</p>
          <p className="font-serif text-xl font-bold">{need !== null ? r0(need) : '—'}</p>
          <p className="text-xs text-tinta/55">{need !== null && inc.total ? `${Math.round((need / inc.total) * 100)}% de salário + VA` : 'defina a data meta'}</p>
        </div>
        <div className="rounded-2xl border-2 border-ink bg-salvia/50 px-4 py-3">
          <p className="text-xs text-tinta/60">Neste mês</p>
          <p className="font-serif text-xl font-bold">{r0(Math.max(0, v.thisMonth))}</p>
          <p className="text-xs text-tinta/55">{need ? (parcelLeft > 0 ? `faltam ${r0(parcelLeft)}` : 'parcela batida ✓') : 'guardado no mês'}</p>
        </div>
      </div>
    </div>
  )
}

/** Em andamento: Estudos e Leitura (Sair de casa tem o card próprio acima). */
export function InProgress() {
  const study = useStudyWeek()
  const book = useBooks().find((b) => b.status === 'lendo')
  const items = [
    { label: 'Estudos', icon: GraduationCap, value: study.progress, to: '/estudos' },
    { label: 'Leitura', icon: BookOpen, value: book ? ratio(book.currentPage, book.pages) : 0, to: '/leitura' },
  ]
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 font-serif text-2xl font-bold"><Layers size={20} /> Em andamento</h2>
      <div className="grid gap-6 md:grid-cols-2">
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
      </div>
    </section>
  )
}
