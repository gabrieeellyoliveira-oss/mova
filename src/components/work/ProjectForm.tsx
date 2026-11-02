import { moneyInput, parseMoney } from '@/utils/format'
import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { ProjectMetric, ProjectStatus, WorkProject } from '@/types'
import { db } from '@/store/db'
import { uid } from '@/utils/id'
import { formatShort, today } from '@/utils/date'
import { PROJECT_COLORS } from '@/data/constants'
import { PROJECT_METRICS, PROJECT_STATUS, formatProject } from '@/hooks/useProjects'
import { celebrate } from '@/hooks/useToast'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Segmented } from '@/components/ui/Chip'
import { Checkbox } from '@/components/ui/Checkbox'
import { DeleteButton } from '@/components/ui/Misc'
import { Field, FormGrid, Input, Select, Textarea } from '@/components/ui/Form'
import { cn } from '@/lib/cn'

type Draft = Omit<WorkProject, 'id' | 'createdAt'> & { id?: string }

const empty = (): Draft => ({ name: '', client: '', status: 'andamento', start: today(), deadline: '', metric: 'etapas', target: 0, unitLabel: '', steps: [], entries: [], color: PROJECT_COLORS[0], notes: '' })

/** Criar/editar projeto: prazo, como medir o avanço (etapas ou número com meta), etapas e registros. */
export function ProjectForm({ initial, onClose }: { initial?: WorkProject; onClose: () => void }) {
  const [f, setF] = useState<Draft>(() => ({ ...empty(), ...initial }))
  const [step, setStep] = useState('')
  const [target, setTarget] = useState(initial?.target ? moneyInput(initial.target) : '')
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setF((p) => ({ ...p, [k]: v }))
  const numeric = f.metric !== 'etapas'
  const targetValue = parseMoney(target)
  const valid = !!f.name.trim() && (!numeric || targetValue > 0)

  const addStep = () => {
    if (!step.trim()) return
    set('steps', [...f.steps, { id: uid(), title: step.trim(), done: false }])
    setStep('')
  }
  const save = () => {
    if (!valid) return
    const data = {
      ...f, name: f.name.trim(), client: f.client?.trim() || undefined, unitLabel: f.unitLabel?.trim() || undefined,
      notes: f.notes?.trim() || undefined, start: f.start || undefined, deadline: f.deadline || undefined, target: numeric ? targetValue : 0,
    }
    delete (data as Partial<Draft>).id
    if (f.id) {
      db.workProjects.update(f.id, data)
      if (data.status === 'concluido' && initial?.status !== 'concluido') celebrate.project(data.name)
    } else db.workProjects.add(data)
    onClose()
  }

  return (
    <Modal open onClose={onClose} title={f.id ? 'Editar projeto' : 'Novo projeto'} subtitle="Mesmo controle da meta do mês: meta, ritmo e prazo."
      footer={<>{f.id && <div className="mr-auto"><DeleteButton onConfirm={() => { db.workProjects.remove(f.id!); onClose() }} /></div>}<Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={save} disabled={!valid}>Salvar</Button></>}>
      <form onSubmit={(e) => { e.preventDefault(); save() }} className="space-y-4">
        <FormGrid>
          <Field label="Projeto"><Input autoFocus value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Site da Doceria" /></Field>
          <Field label="Cliente / empresa (opcional)"><Input value={f.client ?? ''} onChange={(e) => set('client', e.target.value)} placeholder="Doceria Pistache" /></Field>
          <Field label="Status">
            <Select value={f.status} onChange={(e) => set('status', e.target.value as ProjectStatus)}>
              {(Object.keys(PROJECT_STATUS) as ProjectStatus[]).map((s) => <option key={s} value={s}>{PROJECT_STATUS[s].label}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Início"><Input type="date" value={f.start ?? ''} onChange={(e) => set('start', e.target.value)} /></Field>
            <Field label="Prazo"><Input type="date" value={f.deadline ?? ''} onChange={(e) => set('deadline', e.target.value)} /></Field>
          </div>
        </FormGrid>

        <Field group label="Como medir o avanço">
          <Segmented<ProjectMetric> value={f.metric} onChange={(m) => set('metric', m)} options={(Object.keys(PROJECT_METRICS) as ProjectMetric[]).map((m) => ({ value: m, label: PROJECT_METRICS[m] }))} />
        </Field>
        {numeric && (
          <FormGrid>
            <Field label={f.metric === 'moeda' ? 'Meta (R$)' : f.metric === 'horas' ? 'Meta (horas)' : 'Meta (quantidade)'}><Input inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="0" /></Field>
            {f.metric === 'numero' && <Field label="Unidade"><Input value={f.unitLabel ?? ''} onChange={(e) => set('unitLabel', e.target.value)} placeholder="telas, entregas, posts…" /></Field>}
          </FormGrid>
        )}

        <Field group label={f.metric === 'etapas' ? 'Etapas (o avanço é a porcentagem concluída)' : 'Etapas (opcional, para organizar)'}>
          <div className="space-y-1.5">
            {f.steps.map((s) => (
              <div key={s.id} className="flex items-center gap-2 rounded-md bg-quente/60 px-2 py-1">
                <Checkbox checked={s.done} onChange={() => set('steps', f.steps.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)))} label={s.title} size={18} />
                <input value={s.title} onChange={(e) => set('steps', f.steps.map((x) => (x.id === s.id ? { ...x, title: e.target.value } : x)))} className={cn('min-w-0 flex-1 bg-transparent text-sm focus:outline-none', s.done && 'text-vinho/45 line-through')} aria-label="Etapa" />
                <button type="button" onClick={() => set('steps', f.steps.filter((x) => x.id !== s.id))} className="text-vinho/40 hover:text-cereja" aria-label={`Remover ${s.title}`}><X size={14} /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input value={step} onChange={(e) => setStep(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addStep() } }} placeholder="Nova etapa…" />
              <Button type="button" variant="soft" onClick={addStep} disabled={!step.trim()}><Plus size={14} /> Etapa</Button>
            </div>
          </div>
        </Field>

        {numeric && f.entries.length > 0 && (
          <Field group label="Registros">
            <ul className="max-h-40 space-y-1 overflow-y-auto">
              {[...f.entries].sort((a, b) => b.date.localeCompare(a.date)).map((e) => (
                <li key={e.id} className="flex items-center gap-2 rounded-md bg-quente/60 px-2 py-1 text-sm">
                  <span className="w-12 shrink-0 text-xs text-vinho/55">{formatShort(e.date)}</span>
                  <span className="font-semibold text-tinta">{formatProject(e.amount, f)}</span>
                  <span className="min-w-0 flex-1 truncate text-xs text-vinho/55">{e.note}</span>
                  <button type="button" onClick={() => set('entries', f.entries.filter((x) => x.id !== e.id))} className="text-vinho/40 hover:text-cereja" aria-label="Remover registro"><X size={14} /></button>
                </li>
              ))}
            </ul>
          </Field>
        )}

        <Field group label="Cor">
          <div className="flex gap-2">
            {PROJECT_COLORS.map((c) => <button key={c} type="button" onClick={() => set('color', c)} aria-label={`Cor ${c}`} className={cn('h-8 w-8 rounded-full border-2', f.color === c ? 'scale-110 border-tinta' : 'border-transparent')} style={{ backgroundColor: c }} />)}
          </div>
        </Field>
        <Field label="Notas (opcional)"><Textarea rows={2} value={f.notes ?? ''} onChange={(e) => set('notes', e.target.value)} placeholder="Links, combinados, contatos…" /></Field>
      </form>
    </Modal>
  )
}
