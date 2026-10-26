import { useState } from 'react'
import type { Note } from '@/types'
import { db } from '@/store/db'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Form'
import { DeleteButton } from '@/components/ui/Misc'
import { cn } from '@/lib/cn'
import { X } from 'lucide-react'

export const NOTE_TONES: Record<Note['color'], string> = {
  creme: 'bg-quente text-tinta border border-vinho/10',
  rosa: 'bg-rosa-100 text-vinho border border-rosa',
  vinho: 'bg-vinho text-rosa-50',
  oliva: 'bg-oliva-100 text-oliva-600 border border-oliva/20',
  nevoa: 'bg-nevoa/70 text-vinho border border-nevoa',
}
const swatch: Record<Note['color'], string> = { creme: '#FFFCF8', rosa: '#f8dcde', vinho: '#520215', oliva: '#E6E4CF', nevoa: '#DFD1D1' }

export function NoteForm({ initial, onClose }: { initial?: Partial<Note>; onClose: () => void }) {
  const [f, setF] = useState({ title: '', content: '', tags: [] as string[], favorite: false, color: 'creme' as Note['color'], ...initial })
  const [tag, setTag] = useState('')
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }))

  const addTag = () => {
    const t = tag.trim().toLowerCase().replace(/^#/, '')
    if (t && !f.tags.includes(t)) set('tags', [...f.tags, t])
    setTag('')
  }
  const save = () => {
    if (!f.title.trim() && !f.content.trim()) return
    const data = { title: f.title.trim() || 'Sem título', content: f.content, tags: f.tags, favorite: f.favorite, color: f.color, updatedAt: new Date().toISOString() }
    if (f.id) db.notes.update(f.id, data)
    else db.notes.add(data)
    onClose()
  }

  return (
    <Modal
      open onClose={onClose}
      title={f.id ? 'Editar nota' : 'Nova nota'}
      footer={
        <>
          {f.id && <div className="mr-auto"><DeleteButton onConfirm={() => { db.notes.remove(f.id!); onClose() }} /></div>}
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>Salvar</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Título"><Input value={f.title} onChange={(e) => set('title', e.target.value)} /></Field>
        <Field label="Nota"><Textarea className="min-h-[160px]" value={f.content} onChange={(e) => set('content', e.target.value)} placeholder="Escreve aqui…" /></Field>
        <Field label="Tags">
          <div className="flex flex-wrap items-center gap-2">
            {f.tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-rosa-100 px-2.5 py-1 text-xs font-semibold text-vinho">
                #{t}
                <button type="button" onClick={() => set('tags', f.tags.filter((x) => x !== t))} aria-label={`Remover ${t}`}><X size={12} /></button>
              </span>
            ))}
            <Input
              className="h-9 w-40"
              value={tag}
              placeholder="nova tag + Enter"
              onChange={(e) => setTag(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
              onBlur={addTag}
            />
          </div>
        </Field>
        <Field group label="Cor">
          <div className="flex gap-2">
            {(Object.keys(swatch) as Note['color'][]).map((c) => (
              <button key={c} type="button" onClick={() => set('color', c)} aria-label={c}
                className={cn('h-8 w-8 rounded-full border-2 transition', f.color === c ? 'scale-110 border-cereja' : 'border-vinho/15')}
                style={{ backgroundColor: swatch[c] }} />
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  )
}
