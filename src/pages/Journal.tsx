import { useMemo, useState } from 'react'
import { ArrowLeft, FolderPlus, Heart, Images, Lock, PenLine, Pencil, Search } from 'lucide-react'
import type { JournalEntry, JournalFolder } from '@/types'
import { useJournal, useJournalFolders } from '@/hooks/useData'
import { fromISODate, monthKey, today } from '@/utils/date'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { EmptyState } from '@/components/ui/Misc'
import { JournalForm } from '@/components/journal/JournalForm'
import { FolderForm, FolderShape } from '@/components/journal/Folder'

type Filter = 'todas' | 'mes' | 'fotos' | 'favoritas'
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todas', label: 'Todas' }, { id: 'mes', label: 'Este mês' }, { id: 'fotos', label: 'Com fotos' }, { id: 'favoritas', label: 'Favoritas' },
]
const longDate = (d: string) => fromISODate(d).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace('-feira', '')

/** Um bloco do diário: só foto, data, humor e título — o texto só aparece ao abrir a página. */
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
        <p className="mt-3 line-clamp-2 font-serif text-xl font-bold leading-snug">{entry.title || 'Sem título'}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-tinta/50"><Lock size={12} /> toque para ler</p>
      </div>
    </button>
  )
}

/**
 * Diário: pastas opcionais (o que está numa pasta só aparece dentro dela) e páginas em blocos.
 * Os blocos não mostram o texto — ele só aparece ao abrir a página.
 */
export default function Journal() {
  const entries = useJournal()
  const folders = useJournalFolders()
  const [folderId, setFolderId] = useState<string | null>(null)
  const [editFolder, setEditFolder] = useState<JournalFolder | 'new' | null>(null)
  const [filter, setFilter] = useState<Filter>('todas')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<JournalEntry | 'new' | null>(null)
  const current = folders.find((x) => x.id === folderId)
  const folderExists = (id?: string) => !!id && folders.some((x) => x.id === id)

  // fora de uma pasta: só as páginas sem pasta; dentro: só as da pasta
  const scope = useMemo(() => entries.filter((e) => (current ? e.folderId === current.id : !folderExists(e.folderId))), [entries, current, folders]) // eslint-disable-line react-hooks/exhaustive-deps
  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return scope
      .filter((e) => filter === 'todas' || (filter === 'mes' ? monthKey(e.date) === monthKey(today()) : filter === 'fotos' ? e.photos.length > 0 : !!e.favorite))
      .filter((e) => !term || `${e.title ?? ''} ${e.text}`.toLowerCase().includes(term))
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
  }, [scope, filter, q])
  const goTo = (id: string | null) => { setFolderId(id); setFilter('todas'); setQ('') }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-[2rem] border-2 border-ink bg-ink p-7 text-ink-fg sm:p-9 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          {current ? (
            <button onClick={() => goTo(null)} className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] text-lavanda hover:underline"><ArrowLeft size={14} /> diário</button>
          ) : (
            <p className="text-xs uppercase tracking-[0.3em] text-lavanda">querido diário</p>
          )}
          <p className="mt-2 font-serif text-3xl font-bold first-letter:uppercase sm:text-4xl">{current ? current.name : longDate(today())}</p>
          <p className="mt-2 text-ink-fg/75">{current ? `${scope.length} ${scope.length === 1 ? 'página' : 'páginas'} nesta pasta` : 'Seu cantinho para guardar os dias.'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {current && <Button size="lg" variant="light" onClick={() => setEditFolder(current)}><Pencil size={16} /> Editar pasta</Button>}
          <Button size="lg" onClick={() => setOpen('new')}><PenLine size={18} /> Nova página</Button>
        </div>
      </section>

      {!current && (
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl font-bold">Pastas</h2>
            <Button size="sm" variant="light" onClick={() => setEditFolder('new')}><FolderPlus size={14} /> Nova pasta</Button>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6">
            {folders.map((x) => {
              const count = entries.filter((e) => e.folderId === x.id).length
              return (
                <button key={x.id} onClick={() => goTo(x.id)} className="group block w-full text-left">
                  <FolderShape color={x.color} cover={x.cover} className="transition group-hover:-translate-y-1" />
                  <p className="mt-2 truncate text-sm font-bold">{x.name}</p>
                  <p className="text-xs text-tinta/55">{count} {count === 1 ? 'página' : 'páginas'}</p>
                </button>
              )
            })}
            <button onClick={() => setEditFolder('new')} className="mt-[9%] flex aspect-[4/3] flex-col items-center justify-center gap-2 self-start rounded-2xl border-2 border-dashed border-ink/30 px-3 text-center text-xs text-tinta/60 transition hover:border-ink hover:text-ink">
              <FolderPlus size={22} /> {folders.length ? 'Nova pasta' : 'Crie pastas para separar seus diários (opcional)'}
            </button>
          </div>
        </section>
      )}

      {(current || scope.length > 0) && (
        <section className="space-y-4">
          {!current && <h2 className="font-serif text-2xl font-bold">Páginas soltas</h2>}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {FILTERS.map((f) => <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</Chip>)}
            </div>
            <label className="relative block sm:w-72">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-tinta/50" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={current ? 'Buscar nesta pasta' : 'Buscar nas páginas soltas'} aria-label="Buscar no diário"
                className="h-10 w-full rounded-full border-2 border-ink bg-quente pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-lavanda/60" />
            </label>
          </div>
          {list.length === 0 ? (
            <EmptyState title={scope.length ? 'Nada por aqui' : 'Pasta vazia'} text={scope.length ? 'Tente outro filtro ou outra busca.' : 'Escreva a primeira página desta pasta.'}
              action={!scope.length && <Button size="sm" onClick={() => setOpen('new')}><PenLine size={14} /> Nova página</Button>} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {list.map((e) => <EntryBlock key={e.id} entry={e} onOpen={() => setOpen(e)} />)}
            </div>
          )}
        </section>
      )}

      {!current && !entries.length && !folders.length && (
        <EmptyState title="Seu diário está em branco" text="Escreva sobre o seu dia e adicione fotos. Se quiser, crie pastas para separar os assuntos." />
      )}

      {open && <JournalForm initial={open === 'new' ? undefined : open} folderId={current?.id} onClose={() => setOpen(null)} />}
      {editFolder && <FolderForm initial={editFolder === 'new' ? undefined : editFolder} onClose={() => { if (editFolder !== 'new' && !folders.some((x) => x.id === editFolder.id)) goTo(null); setEditFolder(null) }} />}
    </div>
  )
}
