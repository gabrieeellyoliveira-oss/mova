import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Heart, Plus } from 'lucide-react'
import type { Book, BookStatus } from '@/types'
import { BOOK_STATUS } from '@/data/constants'
import { useBooks, useSettings } from '@/hooks/useData'
import { ratio } from '@/utils/format'
import { MONTHS_SHORT } from '@/utils/date'
import { openForm } from '@/hooks/useQuickAdd'
import { PageHeader, StatCard } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { Card, CardHeader } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { EmptyState, StarRating } from '@/components/ui/Misc'
import { PixelIcon } from '@/components/game/PixelIcon'
import { WidgetHeader } from '@/components/widgets/WidgetHeader'
import { PAGES_PER_READING, XP_VALUES } from '@/game/config'
import { cn } from '@/lib/cn'
import { BookCover } from '@/components/books/BookCover'
import { BookDetail } from '@/components/books/BookDetail'
import { BookDoodle } from '@/components/doodles/Doodles'

type Shelf = BookStatus | 'favoritos' | 'todos'

function BookTile({ book, onOpen }: { book: Book; onOpen: () => void }) {
  const p = ratio(book.currentPage, book.pages)
  return (
    <button onClick={onOpen} className="group self-start text-left">
      <div className="relative transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:-rotate-1">
        <BookCover book={book} />
        {book.favorite && <Heart size={18} className="absolute right-2 top-2 fill-rosa text-rosa drop-shadow" />}
      </div>
      <p className="mt-3 line-clamp-2 text-sm font-bold leading-snug text-vinho">{book.title}</p>
      <p className="truncate text-xs text-vinho/55">{book.author}</p>
      {book.status === 'lendo' || book.status === 'pausado' ? (
        <div className="mt-1.5 flex items-center gap-2"><Progress value={p} height={5} className="flex-1" /><span className="text-[11px] font-bold text-cereja">{Math.round(p)}%</span></div>
      ) : book.status === 'lido' && book.rating ? (
        <div className="mt-1"><StarRating value={book.rating} size={12} /></div>
      ) : null}
    </button>
  )
}

