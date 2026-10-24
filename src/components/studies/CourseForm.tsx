import { useState } from 'react'
import type { Course } from '@/types'
import { db } from '@/store/db'
import { COURSE_COLORS } from '@/data/constants'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, FormGrid, Input, Textarea, Toggle } from '@/components/ui/Form'
import { DeleteButton } from '@/components/ui/Misc'
import { cn } from '@/lib/cn'

export function CourseForm({ initial, onClose }: { initial?: Course; onClose: () => void }) {
  const [f, setF] = useState({
    name: initial?.name ?? '', institution: initial?.institution ?? '', modules: String(initial?.modules ?? ''),
    lessonsTotal: String(initial?.lessonsTotal ?? ''), lessonsDone: String(initial?.lessonsDone ?? '0'),
    deadline: initial?.deadline ?? '', notes: initial?.notes ?? '', color: initial?.color ?? COURSE_COLORS[0], active: initial?.active ?? true,
  })
  const valid = f.name.trim() && Number(f.lessonsTotal) > 0
  const save = () => {
    if (!valid) return
    const total = Number(f.lessonsTotal)
    const data = { name: f.name.trim(), institution: f.institution, modules: Number(f.modules) || 1, lessonsTotal: total, lessonsDone: Math.min(total, Number(f.lessonsDone) || 0), deadline: f.deadline || undefined, notes: f.notes, color: f.color, active: f.active }
    if (initial) db.courses.update(initial.id, data)
    else db.courses.add(data)
    onClose()
  }
  return (
    <Modal open onClose={onClose} title={initial ? 'Editar curso' : 'Novo curso'} subtitle="Aprender também é se mover."
      footer={<>{initial && <div className="mr-auto"><DeleteButton onConfirm={() => { db.courses.remove(initial.id); onClose() }} /></div>}<Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={save} disabled={!valid}>Salvar</Button></>}>
      <div className="space-y-4">
        <FormGrid>
          <Field label="Nome do curso"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Instituição"><Input value={f.institution} onChange={(e) => setF({ ...f, institution: e.target.value })} /></Field>
          <Field label="Módulos"><Input type="number" min={1} value={f.modules} onChange={(e) => setF({ ...f, modules: e.target.value })} /></Field>
          <Field label="Prazo"><Input type="date" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} /></Field>
          <Field label="Total de aulas"><Input type="number" min={1} value={f.lessonsTotal} onChange={(e) => setF({ ...f, lessonsTotal: e.target.value })} /></Field>
          <Field label="Aulas concluídas"><Input type="number" min={0} value={f.lessonsDone} onChange={(e) => setF({ ...f, lessonsDone: e.target.value })} /></Field>
        </FormGrid>
        <Field label="Notas"><Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {COURSE_COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setF({ ...f, color: c })} aria-label={`Cor ${c}`} className={cn('h-7 w-7 rounded-full border-2', f.color === c ? 'scale-110 border-tinta' : 'border-transparent')} style={{ backgroundColor: c }} />
            ))}
          </div>
          <Toggle checked={f.active} onChange={(v) => setF({ ...f, active: v })} label="Curso ativo" />
        </div>
      </div>
    </Modal>
  )
}
