import { Plus } from 'lucide-react'
import { useIncome, useVault } from '@/hooks/useData'
import { openForm } from '@/hooks/useQuickAdd'
import { money } from '@/utils/format'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/cn'

const r0 = (n: number) => money(Math.round(n)).replace(',00', '')

/**
 * Ensaio de morar sozinha: todo dia de pagamento ela "paga" ao cofre o custo de viver fora
 * (moradia total + custos fixos). Testa o orçamento antes do contrato e, de quebra, enche o cofre.
 */
export function useRehearsal() {
  const v = useVault()
  const inc = useIncome()
  const suggested = v.livingTotal
  const done = Math.max(0, v.thisMonth)
  const left = Math.max(0, suggested - done)
  const need = v.neededPerMonth ?? 0
  const day = new Date().getDate()
  return { suggested, done, left, need, covers: suggested >= need, payday: inc.payday, due: day >= inc.payday && left > 0 && v.remaining > 0 }
}

export function Rehearsal() {
  const r = useRehearsal()
  const v = useVault()
  const pct = r.suggested ? Math.min(100, (r.done / r.suggested) * 100) : 0
  return (
    <div className="flex h-full flex-col">
      <p className="text-sm text-tinta/75">
        Todo dia <b>{r.payday}</b>, guarde no cofre o que você vai gastar morando sozinha: moradia de {r0(v.rent)} + contas de {r0(r.suggested - v.rent)}.
      </p>
      <div className="mt-4 rounded-2xl border-2 border-ink bg-lavanda-100 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-tinta/60">Ensaio deste mês</p>
        <p className="mt-1 font-serif text-3xl font-bold">{r0(r.done)} <span className="text-lg font-normal text-tinta/60">de {r0(r.suggested)}</span></p>
        <div className="mt-3"><Progress value={pct} height={8} color={pct >= 100 ? '#376139' : '#0C0A0E'} /></div>
        <p className="mt-2 text-sm text-tinta/70">{r.left > 0 ? `Faltam ${r0(r.left)} para fechar o ensaio do mês.` : 'Ensaio do mês feito ✓ — você já viveria com esse orçamento.'}</p>
      </div>
      <p className={cn('mt-3 rounded-2xl px-4 py-2.5 text-sm', r.covers ? 'bg-salvia/60' : 'bg-[#F6D6DC]')}>
        {r.need > 0
          ? r.covers
            ? <>O ensaio ({r0(r.suggested)}) já cobre a parcela do plano ({r0(r.need)}). Se ele couber no seu mês, a meta fecha na data. 🔑</>
            : <>O ensaio ({r0(r.suggested)}) fica abaixo da parcela do plano ({r0(r.need)}): complete com {r0(r.need - r.suggested)} de extra por mês ou ajuste a data meta.</>
          : <>Defina a data meta no topo para comparar o ensaio com a parcela do plano.</>}
      </p>
      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <button onClick={() => openForm('deposit', { type: 'deposito', amount: r.left || r.suggested, category: 'salario', note: 'Ensaio de morar sozinha' })}
          className="inline-flex h-10 items-center gap-1.5 rounded-full border-2 border-ink bg-lavanda px-4 text-sm font-semibold hover:brightness-105">
          <Plus size={15} strokeWidth={2.6} /> Guardar {r0(r.left || r.suggested)}
        </button>
      </div>
    </div>
  )
}
