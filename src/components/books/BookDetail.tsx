import { useState } from 'react'
import { Heart, Plus, Quote, X } from 'lucide-react'
import type { Book, BookStatus } from '@/types'
import { db } from '@/store/db'
import { BOOK_STATUS } from '@/data/constants'
import { today } from '@/utils/date'
import { ratio } from '@/utils/format'
import { celebrate } from '@/hooks/useToast'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, FormGrid, Input, Textarea } from '@/components/ui/Form'
import { Segmented } from '@/components/ui/Chip'
import { Progress } from '@/components/ui/Progress'
import { DeleteButton, StarRating } from '@/components/ui/Misc'
import { PhotoInput } from '@/components/ui/PhotoInput'
import { BookCover } from './BookCover'
import { cn } from '@/lib/cn'

export function BookDetail({ book, onClose }: { book: Book; onClose: () => void }) {
  const [f, setF] = useState<Book>(book)
  const [quote, setQuote] = useState('')
  const set = <K extends keyof Book>(k: K, v: Book[K]) => setF((p) => ({ ...p, [k]: v }))
  const p = ratio(f.currentPage, f.pages)

  const setStatus = (s: BookStatus) =>
    setF((prev) => ({
      ...prev,
      status: s,
      startedAt: s !== 'quero' ? prev.startedAt ?? today() : prev.startedAt,
      finishedAt: s === 'lido' ? prev.finishedAt ?? today() : undefined,
      currentPage: s === 'lido' ? prev.pages : prev.currentPage,
    }))

  const setPage = (n: number) => {
    const currentPage = Math.max(0, Math.min(f.pages, n))
    setF((prev) => ({
      ...prev,
      currentPage,
      status: currentPage >= prev.pages ? 'lido' : prev.status === 'quero' && currentPage > 0 ? 'lendo' : prev.status,
      startedAt: prev.startedAt ?? (currentPage > 0 ? today() : undefined),
      finishedAt: currentPage >= prev.pages ? prev.finishedAt ?? today() : prev.finishedAt,
    }))
  }

  const save = () => {
    const { id, createdAt: _c, ...data } = f
    void _c
    db.books.update(id, data)
    if (f.status === 'lido' && book.status !== 'lido') celebrate.book(f.title)
    onClose()
  }

  return (
    <Modal
      open onClose={onClose} size="lg" title={f.title} subtitle={f.author}
      footer={
        <>
          <div className="mr-auto"><DeleteButton onConfirm={() => { db.books.remove(book.id); onClose() }} /></div>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>Salvar</Button>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-[180px_1fr]">
        <div className="space-y-3">
          <div className="mx-auto w-36 md:w-full"><BookCover book={f} /></div>
          {f.cover ? (
            <Button size="sm" variant="ghost" className="w-full" onClick={() => set('cover', undefined)}>Remover capa</Button>
          ) : (
            <PhotoInput onChange={(v) => set('cover', v)} />
          )}
          <button onClick={() => set('favorite', !f.favorite)} className={cn('flex w-full items-center justify-center gap-2 rounded-full border py-2 text-sm font-semibold transition', f.favorite ? 'border-cereja bg-cereja text-quente' : 'border-vinho/15 text-vinho hover:bg-rosa-50')}>
            <Heart size={15} className={f.favorite ? 'fill-quente' : ''} /> {f.favorite ? 'Favorito' : 'Favoritar'}
          </button>
        </div>
        <div className="space-y-5">
          <Segmented value={f.status} onChange={setStatus} options={(Object.keys(BOOK_STATUS) as BookStatus[]).map((s) => ({ value: s, label: BOOK_STATUS[s] }))} />
          <div className="rounded-lg border-2 border-black/25 bg-creme-100 p-4">
            <div className="mb-2 flex items-end justify-between">
              <p className="text-sm text-vinho/70">Página <b className="text-vinho">{f.currentPage}</b> de {f.pages}</p>
              <p className="text-2xl font-extrabold text-cereja">{Math.round(p)}%</p>
            </div>
            <Progress value={p} height={10} />
            <input type="range" min={0} max={f.pages} value={f.currentPage} onChange={(e) => setPage(Number(e.target.value))} className="mt-3 w-full accent-cereja" aria-label="Página atual" />
            <div className="mt-2 flex flex-wrap gap-2">
              {[10, 20, 50].map((n) => <Button key={n} size="sm" variant="soft" onClick={() => setPage(f.currentPage + n)}>+{n} págs</Button>)}
              <Input type="number" value={f.currentPage} onChange={(e) => setPage(Number(e.target.value))} className="h-8 w-24 text-xs" aria-label="Página atual (número)" />
            </div>
          </div>
          <FormGrid>
            <Field label="Título"><Input value={f.title} onChange={(e) => set('title', e.target.value)} /></Field>
            <Field label="Autor(a)"><Input value={f.author} onChange={(e) => set('author', e.target.value)} /></Field>
            <Field label="Páginas"><Input type="number" value={f.pages} onChange={(e) => set('pages', Math.max(1, Number(e.target.value)))} /></Field>
            <Field group label="Nota"><div className="flex h-11 items-center"><StarRating value={f.rating ?? 0} onChange={(v) => set('rating', v)} size={24} /></div></Field>
            <Field label="Comecei em"><Input type="date" value={f.startedAt ?? ''} onChange={(e) => set('startedAt', e.target.value || undefined)} /></Field>
            <Field label="Terminei em"><Input type="date" value={f.finishedAt ?? ''} onChange={(e) => set('finishedAt', e.target.value || undefined)} /></Field>
          </FormGrid>
          <Field label="Comentários"><Textarea value={f.comments ?? ''} onChange={(e) => set('comments', e.target.value)} placeholder="O que esse livro está te fazendo sentir?" /></Field>
          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-vinho/70">Citações favoritas</span>
            <ul className="space-y-2">
              {f.quotes.map((q, i) => (
                <li key={i} className="group relative rounded-2xl bg-rosa-50 py-3 pl-10 pr-10 text-[15px] italic leading-relaxed text-vinho">
                  <Quote size={15} className="absolute left-3.5 top-3.5 text-queimado" />
                  {q}
                  <button onClick={() => set('quotes', f.quotes.filter((_, j) => j !== i))} className="absolute right-3 top-3 text-vinho/40 hover:text-cereja" aria-label="Remover citação"><X size={14} /></button>
                </li>
              ))}
            </ul>
            <form onSubmit={(e) => { e.preventDefault(); if (quote.trim()) { set('quotes', [...f.quotes, quote.trim()]); setQuote('') } }} className="mt-2 flex gap-2">
              <Input value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="Um trecho que ficou com você…" />
              <Button type="submit" size="icon" variant="soft" aria-label="Adicionar citação"><Plus size={16} /></Button>
            </form>
          </div>
        </div>
      </div>
    </Modal>
  )
}
