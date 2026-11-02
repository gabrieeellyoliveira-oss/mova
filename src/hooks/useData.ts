/**
 * Hooks de leitura das coleções + seletores derivados.
 * Componentes devem usar estes hooks (e as ações em `db`) em vez de tocar
 * no armazenamento diretamente.
 */
import { useMemo } from 'react'
import { db, settingsStore, vaultSettingsStore } from '@/store/db'
import { useCollection } from '@/store/collections'
import { useStore } from '@/store/createStore'
import { monthKey, startOfWeek, today, weekDays } from '@/utils/date'
import { ratio } from '@/utils/format'
import type { Goal, Habit, Transaction, VaultEntry } from '@/types'

export const useSettings = () => useStore(settingsStore)

/** Renda fixa da Gabi: salário R$ 2.185 e vale-alimentação R$ 500 (editáveis em Finanças e Sair de casa). */
export function useIncome() {
  const s = useSettings()
  const salary = s.salary ?? 2185
  const voucher = s.mealVoucher ?? 500
  return { salary, voucher, total: salary + voucher, payday: s.payday ?? 5, card: s.creditCard ?? 0 }
}
export const useEvents = () => useCollection(db.events)
export const useTasks = () => useCollection(db.tasks)
export const useTransactions = () => useCollection(db.transactions)
export const useFinancialGoals = () => useCollection(db.financialGoals)
export const useExperiences = () => useCollection(db.experiences)
export const useVaultEntries = () => useCollection(db.vaultEntries)
export const useVaultCosts = () => useCollection(db.vaultCosts)
export const useVaultSettings = () => useStore(vaultSettingsStore)
export const useCourses = () => useCollection(db.courses)
export const useFocusSessions = () => useCollection(db.focusSessions)
export const useBooks = () => useCollection(db.books)
export const useGoals = () => useCollection(db.goals)
export const useHabits = () => useCollection(db.habits)
export const usePriorities = () => useCollection(db.priorities)
export const useNotes = () => useCollection(db.notes)
export const useWorkouts = () => useCollection(db.workouts)
export const useBodyCheckins = () => useCollection(db.bodyCheckins)
export const useJournal = () => useCollection(db.journal)
export const useJournalFolders = () => useCollection(db.journalFolders)
export const useMonthlyBills = () => useCollection(db.monthlyBills)
export const useDegrees = () => useCollection(db.degrees)
export const useAssignments = () => useCollection(db.assignments)
export const useDisciplines = () => useCollection(db.disciplines)

/* ---------- seletores puros ---------- */

export const goalProgress = (g: Goal) =>
  g.status === 'concluida' ? 100 : g.steps.length ? ratio(g.steps.filter((s) => s.done).length, g.steps.length) : g.manualProgress

export const sumBy = (list: Transaction[], type: Transaction['type']) =>
  list.filter((t) => t.type === type).reduce((a, t) => a + t.amount, 0)


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

/** Tudo de um mês (`AAAA-MM`): movimentações, entradas (salário x extras), gastos e contas já pagas. */
export function useMonthFinance(month: string) {
  const tx = useTransactions()
  return useMemo(() => {
    const monthTx = tx.filter((t) => monthKey(t.date) === month)
    const incomeTx = monthTx.filter((t) => t.type === 'receita')
    const salaryReceived = incomeTx.filter((t) => t.category === 'Salário').reduce((a, t) => a + t.amount, 0)
    const income = incomeTx.reduce((a, t) => a + t.amount, 0)
    const expenses = monthTx.filter((t) => t.type === 'despesa').reduce((a, t) => a + t.amount, 0)
    const billsPaid = monthTx.filter((t) => t.billId && t.type === 'despesa').reduce((a, t) => a + t.amount, 0)
    const paid = new Set(monthTx.filter((t) => t.billId).map((t) => t.billId!))
    return { monthTx, income, salaryReceived, extras: income - salaryReceived, expenses, billsPaid, paid }
  }, [tx, month])
}

export function useMonthlySeries(months = 6, until?: string) {
  const tx = useTransactions()
  return useMemo(() => {
    const now = until ? new Date(Number(until.slice(0, 4)), Number(until.slice(5, 7)) - 1, 1) : new Date()
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
        contas: Math.round(list.filter((t) => t.type === 'despesa' && t.billId).reduce((a, t) => a + t.amount, 0)),
        outros: Math.round(list.filter((t) => t.type === 'despesa' && !t.billId).reduce((a, t) => a + t.amount, 0)),
        saldo: Math.round(receitas - despesas),
      }
    })
  }, [tx, months, until])
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

export const vaultNet = (e: Pick<VaultEntry, 'type' | 'amount'>) => (e.type === 'deposito' ? e.amount : -e.amount)

/** Resumo do cofre "Sair de casa": quanto tenho, quanto falta e quando chego lá */
export function useVault() {
  const entries = useVaultEntries()
  const costs = useVaultCosts()
  const settings = useVaultSettings()
  return useMemo(() => {
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))
    const saved = sorted.reduce((a, e) => a + vaultNet(e), 0)
    const orderedCosts = [...costs].sort((a, b) => a.order - b.order)
    const target = orderedCosts.length ? orderedCosts.reduce((a, c) => a + c.amount, 0) : settings.manualTarget
    const remaining = Math.max(0, target - saved)
    const progress = ratio(saved, target)

    // série mensal (do primeiro depósito até hoje)
    const now = new Date()
    const firstKey = sorted[0] ? monthKey(sorted[0].date) : monthKey(today())
    const [fy, fm] = firstKey.split('-').map(Number)
    const months: { key: string; mes: string; liquido: number; saldo: number }[] = []
    let acc = 0
    for (let d = new Date(fy, fm - 1, 1); d <= now; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const liquido = sorted.filter((e) => monthKey(e.date) === key).reduce((a, e) => a + vaultNet(e), 0)
      acc += liquido
      months.push({ key, mes: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), liquido, saldo: acc })
    }
    const recent = months.slice(-6)
    const monthlyAvg = recent.length ? recent.reduce((a, m) => a + m.liquido, 0) / recent.length : 0
    const thisMonth = months[months.length - 1]?.liquido ?? 0

    // previsão no ritmo atual
    const monthsToGoal = remaining <= 0 ? 0 : monthlyAvg > 0 ? Math.ceil(remaining / monthlyAvg) : null
    const forecast = monthsToGoal === null ? null : new Date(now.getFullYear(), now.getMonth() + monthsToGoal, 1)

    // quanto guardar por mês para chegar na data desejada
    let monthsLeft: number | null = null
    let neededPerMonth: number | null = null
    if (settings.targetDate) {
      const [ty, tm] = settings.targetDate.split('-').map(Number)
      monthsLeft = Math.max(1, (ty - now.getFullYear()) * 12 + (tm - 1 - now.getMonth()))
      neededPerMonth = remaining / monthsLeft
    }

    // o saldo vai "cobrindo" os custos na ordem da lista
    let left = Math.max(0, saved)
    const coverage = orderedCosts.map((c) => {
      const covered = Math.min(c.amount, left)
      left -= covered
      return { cost: c, covered, progress: ratio(covered, c.amount) }
    })

    return { entries: sorted, costs: orderedCosts, settings, saved, target, remaining, progress, months, monthlyAvg, thisMonth, monthsToGoal, forecast, monthsLeft, neededPerMonth, coverage }
  }, [entries, costs, settings])
}
