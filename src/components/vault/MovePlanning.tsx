import { useMemo, useState } from 'react'
import { CalendarClock, ExternalLink, FileCheck2, Images, KeyRound, Link2, PenLine, Scale, Search } from 'lucide-react'
import type { MoveNote, MoveNoteKind } from '@/types'
import { useMoveNotes } from '@/hooks/useData'
import { money } from '@/utils/format'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { EmptyState } from '@/components/ui/Misc'
import { cn } from '@/lib/cn'
import { Card, CardHeader } from '@/components/ui/Card'
import { MoveNoteForm, NOTE_KINDS, NOTE_STATUS, domainOf } from './MoveNoteForm'
import { HouseCompare } from './HouseCompare'
import { DocsChecklist, GuaranteeCard, MoveTimeline } from './MoveChecklist'

type Filter = 'todas' | MoveNoteKind
const r0 = (n: number) => money(n).replace(',00', '')

/** Um card da pesquisa, no formato dos blocos do Diário: foto, tipo, título, preço e links. */
function NoteCard({ note, onOpen }: { note: MoveNote; onOpen: () => void }) {
  const k = NOTE_KINDS.find((x) => x.value === note.kind) ?? NOTE_KINDS[3]
  const [cover, ...rest] = note.photos
  const st = note.status !== 'pesquisando' ? NOTE_STATUS.find((s) => s.value === note.status) : undefined
  return (
    <div className={cn('group flex flex-col overflow-hidden rounded-3xl border-2 border-ink bg-quente shadow-pixel transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-lift', note.status === 'descartado' && 'opacity-55')}>
      <button onClick={onOpen} className="flex flex-1 flex-col text-left">
        {cover && (
          <div className="relative aspect-[4/3] w-full overflow-hidden border-b-2 border-ink bg-creme-100">
            <img src={cover} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" loading="lazy" />
            {rest.length > 0 && <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full border-2 border-ink bg-quente px-2 py-0.5 text-[11px] font-semibold"><Images size={12} /> +{rest.length}</span>}
          </div>
        )}
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center justify-between gap-2">
            <span className={cn('rounded-full border-2 border-ink px-2.5 py-0.5 text-[11px] font-semibold', k.cls)}>{k.emoji} {k.label}</span>
            {st && <span className={cn('text-xs font-semibold', note.status === 'comprado' ? 'text-oliva-600' : note.status === 'favorito' ? 'text-cereja' : 'text-tinta/55')}>{st.label}</span>}
          </div>
          <p className="mt-3 line-clamp-2 font-serif text-xl font-bold leading-snug">{note.title}</p>
          {note.kind === 'casa' && note.total ? <p className="mt-1 font-serif text-lg font-bold text-cereja">{r0(note.total)}<span className="font-sans text-xs font-normal text-tinta/55">/mês com tudo</span></p>
            : note.price ? <p className="mt-1 font-serif text-lg font-bold text-cereja">{r0(note.price)}{note.kind === 'casa' && <span className="font-sans text-xs font-normal text-tinta/55">/mês</span>}</p> : null}
          {note.text && <p className="mt-2 line-clamp-2 text-sm text-tinta/65">{note.text}</p>}
        </div>
      </button>
      {note.links.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t-2 border-dashed border-ink/15 px-5 py-3">
          {note.links.slice(0, 3).map((l, i) => (
            <a key={i} href={l} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1 rounded-full border-2 border-ink bg-lavanda-100 px-2.5 py-0.5 text-[11px] font-semibold hover:bg-lavanda">
              <ExternalLink size={11} className="shrink-0" /><span className="truncate">{domainOf(l)}</span>
            </a>
          ))}
          {note.links.length > 3 && <span className="inline-flex items-center gap-1 text-[11px] text-tinta/55"><Link2 size={11} /> +{note.links.length - 3}</span>}
        </div>
      )}
    </div>
  )
}

