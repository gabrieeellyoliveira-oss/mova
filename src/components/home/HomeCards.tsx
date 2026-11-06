import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, BookOpen, Calendar, ChevronDown, Cloud, CloudRain,
  GraduationCap, Home as HomeIcon, Layers, Sun, Wallet,
} from 'lucide-react'
import { useBooks, useFinanceSummary, useSettings, useStudyWeek, useVault } from '@/hooks/useData'
import { useWeather, weatherKind } from '@/hooks/useWeather'
import { fromISODate, today } from '@/utils/date'
import { money, ratio } from '@/utils/format'
import { cn } from '@/lib/cn'
import { FinanceTip } from '@/components/finance/FinanceTip'
import { SalaryFlow } from '@/components/finance/SalaryFlow'

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

/** Finanças: saldo atual, o salário do mês passo a passo (contas do mês passado, gastos, disponível) e a dica do mês. */
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
      <SalaryFlow />
      <FinanceTip />
    </div>
  )
}

/** Em andamento: Estudos, Leitura e Sair de casa. */
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
      <div className="grid gap-6 md:grid-cols-3">
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
