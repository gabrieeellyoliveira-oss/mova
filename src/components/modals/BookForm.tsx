import { useState } from 'react'
import type { Book, BookStatus } from '@/types'
import { db } from '@/store/db'
import { BOOK_COLORS, BOOK_STATUS } from '@/data/constants'
import { today } from '@/utils/date'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, FormGrid, Input, Select } from '@/components/ui/Form'
import { PhotoInput } from '@/components/ui/PhotoInput'
import { BookCover } from '@/components/books/BookCover'
import { toast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'

export function BookForm({ initial, onClose }: { initial?: Partial<Book>; onClose: () => void }) {
  const [f, setF] = useState({
    title: '', author: '', pages: '', status: 'quero' as BookStatus, coverColor: BOOK_COLORS[0], cover: undefined as string | undefined,
    ...initial,
  })
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }))
  const valid = f.title.trim() && Number(f.pages) > 0

  const save = () => {
    if (!valid) return
    db.books.add({
      title: f.title.trim(), author: f.author.trim(), pages: Number(f.pages), currentPage: f.status === 'lido' ? Number(f.pages) : 0,
      status: f.status, coverColor: f.coverColor, cover: f.cover, favorite: false, quotes: [],
      startedAt: f.status === 'lendo' || f.status === 'lido' ? today() : undefined,
      finishedAt: f.status === 'lido' ? today() : undefined,
    })
    toast('Livro na estante 📚')
    onClose()
  }

  return (
    <Modal
      open onClose={onClose}
      title="Nova leitura"
      subtitle="Toda história começa com um título."
      footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={save} disabled={!valid}>Adicionar</Button></>}
    >
      <form onSubmit={(e) => { e.preventDefault(); save() }} className="grid gap-5 sm:grid-cols-[1fr_140px]">
        <div className="space-y-4">
          <Field label="Título"><Input value={f.title} onChange={(e) => set('title', e.target.value)} /></Field>
          <Field label="Autor(a)"><Input value={f.author} onChange={(e) => set('author', e.target.value)} /></Field>
          <FormGrid>
            <Field label="Páginas"><Input type="number" min={1} value={f.pages} onChange={(e) => set('pages', e.target.value)} /></Field>
            <Field label="Estante">
              <Select value={f.status} onChange={(e) => set('status', e.target.value as BookStatus)}>
                {(Object.keys(BOOK_STATUS) as BookStatus[]).map((s) => <option key={s} value={s}>{BOOK_STATUS[s]}</option>)}
              </Select>
            </Field>
          </FormGrid>
          <Field label="Cor da capa">
            <div className="flex flex-wrap gap-2">
              {BOOK_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => set('coverColor', c)} aria-label={`Cor ${c}`}
                  className={cn('h-7 w-7 rounded-full border-2 transition', f.coverColor === c ? 'scale-110 border-tinta' : 'border-transparent')}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </Field>
          <Field label="Capa (opcional)"><PhotoInput value={f.cover} onChange={(v) => set('cover', v)} aspect="aspect-[2/3] max-w-[140px]" /></Field>
        </div>
        <div className="hidden sm:block">
          <BookCover book={{ title: f.title || 'Título', author: f.author || 'Autor', cover: f.cover, coverColor: f.coverColor }} />
        </div>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}
