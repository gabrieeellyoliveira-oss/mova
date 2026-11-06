import { Link } from 'react-router-dom'
import { monthKey, today } from '@/utils/date'
import { money } from '@/utils/format'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/cn'
import { useMonthFlow } from './useMonthFlow'
import { lessonOfDay } from './FinanceTip'

const short = (m: string) => new Date(Number(m.slice(0, 4)), Number(m.slice(5, 7)) - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })

/** O mês na Visão geral, com a mesma conta de Finanças: recebi − contas do mês passado = sobrou; − gastos = disponível. */
export function SalaryFlow() {
  const f = useMonthFlow(monthKey(today()))
  const used = f.leftover > 0 ? Math.min(100, ((f.spent + Math.max(0, f.saved)) / f.leftover) * 100) : 100
  const row = (label: string, value: number, strong = false) => (
    <li className={cn('flex justify-between gap-3', strong ? 'border-t border-ink/15 pt-1.5 font-semibold text-tinta' : 'text-tinta/70')}><span>{label}</span><span className="tabular-nums">{money(value)}</span></li>
  )
  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-2xl border-2 border-ink bg-lavanda-100 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-tinta/60">Disponível agora</p>
        <p className={cn('font-serif text-4xl font-bold', f.available < 0 && 'text-cereja')}>{money(f.available)}</p>
        <Progress value={used} height={6} className="mt-2" color={used > 90 ? '#702335' : '#0C0A0E'} />
        <ul className="mt-3 space-y-1 text-sm">
          {row(f.salaryEstimate ? 'Recebi (salário previsto)' : 'Recebi', f.received)}
          {row(`− Contas de ${short(f.prev)}${f.billsPending ? ' (falta pagar parte)' : ''}`, f.bills)}
          {row('Sobrou', f.leftover, true)}
          {row(`− Gastos de ${short(f.month)}`, f.spent)}
          {f.saved !== 0 && row('− Guardado no cofre', f.saved)}
        </ul>
        <p className="mt-2 text-xs text-tinta/55">Vale-alimentação à parte: {money(f.vaLeft)} · <Link to="/financas" className="font-semibold underline underline-offset-2">atualizar em Finanças</Link></p>
      </div>
      <p className="text-xs leading-snug text-tinta/65"><b className="text-tinta">💡 Ensinamento:</b> {lessonOfDay(f.inc.total)}</p>
    </div>
  )
}
