import { History, ListChecks, Plus, TrendingUp } from 'lucide-react'
import { openForm } from '@/hooks/useQuickAdd'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { VaultHero } from '@/components/vault/VaultHero'
import { VaultChart } from '@/components/vault/VaultChart'
import { CostList } from '@/components/vault/CostList'
import { EntryList } from '@/components/vault/EntryList'

export default function Vault() {
  return (
    <div className="space-y-6">
      <PageHeader
        actions={<Button onClick={() => openForm('deposit', { type: 'deposito' })}><Plus size={16} /> Guardar</Button>}
      />
      <VaultHero />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card className="flex flex-col">
          <CardHeader icon={<TrendingUp size={18} />} title="Evolução do cofre" subtitle="saldo acumulado mês a mês e a linha da meta" />
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
