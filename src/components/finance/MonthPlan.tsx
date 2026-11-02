import { useState } from 'react'
import { CreditCard, Plus, ReceiptText, X } from 'lucide-react'
import { db, settingsStore } from '@/store/db'
import { useIncome, useMonthlyBills, useVault } from '@/hooks/useData'
import { addMonths, today, fromISODate } from '@/utils/date'
import { money, moneyInput, parseMoney } from '@/utils/format'
import { cn } from '@/lib/cn'

const field = 'h-10 min-w-0 rounded-2xl border-2 border-ink bg-quente px-3 text-sm focus:outline-none focus:ring-4 focus:ring-lavanda/60'

/** Contas do mês (aluguel, internet…) + a fatura do cartão de crédito. */
export function BillsCard() {
  const bills = useMonthlyBills()
  const inc = useIncome()
  const [f, setF] = useState({ name: '', amount: '', dueDay: '' })
  const [card, setCard] = useState<string | null>(null)
  const sorted = [...bills].sort((a, b) => (a.dueDay ?? 99) - (b.dueDay ?? 99) || a.name.localeCompare(b.name))
  const total = bills.reduce((a, b) => a + b.amount, 0)
  const add = () => {
    const amount = parseMoney(f.amount)
    const day = Math.round(Number(f.dueDay))
    if (!f.name.trim() || !(amount > 0)) return
    db.monthlyBills.add({ name: f.name.trim(), amount, dueDay: day >= 1 && day <= 31 ? day : undefined })
    setF({ name: '', amount: '', dueDay: '' })
  }
  const saveCard = () => {
    const n = parseMoney(card ?? '')
    settingsStore.set((p) => ({ ...p, creditCard: Number.isFinite(n) && n >= 0 ? n : p.creditCard }))
    setCard(null)
  }
  return (
    <div className="flex flex-col rounded-3xl border-2 border-ink bg-quente p-6 shadow-pixel">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-lavanda"><ReceiptText size={20} /></span>
        <div>
          <h2 className="font-serif text-xl font-bold">Contas do mês</h2>
          <p className="text-xs text-tinta/60">o que sai todo mês do salário</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-lavanda-100 px-3 py-2.5">
        <CreditCard size={18} className="shrink-0" />
        <span className="flex-1 text-sm font-semibold">Fatura do cartão de crédito</span>
        {card !== null ? (
          <input autoFocus className={cn(field, 'h-9 w-28 text-right font-bold')} inputMode="decimal" aria-label="Valor da fatura do cartão" value={card}
            onChange={(e) => setCard(e.target.value)} onBlur={saveCard} onKeyDown={(e) => e.key === 'Enter' && saveCard()} />
        ) : (
          <button onClick={() => setCard(moneyInput(inc.card))} className="rounded-full px-2 text-sm font-bold underline decoration-ink/30 underline-offset-4 hover:decoration-ink" aria-label="Editar fatura do cartão">{money(inc.card)}</button>
        )}
      </div>

      <ul className="mt-2 divide-y divide-ink/10">
        {sorted.map((b) => (
          <li key={b.id} className="group flex items-center gap-3 py-2.5 text-sm">
            <span className="w-14 shrink-0 text-xs text-tinta/55">{b.dueDay ? `dia ${b.dueDay}` : '—'}</span>
            <span className="min-w-0 flex-1 truncate">{b.name}</span>
            <span className="font-semibold tabular-nums">{money(b.amount)}</span>
            <button onClick={() => db.monthlyBills.remove(b.id)} className="grid h-7 w-7 place-items-center rounded-full text-tinta/40 hover:bg-ink/5 hover:text-cereja" aria-label={`Remover ${b.name}`}><X size={14} /></button>
          </li>
        ))}
      </ul>
      {!bills.length && <p className="py-3 text-sm text-tinta/55">Adicione as contas fixas (aluguel, internet, celular…).</p>}

      <form onSubmit={(e) => { e.preventDefault(); add() }} className="mt-2 grid grid-cols-[minmax(0,1fr)_96px_64px_auto] gap-2">
        <input className={field} placeholder="Conta (ex.: internet)" aria-label="Nome da conta" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className={field} placeholder="R$" inputMode="decimal" aria-label="Valor da conta" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
        <input className={field} placeholder="dia" inputMode="numeric" aria-label="Dia de vencimento" value={f.dueDay} onChange={(e) => setF({ ...f, dueDay: e.target.value })} />
        <button type="submit" className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-lavanda" aria-label="Adicionar conta"><Plus size={16} /></button>
      </form>

      <p className="mt-auto flex justify-between border-t-2 border-ink pt-3 text-sm">
        <span>Total (contas + cartão)</span><b className="tabular-nums">{money(total + inc.card)}</b>
      </p>
    </div>
  )
}

/** Projeção do próximo mês: salário − contas − cartão = sobra; quanto guardar para sair de casa. */
export function ProjectionCard() {
  const inc = useIncome()
  const bills = useMonthlyBills()
  const vault = useVault()
  const billsTotal = bills.reduce((a, b) => a + b.amount, 0)
  const left = inc.salary - billsTotal - inc.card
  const save = vault.remaining > 0 ? vault.neededPerMonth ?? 0 : 0
  const free = left - save
  const month = addMonths(fromISODate(today()), 1).toLocaleDateString('pt-BR', { month: 'long' })
  const pct = (n: number) => (inc.salary ? Math.round((n / inc.salary) * 100) : 0)
  const rows: { label: string; value: number; sign: '+' | '−' }[] = [
    { label: 'Salário', value: inc.salary, sign: '+' },
    { label: 'Contas do mês', value: billsTotal, sign: '−' },
    { label: 'Fatura do cartão', value: inc.card, sign: '−' },
  ]
  return (
    <div className="flex flex-col rounded-3xl border-2 border-ink bg-ink p-6 text-ink-fg shadow-lavanda">
      <p className="text-xs uppercase tracking-[0.3em] text-lavanda">projeção de {month}</p>
      <h2 className="mt-1 font-serif text-2xl font-bold">Quanto vai sobrar</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {rows.map((r) => (
          <li key={r.label} className="flex justify-between"><span className="text-ink-fg/75">{r.sign} {r.label}</span><span className="tabular-nums">{money(r.value)}</span></li>
        ))}
      </ul>
      <div className="mt-3 flex items-end justify-between border-t border-ink-fg/25 pt-3">
        <span className="text-sm text-ink-fg/75">Sobra do salário</span>
        <span className={cn('font-serif text-3xl font-bold', left < 0 ? 'text-[#E07A8C]' : 'text-ink-fg')}>{money(left)}</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-lavanda p-3 text-ink">
          <p className="text-xs">Guardar para sair de casa</p>
          <p className="font-serif text-xl font-bold">{money(save)}</p>
          <p className="text-[11px]">{save ? `${pct(save)}% do salário por mês` : vault.remaining <= 0 ? 'meta batida 🎉' : 'defina a data em Sair de casa'}</p>
        </div>
        <div className="rounded-2xl bg-salvia p-3 text-ink">
          <p className="text-xs">Livre depois de guardar</p>
          <p className="font-serif text-xl font-bold">{money(free)}</p>
          <p className="text-[11px]">{pct(free)}% do salário</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-fg/60">+ {money(inc.voucher)} de vale-alimentação para o mercado.</p>
    </div>
  )
}
