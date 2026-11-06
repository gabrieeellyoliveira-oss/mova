import { useMemo } from 'react'
import { useIncome, useTransactions, useVaultEntries, vaultNet } from '@/hooks/useData'
import { monthKey, today } from '@/utils/date'
import { refOf, shiftMonth, useItems } from './MonthPlan'

export const VA = 'Vale-alimentação'

/**
 * A conta do mês, do jeito que a Gabi vive:
 * 1. Recebi (salário real + outras entradas, como 13º e extras)
 * 2. Paguei as contas do mês passado com esse dinheiro
 * 3. Sobrou = recebi − contas
 * Disponível agora = sobrou − gastos do mês − o que foi guardado no cofre.
 * O vale-alimentação fica à parte (só serve para comida).
 */
export function useMonthFlow(month: string) {
  const inc = useIncome()
  const tx = useTransactions()
  const vault = useVaultEntries()
  const items = useItems()
  return useMemo(() => {
    const now = monthKey(today())
    const past = month < now
    const prev = shiftMonth(month, -1)
    const monthTx = tx.filter((t) => monthKey(t.date) === month)
    const isVoucherIn = (d: string) => /vale|alimenta/i.test(d)

    // 1. recebi
    const incomeTx = monthTx.filter((t) => t.type === 'receita' && !isVoucherIn(t.description))
    const salaryTx = incomeTx.find((t) => t.income === 'salario')
    const legacySalary = salaryTx ? [] : incomeTx.filter((t) => t.category === 'Salário' && !t.income)
    const salary = salaryTx ? salaryTx.amount : legacySalary.reduce((a, t) => a + t.amount, 0)
    const salaryEstimate = !salary && !past ? inc.salary : 0
    const others = incomeTx.filter((t) => t !== salaryTx && !legacySalary.includes(t))
    const othersTotal = others.reduce((a, t) => a + t.amount, 0)
    const received = salary + salaryEstimate + othersTotal

    // 2. contas do mês passado (pagas neste mês)
    const billTx = tx.filter((t) => t.billId && t.type === 'despesa' && refOf(t) === prev)
    const paidIds = new Set(billTx.map((t) => t.billId!))
    const pending = past ? [] : items.filter((i) => !paidIds.has(i.id))
    const billsPaid = billTx.reduce((a, t) => a + t.amount, 0)
    const billsPending = pending.reduce((a, i) => a + i.amount, 0)
    const bills = billsPaid + billsPending

    // 3. sobrou
    const leftover = received - bills

    // gastos do mês (sem as contas do mês passado e sem o vale)
    const billTxIds = new Set(billTx.map((t) => t.id))
    const spentTx = monthTx.filter((t) => t.type === 'despesa' && !billTxIds.has(t.id) && t.method !== VA)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    const spent = spentTx.reduce((a, t) => a + t.amount, 0)
    const saved = vault.filter((e) => monthKey(e.date) === month).reduce((a, e) => a + vaultNet(e), 0)
    const available = leftover - spent - saved

    // vale-alimentação
    const vaUsed = monthTx.filter((t) => t.type === 'despesa' && t.method === VA).reduce((a, t) => a + t.amount, 0)

    return {
      month, prev, past, inc, salaryTx, salary, salaryEstimate, others, othersTotal, received,
      billTx, paidIds, pending, billsPaid, billsPending, bills, leftover,
      spentTx, spent, saved, available, vaUsed, vaLeft: inc.voucher - vaUsed, items,
    }
  }, [month, tx, vault, items, inc])
}
