import type { Habit, ISODate } from '@/types'
import { db } from '@/store/db'
import { today } from '@/utils/date'
import { toast } from '@/hooks/useToast'

export function toggleHabit(h: Habit, day: ISODate) {
  if (day > today()) return
  const has = h.log.includes(day)
  db.habits.update(h.id, { log: has ? h.log.filter((d) => d !== day) : [...h.log, day] })
  if (!has && day === today()) toast(`${h.emoji} ${h.name} ✓`, { duration: 1600 })
}
