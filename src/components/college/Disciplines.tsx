import { useState } from 'react'
import { BookMarked, Plus } from 'lucide-react'
import type { Degree, Discipline } from '@/types'
import { db } from '@/store/db'
import { useDisciplines } from '@/hooks/useData'
import { parseMoney } from '@/utils/format'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Chip, Segmented } from '@/components/ui/Chip'
import { Field, FormGrid, Input } from '@/components/ui/Form'
import { DeleteButton } from '@/components/ui/Misc'
import { cn } from '@/lib/cn'

const fmt = (n?: number) => (n == null ? '—' : n.toLocaleString('pt-BR', { maximumFractionDigits: 1 }))
const num = (s: string) => { const n = parseMoney(s); return Number.isFinite(n) ? n : undefined }
/** Média das notas lançadas. */
export const average = (d: Discipline) => { const g = [d.n1, d.n2, d.n3].filter((x): x is number => x != null); return g.length ? g.reduce((a, x) => a + x, 0) / g.length : undefined }
const STATUS = { cursando: { label: 'Cursando', bg: '#C3AEEC' }, aprovada: { label: 'Aprovada', bg: '#A8CA96' }, reprovada: { label: 'Reprovada', bg: '#E07A8C' } }

function DisciplineForm({ initial, degree, onClose }: { initial?: Discipline; degree: Degree; onClose: () => void }) {
  const s = (n?: number) => (n == null ? '' : String(n).replace('.', ','))
  const [f, setF] = useState({ name: initial?.name ?? '', semester: String(initial?.semester ?? degree.currentSemester), professor: initial?.professor ?? '', n1: s(initial?.n1), n2: s(initial?.n2), n3: s(initial?.n3), absences: initial?.absences != null ? String(initial.absences) : '', status: initial?.status ?? ('cursando' as Discipline['status']) })
  const save = () => {
    if (!f.name.trim()) return
    const data = { degreeId: degree.id, name: f.name.trim(), semester: Math.max(1, Math.round(Number(f.semester)) || degree.currentSemester), professor: f.professor.trim() || undefined, n1: num(f.n1), n2: num(f.n2), n3: num(f.n3), absences: f.absences ? Math.max(0, Math.round(Number(f.absences))) : undefined, status: f.status }
    if (initial) db.disciplines.update(initial.id, data)
    else db.disciplines.add(data)
    onClose()
  }
  return (
    <Modal open onClose={onClose} title={initial ? initial.name : 'Nova disciplina'}
      footer={<>
        {initial && <span className="mr-auto"><DeleteButton onConfirm={() => { db.disciplines.remove(initial.id); onClose() }} /></span>}
        <Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={save} disabled={!f.name.trim()}>Salvar</Button>
      </>}>
      <div className="space-y-4">
        <FormGrid>
          <Field label="Disciplina"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Gestão de Pessoas" /></Field>
          <Field label="Professor(a) (opcional)"><Input value={f.professor} onChange={(e) => setF({ ...f, professor: e.target.value })} /></Field>
        </FormGrid>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Field label="Semestre"><Input inputMode="numeric" value={f.semester} onChange={(e) => setF({ ...f, semester: e.target.value })} /></Field>
          <Field label="Nota 1"><Input inputMode="decimal" value={f.n1} onChange={(e) => setF({ ...f, n1: e.target.value })} placeholder="—" /></Field>
          <Field label="Nota 2"><Input inputMode="decimal" value={f.n2} onChange={(e) => setF({ ...f, n2: e.target.value })} placeholder="—" /></Field>
          <Field label="Nota 3"><Input inputMode="decimal" value={f.n3} onChange={(e) => setF({ ...f, n3: e.target.value })} placeholder="—" /></Field>
          <Field label="Faltas"><Input inputMode="numeric" value={f.absences} onChange={(e) => setF({ ...f, absences: e.target.value })} placeholder="0" /></Field>
        </div>
        <Field label="Situação" group>
          <Segmented value={f.status} onChange={(v) => setF({ ...f, status: v })} options={(Object.keys(STATUS) as Discipline['status'][]).map((k) => ({ value: k, label: STATUS[k].label }))} />
        </Field>
      </div>
    </Modal>
  )
}

/** Disciplinas do curso, por semestre: notas, média, faltas e situação (como no portal do aluno). */
export function Disciplines({ degree }: { degree: Degree }) {
  const all = useDisciplines().filter((d) => d.degreeId === degree.id)
  const semesters = [...new Set([degree.currentSemester, ...all.map((d) => d.semester)])].sort((a, b) => a - b)
  const [sem, setSem] = useState(degree.currentSemester)
  const [edit, setEdit] = useState<Discipline | 'new' | null>(null)
  const list = all.filter((d) => d.semester === sem).sort((a, b) => a.name.localeCompare(b.name))
  const pass = degree.passGrade ?? 7
  const avgs = list.map(average).filter((x): x is number => x != null)
  const semAvg = avgs.length ? avgs.reduce((a, x) => a + x, 0) / avgs.length : undefined
  return (
    <div className="flex flex-col rounded-3xl border-2 border-ink bg-quente p-6 shadow-pixel">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-lavanda"><BookMarked size={20} /></span>
          <div>
            <h2 className="font-serif text-xl font-bold">Disciplinas</h2>
            <p className="text-xs text-tinta/60">média para passar: {fmt(pass)}{semAvg != null ? ` · média do semestre: ${fmt(semAvg)}` : ''}</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setEdit('new')}><Plus size={14} /> Disciplina</Button>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {semesters.map((s) => <Chip key={s} active={s === sem} onClick={() => setSem(s)}>{s}º semestre</Chip>)}
      </div>
      {list.length === 0 ? (
        <p className="py-4 text-sm text-tinta/55">Cadastre as disciplinas do {sem}º semestre para acompanhar notas e faltas.</p>
      ) : (
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead><tr className="text-left text-[11px] uppercase tracking-wide text-tinta/55">
              <th className="px-2 py-2 font-semibold">Disciplina</th><th className="px-2 font-semibold">N1</th><th className="px-2 font-semibold">N2</th><th className="px-2 font-semibold">N3</th><th className="px-2 font-semibold">Média</th><th className="px-2 font-semibold">Faltas</th><th className="px-2 font-semibold">Situação</th>
            </tr></thead>
            <tbody className="divide-y divide-ink/10">
              {list.map((d) => {
                const avg = average(d)
                return (
                  <tr key={d.id} onClick={() => setEdit(d)} className="cursor-pointer hover:bg-lavanda-100/60">
                    <td className="px-2 py-2.5"><span className="font-semibold">{d.name}</span>{d.professor && <span className="block text-xs text-tinta/55">{d.professor}</span>}</td>
                    <td className="px-2 tabular-nums">{fmt(d.n1)}</td><td className="px-2 tabular-nums">{fmt(d.n2)}</td><td className="px-2 tabular-nums">{fmt(d.n3)}</td>
                    <td className={cn('px-2 font-bold tabular-nums', avg != null && avg < pass ? 'text-cereja' : 'text-oliva-600')}>{fmt(avg)}</td>
                    <td className="px-2 tabular-nums">{d.absences ?? 0}</td>
                    <td className="px-2"><span className="rounded-full border-2 border-ink px-2 py-px text-[11px] font-semibold" style={{ backgroundColor: STATUS[d.status].bg }}>{STATUS[d.status].label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {edit && <DisciplineForm initial={edit === 'new' ? undefined : edit} degree={degree} onClose={() => setEdit(null)} />}
    </div>
  )
}
