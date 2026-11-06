import { History, ListChecks, TrendingUp } from 'lucide-react'
import { useIncome, useVault } from '@/hooks/useData'
import { money } from '@/utils/format'
import { IncomeCard } from '@/components/finance/IncomeCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { VaultHero } from '@/components/vault/VaultHero'
import { VaultChart } from '@/components/vault/VaultChart'
import { CostList } from '@/components/vault/CostList'
import { EntryList } from '@/components/vault/EntryList'

export default function Vault() {
  const v = useVault()
  const inc = useIncome()
  const need = v.neededPerMonth
  return (
    <div className="space-y-6">
      <VaultHero />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <IncomeCard className="lg:col-span-2" extra={need && need > 0 ? <>Para sair na data que você quer, guardar <b className="text-tinta">{money(need)}</b> por mês = <b className="text-tinta">{Math.round((need / inc.total) * 100)}% da sua renda</b> ({money(inc.total)}).</> : <>Guardando {money(v.monthlyAvg)} por mês em média = {inc.total ? Math.round((v.monthlyAvg / inc.total) * 100) : 0}% da sua renda ({money(inc.total)}).</>} />
        <Card className="flex flex-col">
          <CardHeader icon={<TrendingUp size={18} />} title="Evolução do cofre" subtitle="quanto você guardou e tirou em cada mês" />
          <VaultChart />
        </Card>
        <Card>
          <CardHeader icon={<ListChecks size={18} />} title="Custos da mudança" subtitle="o saldo cobre os itens na ordem da lista" />
          <CostList />
        </Card>
      </div>
      <Card>
        <CardHeader icon={<History size={18} />} title="Histórico" subtitle="toque em uma movimentação para editar" />
        <EntryList />
      </Card>
    </div>
  )
}
