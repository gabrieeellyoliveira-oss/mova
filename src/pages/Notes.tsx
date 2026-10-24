import { useMemo, useState } from 'react'
import { Plus, Search, Star } from 'lucide-react'
import { db } from '@/store/db'
import { useNotes } from '@/hooks/useData'
import { normalize } from '@/utils/format'
import { relativeDay, toISODate } from '@/utils/date'
import { openForm } from '@/hooks/useQuickAdd'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { EmptyState } from '@/components/ui/Misc'
import { NOTE_TONES } from '@/components/modals/NoteForm'
import { Squiggle } from '@/components/doodles/Doodles'
import { cn } from '@/lib/cn'

export default function Notes() {
  const notes = useNotes()
  const [q, setQ] = useState('')
  const [tag, setTag] = useState<string | null>(null)
  const [favOnly, setFavOnly] = useState(false)

  const tags = useMemo(() => [...new Set(notes.flatMap((n) => n.tags))].sort(), [notes])
  const list = notes
    .filter((n) => (!tag || n.tags.includes(tag)) && (!favOnly || n.favorite))
    .filter((n) => !q || normalize(`${n.title} ${n.content} ${n.tags.join(' ')}`).includes(normalize(q)))
    .sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.updatedAt.localeCompare(a.updatedAt))

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="cantinho das ideias"
        title="Notas"
        subtitle="Listas, lembretes, receitas e pensamentos soltos."
        doodle={<Squiggle width={90} className="text-queimado" />}
        actions={<Button onClick={() => openForm('note', tag ? { tags: [tag] } : undefined)}><Plus size={16} /> Nova nota</Button>}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-vinho/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar nas notas…" className="h-11 w-full rounded-full border border-vinho/10 bg-quente pl-11 pr-4 text-sm shadow-soft focus:border-queimado focus:outline-none" />
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip active={favOnly} onClick={() => setFavOnly(!favOnly)}><Star size={12} className={favOnly ? 'fill-rosa-50' : ''} /> Favoritas</Chip>
          <Chip active={!tag} onClick={() => setTag(null)}>Todas</Chip>
          {tags.map((t) => <Chip key={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)}>#{t}</Chip>)}
        </div>
      </div>
      {list.length === 0 ? (
        <EmptyState title={q ? `Nada com “${q}”` : 'Nenhuma nota ainda'} text="Escreve qualquer coisa — depois você organiza." action={<Button size="sm" onClick={() => openForm('note')}>Criar nota</Button>} />
      ) : (
        <div className="columns-1 gap-5 sm:columns-2 xl:columns-3 2xl:columns-4">
          {list.map((n, i) => (
            <article
              key={n.id}
              onClick={() => openForm('note', n as never)}
              className={cn('group relative mb-5 cursor-pointer break-inside-avoid rounded-3xl p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift animate-rise', NOTE_TONES[n.color], i % 3 === 1 && 'sm:rotate-[0.6deg]', i % 3 === 2 && 'sm:-rotate-[0.5deg]')}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <span className="absolute -top-2 left-1/2 h-5 w-16 -translate-x-1/2 rotate-[-2deg] rounded-sm bg-rosa/60" aria-hidden />
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-extrabold leading-snug">{n.title}</h3>
                <button
                  onClick={(e) => { e.stopPropagation(); db.notes.update(n.id, { favorite: !n.favorite }) }}
                  className="shrink-0 opacity-70 hover:opacity-100"
                  aria-label={n.favorite ? 'Desfavoritar' : 'Favoritar'}
                >
                  <Star size={17} className={n.favorite ? 'fill-current' : ''} />
                </button>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed opacity-85">{n.content}</p>
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {n.tags.map((t) => (
                  <button key={t} onClick={(e) => { e.stopPropagation(); setTag(t) }} className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[11px] font-semibold hover:bg-black/10">#{t}</button>
                ))}
                <span className="ml-auto text-[11px] opacity-60">{relativeDay(toISODate(new Date(n.updatedAt)))}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
