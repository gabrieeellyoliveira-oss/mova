import { useMemo, useState } from 'react'
import { Heart, Images, PenLine, Search } from 'lucide-react'
import type { JournalEntry } from '@/types'
import { useJournal } from '@/hooks/useData'
import { fromISODate, monthKey, today } from '@/utils/date'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { EmptyState } from '@/components/ui/Misc'
import { JournalForm } from '@/components/journal/JournalForm'
import { cn } from '@/lib/cn'

type Filter = 'todas' | 'mes' | 'fotos' | 'favoritas'
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todas', label: 'Todas' }, { id: 'mes', label: 'Este mês' }, { id: 'fotos', label: 'Com fotos' }, { id: 'favoritas', label: 'Favoritas' },
]
const longDate = (d: string) => fromISODate(d).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace('-feira', '')

/** Um bloco do diário: foto de capa (se houver), data, humor, título e o começo do texto. */
function EntryBlock({ entry, onOpen }: { entry: JournalEntry; onOpen: () => void }) {
  const [cover, ...rest] = entry.photos
  return (
    <button onClick={onOpen} className="group flex w-full flex-col overflow-hidden rounded-3xl border-2 border-ink bg-quente text-left shadow-pixel transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-lift">
      {cover && (
        <div className="relative aspect-[4/3] overflow-hidden border-b-2 border-ink bg-creme-100">
          <img src={cover} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" loading="lazy" />
          {rest.length > 0 && <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full border-2 border-ink bg-quente px-2 py-0.5 text-[11px] font-semibold"><Images size={12} /> +{rest.length}</span>}
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-lavanda px-2.5 py-0.5 text-[11px] font-semibold text-ink">{fromISODate(entry.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span className="flex items-center gap-1.5">
            {entry.favorite && <Heart size={15} className="fill-cereja text-cereja" />}
            {entry.mood && <span className="text-lg leading-none">{entry.mood}</span>}
          </span>
        </div>
        {entry.title && <p className="mt-3 line-clamp-2 font-serif text-xl font-bold leading-snug">{entry.title}</p>}
        {entry.text && <p className={cn('mt-2 whitespace-pre-line text-sm leading-relaxed text-tinta/75', cover ? 'line-clamp-3' : 'line-clamp-6')}>{entry.text}</p>}
      </div>
    </button>
  )
}

/** Diário: páginas em blocos, com fotos, humor e texto. */
export default function Journal() {
  const entries = useJournal()
  const [filter, setFilter] = useState<Filter>('todas')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<JournalEntry | 'new' | null>(null)

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return [...entries]
      .filter((e) => filter === 'todas' || (filter === 'mes' ? monthKey(e.date) === monthKey(today()) : filter === 'fotos' ? e.photos.length > 0 : !!e.favorite))
      .filter((e) => !term || `${e.title ?? ''} ${e.text}`.toLowerCase().includes(term))
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
  }, [entries, filter, q])
  const wroteToday = entries.some((e) => e.date === today())

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-[2rem] border-2 border-ink bg-ink p-7 text-ink-fg sm:p-9 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-lavanda">querido diário</p>
          <p className="mt-2 font-serif text-3xl font-bold first-letter:uppercase sm:text-4xl">{longDate(today())}</p>
          <p className="mt-2 text-ink-fg/75">{entries.length ? `${entries.length} ${entries.length === 1 ? 'página escrita' : 'páginas escritas'}${wroteToday ? ' · hoje já tem página ✓' : ''}` : 'Seu cantinho para guardar os dias.'}</p>
        </div>
        <Button size="lg" onClick={() => setOpen('new')}><PenLine size={18} /> {wroteToday ? 'Nova página' : 'Escrever sobre hoje'}</Button>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {FILTERS.map((f) => <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</Chip>)}
        </div>
        <label className="relative block sm:w-72">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-tinta/50" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar no diário" aria-label="Buscar no diário"
            className="h-10 w-full rounded-full border-2 border-ink bg-quente pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-lavanda/60" />
        </label>
      </div>

      {list.length === 0 ? (
        <EmptyState title={entries.length ? 'Nada por aqui' : 'Seu diário está em branco'} text={entries.length ? 'Tente outro filtro ou outra busca.' : 'Escreva sobre o seu dia e adicione fotos — cada página vira um bloco aqui.'}
          action={!entries.length && <Button size="sm" onClick={() => setOpen('new')}><PenLine size={14} /> Escrever a primeira página</Button>} />
      ) : (
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 2xl:columns-4 [&>*]:mb-6 [&>*]:break-inside-avoid">
          {list.map((e) => <EntryBlock key={e.id} entry={e} onOpen={() => setOpen(e)} />)}
        </div>
      )}

      {open && <JournalForm initial={open === 'new' ? undefined : open} onClose={() => setOpen(null)} />}
    </div>
  )
}
