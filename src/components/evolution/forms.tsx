import { useState } from 'react'
import type { BodyCheckin, Workout, WorkoutKind } from '@/types'
import { db } from '@/store/db'
import { today } from '@/utils/date'
import { moneyInput, parseMoney } from '@/utils/format'
import { toast } from '@/hooks/useToast'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { Field, FormGrid, Input, Textarea } from '@/components/ui/Form'
import { DeleteButton } from '@/components/ui/Misc'
import { PhotoInput } from '@/components/ui/PhotoInput'

export const WORKOUT_KINDS: Record<WorkoutKind, string> = {
  musculacao: 'Musculação', corrida: 'Corrida', caminhada: 'Caminhada', bike: 'Bike', natacao: 'Natação',
  pilates: 'Pilates', yoga: 'Yoga', funcional: 'Funcional', danca: 'Dança', outro: 'Outro',
}

/** Número digitado com vírgula ("62,5") → número; vazio vira undefined. */
const num = (v: string) => {
  const n = parseMoney(v)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

export function WorkoutForm({ initial, onClose }: { initial?: Workout; onClose: () => void }) {
  const [kind, setKind] = useState<WorkoutKind>(initial?.kind ?? 'musculacao')
  const [date, setDate] = useState(initial?.date ?? today())
  const [minutes, setMinutes] = useState(initial?.minutes ? String(initial.minutes) : '60')
  const [note, setNote] = useState(initial?.note ?? '')
  const mins = Math.round(parseMoney(minutes))
  const valid = !!date && mins > 0
  const save = () => {
    if (!valid) return
    const data = { kind, date, minutes: mins, note: note.trim() || undefined }
    if (initial) db.workouts.update(initial.id, data)
    else db.workouts.add(data)
    toast(initial ? 'Treino atualizado' : 'Treino registrado 💪')
    onClose()
  }
  return (
    <Modal
      open onClose={onClose} size="sm" title={initial ? 'Editar treino' : 'Novo treino'}
      footer={<>
        {initial && <span className="mr-auto"><DeleteButton onConfirm={() => { db.workouts.remove(initial.id); onClose() }} /></span>}
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={save} disabled={!valid}>Salvar</Button>
      </>}
    >
      <div className="space-y-4">
        <Field label="Tipo de treino" group>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(WORKOUT_KINDS) as WorkoutKind[]).map((k) => <Chip key={k} active={kind === k} onClick={() => setKind(k)}>{WORKOUT_KINDS[k]}</Chip>)}
          </div>
        </Field>
        <FormGrid>
          <Field label="Data"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Duração (min)"><Input inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value)} /></Field>
        </FormGrid>
        <Field label="Como foi? (opcional)"><Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex.: treino de perna, aumentei a carga no agachamento" /></Field>
      </div>
    </Modal>
  )
}

export function CheckinForm({ initial, onClose }: { initial?: BodyCheckin; onClose: () => void }) {
  const [photo, setPhoto] = useState<string | undefined>(initial?.photo)
  const [date, setDate] = useState(initial?.date ?? today())
  const [f, setF] = useState({
    weight: moneyInput(initial?.weight), waist: moneyInput(initial?.waist), hip: moneyInput(initial?.hip),
    arm: moneyInput(initial?.arm), thigh: moneyInput(initial?.thigh), note: initial?.note ?? '',
  })
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }))
  const data = { date, photo, weight: num(f.weight), waist: num(f.waist), hip: num(f.hip), arm: num(f.arm), thigh: num(f.thigh), note: f.note.trim() || undefined }
  const valid = !!date && !!(photo || data.weight || data.waist || data.hip || data.arm || data.thigh)
  const save = () => {
    if (!valid) return
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
    toast(initial ? 'Registro atualizado' : 'Evolução registrada ✨')
    onClose()
  }
  return (
    <Modal
      open onClose={onClose} title={initial ? 'Editar registro' : 'Registrar evolução'} subtitle="Foto e/ou medidas do dia — preencha só o que quiser."
      footer={<>
        {initial && <span className="mr-auto"><DeleteButton onConfirm={() => { db.bodyCheckins.remove(initial.id); onClose() }} /></span>}
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={save} disabled={!valid}>Salvar</Button>
      </>}
    >
      <div className="grid gap-5 sm:grid-cols-[200px_minmax(0,1fr)]">
        <Field label="Foto" group><PhotoInput value={photo} onChange={setPhoto} aspect="aspect-[3/4]" /></Field>
        <div className="space-y-4">
          <FormGrid>
            <Field label="Data"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
            <Field label="Peso (kg)"><Input inputMode="decimal" placeholder="Ex.: 62,5" value={f.weight} onChange={(e) => set('weight', e.target.value)} /></Field>
            <Field label="Cintura (cm)"><Input inputMode="decimal" value={f.waist} onChange={(e) => set('waist', e.target.value)} /></Field>
            <Field label="Quadril (cm)"><Input inputMode="decimal" value={f.hip} onChange={(e) => set('hip', e.target.value)} /></Field>
            <Field label="Braço (cm)"><Input inputMode="decimal" value={f.arm} onChange={(e) => set('arm', e.target.value)} /></Field>
            <Field label="Coxa (cm)"><Input inputMode="decimal" value={f.thigh} onChange={(e) => set('thigh', e.target.value)} /></Field>
          </FormGrid>
          <Field label="Observação (opcional)"><Textarea value={f.note} onChange={(e) => set('note', e.target.value)} placeholder="Como você está se sentindo?" /></Field>
        </div>
      </div>
    </Modal>
  )
}
