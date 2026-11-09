import { useEffect, useState, type FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { Field, Input, Textarea } from '@/components/ui/Form'
import { cn } from '@/lib/cn'
import { db } from '@/store/db'
import { useCollection } from '@/store/collections'
import type { Focus, Intensity, Workout } from '@/types'
import { today } from '@/utils/date'
import { FEELINGS, FOCUS, FOCUS_LIST, INTENSITY, normalizeLink, recentTemplates } from '@/utils/workouts'
import { closeWorkoutForm, templateOf, useWorkoutForm } from '@/hooks/useWorkoutForm'

const MINUTES = [10, 15, 20, 30, 45, 60]

type Draft = {
  date: string
  title: string
  focus: Focus
  minutes: string
  intensity: Intensity
  feeling?: number
  link: string
  notes: string
}

const blank = (): Draft => ({ date: today(), title: '', focus: 'corpo', minutes: '30', intensity: 'moderado', link: '', notes: '' })
const fromWorkout = (w: Partial<Workout>): Draft => ({
  ...blank(),
  ...(w.date ? { date: w.date } : {}),
  title: w.title ?? '',
  focus: w.focus ?? 'corpo',
  minutes: w.minutes ? String(w.minutes) : '30',
  intensity: w.intensity ?? 'moderado',
  feeling: w.feeling,
  link: w.link ?? '',
  notes: w.notes ?? '',
})

/** Registrar ou editar um treino feito. */
export function WorkoutForm() {
  const form = useWorkoutForm()
  const workouts = useCollection(db.workouts)
  const editing = form.open ? form.editing : undefined
  const [d, setD] = useState<Draft>(blank)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!form.open) return
    setError(null)
    setD(form.editing ? fromWorkout(form.editing) : form.preset ? fromWorkout({ date: today(), ...form.preset }) : blank())
  }, [form])

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }))
  const templates = editing ? [] : recentTemplates(workouts, 5)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const minutes = Math.round(Number(d.minutes.replace(',', '.')))
    if (!d.title.trim()) return setError('Dê um nome para o treino (ex.: "Glúteos 30 min").')
    if (!Number.isFinite(minutes) || minutes <= 0) return setError('Quantos minutos durou o treino?')
    if (!d.date) return setError('Escolha a data do treino.')
    const data = {
      date: d.date,
      title: d.title.trim(),
      focus: d.focus,
      minutes,
      intensity: d.intensity,
      feeling: d.feeling,
      link: normalizeLink(d.link) || undefined,
      notes: d.notes.trim() || undefined,
    }
    if (editing) db.workouts.update(editing.id, data)
    else db.workouts.add(data)
    closeWorkoutForm()
  }

  const remove = () => {
    if (!editing || !window.confirm(`Apagar o treino "${editing.title}"?`)) return
    db.workouts.remove(editing.id)
    closeWorkoutForm()
  }

  return (
    <Modal
      open={form.open}
      onClose={closeWorkoutForm}
      title={editing ? 'Editar treino' : 'Registrar treino'}
      subtitle={editing ? undefined : 'O que você treinou hoje?'}
      footer={
        <>
          {editing && (
            <Button variant="danger" onClick={remove} className="mr-auto">
              <Trash2 size={16} /> Apagar
            </Button>
          )}
          <Button variant="light" onClick={closeWorkoutForm}>Cancelar</Button>
          <Button type="submit" form="workout-form">{editing ? 'Salvar' : 'Registrar'}</Button>
        </>
      }
    >
      <form id="workout-form" onSubmit={submit} className="space-y-5" noValidate>
        {templates.length > 0 && (
          <Field label="Repetir um treino" group>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
              {templates.map((t) => (
                <Chip key={t.id} onClick={() => setD((p) => ({ ...fromWorkout(templateOf(t)), date: p.date }))} active={d.title === t.title}>
                  {FOCUS[t.focus].emoji} {t.title}
                </Chip>
              ))}
            </div>
          </Field>
        )}

        <Field label="Nome do treino">
          <Input value={d.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex.: Glúteos e pernas 30 min" maxLength={80} />
        </Field>

        <Field label="Foco" group>
          <div className="flex flex-wrap gap-2">
            {FOCUS_LIST.map((f) => (
              <Chip key={f} active={d.focus === f} onClick={() => set('focus', f)} aria-pressed={d.focus === f}>
                {FOCUS[f].emoji} {FOCUS[f].label}
              </Chip>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Data">
            <Input type="date" value={d.date} max={today()} onChange={(e) => set('date', e.target.value)} />
          </Field>
          <Field label="Duração (minutos)">
            <Input inputMode="numeric" value={d.minutes} onChange={(e) => set('minutes', e.target.value.replace(/[^\d]/g, ''))} placeholder="30" />
          </Field>
        </div>
        <div className="-mt-2 flex flex-wrap gap-2" aria-label="Durações rápidas">
          {MINUTES.map((m) => (
            <Chip key={m} active={d.minutes === String(m)} onClick={() => set('minutes', String(m))}>{m} min</Chip>
          ))}
        </div>

        <Field label="Intensidade" group>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(INTENSITY) as Intensity[]).map((i) => (
              <button
                key={i}
                type="button"
                aria-pressed={d.intensity === i}
                onClick={() => set('intensity', i)}
                className={cn(
                  'h-11 rounded-2xl border-2 border-ink text-sm font-semibold transition',
                  d.intensity === i ? 'bg-ink text-ink-fg' : 'bg-quente text-ink hover:bg-lavanda-100',
                )}
              >
                {INTENSITY[i]}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Como me senti" group>
          <div className="grid grid-cols-5 gap-2">
            {FEELINGS.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={d.feeling === f.value}
                onClick={() => set('feeling', d.feeling === f.value ? undefined : f.value)}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-2xl border-2 border-ink py-2 text-[11px] font-semibold transition',
                  d.feeling === f.value ? 'bg-lavanda' : 'bg-quente hover:bg-lavanda-100',
                )}
              >
                <span className="text-xl leading-none" aria-hidden>{f.emoji}</span>
                {f.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Link do vídeo (opcional)" hint="Cole o link da aula que você seguiu para achar de novo depois.">
          <Input type="url" inputMode="url" value={d.link} onChange={(e) => set('link', e.target.value)} placeholder="https://…" />
        </Field>

        <Field label="Anotações (opcional)">
          <Textarea value={d.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Ex.: aumentei o peso, senti o glúteo, pulei o último bloco…" />
        </Field>

        {error && <p role="alert" className="rounded-2xl border-2 border-cereja bg-cereja/10 px-4 py-2.5 text-sm font-medium text-cereja">{error}</p>}
      </form>
    </Modal>
  )
}
