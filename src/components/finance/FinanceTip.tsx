import { money } from '@/utils/format'

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

/** Ensinamento do dia (um por dia, com o valor calculado para a renda). */
export const lessonOfDay = (renda: number) => {
  const now = new Date()
  const day = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000)
  return LESSONS[day % LESSONS.length](renda)
}
