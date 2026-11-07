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
import type { Goal, Habit, Transaction, VaultCost, VaultEntry, VaultSettings } from '@/types'

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
export const useMoveNotes = () => useCollection(db.moveNotes)
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
    // o salário lançado pelo botão "Salário do mês" vale como o salário do mês; sem ele, conta a categoria Salário
    const marked = incomeTx.filter((t) => t.income === 'salario')
    const salaryReceived = (marked.length ? marked : incomeTx.filter((t) => t.category === 'Salário' && !t.income)).reduce((a, t) => a + t.amount, 0)
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

/** Custos fixos padrão de quando ela sair (o aluguel vem do "aluguel alvo"). */
export const DEFAULT_LIVING_COSTS = [
  { id: 'luz', name: 'Luz', amount: 150 },
  { id: 'internet', name: 'Internet', amount: 100 },
  { id: 'gas', name: 'Gás', amount: 30 },
  { id: 'transporte', name: 'Transporte e outros', amount: 170 },
]
export const AUTO_DEPOSIT = 'auto-caucao'
export const AUTO_RENT = 'auto-aluguel'
export const isAutoName = (n: string) => /cau[cç][aã]o|primeiro aluguel/i.test(n)
/** Meta do cofre = caução (aluguel × mult) + primeiro aluguel + custos próprios. */
export const vaultTarget = (costs: VaultCost[], s: VaultSettings) => {
  const rent = s.targetRent ?? 1000
  return rent * (s.depositMultiplier ?? 1) + rent + costs.filter((c) => !isAutoName(c.name)).reduce((a, c) => a + c.amount, 0)
}

/**
 * Resumo do cofre "Sair de casa": a meta é Caução (aluguel alvo × 1/2/3) + Primeiro aluguel (AUTO)
 * + os outros custos da mudança; o saldo vai cobrindo os itens na ordem.
 */
export function useVault() {
  const entries = useVaultEntries()
  const costs = useVaultCosts()
  const settings = useVaultSettings()
  return useMemo(() => {
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))
    const saved = sorted.reduce((a, e) => a + vaultNet(e), 0)
    const rent = settings.targetRent ?? 1000
    const mult = settings.depositMultiplier ?? 1
    // IPTU já entra na moradia total (aluguel + condomínio + IPTU): não descontar duas vezes
    const livingCosts = (settings.livingCosts ?? DEFAULT_LIVING_COSTS).filter((c) => c.id !== 'iptu' && !/iptu/i.test(c.name))
    // Caução e Primeiro aluguel são calculados pelo aluguel alvo (itens antigos com esses nomes ficam guardados, mas não somam)
    const autoCosts = [
      { id: AUTO_DEPOSIT, name: `Caução (${mult}x)`, amount: rent * mult, order: -2, createdAt: '', auto: true },
      { id: AUTO_RENT, name: 'Primeiro aluguel', amount: rent, order: -1, createdAt: '', auto: true },
    ]
    const ownCosts = [...costs].filter((c) => !isAutoName(c.name)).sort((a, b) => a.order - b.order).map((c) => ({ ...c, auto: false }))
    const orderedCosts = [...autoCosts, ...ownCosts]
    const target = orderedCosts.reduce((a, c) => a + c.amount, 0)
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
      // meses para guardar: do mês atual até o mês anterior ao da mudança (ex.: nov→fev = nov, dez, jan)
      monthsLeft = Math.max(1, (ty - now.getFullYear()) * 12 + (tm - 1 - now.getMonth()))
      // parcela do plano: parte do saldo do início deste mês, então não muda a cada depósito do mês
      neededPerMonth = Math.max(0, target - (saved - thisMonth)) / monthsLeft
    }
    const onTrack = neededPerMonth === null ? null : remaining <= 0 || monthlyAvg >= neededPerMonth

    // o saldo vai "cobrindo" os custos na ordem da lista
    let left = Math.max(0, saved)
    const coverage = orderedCosts.map((c) => {
      const covered = Math.min(c.amount, left)
      left -= covered
      return { cost: c, covered, progress: ratio(covered, c.amount) }
    })

    // depois de sair: aluguel + custos fixos
    const livingTotal = rent + livingCosts.reduce((a, c) => a + c.amount, 0)

    return {
      entries: sorted, costs: orderedCosts, settings, saved, target, remaining, progress, months, monthlyAvg, thisMonth,
      monthsToGoal, forecast, monthsLeft, neededPerMonth, onTrack, coverage, rent, mult, livingCosts, livingTotal,
    }
  }, [entries, costs, settings])
}
