import { useState } from 'react'
import { Check, GraduationCap, Pencil, Pin, PinOff, Plus, X } from 'lucide-react'
import type { Assignment, AssignmentKind, AssignmentStatus, Degree, DegreeLevel } from '@/types'
import { db } from '@/store/db'
import { useAssignments, useDegrees } from '@/hooks/useData'
import { daysBetween, formatShort, today } from '@/utils/date'
import { parseMoney } from '@/utils/format'
import { toast } from '@/hooks/useToast'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Chip, Segmented } from '@/components/ui/Chip'
import { Field, FormGrid, Input, Textarea } from '@/components/ui/Form'
import { DeleteButton } from '@/components/ui/Misc'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/cn'
import { Disciplines } from './Disciplines'

export const LEVELS: Record<DegreeLevel, string> = { graduacao: 'Graduação', pos: 'Pós-graduação', mba: 'MBA', tecnico: 'Técnico', mestrado: 'Mestrado', outro: 'Outro' }
export const KINDS: Record<AssignmentKind, string> = { extensao: 'Extensão', trabalho: 'Trabalho', prova: 'Prova', atividade: 'Atividade', tcc: 'TCC' }
export const STATUS: Record<AssignmentStatus, { label: string; bg: string }> = {
  'a-fazer': { label: 'A fazer', bg: '#EBE7E0' },
  fazendo: { label: 'Fazendo', bg: '#C3AEEC' },
  entregue: { label: 'Entregue', bg: '#A8CA96' },
}
export const pctSteps = (a: Assignment) => (a.steps.length ? (a.steps.filter((s) => s.done).length / a.steps.length) * 100 : a.status === 'entregue' ? 100 : 0)

function DegreeForm({ initial, onClose }: { initial?: Degree; onClose: () => void }) {
  const [f, setF] = useState({ name: initial?.name ?? '', institution: initial?.institution ?? '', current: String(initial?.currentSemester ?? 1), total: String(initial?.totalSemesters ?? 4), level: initial?.level ?? ('graduacao' as DegreeLevel), done: !!initial?.done, pass: initial?.passGrade != null ? String(initial.passGrade).replace('.', ',') : '7' })
  const save = () => {
    if (!f.name.trim()) return
    const total = Math.max(1, Math.round(Number(f.total)) || 4)
    const data = { name: f.name.trim(), institution: f.institution.trim(), level: f.level, done: f.done || undefined, passGrade: parseMoney(f.pass) > 0 ? parseMoney(f.pass) : 7, totalSemesters: total, currentSemester: Math.min(total, Math.max(1, Math.round(Number(f.current)) || 1)) }
    if (initial) db.degrees.update(initial.id, data)
    else db.degrees.add(data)
    onClose()
  }
  return (
    <Modal open onClose={onClose} size="sm" title={initial ? 'Editar curso' : 'Novo curso'}
      footer={<>
        {initial && <span className="mr-auto"><DeleteButton onConfirm={() => { db.degrees.remove(initial.id); onClose() }} /></span>}
        <Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={save}>Salvar</Button>
      </>}>
      <div className="space-y-4">
        <Field label="Tipo" group>
          <div className="flex flex-wrap gap-2">{(Object.keys(LEVELS) as DegreeLevel[]).map((l) => <Chip key={l} active={f.level === l} onClick={() => setF({ ...f, level: l })}>{LEVELS[l]}</Chip>)}</div>
        </Field>
        <Field label="Curso"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Recursos Humanos" /></Field>
        <Field label="Instituição"><Input value={f.institution} onChange={(e) => setF({ ...f, institution: e.target.value })} placeholder="Unigrande" /></Field>
        <FormGrid>
          <Field label="Semestre atual"><Input inputMode="numeric" value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} /></Field>
          <Field label="Total de semestres"><Input inputMode="numeric" value={f.total} onChange={(e) => setF({ ...f, total: e.target.value })} /></Field>
          <Field label="Média para passar"><Input inputMode="decimal" value={f.pass} onChange={(e) => setF({ ...f, pass: e.target.value })} /></Field>
        </FormGrid>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.done} onChange={(e) => setF({ ...f, done: e.target.checked })} className="h-4 w-4 accent-[#0C0A0E]" /> Curso concluído</label>
      </div>
    </Modal>
  )
}

