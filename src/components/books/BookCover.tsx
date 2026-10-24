import type { Book } from '@/types'
import { cn } from '@/lib/cn'
import { Cherry, Flower, Sparkle, Star } from '@/components/doodles/Doodles'

/** Capa real (se houver) ou capa tipográfica no estilo editorial retrô. */
export function BookCover({ book, className, small }: { book: Pick<Book, 'title' | 'author' | 'cover' | 'coverColor'>; className?: string; small?: boolean }) {
  if (book.cover) {
    return <img src={book.cover} alt={book.title} className={cn('aspect-[2/3] w-full rounded-r-xl rounded-l-md object-cover shadow-lift', className)} loading="lazy" />
  }
  const seed = [...book.title].reduce((a, c) => a + c.charCodeAt(0), 0)
  const D = [Cherry, Flower, Star, Sparkle][seed % 4]
  return (
    <div
      className={cn('relative flex aspect-[2/3] w-full flex-col justify-between overflow-hidden rounded-l-md rounded-r-xl p-3 text-rosa-50 shadow-lift', className)}
      style={{ backgroundColor: book.coverColor }}
    >
      <div className="absolute inset-y-0 left-0 w-2 bg-black/15" />
      <div className="absolute inset-x-3 top-3 h-px bg-rosa-50/40" />
      <p className={cn('relative mt-2 pl-1 font-extrabold uppercase leading-[1.1] tracking-wide', small ? 'text-[10px]' : 'text-sm')}>{book.title}</p>
      <D size={small ? 22 : 30} className="relative self-end text-rosa" />
      {!small && <p className="relative pl-1 text-[10px] font-semibold uppercase tracking-widest opacity-80">{book.author}</p>}
    </div>
  )
}
