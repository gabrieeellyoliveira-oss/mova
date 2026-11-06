import { useState, type ReactNode } from 'react'
import { Check, Plus, Settings2, X } from 'lucide-react'
import type { FinanceCategory } from '@/types'
import { db, settingsStore } from '@/store/db'
import { EXPENSE_CATEGORIES } from '@/data/constants'
import { formatShort, monthKey, today } from '@/utils/date'
import { money, moneyInput, parseMoney } from '@/utils/format'
import { openForm } from '@/hooks/useQuickAdd'
import { toast } from '@/hooks/useToast'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/cn'
import { CARD_ID, payDate, pay, unpay, type Item } from './MonthPlan'
import { useMonthFlow } from './useMonthFlow'
import { styleOf } from './categoryStyle'

const field = 'h-10 min-w-0 rounded-2xl border-2 border-ink bg-quente px-3 text-sm focus:outline-none focus:ring-4 focus:ring-lavanda/60'
const short = (m: string) => new Date(Number(m.slice(0, 4)), Number(m.slice(5, 7)) - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })

/** Valor que vira campo ao tocar (para corrigir o valor real). */
function EditableMoney({ value, onSave, label, className }: { value: number; onSave: (v: number) => void; label: string; className?: string }) {
  const [v, setV] = useState<string | null>(null)
  const save = () => { const n = parseMoney(v ?? ''); setV(null); if (Number.isFinite(n) && n >= 0 && n !== value) onSave(n) }
  if (v !== null)
    return <input autoFocus inputMode="decimal" value={v} onChange={(e) => setV(e.target.value)} onBlur={save} onKeyDown={(e) => e.key === 'Enter' && save()} aria-label={label}
      className="h-8 w-28 rounded-xl border-2 border-ink bg-quente px-2 text-right text-sm font-semibold text-tinta focus:outline-none" />
  return <button onClick={() => setV(moneyInput(value))} aria-label={label} title="Toque para alterar"
    className={cn('font-semibold tabular-nums underline decoration-dashed decoration-ink/25 underline-offset-4 hover:decoration-ink', className)}>{money(value)}</button>
}

function Step({ n, title, hint, children, total, totalLabel }: { n: number; title: ReactNode; hint?: ReactNode; children: ReactNode; total: number; totalLabel: string }) {
  return (
    <div className="flex min-w-0 flex-col rounded-3xl border-2 border-ink bg-quente p-5 shadow-pixel">
      <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink font-serif text-sm font-bold text-ink-fg">{n}</span>
        <div className="min-w-0">
          <h2 className="font-serif text-xl font-bold leading-tight">{title}</h2>
          {hint && <p className="text-xs text-tinta/60">{hint}</p>}
        </div>
      </div>
      <div className="mt-4 flex-1">{children}</div>
      <div className="mt-4 flex items-baseline justify-between border-t-2 border-ink pt-3">
        <span className="text-sm text-tinta/70">{totalLabel}</span>
        <span className="font-serif text-2xl font-bold">{money(total)}</span>
      </div>
    </div>
  )
}

