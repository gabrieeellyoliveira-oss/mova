import { useMemo } from 'react'
import { db, workSettingsStore } from '@/store/db'
import { useCollection } from '@/store/collections'
import { useStore } from '@/store/createStore'
import type { WorkSettings } from '@/types'
import { monthKey, today, toISODate, weekdayIndex, MONTHS } from '@/utils/date'
import { money, ratio } from '@/utils/format'

export const useWorkSettings = () => useStore(workSettingsStore)
export const useWorkGoals = () => useCollection(db.workGoals)
export const useWorkEntries = () => useCollection(db.workEntries)

/** Formata um valor conforme a unidade da meta (R$ ou quantidade). */
export const formatWork = (v: number, s: Pick<WorkSettings, 'unit' | 'metricName'>, short = false) =>
  s.unit === 'moeda'
    ? short ? money(v).replace(',00', '') : money(v)
    : `${Math.round(v).toLocaleString('pt-BR')}${short ? '' : ` ${s.metricName.toLowerCase()}`}`

export const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}
export const shiftMonth = (key: string, n: number) => {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const daysOf = (key: string) => {
  const [y, m] = key.split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  return Array.from({ length: last }, (_, i) => toISODate(new Date(y, m - 1, i + 1)))
}

/** Resumo da meta do trabalho de um mês: quanto fiz, ritmo, projeção e evolução. */
export function useWork(month: string) {
  const settings = useWorkSettings()
  const goals = useWorkGoals()
  const entries = useWorkEntries()

  return useMemo(() => {
    const goalFor = (key: string) => {
      const exact = goals.find((g) => g.month === key)
      if (exact) return { target: exact.target, goal: exact, inherited: false }
      const prev = [...goals].filter((g) => g.month < key).sort((a, b) => b.month.localeCompare(a.month))[0]
      return { target: prev?.target ?? 0, goal: undefined, inherited: !!prev }
    }
    const achievedIn = (key: string) => entries.filter((e) => monthKey(e.date) === key).reduce((a, e) => a + e.amount, 0)

    const t = today()
    const current = monthKey(t)
    const { target, goal, inherited } = goalFor(month)
    const days = daysOf(month)
    const workDays = days.filter((d) => settings.workDays.includes(weekdayIndex(d)))
    const monthEntries = entries.filter((e) => monthKey(e.date) === month).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    const achieved = monthEntries.reduce((a, e) => a + e.amount, 0)
    const remaining = Math.max(0, target - achieved)

    const status: 'passado' | 'atual' | 'futuro' = month < current ? 'passado' : month > current ? 'futuro' : 'atual'
    const doneDays = status === 'passado' ? workDays.length : status === 'futuro' ? 0 : workDays.filter((d) => d <= t).length
    const daysLeft = status === 'atual' ? workDays.filter((d) => d >= t).length : status === 'futuro' ? workDays.length : 0
    const expected = workDays.length ? (target * doneDays) / workDays.length : 0
    const pace = achieved - expected // positivo = adiantada
    const projection = status === 'passado' ? achieved : doneDays ? (achieved / doneDays) * workDays.length : 0
    const neededPerDay = daysLeft ? remaining / daysLeft : null

    // série diária: acumulado real x ritmo ideal (por dias úteis)
    let acc = 0
    let ideal = 0
    const perWorkDay = workDays.length ? target / workDays.length : 0
    const daily = days.map((d) => {
      acc += entries.filter((e) => e.date === d).reduce((a, e) => a + e.amount, 0)
      if (settings.workDays.includes(weekdayIndex(d))) ideal += perWorkDay
      return { dia: Number(d.slice(8)), feito: status === 'atual' && d > t ? null : Math.round(acc), ideal: Math.round(ideal) }
    })

    // evolução dos últimos 6 meses (até o mês escolhido)
    const history = Array.from({ length: 6 }, (_, i) => {
      const key = shiftMonth(month, i - 5)
      const g = goalFor(key).target
      const a = achievedIn(key)
      const [y, m] = key.split('-').map(Number)
      return { key, mes: new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), meta: g, feito: a, pct: g > 0 ? Math.floor((a / g) * 100) : 0 }
    }).filter((h) => h.feito > 0 || h.meta > 0)
    const best = history.reduce<(typeof history)[number] | null>((b, h) => (!b || h.pct > b.pct ? h : b), null)
    const hit = history.filter((h) => h.meta > 0 && h.feito >= h.meta).length

    return {
      settings, month, status, target, goal, inherited, achieved, remaining, progress: ratio(achieved, target),
      workDaysTotal: workDays.length, doneDays, daysLeft, expected, pace, projection, neededPerDay,
      entries: monthEntries, daily, history, best, hit,
    }
  }, [month, settings, goals, entries])
}
