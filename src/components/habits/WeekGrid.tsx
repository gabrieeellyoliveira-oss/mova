import { Check, Flame, Pencil } from 'lucide-react'
import type { Habit, ISODate } from '@/types'
import { WEEKDAYS_SHORT, fromISODate, today } from '@/utils/date'
import { habitStreak } from '@/hooks/useData'
import { toggleHabit } from './habitActions'
import { cn } from '@/lib/cn'

export function WeekGrid({ habits, days, onEdit }: { habits: Habit[]; days: ISODate[]; onEdit: (h: Habit) => void }) {
  const t = today()
  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[620px] border-separate border-spacing-y-1.5">
        <thead>
          <tr>
            <th className="w-[38%] pb-2 text-left text-xs font-semibold text-vinho/50">Hábito</th>
            {days.map((d, i) => (
              <th key={d} className="pb-2 text-center">
                <span className={cn('inline-flex flex-col items-center rounded-xl px-1.5 py-1 text-[10px] font-bold', d === t ? 'bg-cereja text-quente' : 'text-vinho/50')}>
                  {WEEKDAYS_SHORT[i]}<span className="text-sm">{fromISODate(d).getDate()}</span>
                </span>
              </th>
            ))}
            <th className="pb-2 text-right text-xs font-semibold text-vinho/50">Sequência</th>
          </tr>
        </thead>
        <tbody>
          {habits.map((h) => {
            const streak = habitStreak(h)
            const count = days.filter((d) => h.log.includes(d)).length
            return (
              <tr key={h.id} className="group">
                <td className="rounded-l-2xl bg-quente py-2 pl-3 pr-2">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg" style={{ backgroundColor: `${h.color}26` }}>{h.emoji}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-vinho">{h.name}</p>
                      <p className="text-[11px] text-vinho/50">{count}/{h.weeklyTarget} na semana{count >= h.weeklyTarget && ' 🌱'}</p>
                    </div>
                    <button onClick={() => onEdit(h)} className="ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-full text-vinho/40 opacity-100 hover:bg-vinho/5 sm:opacity-0 sm:group-hover:opacity-100" aria-label={`Editar ${h.name}`}><Pencil size={12} /></button>
                  </div>
                </td>
                {days.map((d) => {
                  const on = h.log.includes(d)
                  const future = d > t
                  return (
                    <td key={d} className="bg-quente text-center">
                      <button
                        disabled={future}
                        onClick={() => toggleHabit(h, d)}
                        aria-label={`${h.name} em ${d}`}
                        aria-pressed={on}
                        className={cn('mx-auto grid h-9 w-9 place-items-center rounded-full border-2 transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-30', on ? cn('animate-pop', h.color === '#EFAFB3' ? 'text-vinho' : 'text-quente') : 'border-dashed border-vinho/15')}
                        style={on ? { backgroundColor: h.color, borderColor: h.color } : undefined}
                      >
                        {on && <Check size={16} strokeWidth={3} />}
                      </button>
                    </td>
                  )
                })}
                <td className="rounded-r-2xl bg-quente pr-3 text-right">
                  {streak > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rosa-100 px-2.5 py-1 text-xs font-bold text-cereja"><Flame size={13} className="fill-queimado text-cereja" />{streak} {streak === 1 ? 'dia' : 'dias'}</span>
                  ) : (
                    <span className="text-[11px] text-vinho/45">recomeçar é movimento</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
