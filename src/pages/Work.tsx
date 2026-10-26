import { useState } from 'react'
import { ChevronLeft, ChevronRight, History, LineChart, ListChecks, Plus, Settings2 } from 'lucide-react'
import type { WorkEntry } from '@/types'
import { monthKey, today } from '@/utils/date'
import { formatWork, monthLabel, shiftMonth, useWork } from '@/hooks/useWork'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { WorkHero } from '@/components/work/WorkHero'
import { DailyChart, HistoryChart } from '@/components/work/WorkCharts'
import { WorkEntryList } from '@/components/work/WorkEntryList'
import { WorkSettingsCard } from '@/components/work/WorkSettingsCard'
import { WorkEntryForm } from '@/components/work/WorkEntryForm'

export default function Work() {
  const current = monthKey(today())
  const [month, setMonth] = useState(current)
  const [editing, setEditing] = useState<Partial<WorkEntry> | null>(null)
  const w = useWork(month)
  const newEntry = () => setEditing(month === current ? {} : { date: `${month}-01` })

  return (
    <div className="space-y-6">
      <PageHeader
        icon="briefcase"
        kicker="minha meta do mês"
        title="Trabalho"
        subtitle="Acompanhe a meta do mês e como você vem evoluindo."
        actions={
          <>
            <div className="flex items-center gap-1 rounded-lg border-2 border-px-line bg-px-panel p-1 shadow-pixel-sm">
              <Button size="icon-sm" variant="ghost" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Mês anterior"><ChevronLeft size={16} /></Button>
              <button onClick={() => setMonth(current)} className="min-w-[128px] px-2 text-sm font-bold capitalize text-vinho">{monthLabel(month)}</button>
              <Button size="icon-sm" variant="ghost" onClick={() => setMonth(shiftMonth(month, 1))} disabled={month >= current} aria-label="Próximo mês"><ChevronRight size={16} /></Button>
            </div>
            <Button onClick={newEntry}><Plus size={16} /> Registrar</Button>
          </>
        }
      />
      <WorkHero w={w} onAdd={newEntry} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader icon={<LineChart size={18} />} title="Evolução no mês" subtitle="acumulado x ritmo para bater a meta" />
          <DailyChart w={w} />
        </Card>
        <Card>
          <CardHeader
            icon={<History size={18} />}
            title="Meta x resultado"
            subtitle={w.history.length ? `metas batidas: ${w.hit} de ${w.history.filter((h) => h.meta > 0).length} meses${w.best ? ` · melhor: ${w.best.mes} (${w.best.pct}%)` : ''}` : 'últimos meses'}
          />
          <HistoryChart w={w} />
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader icon={<ListChecks size={18} />} title={`Registros de ${monthLabel(month).split(' ')[0]}`} subtitle={`${w.entries.length} registros · ${formatWork(w.achieved, w.settings)}`} action={<Button size="sm" variant="soft" onClick={newEntry}><Plus size={14} /> Novo</Button>} />
          <WorkEntryList w={w} onEdit={setEditing} />
        </Card>
        <Card tone="creme">
          <CardHeader icon={<Settings2 size={18} />} title="Como eu meço" subtitle="salvo automaticamente" />
          <WorkSettingsCard />
        </Card>
      </div>
      {editing && <WorkEntryForm initial={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
