import { useAgendaEvents } from './useAgenda'
import { useMemo } from 'react'
import { useCourses, useFinanceSummary, useTransactions, useVault } from './useData'
import { daysBetween, fromISODate, monthKey, relativeDay, toISODate, today } from '@/utils/date'
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
  const fin = useFinanceSummary()
  const vault = useVault()
  const tx = useTransactions()

  return useMemo(() => {
    const t = today()
    const hhmm = now.toTimeString().slice(0, 5)
    const list: Notice[] = []
    const upcoming = events.filter((e) => e.date === t && !e.allDay && e.time >= hhmm).sort((a, b) => a.time.localeCompare(b.time))
    if (upcoming[0]) list.push({ id: `ev-${upcoming[0].id}`, emoji: '🗓️', title: `Às ${upcoming[0].time}: ${upcoming[0].title}`, text: upcoming.length > 1 ? `e mais ${upcoming.length - 1} hoje` : 'seu próximo compromisso', path: '/agenda' })
    if (vault.remaining > 0 && vault.thisMonth <= 0)
      list.push({ id: `vault-${t.slice(0, 7)}`, emoji: '🪙', title: 'Que tal guardar um pouquinho no cofre?', text: `faltam ${Math.round(100 - vault.progress)}% para sair de casa`, path: '/sair-de-casa' })
    if (fin.budgetUsed >= 80) list.push({ id: 'budget', emoji: '🪙', title: `Você já usou ${Math.round(fin.budgetUsed)}% do orçamento`, text: 'Que tal um rolê grátis essa semana?', path: '/financas' })
    courses.filter((c) => c.active && c.deadline && daysBetween(t, c.deadline) >= 0 && daysBetween(t, c.deadline) <= 10).forEach((c) =>
      list.push({ id: `course-${c.id}`, emoji: '📚', title: `${c.name}`, text: `prazo ${relativeDay(c.deadline!)}`, path: '/estudos' }))
    // contas fixas que vencem nos próximos 3 dias (pelo dia do mês da última vez) e ainda não foram lançadas no mês
    const latest = new Map<string, (typeof tx)[number]>()
    tx.filter((x) => x.type === 'despesa' && x.recurring).forEach((x) => {
      const prev = latest.get(x.description)
      if (!prev || x.date > prev.date) latest.set(x.description, x)
    })
    latest.forEach((x) => {
      if (monthKey(x.date) === monthKey(t)) return
      const n = fromISODate(t)
      const last = new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate()
      const due = toISODate(new Date(n.getFullYear(), n.getMonth(), Math.min(fromISODate(x.date).getDate(), last)))
      const d = daysBetween(t, due)
      if (d >= 0 && d <= 3) list.push({ id: `bill-${x.description}-${monthKey(t)}`, emoji: '🧾', title: `${money(x.amount)} · ${x.description}`, text: d === 0 ? 'vence hoje' : `em ${d} ${d === 1 ? 'dia' : 'dias'} (${relativeDay(due)})`, path: '/financas' })
    })
    return list
  }, [events, courses, fin.budgetUsed, vault, tx, now])
}
