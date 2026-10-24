import { Link } from 'react-router-dom'
import { useBooks } from '@/hooks/useData'
import { ratio } from '@/utils/format'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { BookCover } from '@/components/books/BookCover'
import { WidgetHeader } from './WidgetHeader'

export function ReadingWidget() {
  const book = useBooks().find((b) => b.status === 'lendo')
  const p = book ? ratio(book.currentPage, book.pages) : 0
  return (
    <Card className="p-4 sm:p-5">
      <WidgetHeader title="Estou lendo" to="/leitura" linkLabel="Ver todos" />
      {book ? (
        <Link to={`/leitura?livro=${book.id}`} className="group flex gap-4">
          <div className="w-24 shrink-0 transition-transform group-hover:-rotate-2"><BookCover book={book} small /></div>
          <div className="flex min-w-0 flex-1 flex-col py-1">
            <p className="text-[17px] font-extrabold leading-tight text-vinho">{book.title}</p>
            <p className="mt-1 text-sm text-vinho/60">{book.author}</p>
            <div className="mt-auto">
              <Progress value={p} color="#CB757C" height={8} />
              <p className="mt-1.5 text-right text-sm font-bold text-vinho">{Math.round(p)}%</p>
            </div>
          </div>
        </Link>
      ) : (
        <p className="text-sm text-vinho/60">Nenhum livro aberto agora. Escolhe um da sua estante?</p>
      )}
    </Card>
  )
}
