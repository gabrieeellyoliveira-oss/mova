import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { WorkProject } from '@/types'
import { useProjects } from '@/hooks/useProjects'
import { relativeDay } from '@/utils/date'
import { StatCard } from '@/components/ui/PageHeader'
import { Segmented } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Misc'
import { ProjectCard } from './ProjectCard'
import { ProjectEntryForm } from './ProjectEntryForm'

type Filter = 'ativos' | 'entregues' | 'todos'

/** Projetos de trabalho: resumo, filtro e cartões com o controle de meta/ritmo/prazo. */
export function ProjectsView({ onEdit }: { onEdit: (p: WorkProject | 'new') => void }) {
  const list = useProjects()
  const [filter, setFilter] = useState<Filter>('ativos')
  const [recording, setRecording] = useState<WorkProject | null>(null)

  const active = list.filter((x) => x.project.status !== 'concluido')
  const delivered = list.length - active.length
  const behind = active.filter((x) => x.stats.behind || x.stats.overdue).length
  const next = active.filter((x) => x.project.deadline && (x.stats.calendarDaysLeft ?? -1) >= 0).sort((a, b) => a.project.deadline!.localeCompare(b.project.deadline!))[0]
  const shown = list.filter((x) => filter === 'todos' || (filter === 'entregues' ? x.project.status === 'concluido' : x.project.status !== 'concluido'))

  if (list.length === 0)
    return <EmptyState title="Nenhum projeto ainda" text="Cadastre um projeto com prazo e meta (ou etapas) e acompanhe o ritmo até a entrega." action={<Button size="sm" onClick={() => onEdit('new')}><Plus size={14} /> Criar projeto</Button>} />

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard tone="vinho" label="Em andamento" value={active.length} hint={`${list.filter((x) => x.project.status === 'andamento').length} ativos agora`} />
        <StatCard tone="rosa" label="Próximo prazo" value={next ? relativeDay(next.project.deadline!) : '—'} hint={next?.project.name ?? 'nenhum prazo marcado'} />
        <StatCard label="Abaixo do ritmo" value={behind} hint={behind ? 'vale uma olhadinha' : 'tudo no ritmo ✓'} />
        <StatCard tone="oliva" label="Entregues" value={delivered} hint="projetos concluídos" />
      </div>
      <Segmented value={filter} onChange={setFilter} options={[{ value: 'ativos', label: 'Ativos' }, { value: 'entregues', label: 'Entregues' }, { value: 'todos', label: 'Todos' }]} />
      {shown.length === 0 ? (
        <EmptyState title={filter === 'entregues' ? 'As entregas vão aparecer aqui' : 'Nenhum projeto ativo'} />
      ) : (
        <div className="grid items-start gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {shown.map(({ project, stats }) => <ProjectCard key={project.id} project={project} stats={stats} onEdit={() => onEdit(project)} onRecord={() => setRecording(project)} />)}
        </div>
      )}
      {recording && <ProjectEntryForm project={recording} onClose={() => setRecording(null)} />}
    </div>
  )
}
