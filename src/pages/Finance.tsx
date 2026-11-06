import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { monthKey, today } from '@/utils/date'
import { Button } from '@/components/ui/Button'
import { MonthFlow } from '@/components/finance/MonthFlow'
import { FoodCard } from '@/components/finance/FoodCard'
import { FinanceHistory } from '@/components/finance/FinanceHistory'
import { monthName, shiftMonth } from '@/components/finance/MonthPlan'

/** Finanças: o mês em 3 passos (recebi → contas do mês passado → sobrou), o disponível, o vale e o histórico. */
export default function Finance() {
  const now = monthKey(today())
  const [month, setMonth] = useState(now)
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-full border-2 border-ink bg-quente p-1">
          <Button size="icon-sm" variant="ghost" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Mês anterior"><ChevronLeft size={16} /></Button>
          <span className="min-w-[160px] px-2 text-center font-serif text-lg font-bold first-letter:uppercase">{monthName(month)}</span>
          <Button size="icon-sm" variant="ghost" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Próximo mês"><ChevronRight size={16} /></Button>
        </div>
        {month !== now ? <Button size="sm" variant="light" onClick={() => setMonth(now)}>Voltar para o mês atual</Button> : <span className="text-sm text-tinta/60">mês atual</span>}
      </div>
      <MonthFlow key={month} month={month} />
      <FoodCard month={month} />
      <FinanceHistory current={month} onPick={(mm) => { setMonth(mm); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
    </div>
  )
}