export function AssignmentForm({ initial, degreeId, onClose }: { initial?: Assignment; degreeId?: string; onClose: () => void }) {
  const [f, setF] = useState({
    title: initial?.title ?? '', subject: initial?.subject ?? '', kind: initial?.kind ?? ('trabalho' as AssignmentKind), dueDate: initial?.dueDate ?? '',
    pinned: !!initial?.pinned, status: initial?.status ?? ('a-fazer' as AssignmentStatus), steps: initial?.steps ?? [], grade: initial?.grade != null ? String(initial.grade).replace('.', ',') : '', notes: initial?.notes ?? '',
  })
  const [step, setStep] = useState('')
  const save = () => {
    if (!f.title.trim()) return
    const g = parseMoney(f.grade)
    const data = { degreeId: initial?.degreeId ?? degreeId, title: f.title.trim(), subject: f.subject.trim() || undefined, kind: f.kind, dueDate: f.dueDate || undefined, status: f.status, steps: f.steps, grade: Number.isFinite(g) ? g : undefined, notes: f.notes.trim() || undefined, pinned: f.pinned || undefined }
    if (initial) db.assignments.update(initial.id, data)
    else db.assignments.add(data)
    toast(initial ? 'Trabalho atualizado' : 'Trabalho adicionado 📚')
    onClose()
  }
  const addStep = () => { if (step.trim()) { setF({ ...f, steps: [...f.steps, { text: step.trim(), done: false }] }); setStep('') } }
  return (
    <Modal open onClose={onClose} size="lg" title={initial ? initial.title : 'Novo trabalho ou prova'}
      footer={<>
        {initial && <span className="mr-auto"><DeleteButton onConfirm={() => { db.assignments.remove(initial.id); onClose() }} /></span>}
        <Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={save} disabled={!f.title.trim()}>Salvar</Button>
      </>}>
      <div className="space-y-4">
        <FormGrid>
          <Field label="Nome"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Trabalho de extensão" /></Field>
          <Field label="Disciplina (opcional)"><Input value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} placeholder="Gestão de Pessoas" /></Field>
        </FormGrid>
        <Field label="Tipo" group>
          <div className="flex flex-wrap gap-2">{(Object.keys(KINDS) as AssignmentKind[]).map((k) => <Chip key={k} active={f.kind === k} onClick={() => setF({ ...f, kind: k })}>{KINDS[k]}</Chip>)}</div>
        </Field>
        <FormGrid>
          <Field label="Data de entrega"><Input type="date" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} /></Field>
          <Field label="Nota (opcional)"><Input inputMode="decimal" value={f.grade} onChange={(e) => setF({ ...f, grade: e.target.value })} placeholder="ex.: 8,5" /></Field>
        </FormGrid>
        <Field label="Situação" group>
          <Segmented value={f.status} onChange={(v) => setF({ ...f, status: v })} options={(Object.keys(STATUS) as AssignmentStatus[]).map((s) => ({ value: s, label: STATUS[s].label }))} />
        </Field>
        <Field label="Etapas" group>
          <ul className="space-y-1.5">
            {f.steps.map((s, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <button type="button" onClick={() => setF({ ...f, steps: f.steps.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) })} aria-pressed={s.done} aria-label={`Etapa ${s.text}`}
                  className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 border-ink', s.done ? 'bg-ink text-ink-fg' : 'bg-quente')}>{s.done && <Check size={13} strokeWidth={3} />}</button>
                <span className={cn('flex-1 text-sm', s.done && 'text-tinta/45 line-through')}>{s.text}</span>
                <button type="button" onClick={() => setF({ ...f, steps: f.steps.filter((_, j) => j !== i) })} className="text-tinta/40 hover:text-cereja" aria-label={`Remover etapa ${s.text}`}><X size={14} /></button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex gap-2">
            <Input value={step} onChange={(e) => setStep(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addStep() } }} placeholder="Nova etapa (ex.: escrever a introdução)" aria-label="Nova etapa" />
            <Button size="icon" variant="soft" onClick={addStep} aria-label="Adicionar etapa"><Plus size={16} /></Button>
          </div>
        </Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.pinned} onChange={(e) => setF({ ...f, pinned: e.target.checked })} className="h-4 w-4 accent-[#0C0A0E]" /> Fixar na Visão geral (dashboard)</label>
        <Field label="Anotações"><Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Orientações do professor, links, ideias…" /></Field>
      </div>
    </Modal>
  )
}

