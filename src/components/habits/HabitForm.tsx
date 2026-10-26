import { useState } from 'react'
import type { Habit } from '@/types'
import { db } from '@/store/db'
import { HABIT_COLORS } from '@/data/constants'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, Input, Toggle } from '@/components/ui/Form'
import { DeleteButton } from '@/components/ui/Misc'
import { cn } from '@/lib/cn'

const EMOJIS = ['💧', '🧴', '🏋️', '📚', '📖', '🌷', '🧺', '🌙', '🧘', '🥗', '🚶‍♀️', '✍️', '☀️', '🎨']

export function HabitForm({ initial, onClose }: { initial?: Partial<Habit>; onClose: () => void }) {
  const [f, setF] = useState({ name: initial?.name ?? '', emoji: initial?.emoji ?? '🌷', color: initial?.color ?? HABIT_COLORS[0], weeklyTarget: initial?.weeklyTarget ?? 5, health: initial?.health ?? false, training: initial?.training ?? false })
  const save = () => {
    if (!f.name.trim()) return
    if (initial?.id) db.habits.update(initial.id, { ...f, name: f.name.trim() })
    else db.habits.add({ ...f, name: f.name.trim(), log: [] })
    onClose()
  }
  return (
    <Modal open onClose={onClose} size="sm" title={initial?.id ? 'Editar hábito' : 'Novo hábito'} subtitle="Um cuidado pequeno, repetido com carinho."
      footer={<>{initial?.id && <div className="mr-auto"><DeleteButton onConfirm={() => { db.habits.remove(initial.id!); onClose() }} /></div>}<Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={save} disabled={!f.name.trim()}>Salvar</Button></>}>
      <div className="space-y-4">
        <Field label="Hábito"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Alongar pela manhã" /></Field>
        <Field label="Emoji">
          <div className="flex flex-wrap gap-1.5">
            {EMOJIS.map((e) => (
              <button key={e} type="button" onClick={() => setF({ ...f, emoji: e })} className={cn('grid h-10 w-10 place-items-center rounded-xl text-lg transition', f.emoji === e ? 'bg-rosa-100 ring-2 ring-cereja' : 'bg-quente hover:bg-rosa-50')}>{e}</button>
            ))}
          </div>
        </Field>
        <Field label="Cor">
          <div className="flex gap-2">
            {HABIT_COLORS.map((c) => <button key={c} type="button" onClick={() => setF({ ...f, color: c })} aria-label={`Cor ${c}`} className={cn('h-8 w-8 rounded-full border-2', f.color === c ? 'scale-110 border-tinta' : 'border-transparent')} style={{ backgroundColor: c }} />)}
          </div>
        </Field>
        <Field label={`Quantas vezes por semana? ${f.weeklyTarget}x`}>
          <input type="range" min={1} max={7} value={f.weeklyTarget} onChange={(e) => setF({ ...f, weeklyTarget: Number(e.target.value) })} className="w-full accent-cereja" />
        </Field>
        <div className="space-y-2">
          <Toggle checked={f.health} onChange={(v) => setF({ ...f, health: v })} label="Conta pra Saúde & bem-estar" />
          <Toggle checked={f.training} onChange={(v) => setF({ ...f, training: v, health: v || f.health })} label="É treino (+10 XP)" />
        </div>
      </div>
    </Modal>
  )
}
