import { useState } from 'react'
import { Check, CreditCard, Plus, ReceiptText, X } from 'lucide-react'
import type { FinanceCategory, MonthlyBill } from '@/types'
import { db, settingsStore } from '@/store/db'
import { useIncome, useMonthFinance, useMonthlyBills, useTransactions, useVault } from '@/hooks/useData'
import type { Transaction } from '@/types'
import { EXPENSE_CATEGORIES } from '@/data/constants'
import { monthKey, toISODate, today, fromISODate } from '@/utils/date'
import { money, moneyInput, parseMoney } from '@/utils/format'
import { toast } from '@/hooks/useToast'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

const field = 'h-10 min-w-0 rounded-2xl border-2 border-ink bg-quente px-3 text-sm focus:outline-none focus:ring-4 focus:ring-lavanda/60'
export const CARD_ID = 'cartao'
export const monthName = (m: string) => fromISODate(`${m}-01`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

/** Data do lançamento de um pagamento do mês: hoje (mês atual) ou o último dia (mês passado). */
const payDate = (month: string) => {
  if (month === monthKey(today())) return today()
  const [y, m] = month.split('-').map(Number)
  return toISODate(new Date(y, m, 0))
}

type Item = { id: string; name: string; amount: number; category: FinanceCategory; dueDay?: number; bill?: MonthlyBill }

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
function pay(items: Item[], month: string, ref: string, on?: string) {
  items.forEach((i) => db.transactions.add({ type: 'despesa', description: i.name, amount: i.amount, category: i.category, date: on || payDate(month), method: i.id === CARD_ID ? 'Crédito' : 'Pix', recurring: true, billId: i.id, ref, note: `referente a ${shortMonth(ref)}` }))
}
function unpay(id: string, ref: string) {
  db.transactions.store.set((list) => list.filter((t) => !(t.billId === id && refOf(t) === ref)))
}

/**
 * Contas do mês: as contas de um mês são pagas no mês seguinte. Vendo novembro, o card mostra as contas
 * de outubro (pagas em novembro) e "Paguei as contas de outubro" lança tudo em Movimentações com data de novembro.
 */
export function BillsCard({ month }: { month: string }) {
  const items = useItems()
  const inc = useIncome()
  const prevRef = shiftMonth(month, -1)
  const paidPrev = usePaidFor(prevRef)
  const paidCur = usePaidFor(month)
  // depois de pagar tudo do mês passado, o card passa a mostrar as contas deste mês (que vencem no próximo)
  const prevDone = items.length > 0 && items.every((i) => paidPrev.has(i.id))
  const ref = prevDone ? month : prevRef
  const paid = prevDone ? paidCur : paidPrev
  const prevTx = useTransactions().filter((t) => t.billId && t.type === 'despesa' && refOf(t) === prevRef)
  const prevTotal = prevTx.reduce((a, t) => a + t.amount, 0)
  const [showPrev, setShowPrev] = useState(false)
  const [f, setF] = useState({ name: '', amount: '', dueDay: '', category: 'Casa' as FinanceCategory })
  const [card, setCard] = useState<string | null>(null)
  const [payOn, setPayOn] = useState(() => payDate(month))
  const [editAmt, setEditAmt] = useState<{ id: string; v: string } | null>(null)
  const refTx = useTransactions().filter((t) => t.billId && t.type === 'despesa' && refOf(t) === ref)
  /** Valor real: numa conta paga, muda o lançamento; numa pendente, muda o valor desta conta (e da fatura). */
  const saveAmt = (i: Item, txId?: string) => {
    const v = parseMoney(editAmt?.v ?? '')
    setEditAmt(null)
    if (!Number.isFinite(v) || v < 0) return
    if (txId) db.transactions.update(txId, { amount: v })
    else if (i.id === CARD_ID) settingsStore.set((p) => ({ ...p, creditCard: v }))
    else db.monthlyBills.update(i.id, { amount: v })
  }
  const future = month > monthKey(today())
  const pending = items.filter((i) => !paid.has(i.id))
  const total = items.reduce((a, i) => a + i.amount, 0)
  const tx = useTransactions()
  const history = Object.values(tx.filter((t) => t.billId && t.type === 'despesa').reduce<Record<string, { ref: string; paidIn: string; total: number }>>((acc, t) => {
    const r = refOf(t)
    acc[r] = acc[r] ?? { ref: r, paidIn: monthKey(t.date), total: 0 }
    acc[r].total += t.amount
    return acc
  }, {})).sort((x, y) => y.ref.localeCompare(x.ref)).slice(0, 4)
  const add = () => {
    const amount = parseMoney(f.amount)
    const day = Math.round(Number(f.dueDay))
    if (!f.name.trim() || !(amount > 0)) return
    db.monthlyBills.add({ name: f.name.trim(), amount, dueDay: day >= 1 && day <= 31 ? day : undefined, category: f.category })
    setF({ name: '', amount: '', dueDay: '', category: f.category })
  }
  const saveCard = () => {
    const n = parseMoney(card ?? '')
    settingsStore.set((p) => ({ ...p, creditCard: Number.isFinite(n) && n >= 0 ? n : p.creditCard }))
    setCard(null)
  }
  const payAll = () => {
    pay(pending, month, ref, payOn)
    toast('Contas pagas ✓', { text: `${pending.length} ${pending.length === 1 ? 'conta lançada' : 'contas lançadas'} em Movimentações` })
  }
  return (
    <div className="flex flex-col rounded-3xl border-2 border-ink bg-quente p-6 shadow-pixel">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-lavanda"><ReceiptText size={20} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-xl font-bold">Contas do mês</h2>
          <p className="text-xs text-tinta/60">Contas de <b>{shortMonth(ref)}</b> · pagar em {shortMonth(shiftMonth(ref, 1))}{items.length ? ` · ${items.length - pending.length} de ${items.length} pagas` : ''}</p>
        </div>
      </div>

      {prevDone && (
        <div className="mb-3 rounded-2xl border-2 border-ink bg-salvia px-3 py-2.5 text-sm">
          <div className="flex items-center gap-3">
            <Check size={18} strokeWidth={3} className="shrink-0" />
            <span className="flex-1"><b>Contas de {shortMonth(prevRef)} pagas</b> em {shortMonth(month)} · {money(prevTotal)}</span>
            <button onClick={() => setShowPrev(!showPrev)} className="shrink-0 text-xs font-semibold underline underline-offset-4">{showPrev ? 'fechar' : 'ver e corrigir valores'}</button>
          </div>
          {showPrev && (
            <ul className="mt-2 divide-y divide-ink/15 border-t border-ink/20">
              {prevTx.map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-2">
                  <span className="min-w-0 flex-1 truncate">{t.description}</span>
                  <input inputMode="decimal" defaultValue={moneyInput(t.amount)} aria-label={`Valor pago de ${t.description} em ${shortMonth(prevRef)}`}
                    onBlur={(e) => { const v = parseMoney(e.target.value); if (Number.isFinite(v) && v >= 0 && v !== t.amount) db.transactions.update(t.id, { amount: v }) }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                    className="h-8 w-28 rounded-xl border-2 border-ink bg-quente px-2 text-right font-semibold focus:outline-none" />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-lavanda-100 px-3 py-2.5">
        <CreditCard size={18} className="shrink-0" />
        <span className="flex-1 text-sm font-semibold">Fatura do cartão (valor do mês)</span>
        {card !== null ? (
          <input autoFocus className={cn(field, 'h-9 w-28 text-right font-bold')} inputMode="decimal" aria-label="Valor da fatura do cartão" value={card}
            onChange={(e) => setCard(e.target.value)} onBlur={saveCard} onKeyDown={(e) => e.key === 'Enter' && saveCard()} />
        ) : (
          <button onClick={() => setCard(moneyInput(inc.card))} className="rounded-full px-2 text-sm font-bold underline decoration-ink/30 underline-offset-4 hover:decoration-ink" aria-label="Editar fatura do cartão">{money(inc.card)}</button>
        )}
      </div>

      <ul className="mt-2 divide-y divide-ink/10">
        {items.map((i) => {
          const done = paid.has(i.id)
          const paidTx = done ? refTx.find((t) => t.billId === i.id) : undefined
          const shown = paidTx ? refTx.filter((t) => t.billId === i.id).reduce((a, t) => a + t.amount, 0) : i.amount
          return (
            <li key={i.id} className="flex items-center gap-3 py-2.5 text-sm">
              <button disabled={future} onClick={() => (done ? unpay(i.id, ref) : pay([i], month, ref, payOn))} aria-pressed={done} aria-label={done ? `Desmarcar ${i.name}` : `Paguei ${i.name}`}
                className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 border-ink transition disabled:opacity-30', done ? 'bg-ink text-ink-fg' : 'bg-quente hover:bg-lavanda-100')}>
                {done && <Check size={14} strokeWidth={3} />}
              </button>
              <span className="w-12 shrink-0 text-xs text-tinta/55">{i.dueDay ? `dia ${i.dueDay}` : i.id === CARD_ID ? 'cartão' : '—'}</span>
              <span className={cn('min-w-0 flex-1 truncate', done && 'text-tinta/45 line-through')}>{i.name}</span>
              {editAmt?.id === i.id ? (
                <input autoFocus inputMode="decimal" value={editAmt.v} onChange={(e) => setEditAmt({ id: i.id, v: e.target.value })} aria-label={`Valor pago de ${i.name}`}
                  onBlur={() => saveAmt(i, paidTx?.id)} onKeyDown={(e) => e.key === 'Enter' && saveAmt(i, paidTx?.id)}
                  className="h-8 w-28 rounded-xl border-2 border-ink bg-quente px-2 text-right text-sm font-semibold focus:outline-none" />
              ) : (
                <button onClick={() => setEditAmt({ id: i.id, v: moneyInput(shown) })} title={done ? 'Alterar o valor que foi pago' : 'Alterar o valor desta conta'} aria-label={`Alterar valor de ${i.name}`}
                  className="font-semibold tabular-nums underline decoration-ink/20 decoration-dashed underline-offset-4 hover:decoration-ink">{money(shown)}</button>
              )}
              {i.bill ? (
                <button onClick={() => db.monthlyBills.remove(i.id)} className="grid h-7 w-7 place-items-center rounded-full text-tinta/40 hover:bg-ink/5 hover:text-cereja" aria-label={`Remover ${i.name}`}><X size={14} /></button>
              ) : <span className="w-7" />}
            </li>
          )
        })}
      </ul>
      {!items.length && <p className="py-3 text-sm text-tinta/55">Adicione as contas fixas (aluguel, internet, celular…) e o valor da fatura.</p>}

      <form onSubmit={(e) => { e.preventDefault(); add() }} className="mt-2 grid grid-cols-[minmax(0,1fr)_88px_56px_auto] gap-2">
        <input className={field} placeholder="Conta (ex.: internet)" aria-label="Nome da conta" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className={field} placeholder="R$" inputMode="decimal" aria-label="Valor da conta" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
        <input className={field} placeholder="dia" inputMode="numeric" aria-label="Dia de vencimento" value={f.dueDay} onChange={(e) => setF({ ...f, dueDay: e.target.value })} />
        <button type="submit" className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-lavanda" aria-label="Adicionar conta"><Plus size={16} /></button>
        <select className={cn(field, 'col-span-4 h-9')} aria-label="Categoria da conta" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as FinanceCategory })}>
          {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </form>

      {history.length > 0 && (
        <div className="mt-4 rounded-2xl border-2 border-ink/15 p-3">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-tinta/55">Histórico das contas</p>
          <ul className="space-y-1 text-xs">
            {history.map((h) => (
              <li key={h.ref} className="flex justify-between gap-2"><span className="capitalize">{shortMonth(h.ref)} <span className="normal-case text-tinta/55">· pagas em {shortMonth(h.paidIn)}</span></span><b className="tabular-nums">{money(h.total)}</b></li>
            ))}
          </ul>
        </div>
      )}
      {!prevDone && items.length > 0 && <p className="mt-3 text-xs text-tinta/60">As contas de {shortMonth(month)} ({money(total)}) ficam para pagar em {shortMonth(shiftMonth(month, 1))}.</p>}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink pt-3 text-sm">
        <span>Falta pagar: <b className="tabular-nums">{money(pending.reduce((a, i) => a + i.amount, 0))}</b></span>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-tinta/60">pago em
            <input type="date" value={payOn} onChange={(e) => setPayOn(e.target.value || payDate(month))} aria-label="Data do pagamento" className="h-8 rounded-xl border-2 border-ink bg-quente px-2 text-xs text-tinta focus:outline-none" />
          </label>
          <Button size="sm" disabled={future || !pending.length} onClick={payAll}><Check size={14} /> Paguei as contas de {shortMonth(ref)}</Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Projeção do mês: o que já entrou (salário recebido ou a receber + dinheiro extra)
 * menos o que já saiu (Movimentações) e as contas ainda não pagas. Mês passado = fechamento real.
 */
/** Conta do mês: entradas (recebidas ou a receber) − gastos lançados − contas pendentes = sobra. */
export function useProjection(month: string) {
  const inc = useIncome()
  const items = useItems()
  const vault = useVault()
  const m = useMonthFinance(month)
  const paidPrev = usePaidFor(shiftMonth(month, -1))
  const current = month === monthKey(today())
  const past = month < monthKey(today())
  const salaryToCome = !past && m.salaryReceived === 0 ? inc.salary : 0
  const voucherReceived = m.monthTx.filter((t) => t.type === 'receita' && /vale|alimenta/i.test(t.description)).reduce((a, t) => a + t.amount, 0)
  const voucherToCome = !past && voucherReceived === 0 ? inc.voucher : 0
  const pendingBills = past ? 0 : items.filter((i) => !paidPrev.has(i.id)).reduce((a, i) => a + i.amount, 0)
  const thirteenth = m.monthTx.filter((t) => t.type === 'receita' && (t.income === '13' || t.category === '13º salário')).reduce((a, t) => a + t.amount, 0)
  const extras = m.extras - voucherReceived - thirteenth
  const left = m.salaryReceived + salaryToCome + voucherReceived + voucherToCome + thirteenth + extras - m.expenses - pendingBills
  const save = vault.remaining > 0 ? vault.neededPerMonth ?? 0 : 0
  const base = (m.salaryReceived || inc.salary) + (voucherReceived || inc.voucher)
  return { inc, m, vault, current, past, salaryToCome, voucherReceived, voucherToCome, thirteenth, pendingBills, extras, left, save, base }
}

export function ProjectionCard({ month }: { month: string }) {
  const { inc, m, vault, current, past, salaryToCome, voucherReceived, voucherToCome, thirteenth, pendingBills, extras, left, save, base } = useProjection(month)
  const pct = (n: number) => (base ? Math.round((n / base) * 100) : 0)
  const [receiving, setReceiving] = useState<null | 'Salário' | '13º salário'>(null)
  const [amount, setAmount] = useState('')
  // o lançamento feito pelo botão (um por mês): dá para alterar o valor quantas vezes quiser
  const salaryTx = m.monthTx.find((t) => t.income === 'salario')
  const thirteenthTx = m.monthTx.find((t) => t.income === '13')
  const startReceive = (k: 'Salário' | '13º salário') => {
    const cur = k === 'Salário' ? salaryTx : thirteenthTx
    setReceiving(k)
    setAmount(cur ? moneyInput(cur.amount) : k === 'Salário' ? moneyInput(m.salaryReceived || inc.salary) : '')
  }
  const receive = () => {
    const v = parseMoney(amount)
    if (!receiving || !(v >= 0)) return
    const cur = receiving === 'Salário' ? salaryTx : thirteenthTx
    if (cur && v === 0) db.transactions.remove(cur.id)
    else if (cur) db.transactions.update(cur.id, { amount: v })
    else if (v > 0) db.transactions.add({ type: 'receita', description: receiving === 'Salário' ? `Salário de ${shortMonth(month)}` : '13º salário', amount: v, category: receiving, date: payDate(month), method: 'Transferência', recurring: false, income: receiving === 'Salário' ? 'salario' : '13' })
    toast(receiving === 'Salário' ? 'Salário do mês salvo 💸' : '13º salvo 🎁', { text: money(v) })
    setReceiving(null)
  }
  const rows: { label: string; value: number; sign: '+' | '−'; hide?: boolean }[] = [
    { label: 'Salário recebido', value: m.salaryReceived, sign: '+', hide: !m.salaryReceived },
    { label: 'Salário a receber (estimado)', value: salaryToCome, sign: '+', hide: !salaryToCome },
    { label: 'Vale-alimentação recebido', value: voucherReceived, sign: '+', hide: !voucherReceived },
    { label: 'Vale-alimentação a receber', value: voucherToCome, sign: '+', hide: !voucherToCome },
    { label: '13º salário', value: thirteenth, sign: '+', hide: !thirteenth },
    { label: 'Dinheiro extra', value: extras, sign: '+', hide: !extras },
    { label: 'Gastos lançados', value: m.expenses, sign: '−' },
    { label: `Contas de ${shortMonth(shiftMonth(month, -1))} ainda não pagas`, value: pendingBills, sign: '−', hide: past },
  ]
  return (
    <div className="flex flex-col rounded-3xl border-2 border-ink bg-ink p-6 text-ink-fg shadow-lavanda">
      <p className="text-xs uppercase tracking-[0.3em] text-lavanda">{past ? 'fechamento de' : current ? 'projeção de' : 'previsão de'} {monthName(month)}</p>
      <h2 className="mt-1 font-serif text-2xl font-bold">{past ? 'Quanto sobrou' : 'Quanto vai sobrar'}</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {rows.filter((r) => !r.hide).map((r) => (
          <li key={r.label} className="flex justify-between"><span className="text-ink-fg/75">{r.sign} {r.label}</span><span className="tabular-nums">{money(r.value)}</span></li>
        ))}
      </ul>
      {!past && (
        <div className="mt-3">
          {receiving ? (
            <form onSubmit={(e) => { e.preventDefault(); receive() }} className="flex flex-wrap items-center gap-2 rounded-2xl bg-ink-fg/10 p-2.5">
              <span className="text-sm">{receiving === 'Salário' ? 'Quanto caiu de salário este mês?' : 'Quanto veio de 13º?'}</span>
              <input autoFocus inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} aria-label={receiving === 'Salário' ? 'Valor do salário recebido' : 'Valor do 13º'} placeholder="R$"
                className="h-9 w-32 rounded-xl border-2 border-ink-fg/60 bg-transparent px-3 text-right font-bold text-ink-fg focus:outline-none focus:ring-2 focus:ring-lavanda" />
              <button type="submit" className="h-9 rounded-full bg-lavanda px-4 text-sm font-semibold text-ink">Salvar</button>
              <button type="button" onClick={() => setReceiving(null)} className="text-xs text-ink-fg/60 hover:text-ink-fg">cancelar</button>
            </form>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => startReceive('Salário')} className="rounded-full border-2 border-ink-fg/70 px-3 py-1 text-xs font-semibold hover:bg-ink-fg/10">💸 {salaryTx ? `Salário do mês: ${money(salaryTx.amount)} · alterar` : 'Recebi o salário'}</button>
              <button onClick={() => startReceive('13º salário')} className="rounded-full border-2 border-ink-fg/70 px-3 py-1 text-xs font-semibold hover:bg-ink-fg/10">🎁 {thirteenthTx ? `13º: ${money(thirteenthTx.amount)} · alterar` : 'Recebi o 13º'}</button>
            </div>
          )}
        </div>
      )}
      <div className="mt-3 flex items-end justify-between border-t border-ink-fg/25 pt-3">
        <span className="text-sm text-ink-fg/75">{past ? 'Sobrou no mês' : 'Vai sobrar no mês'}</span>
        <span className={cn('font-serif text-3xl font-bold', left < 0 ? 'text-[#E07A8C]' : 'text-ink-fg')}>{money(left)}</span>
      </div>
      {!past && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-lavanda p-3 text-ink">
            <p className="text-xs">Guardar para sair de casa</p>
            <p className="font-serif text-xl font-bold">{money(save)}</p>
            <p className="text-[11px]">{save ? `${pct(save)}% da renda por mês` : vault.remaining <= 0 ? 'meta batida 🎉' : 'defina a data em Sair de casa'}</p>
          </div>
          <div className="rounded-2xl bg-salvia p-3 text-ink">
            <p className="text-xs">Livre depois de guardar</p>
            <p className="font-serif text-xl font-bold">{money(left - save)}</p>
            <p className="text-[11px]">{pct(left - save)}% da renda</p>
          </div>
        </div>
      )}
      <p className="mt-3 text-xs text-ink-fg/60">Usa as Movimentações do mês. O salário varia: quando cair, toque em “Recebi o salário” e coloque o valor real. A renda é salário + vale-alimentação ({money(inc.total)}).</p>
    </div>
  )
}
