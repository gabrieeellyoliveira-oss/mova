import { useMemo } from 'react'
import { useCourses, useEvents, useFinanceSummary, useHabits, useVault } from './useData'
import { daysBetween, relativeDay, today } from '@/utils/date'

export interface Notice {
  id: string
  title: string
  text: string
  path: string
  emoji: string
}

/** Lembretes gentis derivados dos dados (sem cobranças). */
export function useNotifications(now: Date): Notice[] {
  const events = useEvents()
  const habits = useHabits()
  const courses = useCourses()
  const fin = useFinanceSummary()
  const vault = useVault()

  return useMemo(() => {
    const t = today()
    const hhmm = now.toTimeString().slice(0, 5)
    const list: Notice[] = []
    const upcoming = events.filter((e) => e.date === t && e.time >= hhmm).sort((a, b) => a.time.localeCompare(b.time))
    if (upcoming[0]) list.push({ id: `ev-${upcoming[0].id}`, emoji: '🗓️', title: `Às ${upcoming[0].time}: ${upcoming[0].title}`, text: upcoming.length > 1 ? `e mais ${upcoming.length - 1} hoje` : 'seu próximo compromisso', path: '/' })
    if (vault.remaining > 0 && vault.thisMonth <= 0)
      list.push({ id: `vault-${t.slice(0, 7)}`, emoji: '🪙', title: 'Que tal guardar um pouquinho no cofre?', text: `faltam ${Math.round(100 - vault.progress)}% para sair de casa`, path: '/sair-de-casa' })
    const pending = habits.filter((h) => !h.log.includes(t))
    if (pending.length && now.getHours() >= 17) list.push({ id: 'habits', emoji: '🌙', title: 'Ainda dá tempo de se cuidar', text: `${pending.slice(0, 2).map((h) => h.name.toLowerCase()).join(', ')}${pending.length > 2 ? '…' : ''}`, path: '/rotina' })
    if (fin.budgetUsed >= 80) list.push({ id: 'budget', emoji: '🪙', title: `Você já usou ${Math.round(fin.budgetUsed)}% do orçamento`, text: 'Que tal um rolê grátis essa semana?', path: '/financas' })
    courses.filter((c) => c.active && c.deadline && daysBetween(t, c.deadline) >= 0 && daysBetween(t, c.deadline) <= 10).forEach((c) =>
      list.push({ id: `course-${c.id}`, emoji: '📚', title: `${c.name}`, text: `prazo ${relativeDay(c.deadline!)}`, path: '/estudos' }))
    return list
  }, [events, habits, courses, fin.budgetUsed, vault, now])
}
