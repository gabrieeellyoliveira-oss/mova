import type { CalendarEvent, Place, Task } from '@/types'

interface Base {
  key: string
  title: string
  time?: string
  color: string
  label: string
  done?: boolean
  onOpen: () => void
}

export type PlannerEntry =
  | (Base & { kind: 'task'; task: Task })
  | (Base & { kind: 'event'; event: CalendarEvent })
  | (Base & { kind: 'place'; place: Place })
