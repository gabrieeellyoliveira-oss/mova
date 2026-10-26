import { Plus } from 'lucide-react'
import { useVault } from '@/hooks/useData'
import { openForm } from '@/hooks/useQuickAdd'
import { money } from '@/utils/format'
import { Card } from '@/components/ui/Card'
import { Ring } from '@/components/ui/Progress'
import { WidgetHeader } from './WidgetHeader'

export function VaultWidget() {
  const v = useVault()
  const done = v.remaining <= 0
  return (
    <Card className="flex flex-col p-4 sm:p-5">
      <WidgetHeader sprite="piggy" title="Cofre: sair de casa" to="/sair-de-casa" />
      <div className="flex flex-1 items-center gap-4">
        <Ring value={v.progress} size={104} stroke={10} color="#961415">
          <span className="text-xl font-extrabold text-vinho">{Math.round(v.progress)}%</span>
        </Ring>
        <div className="min-w-0">
          <p className="text-sm text-vinho/60">No cofre</p>
          <p className="text-2xl font-extrabold tracking-tight text-cereja">{money(v.saved)}</p>
          <p className="text-xs text-vinho/60">de {money(v.target)}</p>
          <p className="mt-2 text-[13px] font-semibold text-vinho">{done ? 'Meta batida! 🔑' : `Faltam ${money(v.remaining)}`}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-vinho/60">
        {done ? 'Hora de procurar a casa nova.' : v.forecast
          ? <>No ritmo atual: <b className="text-vinho">{v.forecast.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</b></>
          : 'Guarde um valor para ver a previsão.'}
      </p>
      <button onClick={() => openForm('deposit', { type: 'deposito' })} className="mt-3 inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-rosa px-4 text-sm font-bold text-vinho transition hover:bg-queimado hover:text-quente">
        <Plus size={15} strokeWidth={2.6} /> Guardar no cofre
      </button>
    </Card>
  )
}
