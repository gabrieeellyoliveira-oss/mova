import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { Goal, GoalCategory, GoalStatus } from '@/types'
import { db } from '@/store/db'
import { GOAL_CATEGORIES, GOAL_STATUS } from '@/data/constants'
import { uid } from '@/utils/id'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, FormGrid, Input, Select, Textarea } from '@/components/ui/Form'
import { DeleteButton } from '@/components/ui/Misc'

export function GoalForm({ initial, onClose }: { initial?: Partial<Goal>; onClose: () => void }) {
  const [f, setF] = useState<Omit<Goal, 'id' | 'createdAt'> & { id?: string }>({
    name: '', description: '', category: 'Pessoal', deadline: '', manualProgress: 0, steps: [], status: 'comecando', ...initial,
  })
  const [step, setStep] = useState('')
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }))
  const addStep = () => { if (step.trim()) { set('steps', [...f.steps, { id: uid(), title: step.trim(), done: false }]); setStep('') } }

  const save = () => {
    if (!f.name.trim()) return
    const { id, ...data } = f
    const clean = { ...data, name: data.name.trim(), deadline: data.deadline || undefined }
    if (id) db.goals.update(id, clean)
    else db.goals.add(clean)
    onClose()
  }

  return (
    <Modal open onClose={onClose} title={f.id ? 'Editar meta' : 'Nova meta'} subtitle="O que você quer mover na sua vida?"
      footer={<>{f.id && <div className="mr-auto"><DeleteButton onConfirm={() => { db.goals.remove(f.id!); onClose() }} /></div>}<Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={save} disabled={!f.name.trim()}>Salvar</Button></>}>
      <div className="space-y-4">
        <Field label="Meta"><Input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Conhecer 12 lugares novos" /></Field>
        <Field label="Por que isso importa?"><Textarea value={f.description ?? ''} onChange={(e) => set('description', e.target.value)} className="min-h-[70px]" /></Field>
        <FormGrid>
          <Field label="Área">
            <Select value={f.category} onChange={(e) => set('category', e.target.value as GoalCategory)}>
              {GOAL_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.id}</option>)}
            </Select>
          </Field>
          <Field label="Prazo"><Input type="date" value={f.deadline ?? ''} onChange={(e) => set('deadline', e.target.value)} /></Field>
          <Field label="Status">
            <Select value={f.status} onChange={(e) => set('status', e.target.value as GoalStatus)}>
              {(Object.keys(GOAL_STATUS) as GoalStatus[]).map((s) => <option key={s} value={s}>{GOAL_STATUS[s]}</option>)}
            </Select>
          </Field>
          {!f.steps.length && (
            <Field label={`Progresso: ${f.manualProgress}%`}>
              <input type="range" min={0} max={100} step={5} value={f.manualProgress} onChange={(e) => set('manualProgress', Number(e.target.value))} className="mt-3 w-full accent-cereja" />
            </Field>
          )}
        </FormGrid>
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-vinho/70">Pequenas etapas</span>
          <ul className="space-y-1.5">
            {f.steps.map((s) => (
              <li key={s.id} className="flex items-center gap-2 rounded-xl bg-creme-100 px-3 py-2 text-sm">
                <span className="flex-1">{s.title}</span>
                <button onClick={() => set('steps', f.steps.filter((x) => x.id !== s.id))} className="text-vinho/40 hover:text-cereja" aria-label="Remover etapa"><X size={14} /></button>
              </li>
            ))}
          </ul>
          <form onSubmit={(e) => { e.preventDefault(); addStep() }} className="mt-2 flex gap-2">
            <Input value={step} onChange={(e) => setStep(e.target.value)} placeholder="Ex.: pesquisar 3 cafés novos" />
            <Button type="submit" size="icon" variant="soft" aria-label="Adicionar etapa"><Plus size={16} /></Button>
          </form>
          <p className="mt-1 text-xs text-vinho/50">Com etapas, o progresso é calculado sozinho.</p>
        </div>
      </div>
    </Modal>
  )
}
