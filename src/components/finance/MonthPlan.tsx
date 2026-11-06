/** Base das contas do mês: contas fixas, quem já foi pago (por mês de referência) e os lançamentos de pagamento. */
import type { FinanceCategory, MonthlyBill, Transaction } from '@/types'
import { db } from '@/store/db'
import { useIncome, useMonthlyBills, useTransactions } from '@/hooks/useData'
import { monthKey, toISODate, today, fromISODate } from '@/utils/date'
export const CARD_ID = 'cartao'
export const monthName = (m: string) => fromISODate(`${m}-01`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

/** Data do lançamento de um pagamento do mês: hoje (mês atual) ou o último dia (mês passado). */
export const payDate = (month: string) => {
  if (month === monthKey(today())) return today()
  const [y, m] = month.split('-').map(Number)
  return toISODate(new Date(y, m, 0))
}

export type Item = { id: string; name: string; amount: number; category: FinanceCategory; dueDay?: number; bill?: MonthlyBill }

/** As contas do mês + a fatura do cartão, como itens pagáveis. */
export function useItems(): Item[] {
  const bills = useMonthlyBills()
  const inc = useIncome()
  const list: Item[] = [...bills]
    .sort((a, b) => (a.dueDay ?? 99) - (b.dueDay ?? 99) || a.name.localeCompare(b.name))
    .map((b) => ({ id: b.id, name: b.name, amount: b.amount, category: b.category ?? 'Casa', dueDay: b.dueDay, bill: b }))
  if (inc.card > 0) list.unshift({ id: CARD_ID, name: 'Fatura do cartão', amount: inc.card, category: 'Compras' })
  return list
}

/** Mês anterior / seguinte (`AAAA-MM`). */
export const shiftMonth = (m: string, n: number) => { const [y, mm] = m.split('-').map(Number); const d = new Date(y, mm - 1 + n, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
const shortMonth = (m: string) => fromISODate(`${m}-01`).toLocaleDateString('pt-BR', { month: 'long' })
/** A que mês uma conta paga se refere: `ref` ou, nos lançamentos antigos, o mês anterior ao pagamento. */
export const refOf = (t: Transaction) => t.ref ?? shiftMonth(monthKey(t.date), -1)

/** Contas já pagas que se referem ao mês `ref`. */
export function usePaidFor(ref: string) {
  const tx = useTransactions()
  return new Set(tx.filter((t) => t.billId && t.type === 'despesa' && refOf(t) === ref).map((t) => t.billId!))
}

/** Paga as contas de `ref` (competência) com data no mês `month` (quando o dinheiro sai). */
export function pay(items: Item[], month: string, ref: string, on?: string) {
  items.forEach((i) => db.transactions.add({ type: 'despesa', description: i.name, amount: i.amount, category: i.category, date: on || payDate(month), method: i.id === CARD_ID ? 'Crédito' : 'Pix', recurring: true, billId: i.id, ref, note: `referente a ${shortMonth(ref)}` }))
}
export function unpay(id: string, ref: string) {
  db.transactions.store.set((list) => list.filter((t) => !(t.billId === id && refOf(t) === ref)))
}

