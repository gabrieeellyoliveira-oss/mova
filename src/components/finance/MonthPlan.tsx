import { useState } from 'react'
import { Check, CreditCard, Plus, ReceiptText, X } from 'lucide-react'
import type { FinanceCategory, MonthlyBill } from '@/types'
import { db, settingsStore } from '@/store/db'
import { useIncome, useMonthFinance, useMonthlyBills, useVault } from '@/hooks/useData'
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
function useItems(): Item[] {
  const bills = useMonthlyBills()
  const inc = useIncome()
  const list: Item[] = [...bills]
    .sort((a, b) => (a.dueDay ?? 99) - (b.dueDay ?? 99) || a.name.localeCompare(b.name))
    .map((b) => ({ id: b.id, name: b.name, amount: b.amount, category: b.category ?? 'Casa', dueDay: b.dueDay, bill: b }))
  if (inc.card > 0) list.unshift({ id: CARD_ID, name: 'Fatura do cartão', amount: inc.card, category: 'Compras' })
  return list
}

function pay(items: Item[], month: string) {
  items.forEach((i) => db.transactions.add({ type: 'despesa', description: i.name, amount: i.amount, category: i.category, date: payDate(month), method: i.id === CARD_ID ? 'Crédito' : 'Pix', recurring: true, billId: i.id }))
}
function unpay(id: string, month: string) {
  db.transactions.store.set((list) => list.filter((t) => !(t.billId === id && monthKey(t.date) === month)))
}

/** Contas do mês: cada uma aparece como paga/pendente no mês escolhido; "Paguei as contas do mês" lança tudo em Movimentações. */
export function BillsCard({ month }: { month: string }) {
  const items = useItems()
  const inc = useIncome()
  const m = useMonthFinance(month)
  const [f, setF] = useState({ name: '', amount: '', dueDay: '', category: 'Casa' as FinanceCategory })
  const [card, setCard] = useState<string | null>(null)
  const future = month > monthKey(today())
  const pending = items.filter((i) => !m.paid.has(i.id))
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
    pay(pending, month)
    toast('Contas pagas ✓', { text: `${pending.length} ${pending.length === 1 ? 'conta lançada' : 'contas lançadas'} em Movimentações` })
  }
  return (
    <div className="flex flex-col rounded-3xl border-2 border-ink bg-quente p-6 shadow-pixel">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-lavanda"><ReceiptText size={20} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-xl font-bold">Contas do mês</h2>
          <p className="text-xs text-tinta/60">{items.length ? `${items.length - pending.length} de ${items.length} pagas em ${monthName(month)}` : 'o que sai todo mês do salário'}</p>
        </div>
      </div>

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
          const done = m.paid.has(i.id)
          return (
            <li key={i.id} className="flex items-center gap-3 py-2.5 text-sm">
              <button disabled={future} onClick={() => (done ? unpay(i.id, month) : pay([i], month))} aria-pressed={done} aria-label={done ? `Desmarcar ${i.name}` : `Paguei ${i.name}`}
                className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 border-ink transition disabled:opacity-30', done ? 'bg-ink text-ink-fg' : 'bg-quente hover:bg-lavanda-100')}>
                {done && <Check size={14} strokeWidth={3} />}
              </button>
              <span className="w-12 shrink-0 text-xs text-tinta/55">{i.dueDay ? `dia ${i.dueDay}` : i.id === CARD_ID ? 'cartão' : '—'}</span>
              <span className={cn('min-w-0 flex-1 truncate', done && 'text-tinta/45 line-through')}>{i.name}</span>
              <span className="font-semibold tabular-nums">{money(i.amount)}</span>
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

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink pt-3 text-sm">
        <span>Falta pagar: <b className="tabular-nums">{money(pending.reduce((a, i) => a + i.amount, 0))}</b></span>
        <Button size="sm" disabled={future || !pending.length} onClick={payAll}><Check size={14} /> Paguei as contas do mês</Button>
      </div>
    </div>
  )
}

/**
 * Projeção do mês: o que já entrou (salário recebido ou a receber + dinheiro extra)
 * menos o que já saiu (Movimentações) e as contas ainda não pagas. Mês passado = fechamento real.
 */
export function ProjectionCard({ month }: { month: string }) {
  const inc = useIncome()
  const items = useItems()
  const vault = useVault()
  const m = useMonthFinance(month)
  const current = month === monthKey(today())
  const past = month < monthKey(today())
  const salaryToCome = !past && m.salaryReceived === 0 ? inc.salary : 0
  const voucherReceived = m.monthTx.filter((t) => t.type === 'receita' && /vale|alimenta/i.test(t.description)).reduce((a, t) => a + t.amount, 0)
  const voucherToCome = !past && voucherReceived === 0 ? inc.voucher : 0
  const pendingBills = past ? 0 : items.filter((i) => !m.paid.has(i.id)).reduce((a, i) => a + i.amount, 0)
  const extras = m.extras - voucherReceived
  const left = m.salaryReceived + salaryToCome + voucherReceived + voucherToCome + extras - m.expenses - pendingBills
  const save = vault.remaining > 0 ? vault.neededPerMonth ?? 0 : 0
  const base = (m.salaryReceived || inc.salary) + (voucherReceived || inc.voucher)
  const pct = (n: number) => (base ? Math.round((n / base) * 100) : 0)
  const rows: { label: string; value: number; sign: '+' | '−'; hide?: boolean }[] = [
    { label: 'Salário recebido', value: m.salaryReceived, sign: '+', hide: !m.salaryReceived },
    { label: 'Salário a receber', value: salaryToCome, sign: '+', hide: !salaryToCome },
    { label: 'Vale-alimentação recebido', value: voucherReceived, sign: '+', hide: !voucherReceived },
    { label: 'Vale-alimentação a receber', value: voucherToCome, sign: '+', hide: !voucherToCome },
    { label: 'Dinheiro extra', value: extras, sign: '+', hide: !extras },
    { label: 'Gastos lançados', value: m.expenses, sign: '−' },
    { label: 'Contas ainda não pagas', value: pendingBills, sign: '−', hide: past },
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
      <p className="mt-3 text-xs text-ink-fg/60">Usa as Movimentações do mês: lance o salário quando cair e qualquer dinheiro extra que receber. A renda é salário + vale-alimentação ({money(inc.total)}).</p>
    </div>
  )
}
