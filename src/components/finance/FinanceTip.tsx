import { monthKey, today } from '@/utils/date'
import { money } from '@/utils/format'
import { useProjection } from './MonthPlan'

/** Ensinamentos que se revezam (um por dia), com o valor já calculado para a renda da Gabi. */
const LESSONS: ((renda: number) => string)[] = [
  (r) => `Regra 50-30-20: até 50% da renda em necessidades, 30% em desejos e 20% guardado. Para você, 20% = ${money(r * 0.2)} por mês.`,
  () => 'Pague-se primeiro: separe o valor de Sair de casa no dia em que o salário cair, antes de qualquer gasto.',
  (r) => `Reserva de emergência: antes de mudar, tente ter de 3 a 6 meses de gastos guardados — algo entre ${money(r * 3)} e ${money(r * 6)}.`,
  () => 'Fatura do cartão não é dinheiro extra: tudo que passa no crédito hoje já é gasto do mês que vem.',
  () => 'Gasto pequeno soma: R$ 15 por dia viram R$ 450 no fim do mês.',
  () => 'Regra das 24 horas: antes de uma compra que não estava nos planos, espere um dia. Se ainda fizer sentido, compre.',
  () => 'Olhe as assinaturas a cada 3 meses: cancele o que você não usou no último mês.',
]

/** Leitura do mês atual (como o "Próximo post" do LinkedIn) + um ensinamento. */
export function FinanceTip() {
  const month = monthKey(today())
  const p = useProjection(month)
  const now = new Date()
  const elapsed = now.getDate() / new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate()
  const others = p.m.monthTx.filter((t) => t.type === 'despesa' && !t.billId)
  const byCat = Object.entries(others.reduce<Record<string, number>>((a, t) => ((a[t.category] = (a[t.category] ?? 0) + t.amount), a), {})).sort((a, b) => b[1] - a[1])
  const top = byCat[0]
  const vaUsed = p.m.monthTx.filter((t) => t.type === 'despesa' && t.method === 'Vale-alimentação').reduce((a, t) => a + t.amount, 0)
  const vaPct = p.inc.voucher ? vaUsed / p.inc.voucher : 0

  let title: string
  let text: string
  if (p.left < 0) {
    title = `O mês fecha em ${money(p.left)}`
    text = `Do jeito que está, falta dinheiro.${top ? ` O que mais pesou foi ${top[0].toLowerCase()} (${money(top[1])}) —` : ''} segure os gastos que não são contas nos próximos ${daysLeft} dias.`
  } else if (p.save > 0 && p.left < p.save) {
    title = `Vão sobrar ${money(p.left)}`
    text = `É menos que os ${money(p.save)} para sair de casa no prazo. Faltam ${money(p.save - p.left)}${top ? ` — dá para tirar de ${top[0].toLowerCase()}, onde já foram ${money(top[1])}` : ''}.`
  } else if (vaPct > elapsed + 0.2) {
    title = `Vale em ${Math.round(vaPct * 100)}%`
    text = `O vale-alimentação já foi ${Math.round(vaPct * 100)}% e o mês está em ${Math.round(elapsed * 100)}%. Vá com calma no mercado: restam ${money(p.inc.voucher - vaUsed)} para ${daysLeft} dias.`
  } else {
    title = `Vão sobrar ${money(p.left)}`
    text = p.save > 0
      ? `Guarde ${money(p.save)} para sair de casa assim que o salário cair; fica ${money(p.left - p.save)} livre para o mês.`
      : `Mês no azul. Se quiser acelerar a saída de casa, mande uma parte disso para o cofre.`
  }
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000)
  const lesson = LESSONS[dayOfYear % LESSONS.length](p.base)

  return (
    <div className="mt-4 rounded-2xl border-2 border-ink bg-lavanda-100 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-tinta/60">Este mês</p>
      <p className={`mt-1 font-serif text-2xl font-bold ${p.left < 0 ? 'text-cereja' : ''}`}>{title}</p>
      <p className="mt-1.5 text-sm leading-snug text-tinta/75">{text}</p>
      <p className="mt-3 border-t border-ink/15 pt-2.5 text-xs leading-snug text-tinta/65"><b className="text-tinta">💡 Ensinamento:</b> {lesson}</p>
    </div>
  )
}
