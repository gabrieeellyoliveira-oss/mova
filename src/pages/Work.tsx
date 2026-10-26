import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { WorkProject } from '@/types'
import { Button } from '@/components/ui/Button'
import { ProjectsView } from '@/components/work/ProjectsView'
import { ProjectForm } from '@/components/work/ProjectForm'
import { WorkDaysPicker } from '@/components/work/WorkDaysPicker'

/** Trabalho: controle dos projetos (meta, ritmo e prazo de cada um). */
export default function Work() {
  const [project, setProject] = useState<WorkProject | null | 'new'>(null)
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <WorkDaysPicker />
        <Button onClick={() => setProject('new')}><Plus size={16} /> Novo projeto</Button>
      </div>
      <ProjectsView onEdit={setProject} />
      {project && <ProjectForm initial={project === 'new' ? undefined : project} onClose={() => setProject(null)} />}
    </div>
  )
}
