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
      <span className="font-pixel text-[13px] font-semibold uppercase tracking-wide text-vinho/80">Dias úteis</span>
      <div className="inline-flex rounded-lg border-2 border-px-line bg-vinho-800 p-0.5">
        {WEEKDAYS_SHORT.map((d, i) => (
          <button key={d} type="button" aria-pressed={workDays.includes(i)} onClick={() => toggle(i)}
            className={cn('rounded-md px-2 py-1 text-[11px] font-bold transition', workDays.includes(i) ? 'bg-rosa text-vinho' : 'text-rosa-50/60 hover:text-rosa-50')}>
            {d}
          </button>
        ))}
      </div>
    </div>
  )
}
