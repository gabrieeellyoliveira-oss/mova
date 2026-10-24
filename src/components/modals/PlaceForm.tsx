import { useState } from 'react'
import type { Company, Mood, Place, PlaceCategory, PlaceStatus } from '@/types'
import { db } from '@/store/db'
import { COMPANIES, MOODS, PLACE_CATEGORIES, PLACE_STATUS } from '@/data/constants'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, FormGrid, Input, Select, Textarea } from '@/components/ui/Form'
import { Chip } from '@/components/ui/Chip'
import { DeleteButton } from '@/components/ui/Misc'
import { PhotoInput } from '@/components/ui/PhotoInput'
import { toast } from '@/hooks/useToast'

type Draft = Omit<Place, 'id' | 'createdAt' | 'price'> & { id?: string; price: string }

export function PlaceForm({ initial, onClose }: { initial?: Partial<Place>; onClose: () => void }) {
  const [f, setF] = useState<Draft>({
    name: '', category: 'Cafés', neighborhood: '', status: 'quero', favorite: false, moods: [], goodFor: 'tanto faz', notes: '',
    ...initial,
    price: initial?.price !== undefined ? String(initial.price) : '',
  })
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setF((p) => ({ ...p, [k]: v }))
  const toggleMood = (m: Mood) => set('moods', f.moods.includes(m) ? f.moods.filter((x) => x !== m) : [...f.moods, m])

  const save = () => {
    if (!f.name.trim()) return
    const { id, ...rest } = f
    const data = { ...rest, price: Number(f.price.replace(',', '.')) || 0 }
    if (id) db.places.update(id, data)
    else db.places.add(data)
    toast(id ? 'Lugar atualizado' : 'Mais um lugar na lista 🌷', { kind: 'heart' })
    onClose()
  }

  return (
    <Modal
      open onClose={onClose} size="lg"
      title={f.id ? 'Editar lugar' : 'Novo lugar'}
      subtitle="Anota agora, vive depois."
      footer={
        <>
          {f.id && <div className="mr-auto"><DeleteButton onConfirm={() => { db.places.remove(f.id!); onClose() }} /></div>}
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={!f.name.trim()}>Salvar</Button>
        </>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); save() }} className="grid gap-5 md:grid-cols-[1fr_220px]">
        <div className="space-y-4">
          <Field label="Nome do lugar"><Input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Café da esquina" /></Field>
          <FormGrid>
            <Field label="Categoria">
              <Select value={f.category} onChange={(e) => set('category', e.target.value as PlaceCategory)}>
                {PLACE_CATEGORIES.map((c) => <option key={c.id}>{c.id}</option>)}
              </Select>
            </Field>
            <Field label="Bairro / localização"><Input value={f.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} placeholder="Meireles" /></Field>
            <Field label="Preço estimado (R$)" hint="Por pessoa. 0 = grátis"><Input inputMode="decimal" value={f.price} onChange={(e) => set('price', e.target.value)} placeholder="0" /></Field>
            <Field label="Status">
              <Select value={f.status} onChange={(e) => set('status', e.target.value as PlaceStatus)}>
                {(Object.keys(PLACE_STATUS) as PlaceStatus[]).map((s) => <option key={s} value={s}>{PLACE_STATUS[s].label}</option>)}
              </Select>
            </Field>
          </FormGrid>
          {f.status === 'planejado' && (
            <FormGrid>
              <Field label="Quando?"><Input type="date" value={f.plannedFor ?? ''} onChange={(e) => set('plannedFor', e.target.value)} /></Field>
              <Field label="Horário"><Input type="time" value={f.plannedTime ?? ''} onChange={(e) => set('plannedTime', e.target.value)} /></Field>
            </FormGrid>
          )}
          <Field label="Combina com">
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <Chip key={m.id} active={f.moods.includes(m.id)} onClick={() => toggleMood(m.id)}>{m.label}</Chip>
              ))}
            </div>
          </Field>
          <Field label="Bom para ir">
            <div className="flex flex-wrap gap-2">
              {COMPANIES.map((c) => <Chip key={c} active={f.goodFor === c} onClick={() => set('goodFor', c as Company)}>{c}</Chip>)}
            </div>
          </Field>
          <Field label="Notas"><Textarea value={f.notes ?? ''} onChange={(e) => set('notes', e.target.value)} placeholder="Pedir o bolo de laranja" /></Field>
        </div>
        <Field label="Foto"><PhotoInput value={f.photo} onChange={(v) => set('photo', v)} /></Field>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}
