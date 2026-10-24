import { useState } from 'react'
import type { WorkEntry } from '@/types'
import { db } from '@/store/db'
import { today } from '@/utils/date'
import { useWorkSettings, formatWork } from '@/hooks/useWork'
import { toast } from '@/hooks/useToast'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, FormGrid, Input } from '@/components/ui/Form'
import { DeleteButton } from '@/components/ui/Misc'

export function WorkEntryForm({ initial, onClose }: { initial?: Partial<WorkEntry>; onClose: () => void }) {
  const s = useWorkSettings()
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : '')
  const [date, setDate] = useState(initial?.date ?? today())
  const [note, setNote] = useState(initial?.note ?? '')
  const value = Number(amount.replace(',', '.'))
  const valid = value > 0 && !!date

  const save = () => {
    if (!valid) return
    const data = { amount: value, date, note: note.trim() || undefined }
    if (initial?.id) db.workEntries.update(initial.id, data)
    else {
      db.workEntries.add(data)
      toast(`+ ${formatWork(value, s)} registrados ✓`)
    }
    onClose()
  }

  return (
    <Modal
      open onClose={onClose} size="sm"
      title={initial?.id ? 'Editar registro' : 'Registrar resultado'}
      subtitle={`${s.metricName} do dia`}
      footer={
        <>
          {initial?.id && <div className="mr-auto"><DeleteButton onConfirm={() => { db.workEntries.remove(initial.id!); onClose() }} /></div>}
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={!valid}>Salvar</Button>
        </>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); save() }} className="space-y-4">
        <FormGrid>
          <Field label={s.unit === 'moeda' ? 'Valor (R$)' : `Quantidade (${s.metricName.toLowerCase()})`}>
            <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={s.unit === 'moeda' ? '0,00' : '0'} />
          </Field>
          <Field label="Data"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        </FormGrid>
        <Field label="Observação"><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Cliente, contrato, detalhe…" /></Field>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}
