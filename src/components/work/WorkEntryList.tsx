import { formatWork, type useWork } from '@/hooks/useWork'
import { formatShort } from '@/utils/date'
import { EmptyState } from '@/components/ui/Misc'
import type { WorkEntry } from '@/types'

type Work = ReturnType<typeof useWork>

export function WorkEntryList({ w, onEdit }: { w: Work; onEdit: (e: WorkEntry) => void }) {
  if (!w.entries.length) return <EmptyState title="Nenhum resultado neste mês" text="Registre o que você fez no dia para acompanhar a meta." />
  return (
    <ul className="max-h-[420px] divide-y divide-dashed divide-vinho/10 overflow-y-auto">
      {w.entries.map((e) => (
        <li key={e.id}>
          <button onClick={() => onEdit(e)} className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition hover:bg-creme-100">
            <span className="w-14 shrink-0 text-xs font-bold text-vinho/60">{formatShort(e.date)}</span>
            <span className="min-w-0 flex-1 truncate text-sm text-tinta">{e.note || w.settings.metricName}</span>
            <span className="shrink-0 text-sm font-bold tabular-nums text-cereja">+ {formatWork(e.amount, w.settings)}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
