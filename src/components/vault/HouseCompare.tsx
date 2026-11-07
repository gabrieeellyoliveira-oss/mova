import type { MoveNote } from '@/types'
import { vaultSettingsStore } from '@/store/db'
import { useMoveNotes, useVault } from '@/hooks/useData'
import { toast } from '@/hooks/useToast'
import { money } from '@/utils/format'
import { StarRating } from '@/components/ui/Misc'
import { cn } from '@/lib/cn'

const r0 = (n: number) => money(Math.round(n)).replace(',00', '')
/** Total do mês da casa: o campo "total" ou, sem ele, o aluguel anotado. */
export const houseTotal = (n: MoveNote) => n.total ?? n.price ?? 0

/** Casas lado a lado: total/mês contra o teto (moradia total), tempo até o trabalho, cozinha, garantia e nota da visita. */
export function HouseCompare({ onOpen }: { onOpen: (n: MoveNote) => void }) {
  const notes = useMoveNotes()
  const v = useVault()
  const houses = notes
    .filter((n) => n.kind === 'casa' && n.status !== 'descartado')
    .sort((a, b) => Number(b.status === 'favorito') - Number(a.status === 'favorito') || houseTotal(a) - houseTotal(b))
  if (!houses.length) return <p className="text-sm text-tinta/65">Anote casas na pesquisa abaixo (tipo 🏠 Casa) para comparar aqui.</p>
  const th = 'px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-tinta/60'
  const td = 'px-3 py-2.5 align-middle'
  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="border-b-2 border-ink">
          <tr><th className={cn(th, 'min-w-[200px]')}>Casa</th><th className={th}>Total/mês</th><th className={th}>Até o trabalho</th><th className={th}>Cozinha</th><th className={th}>Garantia</th><th className={th}>Visita</th><th className={th} /></tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {houses.map((h) => {
            const total = houseTotal(h)
            const over = total > v.rent
            const usingThis = total > 0 && total === v.rent
            return (
              <tr key={h.id}>
                <td className={cn(td, 'min-w-[200px]')}><button onClick={() => onOpen(h)} className="text-left font-semibold hover:underline">{h.status === 'favorito' && <span className="text-cereja">♥ </span>}{h.title}</button></td>
                <td className={cn(td, 'whitespace-nowrap tabular-nums')}>
                  {total ? <span className={cn('rounded-full px-2 py-0.5 font-semibold', over ? 'bg-[#F6D6DC] text-cereja' : 'bg-salvia/70')}>{r0(total)}</span> : <span className="text-tinta/40">—</span>}
                  {!h.total && h.price ? <span className="ml-1 text-[10px] text-tinta/45">só aluguel</span> : null}
                </td>
                <td className={cn(td, 'text-tinta/80')}>{h.commute ?? <span className="text-tinta/40">—</span>}</td>
                <td className={td}>{h.kitchen === 'sim' ? '✓' : h.kitchen === 'nao' ? <span className="text-cereja">não</span> : <span className="text-tinta/40">?</span>}</td>
                <td className={cn(td, 'text-tinta/80')}>{h.guarantee ?? <span className="text-tinta/40">—</span>}</td>
                <td className={td}>{h.visitScore ? <StarRating value={h.visitScore} size={14} /> : <span className="text-xs text-tinta/40">não visitei</span>}</td>
                <td className={cn(td, 'text-right')}>
                  {total > 0 && (usingThis ? <span className="whitespace-nowrap text-xs font-semibold text-oliva-600">na meta ✓</span> : (
                    <button onClick={() => { vaultSettingsStore.set((p) => ({ ...p, targetRent: total })); toast(`Moradia total agora é ${r0(total)}`, { text: 'A meta do cofre foi recalculada.' }) }}
                      className="whitespace-nowrap rounded-full border-2 border-ink bg-quente px-2.5 py-0.5 text-xs font-semibold hover:bg-lavanda-100">usar na meta</button>
                  ))}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-tinta/55">Verde = cabe no teto de {r0(v.rent)} (moradia total do Planejamento financeiro). Toque no nome para completar os dados da casa.</p>
    </div>
  )
}
