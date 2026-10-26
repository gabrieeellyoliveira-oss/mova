import type { CalendarEvent, Task } from '@/types'

interface Base {
  key: string
  title: string
  time?: string
  color: string
  label: string
  done?: boolean
  /** vem do Google Agenda: só leitura */
  locked?: boolean
  onOpen: () => void
}

export type PlannerEntry =
  | (Base & { kind: 'task'; task: Task })
  | (Base & { kind: 'event'; event: CalendarEvent })
