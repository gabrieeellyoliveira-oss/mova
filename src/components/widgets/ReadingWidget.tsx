import { Link } from 'react-router-dom'
import { useBooks } from '@/hooks/useData'
import { ratio } from '@/utils/format'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { BookCover } from '@/components/books/BookCover'
import { PixelIcon } from '@/components/game/PixelIcon'
import { WidgetHeader } from './WidgetHeader'

/** "Estou lendo" como item selecionado no inventário. */
export function ReadingWidget() {
  const book = useBooks().find((b) => b.status === 'lendo')
  const p = book ? ratio(book.currentPage, book.pages) : 0
  return (
    <Card className="flex flex-col">
      <WidgetHeader title="Estou lendo" sprite="book" to="/leitura" linkLabel="Ver todos" />
      {book ? (
        <div className="flex flex-1 gap-4">
          <div className="relative w-24 shrink-0 rounded-md border-2 border-px-line bg-px-soft p-1.5 shadow-pixel-glow">
            <BookCover book={book} small />
            <span className="absolute -right-2 -top-2"><PixelIcon name="sparkle" size={18} className="animate-twinkle" /></span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="font-heading text-lg leading-tight text-vinho">{book.title}</p>
            <p className="text-xs text-vinho/60">{book.author}</p>
            <p className="mt-2 text-xs text-vinho/70">Página {book.currentPage} de {book.pages}</p>
            <div className="mt-1 flex items-center gap-2"><Progress value={p} color="#CB757C" height={7} className="flex-1" /><span className="font-pixel text-sm font-semibold text-vinho">{Math.round(p)}%</span></div>
            <Link to={`/leitura?livro=${book.id}`} className="mt-auto inline-flex h-9 items-center justify-center rounded-lg border-2 border-px-line bg-rosa font-bold text-vinho shadow-pixel-sm transition hover:-translate-y-px active:translate-y-px">
              Continuar lendo
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-sm text-vinho/60">Nenhum livro aberto agora. Escolhe um da sua estante?</p>
      )}
    </Card>
  )
}
