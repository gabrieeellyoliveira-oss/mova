import { ArrowDownRight, Plus } from 'lucide-react'
import { vaultSettingsStore } from '@/store/db'
import { useVault } from '@/hooks/useData'
import { openForm } from '@/hooks/useQuickAdd'
import { money } from '@/utils/format'
import { Ring } from '@/components/ui/Progress'
import { Button } from '@/components/ui/Button'

const monthYear = (d: Date) => d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

export function VaultHero() {
  const v = useVault()
  const done = v.remaining <= 0
  return (
    <section className="relative overflow-hidden rounded-px border-2 border-px-line bg-vinho p-6 text-rosa-50 shadow-pixel sm:p-8">
      <div className="grid items-center gap-8 lg:grid-cols-[auto_minmax(0,1fr)]">
        <div className="flex flex-col items-center gap-5 sm:flex-row lg:flex-col xl:flex-row">
          <Ring value={v.progress} size={190} stroke={14} color="#C3AEEC" track="rgba(239,175,179,0.16)">
            <div className="text-center">
              <p className="text-5xl font-extrabold tracking-tight">{Math.round(v.progress)}%</p>
              <p className="text-xs text-rosa-50/70">da meta</p>
            </div>
          </Ring>
          <div className="text-center sm:text-left lg:text-center xl:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-rosa">No cofre</p>
            <p className="text-4xl font-extrabold tracking-tight sm:text-5xl">{money(v.saved)}</p>
            <p className="mt-1 text-sm text-rosa-50/80">de {money(v.target)}</p>
            <p className="mt-3 text-base font-semibold text-rosa">{done ? 'Meta batida! Hora de procurar a casa nova 🔑' : `Faltam ${money(v.remaining)}`}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start lg:justify-center xl:justify-start">
              <Button variant="light" onClick={() => openForm('deposit', { type: 'deposito' })}><Plus size={16} strokeWidth={2.6} /> Guardar</Button>
              <Button variant="ghost" className="text-rosa-50 hover:bg-quente/10" onClick={() => openForm('deposit', { type: 'retirada' })}><ArrowDownRight size={16} /> Retirar</Button>
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-black/25 bg-vinho-900/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-rosa-50/70">Guardado este mês</p>
            <p className="mt-1 text-2xl font-extrabold">{money(v.thisMonth)}</p>
          </div>
          <div className="rounded-lg border-2 border-black/25 bg-vinho-900/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-rosa-50/70">Média por mês</p>
            <p className="mt-1 text-2xl font-extrabold">{money(v.monthlyAvg)}</p>
            <p className="text-xs text-rosa-50/60">últimos {Math.min(6, v.months.length)} meses</p>
          </div>
          <div className="rounded-lg border-2 border-black/25 bg-vinho-900/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-rosa-50/70">No ritmo atual, chego lá em</p>
            <p className="mt-1 text-2xl font-extrabold first-letter:uppercase">
              {done ? 'já cheguei!' : v.forecast ? monthYear(v.forecast) : '—'}
            </p>
            {!done && v.monthsToGoal !== null && <p className="text-xs text-rosa-50/60">daqui a {v.monthsToGoal} {v.monthsToGoal === 1 ? 'mês' : 'meses'}</p>}
            {!done && v.monthsToGoal === null && <p className="text-xs text-rosa-50/60">guarde um valor para ver a previsão</p>}
          </div>
          <div className="rounded-lg border-2 border-black/25 bg-rosa p-4 text-vinho">
            <label htmlFor="vault-target-date" className="text-xs font-semibold uppercase tracking-wide text-vinho/70">Quero sair de casa até</label>
            <input
              id="vault-target-date"
              type="date"
              value={v.settings.targetDate ?? ''}
              onChange={(e) => vaultSettingsStore.set((p) => ({ ...p, targetDate: e.target.value || undefined }))}
              className="mt-1 block w-full rounded-xl border border-vinho/15 bg-quente/70 px-2 py-1 text-sm font-semibold focus:outline-none"
            />
            {v.neededPerMonth !== null && !done && (
              <p className="mt-2 text-sm">Guardar <b>{money(v.neededPerMonth)}</b> por mês ({v.monthsLeft} {v.monthsLeft === 1 ? 'mês' : 'meses'})</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
