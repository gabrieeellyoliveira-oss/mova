import { History, ListChecks, Sparkles, TrendingUp } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { VaultHero, VaultKpis } from '@/components/vault/VaultHero'
import { VaultChart, useTrail } from '@/components/vault/VaultChart'
import { CostList } from '@/components/vault/CostList'
import { AfterMove } from '@/components/vault/AfterMove'
import { EntryList } from '@/components/vault/EntryList'
import { IncomeCard } from '@/components/finance/IncomeCard'

const monthLong = (k: string) => { const [y, m] = k.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long' }) }

/** Sair de casa: veredito, 3 números, custos da mudança, a vida depois de sair, a trilha e o histórico. */
export default function Vault() {
  const { end } = useTrail()
  return (
    <div className="space-y-6">
      <VaultHero />
      <VaultKpis />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader icon={<ListChecks size={18} />} title="Custos da mudança" subtitle="o saldo cobre os itens na ordem da lista" />
          <CostList />
        </Card>
        <Card>
          <CardHeader icon={<Sparkles size={18} />} title={<span className="flex items-center gap-2">Depois que eu sair <span className="rounded-full border-2 border-ink bg-lavanda px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wide">novo</span></span>} subtitle="quanto sobra por mês morando sozinha" />
          <AfterMove />
        </Card>
      </div>
      <Card>
        <CardHeader icon={<TrendingUp size={18} />} title={end ? `Trilha até ${monthLong(end)}` : 'Trilha do cofre'} subtitle={end ? 'quanto você tem vs. quanto deveria ter em cada mês' : 'defina a data meta no topo para ver a trilha'} />
        <VaultChart />
      </Card>
      <Card>
        <CardHeader icon={<History size={18} />} title="Histórico" subtitle="categorias fixas — sem precisar digitar nome · toque para editar" />
        <EntryList />
      </Card>
      <IncomeCard />
    </div>
  )
}
