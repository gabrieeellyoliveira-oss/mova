import type { Habit } from '@/types'
import { WEEKDAYS_MINI, fromISODate, monthMatrix, today } from '@/utils/date'
import { toggleHabit } from './habitActions'
import { cn } from '@/lib/cn'

export function MonthGrid({ habit, year, month }: { habit: Habit; year: number; month: number }) {
  const weeks = monthMatrix(year, month)
  const t = today()
  const days = weeks.flat().filter(Boolean) as string[]
  const done = days.filter((d) => habit.log.includes(d)).length
  const elapsed = days.filter((d) => d <= t).length
  return (
    <div className="rounded-3xl border border-vinho/[0.06] bg-quente p-4 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">{habit.emoji}</span>
        <p className="flex-1 truncate text-sm font-bold text-vinho">{habit.name}</p>
        <span className="text-xs font-bold" style={{ color: habit.color }}>{done}/{elapsed || days.length}</span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS_MINI.map((w, i) => <span key={i} className="text-center text-[9px] font-bold text-vinho/35">{w}</span>)}
        {weeks.flat().map((d, i) =>
          d ? (
            <button
              key={d}
              disabled={d > t}
              onClick={() => toggleHabit(habit, d)}
              title={d}
              className={cn('aspect-square rounded-md text-[9px] font-semibold transition hover:scale-110 disabled:opacity-30', d === t && 'ring-2 ring-cereja ring-offset-1', habit.log.includes(d) ? 'text-quente' : 'bg-creme-200 text-vinho/40')}
              style={habit.log.includes(d) ? { backgroundColor: habit.color } : undefined}
            >
              {fromISODate(d).getDate()}
            </button>
          ) : <span key={i} />,
        )}
      </div>
    </div>
  )
}
