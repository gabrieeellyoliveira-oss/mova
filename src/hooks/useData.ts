/**
 * Hooks de leitura das coleções + seletores derivados.
 * Componentes devem usar estes hooks (e as ações em `db`) em vez de tocar
 * no armazenamento diretamente.
 */
import { useMemo } from 'react'
import { db, settingsStore } from '@/store/db'
import { useCollection } from '@/store/collections'
import { useStore } from '@/store/createStore'
import { addDays, monthKey, startOfWeek, today, weekDays } from '@/utils/date'
import { ratio } from '@/utils/format'
import type { Goal, Habit, Transaction } from '@/types'

export const useSettings = () => useStore(settingsStore)
export const useEvents = () => useCollection(db.events)
export const useTasks = () => useCollection(db.tasks)
export const useTransactions = () => useCollection(db.transactions)
export const useFinancialGoals = () => useCollection(db.financialGoals)
export const usePlaces = () => useCollection(db.places)
export const useExperiences = () => useCollection(db.experiences)
export const useCourses = () => useCollection(db.courses)
export const useFocusSessions = () => useCollection(db.focusSessions)
export const useBooks = () => useCollection(db.books)
export const useGoals = () => useCollection(db.goals)
export const useHabits = () => useCollection(db.habits)
export const usePriorities = () => useCollection(db.priorities)
export const useNotes = () => useCollection(db.notes)

/* ---------- seletores puros ---------- */

export const goalProgress = (g: Goal) =>
  g.status === 'concluida' ? 100 : g.steps.length ? ratio(g.steps.filter((s) => s.done).length, g.steps.length) : g.manualProgress

export const sumBy = (list: Transaction[], type: Transaction['type']) =>
  list.filter((t) => t.type === type).reduce((a, t) => a + t.amount, 0)

export function habitStreak(h: Habit, ref = today()) {
  const set = new Set(h.log)
  // se hoje ainda não foi marcado, a sequência conta até ontem (sem punição)
  let day = set.has(ref) ? ref : addDays(ref, -1)
  let n = 0
  while (set.has(day)) {
    n++
    day = addDays(day, -1)
  }
  return n
}

export const habitWeekCount = (h: Habit, ref = today()) => {
  const days = new Set(weekDays(ref))
  return h.log.filter((d) => days.has(d)).length
}

/* ---------- hooks derivados ---------- */

export function useFinanceSummary() {
  const tx = useTransactions()
  const settings = useSettings()
  return useMemo(() => {
    const month = monthKey(today())
    const monthTx = tx.filter((t) => monthKey(t.date) === month)
    const income = sumBy(monthTx, 'receita')
    const expenses = sumBy(monthTx, 'despesa')
    const balance = sumBy(tx, 'receita') - sumBy(tx, 'despesa')
    const budgetLeft = settings.monthlyBudget - expenses
    return { monthTx, income, expenses, balance, budgetLeft, budget: settings.monthlyBudget, budgetUsed: ratio(expenses, settings.monthlyBudget) }
  }, [tx, settings.monthlyBudget])
}

export function useMonthlySeries(months = 6) {
  const tx = useTransactions()
  return useMemo(() => {
    const now = new Date()
    return Array.from({ length: months }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const list = tx.filter((t) => monthKey(t.date) === key)
      const receitas = sumBy(list, 'receita')
      const despesas = sumBy(list, 'despesa')
      return {
        key,
        mes: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        receitas: Math.round(receitas),
        despesas: Math.round(despesas),
        saldo: Math.round(receitas - despesas),
      }
    })
  }, [tx, months])
}

export function useStudyWeek() {
  const sessions = useFocusSessions()
  const settings = useSettings()
  return useMemo(() => {
    const ws = startOfWeek(today())
    const days = weekDays(today())
    const week = sessions.filter((s) => s.date >= ws && s.date <= days[6])
    const minutes = week.reduce((a, s) => a + s.minutes, 0)
    const perDay = days.map((d) => ({ date: d, minutes: week.filter((s) => s.date === d).reduce((a, s) => a + s.minutes, 0) }))
    const totalMinutes = sessions.reduce((a, s) => a + s.minutes, 0)
    return { minutes, hours: minutes / 60, perDay, goalHours: settings.weeklyStudyHours, progress: ratio(minutes, settings.weeklyStudyHours * 60), totalMinutes }
  }, [sessions, settings.weeklyStudyHours])
}

/** Próximo rolê: lugar planejado mais próximo ou evento de categoria rolê */
export function useNextOuting() {
  const places = usePlaces()
  const events = useEvents()
  return useMemo(() => {
    const t = today()
    const now = new Date()
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const upcoming = (date?: string, time?: string) => !!date && (date > t || (date === t && (!time || time >= hhmm)))
    const planned = places
      .filter((p) => p.status === 'planejado' && upcoming(p.plannedFor, p.plannedTime))
      .sort((a, b) => `${a.plannedFor}${a.plannedTime}`.localeCompare(`${b.plannedFor}${b.plannedTime}`))
    if (planned[0]) return { kind: 'place' as const, place: planned[0], date: planned[0].plannedFor!, time: planned[0].plannedTime }
    const ev = events
      .filter((e) => e.category === 'role' && upcoming(e.date, e.time))
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0]
    if (ev) return { kind: 'event' as const, event: ev, date: ev.date, time: ev.time }
    return null
  }, [places, events])
}

export function useLastExperience() {
  const exps = useExperiences()
  return useMemo(() => [...exps].sort((a, b) => b.date.localeCompare(a.date))[0], [exps])
}