export default function Reading() {
  const books = useBooks()
  const { yearlyBooksGoal } = useSettings()
  const [params, setParams] = useSearchParams()
  const [shelf, setShelf] = useState<Shelf>('todos')
  const [slot, setSlot] = useState<string | null>(null)
  const openId = params.get('livro')
  const open = books.find((b) => b.id === openId)

  const year = String(new Date().getFullYear())
  const stats = useMemo(() => {
    const readYear = books.filter((b) => b.status === 'lido' && b.finishedAt?.startsWith(year))
    const pages = books.reduce((a, b) => a + (b.startedAt?.startsWith(year) || b.finishedAt?.startsWith(year) ? b.currentPage : 0), 0)
    const monthsElapsed = new Date().getMonth() + 1
    const perMonth = MONTHS_SHORT.slice(0, monthsElapsed).map((m, i) => ({ m, n: readYear.filter((b) => Number(b.finishedAt!.slice(5, 7)) === i + 1).length }))
    return { readYear: readYear.length, pages, avg: readYear.length / monthsElapsed, perMonth }
  }, [books, year])

  const list = books.filter((b) => shelf === 'todos' || (shelf === 'favoritos' ? b.favorite : b.status === shelf))
  const count = (s: Shelf) => books.filter((b) => s === 'todos' || (s === 'favoritos' ? b.favorite : b.status === s)).length
  const shelves: Shelf[] = ['todos', 'lendo', 'quero', 'pausado', 'lido', 'favoritos']
  const shelfLabel = (s: Shelf) => (s === 'todos' ? 'Todos' : s === 'favoritos' ? 'Favoritos' : BOOK_STATUS[s])
  const reading = books.filter((b) => b.status === 'lendo')
  const current = reading.find((b) => b.id === slot) ?? reading[0]
  const maxMonth = Math.max(1, ...stats.perMonth.map((x) => x.n))

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="minha biblioteca"
        title="Leitura"
        subtitle="Seus livros e novas histórias — sem pressa, página por página."
        icon="book"
        actions={<Button onClick={() => openForm('book')}><Plus size={16} /> Nova leitura</Button>}
      />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard tone="vinho" label={`Lidos em ${year}`} value={stats.readYear} hint={`meta: ${yearlyBooksGoal} livros`} />
        <StatCard label="Páginas lidas" value={stats.pages.toLocaleString('pt-BR')} hint="neste ano" />
        <StatCard tone="rosa" label="Média mensal" value={stats.avg.toFixed(1).replace('.', ',')} hint="livros por mês" />
        <StatCard tone="oliva" label="Lendo agora" value={count('lendo')} hint={`${count('quero')} na fila`} />
      </div>
      {current && (
        <Card>
          <WidgetHeader title="Estou lendo" sprite="book" subtitle={`Inventário · +${XP_VALUES.leitura} XP a cada ${PAGES_PER_READING} páginas`} />
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div className="grid grid-cols-4 gap-2 self-start sm:grid-cols-5">
              {reading.map((b) => (
                <button key={b.id} onClick={() => setSlot(b.id)} aria-pressed={b.id === current.id} aria-label={b.title} className={cn('relative rounded-md border-2 p-1 transition', b.id === current.id ? 'border-px-line bg-rosa-100 shadow-pixel-glow' : 'border-px-line/30 bg-px-soft hover:border-px-line')}>
                  <BookCover book={b} small />
                  {b.id === current.id && <PixelIcon name="sparkle" size={14} className="absolute -right-1.5 -top-1.5 animate-twinkle" />}
                </button>
              ))}
              {Array.from({ length: Math.max(0, 5 - reading.length) }).map((_, i) => (
                <button key={`empty${i}`} onClick={() => setShelf('quero')} className="hidden aspect-[2/3] rounded-md border-2 border-dashed border-px-line/25 bg-white/30 sm:block" aria-label="Escolher próxima leitura" />
              ))}
            </div>
            <div className="flex min-w-0 flex-col rounded-lg border-2 border-px-line bg-px-soft p-4">
              <p className="font-pixel text-[11px] font-semibold uppercase tracking-[0.14em] text-cereja">Item selecionado</p>
              <p className="mt-1 font-heading text-2xl leading-tight text-vinho">{current.title}</p>
              <p className="text-sm text-vinho/60">{current.author}</p>
              <p className="mt-3 text-xs text-vinho/70">Página {current.currentPage} de {current.pages}</p>
              <div className="mt-1 flex items-center gap-2"><Progress value={ratio(current.currentPage, current.pages)} color="#CB757C" height={8} className="flex-1" /><span className="font-pixel text-sm font-semibold text-vinho">{Math.round(ratio(current.currentPage, current.pages))}%</span></div>
              <Button className="mt-4 self-start" onClick={() => setParams({ livro: current.id })}>Continuar lendo</Button>
            </div>
          </div>
        </Card>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0">
          <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {shelves.map((s) => (
              <Chip key={s} active={shelf === s} onClick={() => setShelf(s)}>{shelfLabel(s)} <span className="opacity-60">{count(s)}</span></Chip>
            ))}
          </div>
          {list.length === 0 ? (
            <EmptyState title="Estante vazia por aqui" text="Que tal anotar aquele livro que te indicaram?" doodle={<BookDoodle size={44} />} action={<Button size="sm" onClick={() => openForm('book')}>Adicionar livro</Button>} />
          ) : (
            <div className="relative grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {list.map((b) => <BookTile key={b.id} book={b} onOpen={() => setParams({ livro: b.id })} />)}
            </div>
          )}
        </section>
        <aside className="space-y-6">
          <Card>
            <CardHeader title={`Meta de ${year}`} subtitle={`${stats.readYear} de ${yearlyBooksGoal} livros`} />
            <Progress value={ratio(stats.readYear, yearlyBooksGoal)} height={10} color="#7A7A4A" />
            <div className="mt-5 flex h-24 items-end gap-1">
              {stats.perMonth.map((x) => (
                <div key={x.m} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-md bg-queimado" style={{ height: `${(x.n / maxMonth) * 64 + 4}px`, opacity: x.n ? 1 : 0.2 }} title={`${x.n} livro(s)`} />
                  <span className="text-[9px] font-bold uppercase text-vinho/50">{x.m[0]}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card tone="rosa">
            <CardHeader title="Citações guardadas" />
            {books.flatMap((b) => b.quotes.map((q) => ({ q, b }))).slice(0, 4).map(({ q, b }, i) => (
              <figure key={i} className="mb-3 last:mb-0">
                <blockquote className="text-[15px] italic leading-relaxed">“{q}”</blockquote>
                <figcaption className="text-xs opacity-70">— {b.title}</figcaption>
              </figure>
            ))}
          </Card>
        </aside>
      </div>
      {open && <BookDetail key={open.id} book={open} onClose={() => setParams({})} />}
    </div>
  )
}
