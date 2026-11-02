import { useMemo, useState } from 'react'
import { Repeat, Search } from 'lucide-react'
import type { FinanceCategory, Transaction } from '@/types'
import { EXPENSE_CATEGORIES, FINANCE_COLORS, INCOME_CATEGORIES } from '@/data/constants'
import { money, normalize } from '@/utils/format'
import { formatShort, monthKey, MONTHS } from '@/utils/date'
import { openForm } from '@/hooks/useQuickAdd'
import { Segmented } from '@/components/ui/Chip'
import { Select } from '@/components/ui/Form'
import { EmptyState } from '@/components/ui/Misc'
import { Coin } from '@/components/doodles/Doodles'
import { cn } from '@/lib/cn'

/** Movimentações; com `month`, mostra só as daquele mês (o mesmo de "Para onde foi o dinheiro"). */
export function TransactionList({ transactions, month: fixedMonth }: { transactions: Transaction[]; month?: string }) {
  const months = useMemo(() => [...new Set(transactions.map((t) => monthKey(t.date)))].sort().reverse(), [transactions])
  const [ownMonth, setMonth] = useState(months[0] ?? '')
  const month = fixedMonth ?? ownMonth
  const [type, setType] = useState<'todas' | 'receita' | 'despesa'>('todas')
  const [cat, setCat] = useState<FinanceCategory | ''>('')
  const [q, setQ] = useState('')

  const list = transactions
    .filter((t) => (!month || monthKey(t.date) === month) && (type === 'todas' || t.type === type) && (!cat || t.category === cat))
    .filter((t) => !q || normalize(t.description + ' ' + (t.note ?? '')).includes(normalize(q)))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))

  const label = (k: string) => { const [y, m] = k.split('-'); return `${MONTHS[+m - 1]} ${y}` }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Segmented value={type} onChange={setType} options={[{ value: 'todas', label: 'Tudo' }, { value: 'receita', label: 'Entradas' }, { value: 'despesa', label: 'Gastos' }]} />
        {!fixedMonth && <Select value={month} onChange={(e) => setMonth(e.target.value)} className="h-9 w-auto capitalize">
          <option value="">Todos os meses</option>
          {months.map((m) => <option key={m} value={m}>{label(m)}</option>)}
        </Select>}
        <Select value={cat} onChange={(e) => setCat(e.target.value as FinanceCategory)} className="h-9 w-auto">
          <option value="">Todas as categorias</option>
          {[...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])].map((c) => <option key={c}>{c}</option>)}
        </Select>
        <div className="relative min-w-[160px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-vinho/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="h-9 w-full rounded-full border border-vinho/15 bg-quente pl-9 pr-3 text-sm focus:border-queimado focus:outline-none" />
        </div>
      </div>
      {list.length === 0 ? (
        <EmptyState title="Nada encontrado" text="Tente outro filtro." doodle={<Coin size={40} />} />
      ) : (
        <ul className="divide-y divide-dashed divide-vinho/10">
          {list.map((t) => (
            <li key={t.id}>
              <button onClick={() => openForm('transaction', t as never)} className="flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left transition hover:bg-creme-100">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-xs font-bold text-quente" style={{ backgroundColor: FINANCE_COLORS[t.category] }}>
                  {t.category.slice(0, 2)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 truncate text-sm font-semibold text-tinta">
                    {t.description}
                    {t.recurring && <Repeat size={12} className="shrink-0 text-queimado" aria-label="recorrente" />}
                  </span>
                  <span className="block truncate text-xs text-vinho/55">{t.category} · {t.method} · {formatShort(t.date)}{t.note ? ` · ${t.note}` : ''}</span>
                </span>
                <span className={cn('shrink-0 text-sm font-bold tabular-nums', t.type === 'receita' ? 'text-oliva-600' : 'text-cereja')}>
                  {t.type === 'receita' ? '+' : '−'} {money(t.amount)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
