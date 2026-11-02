import { useState } from 'react'
import type { BodyCheckin } from '@/types'
import { db } from '@/store/db'
import { today } from '@/utils/date'
import { toast } from '@/hooks/useToast'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Form'
import { DeleteButton } from '@/components/ui/Misc'
import { PhotoInput } from '@/components/ui/PhotoInput'

/** Foto de evolução: foto, data e uma observação (as medidas antigas continuam salvas). */
export function CheckinForm({ initial, onClose }: { initial?: BodyCheckin; onClose: () => void }) {
  const [photo, setPhoto] = useState<string | undefined>(initial?.photo)
  const [date, setDate] = useState(initial?.date ?? today())
  const [note, setNote] = useState(initial?.note ?? '')
  const valid = !!date && !!photo
  const save = () => {
    if (!valid) return
    const data = { date, photo, note: note.trim() || undefined }
    let id = initial?.id
    if (initial) db.bodyCheckins.update(initial.id, data)
    else id = db.bodyCheckins.add(data).id
    // fotos ocupam espaço: se o navegador não conseguiu salvar, avisa e desfaz
    let saved = true
    try { saved = (localStorage.getItem('mova:v1:bodyCheckins') ?? '').includes(`"${id}"`) } catch { /* ignore */ }
    if (!saved && id && !initial) {
      db.bodyCheckins.remove(id)
      toast('Sem espaço para mais fotos', { text: 'Apague algumas fotos antigas e tente de novo.', kind: 'info' })
      return
    }
    toast(initial ? 'Foto atualizada' : 'Foto de evolução salva ✨')
    onClose()
  }
  return (
    <Modal
      open onClose={onClose} title={initial ? 'Editar foto' : 'Nova foto de evolução'}
      footer={<>
        {initial && <span className="mr-auto"><DeleteButton onConfirm={() => { db.bodyCheckins.remove(initial.id); onClose() }} /></span>}
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={save} disabled={!valid}>Salvar</Button>
      </>}
    >
      <div className="grid gap-5 sm:grid-cols-[220px_minmax(0,1fr)]">
        <Field label="Foto" group><PhotoInput value={photo} onChange={setPhoto} aspect="aspect-[3/4]" /></Field>
        <div className="space-y-4">
          <Field label="Data"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Observação (opcional)"><Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Como você está se sentindo?" /></Field>
        </div>
      </div>
    </Modal>
  )
}
