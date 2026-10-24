import { useState } from 'react'
import { Pencil, PiggyBank, Plus } from 'lucide-react'
import type { FinancialGoal } from '@/types'
import { db } from '@/store/db'
import { useFinancialGoals } from '@/hooks/useData'
import { money, ratio } from '@/utils/format'
import { relativeDay } from '@/utils/date'
import { celebrate, toast } from '@/hooks/useToast'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Modal } from '@/components/ui/Modal'
import { Field, FormGrid, Input } from '@/components/ui/Form'
import { DeleteButton, SectionTitle } from '@/components/ui/Misc'

function GoalForm({ initial, onClose }: { initial?: FinancialGoal; onClose: () => void }) {
  const [f, setF] = useState({ name: initial?.name ?? '', emoji: initial?.emoji ?? '🪙', current: String(initial?.current ?? ''), target: String(initial?.target ?? ''), deadline: initial?.deadline ?? '' })
  const valid = f.name.trim() && Number(f.target) > 0
  const save = () => {
    if (!valid) return
    const data = { name: f.name.trim(), emoji: f.emoji, current: Number(f.current) || 0, target: Number(f.target), deadline: f.deadline || undefined }
    if (initial) db.financialGoals.update(initial.id, data)
    else db.financialGoals.add(data)
    onClose()
  }
  return (
    <Modal open onClose={onClose} size="sm" title={initial ? 'Editar meta' : 'Nova meta financeira'}
      footer={<>{initial && <div className="mr-auto"><DeleteButton onConfirm={() => { db.financialGoals.remove(initial.id); onClose() }} /></div>}<Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={save} disabled={!valid}>Salvar</Button></>}>
      <div className="space-y-4">
        <div className="grid grid-cols-[72px_1fr] gap-3">
          <Field label="Emoji"><Input value={f.emoji} maxLength={4} onChange={(e) => setF({ ...f, emoji: e.target.value })} className="text-center text-lg" /></Field>
          <Field label="Nome"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Viagem dos sonhos" /></Field>
        </div>
        <FormGrid>
          <Field label="Já tenho (R$)"><Input type="number" value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} /></Field>
          <Field label="Quero chegar em (R$)"><Input type="number" value={f.target} onChange={(e) => setF({ ...f, target: e.target.value })} /></Field>
        </FormGrid>
        <Field label="Prazo (opcional)"><Input type="date" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} /></Field>
      </div>
    </Modal>
  )
}

function Deposit({ goal }: { goal: FinancialGoal }) {
  const [v, setV] = useState('')
  const [open, setOpen] = useState(false)
  if (!open) return <Button size="sm" variant="soft" onClick={() => setOpen(true)}><PiggyBank size={14} /> Guardar</Button>
  return (
    <form
      className="flex items-center gap-1.5"
      onSubmit={(e) => {
        e.preventDefault()
        const n = Number(v.replace(',', '.'))
        if (n) {
          const current = Math.max(0, goal.current + n)
          db.financialGoals.update(goal.id, { current })
          if (current >= goal.target && goal.current < goal.target) celebrate.goal()
          else toast(`${money(n)} guardados 🪙`)
        }
        setOpen(false); setV('')
      }}
    >
      <Input autoFocus inputMode="decimal" value={v} onChange={(e) => setV(e.target.value)} placeholder="R$" className="h-8 w-24 text-xs" />
      <Button type="submit" size="sm">Ok</Button>
    </form>
  )
}

export function FinancialGoals() {
  const goals = useFinancialGoals()
  const [editing, setEditing] = useState<FinancialGoal | null | 'new'>(null)
  return (
    <section>
      <SectionTitle kicker="pra onde estou indo" action={<Button size="sm" variant="secondary" onClick={() => setEditing('new')}><Plus size={14} /> Nova meta</Button>}>
        Metas financeiras
      </SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {goals.map((g) => {
          const p = ratio(g.current, g.target)
          return (
            <Card key={g.id} hover className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-rosa-100 text-xl">{g.emoji ?? '🪙'}</span>
                  <div>
                    <p className="font-bold text-vinho">{g.name}</p>
                    {g.deadline && <p className="text-xs text-vinho/55">até {relativeDay(g.deadline)}</p>}
                  </div>
                </div>
                <button onClick={() => setEditing(g)} className="grid h-8 w-8 place-items-center rounded-full text-vinho/50 hover:bg-vinho/5" aria-label="Editar meta"><Pencil size={14} /></button>
              </div>
              <p className="text-sm text-vinho/70"><b className="text-lg text-vinho">{money(g.current).replace(',00', '')}</b> / {money(g.target).replace(',00', '')}</p>
              <Progress value={p} height={10} color={p >= 100 ? '#7A7A4A' : '#961415'} />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cereja">{Math.round(p)}%{p >= 100 && ' · conquistada ✨'}</span>
                <Deposit goal={g} />
              </div>
            </Card>
          )
        })}
      </div>
      {editing && <GoalForm initial={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </section>
  )
}
