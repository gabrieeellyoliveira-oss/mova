import { useState } from 'react'
import type { AreaId, Priority, Task } from '@/types'
import { db } from '@/store/db'
import { AREAS, PRIORITIES } from '@/data/constants'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, FormGrid, Input, Select } from '@/components/ui/Form'
import { Segmented } from '@/components/ui/Chip'
import { DeleteButton } from '@/components/ui/Misc'
import { toast } from '@/hooks/useToast'

type Draft = Pick<Task, 'title' | 'priority' | 'area'> & { date?: string; id?: string }

export function TaskForm({ initial, onClose }: { initial?: Partial<Task>; onClose: () => void }) {
  const [f, setF] = useState<Draft>({ title: '', priority: 'media', area: 'geral', date: '', ...initial })
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setF((p) => ({ ...p, [k]: v }))

  const save = () => {
    if (!f.title.trim()) return
    const data = { title: f.title.trim(), priority: f.priority, area: f.area, date: f.date || undefined }
    if (f.id) db.tasks.update(f.id, data)
    else {
      const max = Math.max(-1, ...db.tasks.store.get().map((t) => t.order))
      db.tasks.add({ ...data, done: false, order: max + 1 })
      toast('Tarefa anotada ✓')
    }
    onClose()
  }

  return (
    <Modal
      open onClose={onClose} size="sm"
      title={f.id ? 'Editar tarefa' : 'Nova tarefa'}
      footer={
        <>
          {f.id && <div className="mr-auto"><DeleteButton onConfirm={() => { db.tasks.remove(f.id!); onClose() }} /></div>}
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={!f.title.trim()}>Salvar</Button>
        </>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); save() }} className="space-y-4">
        <Field label="Tarefa"><Input value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Ler 20 páginas" /></Field>
        <Field group label="Prioridade">
          <Segmented<Priority>
            value={f.priority} onChange={(v) => set('priority', v)}
            options={(['baixa', 'media', 'alta'] as Priority[]).map((p) => ({ value: p, label: PRIORITIES[p].label }))}
          />
        </Field>
        <FormGrid>
          <Field label="Área do MOVA">
            <Select value={f.area} onChange={(e) => set('area', e.target.value as AreaId)}>
              {Object.values(AREAS).map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </Select>
          </Field>
          <Field label="Dia (opcional)"><Input type="date" value={f.date ?? ''} onChange={(e) => set('date', e.target.value)} /></Field>
        </FormGrid>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}
