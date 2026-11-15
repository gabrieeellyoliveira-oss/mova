import { useAgendaEvents } from './useAgenda'
import { useMemo } from 'react'
import { useCourses, useIncome, useVault } from './useData'
import { daysBetween, relativeDay, today } from '@/utils/date'
import { money } from '@/utils/format'

export interface Notice {
  id: string
  title: string
  text: string
  path: string
  emoji: string
}

/** Lembretes gentis derivados dos dados (sem cobranças). */
export function useNotifications(now: Date): Notice[] {
  const events = useAgendaEvents()
  const courses = useCourses()
  const vault = useVault()
  const inc = useIncome()

  return useMemo(() => {
    const t = today()
    const hhmm = now.toTimeString().slice(0, 5)
    const list: Notice[] = []
    const upcoming = events.filter((e) => e.date === t && !e.allDay && e.time >= hhmm).sort((a, b) => a.time.localeCompare(b.time))
    if (upcoming[0]) list.push({ id: `ev-${upcoming[0].id}`, emoji: '🗓️', title: `Às ${upcoming[0].time}: ${upcoming[0].title}`, text: upcoming.length > 1 ? `e mais ${upcoming.length - 1} hoje` : 'seu próximo compromisso', path: '/agenda' })
    // ensaio de morar sozinha: a partir do dia do pagamento, guardar o custo de viver fora (moradia + contas)
    const rehearsalLeft = Math.max(0, vault.livingTotal - Math.max(0, vault.thisMonth))
    if (vault.remaining > 0 && now.getDate() >= inc.payday && rehearsalLeft > 0)
      list.push({ id: `ensaio-${t.slice(0, 7)}`, emoji: '🔑', title: `Ensaio do mês: guarde ${money(Math.round(rehearsalLeft))}`, text: 'o custo de morar sozinha vai para o cofre', path: '/sair-de-casa' })
    else if (vault.remaining > 0 && vault.thisMonth <= 0)
      list.push({ id: `vault-${t.slice(0, 7)}`, emoji: '🪙', title: 'Que tal guardar um pouquinho no cofre?', text: `faltam ${Math.round(100 - vault.progress)}% para sair de casa`, path: '/sair-de-casa' })
    courses.filter((c) => c.active && c.deadline && daysBetween(t, c.deadline) >= 0 && daysBetween(t, c.deadline) <= 10).forEach((c) =>
      list.push({ id: `course-${c.id}`, emoji: '📚', title: `${c.name}`, text: `prazo ${relativeDay(c.deadline!)}`, path: '/estudos' }))
    return list
  }, [events, courses, vault, now, inc.payday])
}
