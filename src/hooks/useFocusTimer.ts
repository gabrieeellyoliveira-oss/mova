import { useSyncExternalStore } from 'react'
import { db } from '@/store/db'
import { today } from '@/utils/date'
import { celebrate } from './useToast'

/**
 * Cronômetro de foco global: continua contando mesmo trocando de página.
 * Baseado em timestamp de término (não acumula erro do setInterval).
 */
interface TimerState {
  duration: number // minutos
  remaining: number // segundos
  running: boolean
  endsAt: number | null
  courseId?: string
}

let state: TimerState = { duration: 25, remaining: 25 * 60, running: false, endsAt: null }
let tick: ReturnType<typeof setInterval> | null = null
const listeners = new Set<() => void>()
const set = (patch: Partial<TimerState>) => {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

function complete() {
  stopTicking()
  const minutes = state.duration
  db.focusSessions.add({ minutes, date: today(), courseId: state.courseId })
  // marca o hábito "Estudar" do dia, se existir
  const habit = db.habits.store.get().find((h) => h.name.toLowerCase().startsWith('estud'))
  if (habit && !habit.log.includes(today())) db.habits.update(habit.id, { log: [...habit.log, today()] })
  celebrate.focus(minutes)
  set({ running: false, endsAt: null, remaining: state.duration * 60 })
}

function startTicking() {
  stopTicking()
  tick = setInterval(() => {
    if (!state.endsAt) return
    const remaining = Math.max(0, Math.round((state.endsAt - Date.now()) / 1000))
    if (remaining <= 0) complete()
    else if (remaining !== state.remaining) set({ remaining })
  }, 250)
}
function stopTicking() {
  if (tick) clearInterval(tick)
  tick = null
}

export const focusTimer = {
  setDuration(min: number) {
    if (state.running) return
    set({ duration: min, remaining: min * 60, endsAt: null })
  },
  setCourse(courseId?: string) {
    set({ courseId })
  },
  start() {
    set({ running: true, endsAt: Date.now() + state.remaining * 1000 })
    startTicking()
  },
  pause() {
    stopTicking()
    set({ running: false, endsAt: null })
  },
  reset() {
    stopTicking()
    set({ running: false, endsAt: null, remaining: state.duration * 60 })
  },
  /** encerra agora e registra o tempo já focado */
  finishEarly() {
    const done = Math.round((state.duration * 60 - state.remaining) / 60)
    stopTicking()
    if (done >= 1) {
      db.focusSessions.add({ minutes: done, date: today(), courseId: state.courseId })
      celebrate.focus(done)
    }
    set({ running: false, endsAt: null, remaining: state.duration * 60 })
  },
}

export const useFocusTimer = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
  )
