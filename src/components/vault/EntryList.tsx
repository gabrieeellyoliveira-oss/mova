import type { VaultEntry } from '@/types'
import { useVault } from '@/hooks/useData'
import { openForm } from '@/hooks/useQuickAdd'
import { money } from '@/utils/format'
import { formatShort } from '@/utils/date'
import { EmptyState } from '@/components/ui/Misc'
import { Coin } from '@/components/doodles/Doodles'
import { cn } from '@/lib/cn'

export const VAULT_CATEGORIES = [
  { value: 'salario', label: 'Salário', cls: 'bg-lavanda' },
  { value: 'deposito', label: 'Depósito', cls: 'bg-salvia' },
  { value: 'extra', label: 'Extra', cls: 'bg-px-gold-soft' },
] as const

export function entryChip(e: VaultEntry) {
  if (e.type !== 'deposito') return { label: 'Retirada', cls: 'bg-[#F6D6DC]' }
  return VAULT_CATEGORIES.find((c) => c.value === (e.category ?? 'deposito'))!
}

/** Histórico do cofre em cartões: categoria fixa, valor e data. */
export function EntryList() {
  const v = useVault()
  const list = [...v.entries].reverse()
  if (!list.length) return <EmptyState title="O cofre está vazio" text="Guarde o primeiro valor, qualquer quantia já conta." doodle={<Coin size={40} />} />
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {list.map((e) => {
        const chip = entryChip(e)
        const dep = e.type === 'deposito'
        return (
          <li key={e.id} className="min-w-0">
            <button onClick={() => openForm('deposit', e as never)} title={e.note} className="block w-full rounded-2xl border-2 border-ink bg-quente p-3 text-left transition hover:-translate-y-0.5 hover:shadow-pixel">
              <span className={cn('inline-block rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-semibold', chip.cls)}>{chip.label}</span>
              <span className={cn('mt-2 block font-serif text-xl font-bold tabular-nums', dep ? 'text-oliva-600' : 'text-cereja')}>{dep ? '+' : '−'}{money(e.amount)}</span>
              <span className="block text-xs text-tinta/55">{formatShort(e.date)}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
