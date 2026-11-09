import type { ActiveProgram, Focus, ISODate } from '@/types'
import { PROGRAMS, type Program, type ProgramDay } from '@/data/programs'
import { today } from './date'

export const getProgram = (id?: string) => PROGRAMS.find((p) => p.id === id)

/** Adivinha o foco pelo título do vídeo (para registrar o treino já com o foco certo). */
export function guessFocus(title = ''): Focus {
  const t = title.toLowerCase()
  if (/cardio|hiit|queimar|aer[óo]b/.test(t)) return 'cardio'
  if (/abd|barriga|cintura|core/.test(t)) return 'abdomen'
  if (/gl[úu]te|perna|quadr|posterior|inferior/.test(t)) return 'pernas'
  if (/superior|bra[çc]o|costas|ombro|peito/.test(t)) return 'bracos'
  if (/along|relax|mobil/.test(t)) return 'alongamento'
  if (/pilates/.test(t)) return 'pilates'
  return 'corpo'
}

export interface ProgramState {
  program: Program
  active: ActiveProgram
  /** dias concluídos */
  doneCount: number
  total: number
  /** concluído hoje (se houver) */
  doneToday?: ProgramDay
  /** próximo dia a fazer (undefined = terminou) */
  next?: ProgramDay
  finished: boolean
}

/** Onde estou no programa: segue a ordem dos dias (dia perdido não pula, você continua de onde parou). */
export function programState(active?: ActiveProgram, ref: ISODate = today()): ProgramState | undefined {
  const program = getProgram(active?.id)
  if (!program || !active) return undefined
  const done = active.done ?? {}
  const doneToday = program.days.find((d) => done[d.day] === ref)
  const next = program.days.find((d) => !done[d.day])
  const doneCount = program.days.filter((d) => done[d.day]).length
  return { program, active, doneCount, total: program.days.length, doneToday, next, finished: !next }
}

export const dayMinutes = (p: Program, d: ProgramDay) => d.minutes ?? p.minutesPerDay
export const dayLabel = (d: ProgramDay) => (d.rest ? 'Descanso' : d.title ?? `Dia ${d.day}`)

/** id do vídeo do YouTube a partir de um link youtu.be / youtube.com */
export function videoId(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{6,})/)
  return m?.[1]
}
export const videoThumb = (url: string) => {
  const id = videoId(url)
  return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : undefined
}
