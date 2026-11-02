import { useState } from 'react'
import { Check, Pencil } from 'lucide-react'
import { settingsStore } from '@/store/db'
import { useIncome } from '@/hooks/useData'
import { money, moneyInput, parseMoney } from '@/utils/format'
import { cn } from '@/lib/cn'

/** Renda mensal: salário + vale-alimentação, com edição no próprio card. `extra` = linha a mais embaixo. */
export function IncomeCard({ className, extra }: { className?: string; extra?: React.ReactNode }) {
  const inc = useIncome()
  const [edit, setEdit] = useState(false)
  const [v, setV] = useState({ salary: '', voucher: '' })
  const start = () => { setV({ salary: moneyInput(inc.salary), voucher: moneyInput(inc.voucher) }); setEdit(true) }
  const save = () => {
    const salary = parseMoney(v.salary)
    const voucher = parseMoney(v.voucher)
    settingsStore.set((p) => ({ ...p, salary: Number.isFinite(salary) && salary >= 0 ? salary : p.salary, mealVoucher: Number.isFinite(voucher) && voucher >= 0 ? voucher : p.mealVoucher }))
    setEdit(false)
  }
  const field = 'h-10 w-full rounded-2xl border-2 border-ink bg-quente px-3 text-base font-bold focus:outline-none focus:ring-4 focus:ring-lavanda/60'
  return (
    <div className={cn('flex flex-col rounded-3xl border-2 border-ink bg-quente p-5 shadow-pixel', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="font-serif text-xl font-bold">Minha renda</p>
        <button onClick={edit ? save : start} className="grid h-8 w-8 place-items-center rounded-full border-2 border-ink bg-quente hover:bg-lavanda" aria-label={edit ? 'Salvar renda' : 'Editar renda'}>
          {edit ? <Check size={15} /> : <Pencil size={13} />}
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-ink bg-salvia p-3">
          <p className="text-xs">Salário</p>
          {edit ? <input className={field} inputMode="decimal" aria-label="Salário" value={v.salary} onChange={(e) => setV({ ...v, salary: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && save()} />
            : <p className="font-serif text-xl font-bold">{money(inc.salary)}</p>}
        </div>
        <div className="rounded-2xl border-2 border-ink bg-lavanda p-3">
          <p className="text-xs">Vale-alimentação</p>
          {edit ? <input className={field} inputMode="decimal" aria-label="Vale-alimentação" value={v.voucher} onChange={(e) => setV({ ...v, voucher: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && save()} />
            : <p className="font-serif text-xl font-bold">{money(inc.voucher)}</p>}
        </div>
      </div>
      <p className="mt-3 text-sm text-tinta/70">Total por mês: <b className="text-tinta">{money(inc.total)}</b></p>
      {extra && <div className="mt-1 text-sm text-tinta/70">{extra}</div>}
    </div>
  )
}
