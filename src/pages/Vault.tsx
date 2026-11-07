import { useSearchParams } from 'react-router-dom'
import { History, ListChecks, Sparkles, TrendingUp } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { VaultHero, VaultKpis } from '@/components/vault/VaultHero'
import { VaultChart, useTrail } from '@/components/vault/VaultChart'
import { CostList } from '@/components/vault/CostList'
import { AfterMove } from '@/components/vault/AfterMove'
import { EntryList } from '@/components/vault/EntryList'
import { MovePlanning } from '@/components/vault/MovePlanning'
import { cn } from '@/lib/cn'
import { IncomeCard } from '@/components/finance/IncomeCard'

const monthLong = (k: string) => { const [y, m] = k.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long' }) }

const TABS = [{ id: 'financeiro', label: '💰 Planejamento financeiro' }, { id: 'planejamento', label: '📝 Planejamento' }] as const

/** Sair de casa: duas sub-abas — o cofre (financeiro) e a pesquisa (casas, móveis, links). */
export default function Vault() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('aba') === 'planejamento' ? 'planejamento' : 'financeiro'
  return (
    <div className="space-y-6">
      <div role="tablist" aria-label="Sair de casa" className="flex w-full gap-1 rounded-full border-2 border-ink bg-quente p-1 sm:w-fit">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setParams(t.id === 'financeiro' ? {} : { aba: t.id }, { replace: true })}
            className={cn('flex-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition sm:flex-none sm:px-5', tab === t.id ? 'bg-ink text-ink-fg' : 'hover:bg-lavanda-100')}>{t.label}</button>
        ))}
      </div>
      {tab === 'financeiro' ? <VaultFinance /> : <MovePlanning />}
    </div>
  )
}

function VaultFinance() {
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
