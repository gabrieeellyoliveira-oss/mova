import { useVault } from '@/hooks/useData'
import { openForm } from '@/hooks/useQuickAdd'
import { money } from '@/utils/format'
import { formatShort } from '@/utils/date'
import { EmptyState } from '@/components/ui/Misc'
import { Coin } from '@/components/doodles/Doodles'
import { cn } from '@/lib/cn'

export function EntryList() {
  const v = useVault()
  const list = [...v.entries].reverse()
  if (!list.length) return <EmptyState title="O cofre está vazio" text="Guarde o primeiro valor, qualquer quantia já conta." doodle={<Coin size={40} />} />
  return (
    <ul className="divide-y divide-dashed divide-vinho/10">
      {list.map((e) => (
        <li key={e.id}>
          <button onClick={() => openForm('deposit', e as never)} className="flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left transition hover:bg-creme-100">
            <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-lg font-bold', e.type === 'deposito' ? 'bg-oliva-100 text-oliva-600' : 'bg-rosa-100 text-cereja')}>
              {e.type === 'deposito' ? '+' : '−'}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-tinta">{e.note || (e.type === 'deposito' ? 'Depósito' : 'Retirada')}</span>
              <span className="block text-xs text-vinho/55">{formatShort(e.date)} · {e.type === 'deposito' ? 'guardado' : 'retirado'}</span>
            </span>
            <span className={cn('shrink-0 text-sm font-bold tabular-nums', e.type === 'deposito' ? 'text-oliva-600' : 'text-cereja')}>
              {e.type === 'deposito' ? '+' : '−'} {money(e.amount)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
