import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import type { CustomAchievement } from '@/types'
import { db } from '@/store/db'
import { today } from '@/utils/date'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Segmented } from '@/components/ui/Chip'
import { DeleteButton } from '@/components/ui/Misc'
import { Field, FormGrid, Input, Textarea } from '@/components/ui/Form'
import { PixelIcon, type SpriteName } from './PixelIcon'
import { cn } from '@/lib/cn'

const ICONS: SpriteName[] = ['trophy', 'star', 'sparkle', 'heart', 'cherry', 'book', 'laptop', 'briefcase', 'coins', 'piggy', 'target', 'dumbbell', 'cup', 'map', 'pin', 'home', 'city', 'sun', 'moon', 'tree', 'note', 'check']

type Kind = 'feita' | 'meta'

/** Criar/editar uma conquista própria: já conquistada, ou com meta e progresso. */
export function CustomAchievementForm({ initial, onClose }: { initial?: CustomAchievement; onClose: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [sprite, setSprite] = useState<SpriteName>((initial?.sprite as SpriteName) ?? 'trophy')
  const [kind, setKind] = useState<Kind>(initial && initial.target > 1 ? 'meta' : initial && initial.current < initial.target ? 'meta' : 'feita')
  const [target, setTarget] = useState(String(initial?.target && initial.target > 1 ? initial.target : 5))
  const [current, setCurrent] = useState(initial?.current ?? 0)
  const [date, setDate] = useState(initial?.unlockedAt ?? today())
  const goal = Math.max(1, Math.round(Number(target) || 1))
  const valid = !!title.trim()

  const save = () => {
    if (!valid) return
    const done = kind === 'feita' || current >= goal
    const data = {
      title: title.trim(), description: description.trim() || undefined, sprite,
      target: kind === 'feita' ? 1 : goal,
      current: kind === 'feita' ? 1 : Math.min(current, goal),
      unlockedAt: done ? (kind === 'feita' ? date : initial?.unlockedAt ?? today()) : undefined,
    }
    if (initial) db.customAchievements.update(initial.id, data)
    else db.customAchievements.add(data)
    onClose()
  }

  return (
    <Modal open onClose={onClose} size="sm" title={initial ? 'Editar conquista' : 'Nova conquista'} subtitle="Uma medalha só sua, do jeito que você quiser."
      footer={<>{initial && <div className="mr-auto"><DeleteButton onConfirm={() => { db.customAchievements.remove(initial.id); onClose() }} /></div>}<Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={save} disabled={!valid}>Salvar</Button></>}>
      <form onSubmit={(e) => { e.preventDefault(); save() }} className="space-y-4">
        <Field label="Conquista"><Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Primeira viagem sozinha" /></Field>
        <Field label="Descrição (opcional)"><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="O que essa medalha significa pra você?" /></Field>
        <Field group label="Ícone">
          <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-11">
            {ICONS.map((s) => (
              <button key={s} type="button" onClick={() => setSprite(s)} aria-label={`Ícone ${s}`} aria-pressed={sprite === s}
                className={cn('grid aspect-square place-items-center rounded-md border-2 transition', sprite === s ? 'border-px-line bg-rosa-100 shadow-pixel-sm' : 'border-transparent bg-white/60 hover:border-px-line/30')}>
                <PixelIcon name={s} size={22} />
              </button>
            ))}
          </div>
        </Field>
        <Field group label="Tipo">
          <Segmented<Kind> value={kind} onChange={setKind} options={[{ value: 'feita', label: 'Já conquistei' }, { value: 'meta', label: 'Quero conquistar' }]} />
        </Field>
        {kind === 'feita' ? (
          <Field label="Quando"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        ) : (
          <FormGrid>
            <Field label="Meta (quantas vezes)"><Input inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value.replace(/\D/g, ''))} /></Field>
            <Field group label="Progresso">
              <div className="flex h-11 items-center gap-2">
                <Button size="icon-sm" variant="soft" onClick={() => setCurrent((c) => Math.max(0, c - 1))} aria-label="Diminuir progresso"><Minus size={14} /></Button>
                <span className="min-w-[64px] text-center font-pixel text-lg font-semibold tabular-nums text-vinho">{Math.min(current, goal)} / {goal}</span>
                <Button size="icon-sm" variant="soft" onClick={() => setCurrent((c) => Math.min(goal, c + 1))} aria-label="Aumentar progresso"><Plus size={14} /></Button>
              </div>
            </Field>
          </FormGrid>
        )}
      </form>
    </Modal>
  )
}
