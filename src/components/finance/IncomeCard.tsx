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
  const [v, setV] = useState({ salary: '', voucher: '', payday: '' })
  const start = () => { setV({ salary: moneyInput(inc.salary), voucher: moneyInput(inc.voucher), payday: String(inc.payday) }); setEdit(true) }
  const save = () => {
    const salary = parseMoney(v.salary)
    const voucher = parseMoney(v.voucher)
    const day = Math.round(Number(v.payday))
    settingsStore.set((p) => ({ ...p, payday: day >= 1 && day <= 31 ? day : p.payday, salary: Number.isFinite(salary) && salary >= 0 ? salary : p.salary, mealVoucher: Number.isFinite(voucher) && voucher >= 0 ? voucher : p.mealVoucher }))
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
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-tinta/70">
        <span>Renda total: <b className="text-tinta">{money(inc.total)}</b></span>
        {edit ? (
          <label className="flex items-center gap-2">Cai todo dia <input className="h-8 w-14 rounded-xl border-2 border-ink bg-quente px-2 text-center font-bold focus:outline-none" inputMode="numeric" aria-label="Dia do pagamento" value={v.payday} onChange={(e) => setV({ ...v, payday: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && save()} /></label>
        ) : <span>Cai todo dia <b className="text-tinta">{inc.payday}</b></span>}
      </div>
      {extra && <div className="mt-1 text-sm text-tinta/70">{extra}</div>}
    </div>
  )
}