/** Aba Graduação (em Meus cursos): cursos (graduação, pós…), semestre, trabalhos/provas com etapas e disciplinas. */
export function CollegeSection() {
  const degrees = useDegrees()
  const assignments = useAssignments()
  const [editDegree, setEditDegree] = useState<Degree | 'new' | null>(null)
  const [editA, setEditA] = useState<Assignment | 'new' | null>(null)
  const [showDone, setShowDone] = useState(false)
  const [selId, setSelId] = useState<string | null>(null)
  const ordered = [...degrees].sort((a, b) => Number(!!a.done) - Number(!!b.done))
  const degree = ordered.find((d) => d.id === selId) ?? ordered[0]
  const mine = assignments.filter((a) => !degree || a.degreeId === degree.id || (!a.degreeId && degree.id === ordered[0]?.id))
  const list = mine
    .filter((a) => showDone || a.status !== 'entregue')
    .sort((a, b) => Number(a.status === 'entregue') - Number(b.status === 'entregue') || (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'))
  const toggleStep = (a: Assignment, i: number) => {
    const steps = a.steps.map((s, j) => (j === i ? { ...s, done: !s.done } : s))
    db.assignments.update(a.id, { steps, status: a.status === 'a-fazer' ? 'fazendo' : a.status })
  }
  const delivered = mine.filter((a) => a.status === 'entregue').length

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {ordered.map((d) => (
          <Chip key={d.id} active={d.id === degree?.id} onClick={() => setSelId(d.id)}>{d.name}<span className="opacity-60">· {LEVELS[d.level ?? 'graduacao']}{d.done ? ' ✓' : ''}</span></Chip>
        ))}
        <Button size="sm" variant="light" onClick={() => setEditDegree('new')}><Plus size={14} /> Adicionar curso</Button>
      </div>
    <div className="space-y-6">
      <div className="rounded-3xl border-2 border-ink bg-ink p-5 text-ink-fg shadow-lavanda sm:p-6">
        {degree ? (
          <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.3em] text-lavanda">{LEVELS[degree.level ?? 'graduacao']}{degree.done ? ' · concluído' : ''}</p>
              <p className="mt-1 truncate font-serif text-2xl font-bold leading-tight sm:text-3xl">{degree.name}</p>
              <p className="text-sm text-ink-fg/70">{degree.institution}</p>
            </div>
            <div>
              <p className="text-sm text-ink-fg/75">Semestre <b className="text-ink-fg">{degree.currentSemester}</b> de {degree.totalSemesters}</p>
              <Progress value={(degree.currentSemester / degree.totalSemesters) * 100} color="#C3AEEC" track="rgba(246,241,231,0.15)" height={10} className="mt-2" />
            </div>
            <div className="flex items-center gap-3 text-ink">
              <div className="rounded-2xl bg-lavanda px-4 py-2.5"><p className="text-xs">Em andamento</p><p className="font-serif text-2xl font-bold leading-none">{mine.length - delivered}</p></div>
              <div className="rounded-2xl bg-salvia px-4 py-2.5"><p className="text-xs">Entregues</p><p className="font-serif text-2xl font-bold leading-none">{delivered}</p></div>
              <button onClick={() => setEditDegree(degree)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink-fg/40 text-ink-fg hover:bg-ink-fg/10" aria-label="Editar curso"><Pencil size={14} /></button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-ink-fg/75">Cadastre um curso (graduação, pós, MBA…) para acompanhar semestre, trabalhos e provas.</p>
            <Button onClick={() => setEditDegree('new')}><GraduationCap size={16} /> Adicionar curso</Button>
          </div>
        )}
      </div>

      <div className="flex flex-col rounded-3xl border-2 border-ink bg-quente p-6 shadow-pixel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-bold">Trabalhos e provas</h2>
            <p className="text-xs text-tinta/60">toque para abrir; marque as etapas conforme for fazendo</p>
          </div>
          <div className="flex items-center gap-2">
            {delivered > 0 && <Chip active={showDone} onClick={() => setShowDone(!showDone)}>Entregues</Chip>}
            <Button size="sm" onClick={() => setEditA('new')}><Plus size={14} /> Novo</Button>
          </div>
        </div>
        {list.length === 0 ? (
          <p className="py-6 text-center text-sm text-tinta/55">Nenhum trabalho pendente. 🎉</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {list.map((a) => {
              const pct = pctSteps(a)
              const left = a.dueDate ? daysBetween(today(), a.dueDate) : null
              const st = STATUS[a.status]
              return (
                <li key={a.id} className="rounded-2xl border-2 border-ink bg-quente p-4">
                  <div className="float-right ml-2">
                    <button onClick={() => db.assignments.update(a.id, { pinned: !a.pinned })} title={a.pinned ? 'Tirar da Visão geral' : 'Fixar na Visão geral'} aria-label={a.pinned ? 'Tirar da Visão geral' : 'Fixar na Visão geral'}
                      className={cn('grid h-8 w-8 place-items-center rounded-full border-2 border-ink', a.pinned ? 'bg-lavanda' : 'bg-quente hover:bg-lavanda-100')}>{a.pinned ? <Pin size={14} /> : <PinOff size={14} />}</button>
                  </div>
                  <button onClick={() => setEditA(a)} className="block w-full text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border-2 border-ink px-2 py-px text-[11px] font-semibold" style={{ backgroundColor: st.bg }}>{st.label}</span>
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-tinta/55">{KINDS[a.kind]}{a.subject ? ` · ${a.subject}` : ''}</span>
                    </div>
                    <p className="mt-2 font-serif text-lg font-bold leading-snug">{a.title}</p>
                    <p className={cn('text-xs', left !== null && left < 0 && a.status !== 'entregue' ? 'font-semibold text-cereja' : 'text-tinta/60')}>
                      {a.dueDate ? `entrega ${formatShort(a.dueDate)}${a.status !== 'entregue' && left !== null ? (left < 0 ? ` · atrasado ${-left} ${-left === 1 ? 'dia' : 'dias'}` : left === 0 ? ' · é hoje!' : ` · faltam ${left} ${left === 1 ? 'dia' : 'dias'}`) : ''}` : 'sem data de entrega — toque para definir'}
                      {a.grade != null ? ` · nota ${String(a.grade).replace('.', ',')}` : ''}
                    </p>
                  </button>
                  {a.steps.length > 0 && (
                    <>
                      <div className="mt-3 flex items-center gap-2"><Progress value={pct} height={6} className="flex-1" /><span className="text-xs font-semibold">{Math.round(pct)}%</span></div>
                      <ul className="mt-3 space-y-1.5">
                        {a.steps.map((s, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm">
                            <button onClick={() => toggleStep(a, i)} aria-pressed={s.done} aria-label={`Etapa ${s.text}`}
                              className={cn('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 border-ink', s.done ? 'bg-ink text-ink-fg' : 'bg-quente hover:bg-lavanda-100')}>{s.done && <Check size={12} strokeWidth={3} />}</button>
                            <span className={cn('leading-snug', s.done && 'text-tinta/45 line-through')}>{s.text}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

    </div>
      {degree && <Disciplines degree={degree} />}
      {editDegree && <DegreeForm initial={editDegree === 'new' ? undefined : editDegree} onClose={() => setEditDegree(null)} />}
      {editA && <AssignmentForm initial={editA === 'new' ? undefined : editA} degreeId={degree?.id} onClose={() => setEditA(null)} />}
    </section>
  )
}
