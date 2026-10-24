import { workSettingsStore } from '@/store/db'
import { useWorkSettings } from '@/hooks/useWork'
import type { WorkUnit } from '@/types'
import { WEEKDAYS_SHORT } from '@/utils/date'
import { Field, Input } from '@/components/ui/Form'
import { Chip, Segmented } from '@/components/ui/Chip'

export function WorkSettingsCard() {
  const s = useWorkSettings()
  const set = (patch: Partial<typeof s>) => workSettingsStore.set((p) => ({ ...p, ...patch }))
  const toggleDay = (d: number) => {
    const days = s.workDays.includes(d) ? s.workDays.filter((x) => x !== d) : [...s.workDays, d].sort()
    if (days.length) set({ workDays: days })
  }
  return (
    <div className="space-y-4">
      <Field label="O que você mede">
        <Input value={s.metricName} onChange={(e) => set({ metricName: e.target.value || 'Resultado' })} placeholder="Vendas, clientes, contratos…" />
      </Field>
      <Field label="A meta é em">
        <Segmented<WorkUnit> value={s.unit} onChange={(unit) => set({ unit })} options={[{ value: 'moeda', label: 'Dinheiro (R$)' }, { value: 'numero', label: 'Quantidade' }]} />
      </Field>
      <Field label="Dias que eu trabalho" hint="Usados para calcular o ritmo e quanto fazer por dia.">
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAYS_SHORT.map((d, i) => <Chip key={d} active={s.workDays.includes(i)} onClick={() => toggleDay(i)}>{d}</Chip>)}
        </div>
      </Field>
    </div>
  )
}
