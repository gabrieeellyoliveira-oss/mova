import { useState } from 'react'
import type { WorkProject } from '@/types'
import { db } from '@/store/db'
import { uid } from '@/utils/id'
import { today } from '@/utils/date'
import { formatProject } from '@/hooks/useProjects'
import { toast } from '@/hooks/useToast'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, FormGrid, Input } from '@/components/ui/Form'

/** Registrar avanço num projeto medido por número (R$, horas ou quantidade). */
export function ProjectEntryForm({ project: p, onClose }: { project: WorkProject; onClose: () => void }) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today())
  const [note, setNote] = useState('')
  const value = Number(amount.replace(',', '.'))
  const valid = value > 0 && !!date
  const label = p.metric === 'moeda' ? 'Valor (R$)' : p.metric === 'horas' ? 'Horas' : `Quantidade${p.unitLabel ? ` (${p.unitLabel})` : ''}`

  const save = () => {
    if (!valid) return
    db.workProjects.update(p.id, { entries: [...p.entries, { id: uid(), amount: value, date, note: note.trim() || undefined }], status: p.status === 'planejado' ? 'andamento' : p.status })
    toast(`+ ${formatProject(value, p)} em ${p.name} ✓`)
    onClose()
  }

  return (
    <Modal open onClose={onClose} size="sm" title="Registrar avanço" subtitle={p.name}
      footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={save} disabled={!valid}>Salvar</Button></>}>
      <form onSubmit={(e) => { e.preventDefault(); save() }} className="space-y-4">
        <FormGrid>
          <Field label={label}><Input autoFocus inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" /></Field>
          <Field label="Data"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        </FormGrid>
        <Field label="Observação (opcional)"><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="O que avançou?" /></Field>
      </form>
    </Modal>
  )
}
