import { workSettingsStore } from '@/store/db'
import { useWorkSettings } from '@/hooks/useProjects'
import { WEEKDAYS_SHORT } from '@/utils/date'
import { cn } from '@/lib/cn'

/** Dias em que a Gabi trabalha — base do ritmo e do "por dia útil" dos projetos. */
export function WorkDaysPicker() {
  const { workDays } = useWorkSettings()
  const toggle = (i: number) => {
    const next = workDays.includes(i) ? workDays.filter((d) => d !== i) : [...workDays, i].sort()
    if (next.length) workSettingsStore.set((s) => ({ ...s, workDays: next }))
  }
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Dias que eu trabalho">
      <span className="text-sm font-semibold text-tinta/70">Dias úteis</span>
      <div className="inline-flex rounded-full bg-rosa-100 p-1">
        {WEEKDAYS_SHORT.map((d, i) => (
          <button key={d} type="button" aria-pressed={workDays.includes(i)} onClick={() => toggle(i)}
            className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold transition', workDays.includes(i) ? 'bg-vinho text-white' : 'text-vinho/50 hover:text-vinho')}>
            {d}
          </button>
        ))}
      </div>
    </div>
  )
}