/** O mês em 3 passos (recebi → paguei as contas do mês passado → sobrou) e o disponível agora. */
export function MonthFlow({ month }: { month: string }) {
  const f = useMonthFlow(month)
  const [addIn, setAddIn] = useState<null | { d: string; v: string; kind: 'Outros' | '13º salário' }>(null)
  const [cfg, setCfg] = useState(false)
  const [nb, setNb] = useState({ name: '', amount: '' })
  const [gasto, setGasto] = useState({ d: '', v: '', c: 'Outros' as FinanceCategory })
  const future = month > monthKey(today())

  const setSalary = (v: number) => {
    if (f.salaryTx) { if (v === 0) db.transactions.remove(f.salaryTx.id); else db.transactions.update(f.salaryTx.id, { amount: v }) }
    else if (v > 0) db.transactions.add({ type: 'receita', description: `Salário de ${short(month)}`, amount: v, category: 'Salário', date: payDate(month), method: 'Transferência', recurring: false, income: 'salario' })
    toast('Salário salvo 💸', { text: money(v) })
  }
  const addIncome = () => {
    const v = parseMoney(addIn?.v ?? '')
    if (!addIn || !(v > 0)) return
    db.transactions.add({ type: 'receita', description: addIn.d.trim() || (addIn.kind === '13º salário' ? '13º salário' : 'Entrada extra'), amount: v, category: addIn.kind, date: payDate(month), method: 'Pix', recurring: false, income: addIn.kind === '13º salário' ? '13' : undefined })
    setAddIn(null)
  }
  const billValue = (i: Item) => f.billTx.filter((t) => t.billId === i.id).reduce((a, t) => a + t.amount, 0)
  const setBill = (i: Item, v: number) => {
    const t = f.billTx.find((x) => x.billId === i.id)
    if (t) db.transactions.update(t.id, { amount: v })
    else if (i.id === CARD_ID) settingsStore.set((p) => ({ ...p, creditCard: v }))
    else db.monthlyBills.update(i.id, { amount: v })
  }
  const addGasto = () => {
    const v = parseMoney(gasto.v)
    if (!(v > 0)) return
    db.transactions.add({ type: 'despesa', description: gasto.d.trim() || gasto.c, amount: v, category: gasto.c, date: payDate(month), method: 'Pix', recurring: false })
    setGasto({ d: '', v: '', c: gasto.c })
  }
  const used = f.leftover > 0 ? Math.min(100, ((f.spent + Math.max(0, f.saved)) / f.leftover) * 100) : 100

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 1. Recebi */}
        <Step n={1} title="Recebi" hint={f.past ? `entradas de ${short(month)}` : 'o salário varia: toque no valor quando cair'} total={f.received} totalLabel="Entrou no mês">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between gap-3">
              <span>Salário {!f.salary && !f.past && <span className="text-xs text-tinta/50">(previsto)</span>}</span>
              <EditableMoney value={f.salary || f.salaryEstimate} onSave={setSalary} label="Valor do salário" className={cn(!f.salary && 'text-tinta/50')} />
            </li>
            {f.others.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate">{t.description}{t.income === '13' || t.category === '13º salário' ? ' 🎁' : ''}</span>
                <span className="flex items-center gap-1">
                  <EditableMoney value={t.amount} onSave={(v) => db.transactions.update(t.id, { amount: v })} label={`Valor de ${t.description}`} />
                  <button onClick={() => db.transactions.remove(t.id)} className="grid h-6 w-6 place-items-center rounded-full text-tinta/40 hover:text-cereja" aria-label={`Remover ${t.description}`}><X size={13} /></button>
                </span>
              </li>
            ))}
          </ul>
          {addIn ? (
            <form onSubmit={(e) => { e.preventDefault(); addIncome() }} className="mt-3 grid grid-cols-[minmax(0,1fr)_88px] gap-2">
              <input autoFocus className={field} placeholder="O que entrou (ex.: Pix da Ana)" aria-label="Descrição da entrada" value={addIn.d} onChange={(e) => setAddIn({ ...addIn, d: e.target.value })} />
              <input className={field} inputMode="decimal" placeholder="R$" aria-label="Valor da entrada" value={addIn.v} onChange={(e) => setAddIn({ ...addIn, v: e.target.value })} />
              <select className={cn(field, 'h-9')} aria-label="Tipo da entrada" value={addIn.kind} onChange={(e) => setAddIn({ ...addIn, kind: e.target.value as 'Outros' | '13º salário' })}>
                <option value="Outros">Extra</option><option value="13º salário">13º salário</option>
              </select>
              <div className="flex gap-1"><button type="submit" className="h-9 flex-1 rounded-full border-2 border-ink bg-lavanda text-xs font-semibold">Salvar</button><button type="button" onClick={() => setAddIn(null)} className="px-1 text-xs text-tinta/55">×</button></div>
            </form>
          ) : (
            <button onClick={() => setAddIn({ d: '', v: '', kind: 'Outros' })} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-4"><Plus size={13} /> outra entrada (13º, extra, Pix)</button>
          )}
        </Step>

        {/* 2. Paguei as contas do mês passado */}
        <Step n={2} title={<>Contas de {short(f.prev)}</>} hint={`pagas com o dinheiro de ${short(month)} · toque no valor para pôr o valor real`} total={f.bills} totalLabel={f.billsPending ? `Contas (falta pagar ${money(f.billsPending)})` : 'Contas pagas'}>
          <ul className="space-y-1.5 text-sm">
            {f.items.map((i) => {
              const done = f.paidIds.has(i.id)
              return (
                <li key={i.id} className="flex items-center gap-2.5">
                  <button disabled={future} onClick={() => (done ? unpay(i.id, f.prev) : pay([i], month, f.prev, payDate(month)))} aria-pressed={done} aria-label={done ? `Desmarcar ${i.name}` : `Paguei ${i.name}`}
                    className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 border-ink transition disabled:opacity-30', done ? 'bg-ink text-ink-fg' : 'bg-quente hover:bg-lavanda-100')}>{done && <Check size={13} strokeWidth={3} />}</button>
                  <span className={cn('min-w-0 flex-1 truncate', done && 'text-tinta/55')}>{i.name}</span>
                  <EditableMoney value={done ? billValue(i) : i.amount} onSave={(v) => setBill(i, v)} label={`Valor de ${i.name}`} />
                </li>
              )
            })}
            {f.billTx.filter((t) => !f.items.some((i) => i.id === t.billId)).map((t) => (
              <li key={t.id} className="flex items-center gap-2.5 text-tinta/55"><Check size={13} /> <span className="flex-1 truncate">{t.description}</span><span className="tabular-nums">{money(t.amount)}</span></li>
            ))}
          </ul>
          {!f.items.length && <p className="text-sm text-tinta/55">Cadastre suas contas fixas em “editar contas”.</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {f.pending.length > 0 && !future && (
              <button onClick={() => { pay(f.pending, month, f.prev, payDate(month)); toast(`Contas de ${short(f.prev)} pagas ✓`) }} className="inline-flex h-9 items-center gap-1.5 rounded-full border-2 border-ink bg-lavanda px-3 text-xs font-semibold"><Check size={13} /> Paguei todas</button>
            )}
            <button onClick={() => setCfg(!cfg)} className="inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-4"><Settings2 size={13} /> {cfg ? 'fechar' : 'editar contas'}</button>
          </div>
          {cfg && (
            <div className="mt-3 space-y-2 rounded-2xl border-2 border-ink/15 p-3">
              <p className="text-xs text-tinta/60">Contas fixas (valor previsto). A fatura muda todo mês: corrija o valor lá em cima.</p>
              {f.items.filter((i) => i.bill).map((i) => (
                <div key={i.id} className="flex items-center gap-2 text-sm"><span className="flex-1 truncate">{i.name}</span><span className="tabular-nums text-tinta/60">{money(i.amount)}</span>
                  <button onClick={() => db.monthlyBills.remove(i.id)} className="text-tinta/40 hover:text-cereja" aria-label={`Apagar conta ${i.name}`}><X size={14} /></button></div>
              ))}
              {!f.items.some((i) => i.id === CARD_ID) && (
                <button onClick={() => settingsStore.set((p) => ({ ...p, creditCard: 1 }))} className="text-xs font-semibold underline underline-offset-4">+ incluir fatura do cartão</button>
              )}
              <form onSubmit={(e) => { e.preventDefault(); const v = parseMoney(nb.amount); if (nb.name.trim() && v > 0) { db.monthlyBills.add({ name: nb.name.trim(), amount: v, category: 'Casa' }); setNb({ name: '', amount: '' }) } }} className="grid grid-cols-[minmax(0,1fr)_88px_auto] gap-2">
                <input className={field} placeholder="Nova conta (ex.: internet)" aria-label="Nome da nova conta" value={nb.name} onChange={(e) => setNb({ ...nb, name: e.target.value })} />
                <input className={field} inputMode="decimal" placeholder="R$" aria-label="Valor da nova conta" value={nb.amount} onChange={(e) => setNb({ ...nb, amount: e.target.value })} />
                <button type="submit" className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-lavanda" aria-label="Adicionar conta"><Plus size={15} /></button>
              </form>
            </div>
          )}
        </Step>

        {/* 3. Sobrou */}
        <div className="flex flex-col rounded-3xl border-2 border-ink bg-ink p-5 text-ink-fg shadow-lavanda">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lavanda font-serif text-sm font-bold text-ink">3</span>
            <div><h2 className="font-serif text-xl font-bold leading-tight">Sobrou</h2><p className="text-xs text-ink-fg/60">o dinheiro para o resto do mês</p></div>
          </div>
          <ul className="mt-4 space-y-1.5 text-sm text-ink-fg/75">
            <li className="flex justify-between"><span>Entrou</span><span className="tabular-nums">{money(f.received)}</span></li>
            <li className="flex justify-between"><span>− Contas de {short(f.prev)}</span><span className="tabular-nums">{money(f.bills)}</span></li>
          </ul>
          <p className={cn('mt-auto pt-6 font-serif text-5xl font-bold leading-none', f.leftover < 0 && 'text-[#E07A8C]')}>{money(f.leftover)}</p>
          {f.salaryEstimate > 0 && <p className="mt-2 text-xs text-ink-fg/60">usando o salário previsto — toque no valor do salário quando cair</p>}
        </div>
      </div>

      {/* Disponível agora + lançar gasto */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="rounded-3xl border-2 border-ink bg-lavanda-100 p-6 shadow-pixel">
          <p className="text-xs uppercase tracking-[0.2em] text-tinta/60">{f.past ? `fechou ${short(month)} com` : 'disponível agora'}</p>
          <p className={cn('mt-1 font-serif text-5xl font-bold', f.available < 0 && 'text-cereja')}>{money(f.available)}</p>
          <Progress value={used} height={8} className="mt-3" color={used > 90 ? '#702335' : '#0C0A0E'} />
          <ul className="mt-3 space-y-1 text-sm text-tinta/75">
            <li className="flex justify-between"><span>Sobrou depois das contas</span><span className="tabular-nums">{money(f.leftover)}</span></li>
            <li className="flex justify-between"><span>− Gastos de {short(month)}</span><span className="tabular-nums">{money(f.spent)}</span></li>
            {f.saved !== 0 && <li className="flex justify-between"><span>− Guardado no cofre</span><span className="tabular-nums">{money(f.saved)}</span></li>}
          </ul>
          <p className="mt-3 text-xs text-tinta/55">Vale-alimentação à parte: {money(f.vaLeft)} ainda no vale.</p>
        </div>
        <div className="flex flex-col rounded-3xl border-2 border-ink bg-quente p-6 shadow-pixel">
          <h2 className="font-serif text-xl font-bold">Gastos de {short(month)}</h2>
          <p className="text-xs text-tinta/60">tudo que sai do dinheiro que sobrou (comida no vale fica no card Alimentação)</p>
          <form onSubmit={(e) => { e.preventDefault(); addGasto() }} className="mt-3 grid grid-cols-[minmax(0,1fr)_88px_auto] gap-2 sm:grid-cols-[minmax(0,1fr)_120px_88px_auto]">
            <input className={field} placeholder="O que foi (ex.: Uber)" aria-label="Descrição do gasto" value={gasto.d} onChange={(e) => setGasto({ ...gasto, d: e.target.value })} />
            <select className={cn(field, 'hidden sm:block')} aria-label="Categoria do gasto" value={gasto.c} onChange={(e) => setGasto({ ...gasto, c: e.target.value as FinanceCategory })}>
              {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input className={field} inputMode="decimal" placeholder="R$" aria-label="Valor do gasto" value={gasto.v} onChange={(e) => setGasto({ ...gasto, v: e.target.value })} />
            <button type="submit" className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-lavanda" aria-label="Lançar gasto"><Plus size={16} /></button>
          </form>
          <ul className="mt-2 divide-y divide-ink/10">
            {f.spentTx.map((t) => {
              const st = styleOf(t)
              return (
                <li key={t.id} className="flex items-center gap-3 py-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-ink" style={{ backgroundColor: st.bg, color: st.fg }} aria-hidden><st.icon size={16} /></span>
                  <button onClick={() => openForm('transaction', t as never)} className="min-w-0 flex-1 text-left">
                    <span className="block truncate text-sm font-semibold">{t.description}</span>
                    <span className="block text-xs text-tinta/55">{t.category} · {formatShort(t.date)}</span>
                  </button>
                  <span className="text-sm font-bold tabular-nums text-cereja">− {money(t.amount)}</span>
                  <button onClick={() => db.transactions.remove(t.id)} className="grid h-7 w-7 place-items-center rounded-full text-tinta/40 hover:text-cereja" aria-label={`Apagar ${t.description}`}><X size={14} /></button>
                </li>
              )
            })}
          </ul>
          {!f.spentTx.length && <p className="py-3 text-sm text-tinta/55">Nenhum gasto lançado neste mês.</p>}
        </div>
      </div>
    </div>
  )
}
