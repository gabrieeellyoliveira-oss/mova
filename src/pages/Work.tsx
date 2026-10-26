import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, History, LineChart, ListChecks, Plus, Settings2 } from 'lucide-react'
import type { WorkEntry, WorkProject } from '@/types'
import { monthKey, today } from '@/utils/date'
import { formatWork, monthLabel, shiftMonth, useWork } from '@/hooks/useWork'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { WorkHero } from '@/components/work/WorkHero'
import { DailyChart, HistoryChart } from '@/components/work/WorkCharts'
import { WorkEntryList } from '@/components/work/WorkEntryList'
import { WorkSettingsCard } from '@/components/work/WorkSettingsCard'
import { WorkEntryForm } from '@/components/work/WorkEntryForm'
import { ProjectsView } from '@/components/work/ProjectsView'
import { ProjectForm } from '@/components/work/ProjectForm'
import { Segmented } from '@/components/ui/Chip'

export default function Work() {
  const current = monthKey(today())
  const [month, setMonth] = useState(current)
  const [editing, setEditing] = useState<Partial<WorkEntry> | null>(null)
  const w = useWork(month)
  const newEntry = () => setEditing(month === current ? {} : { date: `${month}-01` })
  const [params, setParams] = useSearchParams()
  const tab = params.get('aba') === 'meta' ? 'meta' : 'projetos'
  const [project, setProject] = useState<WorkProject | null | 'new'>(null)

  const tabs = <Segmented value={tab} onChange={(v) => setParams(v === 'meta' ? { aba: 'meta' } : {})} options={[{ value: 'projetos', label: 'Projetos' }, { value: 'meta', label: 'Meta do mês' }]} />

  if (tab === 'projetos')
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {tabs}
          <Button onClick={() => setProject('new')}><Plus size={16} /> Novo projeto</Button>
        </div>
        <ProjectsView onEdit={setProject} />
        {project && <ProjectForm initial={project === 'new' ? undefined : project} onClose={() => setProject(null)} />}
      </div>
    )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {tabs}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border-2 border-px-line bg-px-panel p-1 shadow-pixel-sm">
            <Button size="icon-sm" variant="ghost" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Mês anterior"><ChevronLeft size={16} /></Button>
            <button onClick={() => setMonth(current)} className="min-w-[128px] px-2 text-sm font-bold capitalize text-vinho">{monthLabel(month)}</button>
            <Button size="icon-sm" variant="ghost" onClick={() => setMonth(shiftMonth(month, 1))} disabled={month >= current} aria-label="Próximo mês"><ChevronRight size={16} /></Button>
          </div>
          <Button onClick={newEntry}><Plus size={16} /> Registrar</Button>
        </div>
      </div>
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
