import { useState, type FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import type { BodyCheckin } from '@/types'
import { db } from '@/store/db'
import { today } from '@/utils/date'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Form'
import { PhotoInput } from '@/components/ui/PhotoInput'
import { MEASURES, parseNum } from '@/utils/body'

type Nums = Record<'weight' | 'waist' | 'hip' | 'arm' | 'thigh', string>
const str = (n?: number) => (n == null ? '' : String(n).replace('.', ','))

/** Novo registro de evolução: peso, medidas e/ou foto. Vai para a Evolução do mova também. */
export function CheckinForm({ initial, onClose }: { initial?: BodyCheckin; onClose: () => void }) {
  const [date, setDate] = useState(initial?.date ?? today())
  const [photo, setPhoto] = useState<string | undefined>(initial?.photo)
  const [note, setNote] = useState(initial?.note ?? '')
  const [nums, setNums] = useState<Nums>({
    weight: str(initial?.weight), waist: str(initial?.waist), hip: str(initial?.hip), arm: str(initial?.arm), thigh: str(initial?.thigh),
  })
  const [error, setError] = useState<string | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const values = Object.fromEntries(Object.entries(nums).map(([k, v]) => [k, parseNum(v)])) as Record<keyof Nums, number | undefined>
    if (!date) return setError('Escolha a data.')
    if (!photo && Object.values(values).every((v) => v == null)) return setError('Coloque o peso, alguma medida ou uma foto.')
    const data = { date, photo, note: note.trim() || undefined, ...values }
    let id = initial?.id
    if (initial) db.bodyCheckins.update(initial.id, data)
    else id = db.bodyCheckins.add(data).id
    // fotos ocupam espaço: se o navegador não conseguiu salvar, desfaz e avisa
    let saved = true
    try { saved = (localStorage.getItem('movafit:v1:bodyCheckins') ?? '').includes(`"${id}"`) } catch { /* ignore */ }
    if (!saved && id && !initial) {
      db.bodyCheckins.remove(id)
      return setError('Sem espaço para mais fotos neste aparelho. Apague fotos antigas e tente de novo.')
    }
    onClose()
  }

  const remove = () => {
    if (!initial || !window.confirm('Apagar este registro? Ele some também da Evolução do mova.')) return
    db.bodyCheckins.remove(initial.id)
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={initial ? 'Editar registro' : 'Novo registro'}
      subtitle="Aparece também na Evolução do mova."
      size="lg"
      footer={<>
        {initial && <Button variant="danger" onClick={remove} className="mr-auto"><Trash2 size={16} /> Apagar</Button>}
        <Button variant="light" onClick={onClose}>Cancelar</Button>
        <Button type="submit" form="checkin-form">Salvar</Button>
      </>}
    >
      <form id="checkin-form" onSubmit={submit} className="grid gap-5 sm:grid-cols-[220px_minmax(0,1fr)]" noValidate>
        <Field label="Foto (opcional)" group><PhotoInput value={photo} onChange={setPhoto} aspect="aspect-[3/4]" /></Field>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data"><Input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} /></Field>
            {MEASURES.map((m) => (
              <Field key={m.key} label={`${m.label} (${m.unit})`}>
                <Input inputMode="decimal" value={nums[m.key]} onChange={(e) => setNums((p) => ({ ...p, [m.key]: e.target.value.replace(/[^\d.,]/g, '') }))} placeholder={m.placeholder} />
              </Field>
            ))}
          </div>
          <p className="text-xs text-tinta/60">Dica: meça de manhã, em jejum, depois de ir ao banheiro — sempre do mesmo jeito. A cintura na altura do umbigo.</p>
          <Field label="Observação (opcional)"><Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Como você está se sentindo?" /></Field>
          {error && <p role="alert" className="rounded-2xl border-2 border-cereja bg-cereja/10 px-4 py-2.5 text-sm font-medium text-cereja">{error}</p>}
        </div>
      </form>
    </Modal>
  )
}
