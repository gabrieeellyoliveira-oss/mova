import { useState } from 'react'
import type { CalendarEvent, EventCategory } from '@/types'
import { db } from '@/store/db'
import { EVENT_CATEGORIES } from '@/data/constants'
import { today } from '@/utils/date'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, FormGrid, Input, Textarea } from '@/components/ui/Form'
import { DeleteButton } from '@/components/ui/Misc'
import { toast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'

type Draft = Omit<CalendarEvent, 'id' | 'createdAt'> & { id?: string }

export function EventForm({ initial, onClose }: { initial?: Partial<CalendarEvent>; onClose: () => void }) {
  const [f, setF] = useState<Draft>({
    title: '', date: today(), time: '09:00', category: 'pessoal', location: '', notes: '', ...initial,
  })
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setF((p) => ({ ...p, [k]: v }))
  const editing = !!f.id

  const save = () => {
    if (!f.title.trim()) return
    const { id, ...data } = f
    if (id) db.events.update(id, data)
    else db.events.add(data)
    toast(editing ? 'Compromisso atualizado' : 'Compromisso na agenda ✓')
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? 'Editar compromisso' : 'Novo compromisso'}
      subtitle="Bota na agenda e deixa a cabeça leve."
      footer={
        <>
          {editing && (
            <div className="mr-auto">
              <DeleteButton onConfirm={() => { db.events.remove(f.id!); onClose() }} />
            </div>
          )}
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={!f.title.trim()}>Salvar</Button>
        </>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); save() }} className="space-y-4">
        <Field label="O que é?">
          <Input value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Café com a Lu" />
        </Field>
        <FormGrid>
          <Field label="Data"><Input type="date" value={f.date} onChange={(e) => set('date', e.target.value)} /></Field>
          <Field label="Horário"><Input type="time" value={f.time} onChange={(e) => set('time', e.target.value)} /></Field>
        </FormGrid>
        <Field group label="Categoria">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(EVENT_CATEGORIES) as EventCategory[]).map((c) => {
              const m = EVENT_CATEGORIES[c]
              const active = f.category === c
              return (
                <button
                  type="button" key={c} onClick={() => set('category', c)}
                  className={cn('flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition', active ? 'text-quente' : 'bg-quente')}
                  style={{ borderColor: m.color, backgroundColor: active ? m.color : undefined, color: active ? undefined : m.color }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: active ? '#FFFCF8' : m.color }} />
                  {m.label}
                </button>
              )
            })}
          </div>
        </Field>
        <Field label="Onde?"><Input value={f.location ?? ''} onChange={(e) => set('location', e.target.value)} placeholder="Meireles" /></Field>
        <Field label="Observações"><Textarea value={f.notes ?? ''} onChange={(e) => set('notes', e.target.value)} placeholder="Levar o caderno…" /></Field>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}
