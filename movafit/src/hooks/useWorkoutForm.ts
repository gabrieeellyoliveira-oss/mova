import { useSyncExternalStore } from 'react'
import type { Workout } from '@/types'

/** Qual formulário está aberto: novo (com sugestão opcional) ou edição de um treino. Só na memória. */
type FormState = { open: false } | { open: true; editing?: Workout; preset?: Partial<Workout> }

let state: FormState = { open: false }
const listeners = new Set<() => void>()
const set = (s: FormState) => { state = s; listeners.forEach((l) => l()) }
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }

export const useWorkoutForm = () => useSyncExternalStore(subscribe, () => state)
export const openNewWorkout = (preset?: Partial<Workout>) => set({ open: true, preset })
export const openEditWorkout = (editing: Workout) => set({ open: true, editing })
export const closeWorkoutForm = () => set({ open: false })

/** Só o "molde" de um treino (nome, foco, duração, intensidade, link), sem data nem como me senti. */
export const templateOf = (w: Workout): Partial<Workout> => ({ title: w.title, focus: w.focus, minutes: w.minutes, intensity: w.intensity, link: w.link })
/** Registrar de novo um treino já feito, hoje. */
export const repeatWorkout = (w: Workout) => openNewWorkout(templateOf(w))