/** Planejamento da mudança: anotações de pesquisa (casas, móveis, ideias) com links, preço e fotos. */
export function MovePlanning() {
  const notes = useMoveNotes()
  const [filter, setFilter] = useState<Filter>('todas')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<MoveNote | 'new' | null>(null)
  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    const rank = { favorito: 0, pesquisando: 1, comprado: 2, descartado: 3 }
    return notes
      .filter((n) => filter === 'todas' || n.kind === filter)
      .filter((n) => !term || `${n.title} ${n.text} ${n.links.join(' ')}`.toLowerCase().includes(term))
      .sort((a, b) => rank[a.status] - rank[b.status] || b.createdAt.localeCompare(a.createdAt))
  }, [notes, filter, q])
  const bought = notes.filter((n) => n.status === 'comprado' && n.kind !== 'casa').reduce((a, n) => a + (n.price ?? 0), 0)
  const toBuy = notes.filter((n) => (n.status === 'favorito' || n.status === 'pesquisando') && n.kind === 'movel').reduce((a, n) => a + (n.price ?? 0), 0)

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-[2rem] border-2 border-ink bg-ink p-7 text-ink-fg sm:p-9 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.3em] text-lavanda">pesquisa da mudança</p>
          <p className="mt-2 font-serif text-3xl font-bold sm:text-4xl">Casas, móveis e ideias</p>
          <p className="mt-2 text-ink-fg/75">{notes.length ? `${notes.length} ${notes.length === 1 ? 'anotação' : 'anotações'}${toBuy ? ` · móveis em vista: ${r0(toBuy)}` : ''}${bought ? ` · já comprado: ${r0(bought)}` : ''}` : 'Guarde os anúncios de casa, os links dos móveis e tudo o que pesquisar.'}</p>
        </div>
        <Button size="lg" onClick={() => setOpen('new')}><PenLine size={18} /> Nova anotação</Button>
      </section>

      <Card>
        <CardHeader icon={<Scale size={18} />} title="Comparar casas" subtitle="as casas da pesquisa lado a lado, contra o seu teto" />
        <HouseCompare onOpen={(n) => setOpen(n)} />
      </Card>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader icon={<KeyRound size={18} />} title="Garantia do aluguel" subtitle="renda exigida e como compensar" />
          <GuaranteeCard />
        </Card>
        <Card>
          <CardHeader icon={<FileCheck2 size={18} />} title="Documentos" subtitle="o que separar antes de fechar" />
          <DocsChecklist />
        </Card>
        <Card>
          <CardHeader icon={<CalendarClock size={18} />} title="Linha do tempo" subtitle="etapas até a data meta · mande para a Agenda" />
          <MoveTimeline />
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip active={filter === 'todas'} onClick={() => setFilter('todas')}>Todas</Chip>
          {NOTE_KINDS.map((k) => <Chip key={k.value} active={filter === k.value} onClick={() => setFilter(k.value)}>{k.emoji} {k.label === 'Móvel' ? 'Móveis' : k.label === 'Casa' ? 'Casas' : k.label === 'Ideia' ? 'Ideias' : 'Outros'}</Chip>)}
        </div>
        <label className="relative block sm:w-72">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-tinta/50" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar na pesquisa" aria-label="Buscar na pesquisa"
            className="h-10 w-full rounded-full border-2 border-ink bg-quente pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-lavanda/60" />
        </label>
      </div>

      {list.length === 0 ? (
        <EmptyState title={notes.length ? 'Nada por aqui' : 'Comece sua pesquisa'} text={notes.length ? 'Tente outro filtro ou outra busca.' : 'Anote o apê que viu, o link do guarda-roupa que quer comprar, ideias de decoração…'}
          action={<Button size="sm" onClick={() => setOpen('new')}><PenLine size={14} /> Nova anotação</Button>} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {list.map((n) => <NoteCard key={n.id} note={n} onOpen={() => setOpen(n)} />)}
        </div>
      )}
      {open && <MoveNoteForm initial={open === 'new' ? undefined : open} kind={filter !== 'todas' ? filter : undefined} onClose={() => setOpen(null)} />}
    </div>
  )
}
