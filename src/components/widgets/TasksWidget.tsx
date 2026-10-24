import { useMemo, useRef, useState } from 'react'
import { ArrowDownWideNarrow, Plus } from 'lucide-react'
import type { Priority } from '@/types'
import { db } from '@/store/db'
import { useTasks } from '@/hooks/useData'
import { Card } from '@/components/ui/Card'
import { WidgetHeader } from './WidgetHeader'
import { Button } from '@/components/ui/Button'
import { Segmented } from '@/components/ui/Chip'
import { EmptyState } from '@/components/ui/Misc'
import { TaskItem } from '@/components/tasks/TaskItem'
import { today } from '@/utils/date'

const rank: Record<Priority, number> = { alta: 0, media: 1, baixa: 2 }

export function TasksWidget({ className }: { className?: string }) {
  const tasks = useTasks()
  const [filter, setFilter] = useState<'hoje' | 'todas' | 'feitas'>('hoje')
  const [title, setTitle] = useState('')
  const dragId = useRef<string | null>(null)
  const t = today()

  const list = useMemo(() => {
    const base = [...tasks].sort((a, b) => a.order - b.order)
    if (filter === 'feitas') return base.filter((x) => x.done)
    // hoje = tarefas do dia + atrasadas ainda abertas
    if (filter === 'hoje') return base.filter((x) => x.date === t || (!!x.date && x.date < t && !x.done))
    return base
  }, [tasks, filter, t])

  const done = list.filter((x) => x.done).length

  const add = () => {
    if (!title.trim()) return
    const max = Math.max(-1, ...tasks.map((x) => x.order))
    db.tasks.add({ title: title.trim(), done: false, priority: 'media', area: 'geral', order: max + 1, date: filter === 'hoje' ? t : undefined })
    setTitle('')
  }

  const reorder = (targetId: string) => {
    const from = dragId.current
    if (!from || from === targetId) return
    const ordered = [...tasks].sort((a, b) => a.order - b.order)
    const fromIdx = ordered.findIndex((x) => x.id === from)
    const [moved] = ordered.splice(fromIdx, 1)
    ordered.splice(ordered.findIndex((x) => x.id === targetId), 0, moved)
    db.tasks.replaceAll(ordered.map((x, i) => ({ ...x, order: i })))
    dragId.current = null
  }

  const sortByPriority = () => {
    const ordered = [...tasks].sort((a, b) => Number(a.done) - Number(b.done) || rank[a.priority] - rank[b.priority] || a.order - b.order)
    db.tasks.replaceAll(ordered.map((x, i) => ({ ...x, order: i })))
  }

  return (
    <Card className={className}>
      <WidgetHeader
        title="Minhas tarefas"
        subtitle={list.length ? `${done} de ${list.length} feitas` : 'nada pendente'}
        action={<Button variant="ghost" size="icon-sm" onClick={sortByPriority} title="Ordenar por prioridade" aria-label="Ordenar por prioridade"><ArrowDownWideNarrow size={16} /></Button>}
      />
      <Segmented
        className="mb-3"
        value={filter}
        onChange={setFilter}
        options={[{ value: 'hoje', label: 'Hoje' }, { value: 'todas', label: 'Todas' }, { value: 'feitas', label: 'Feitas' }]}
      />
      {list.length === 0 ? (
        <EmptyState title="Lista limpinha" text="Aproveita pra viver um pouco 🌷" />
      ) : (
        <ul className="-mx-2 max-h-[340px] space-y-0.5 overflow-y-auto">
          {list.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              draggable
              onDragStart={() => (dragId.current = task.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => reorder(task.id)}
            />
          ))}
        </ul>
      )}
      <form onSubmit={(e) => { e.preventDefault(); add() }} className="mt-3 flex items-center gap-2 rounded-full border border-dashed border-vinho/20 bg-creme-100/60 py-1 pl-4 pr-1">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Adicionar tarefa…" className="h-9 flex-1 bg-transparent text-sm placeholder:text-vinho/40 focus:outline-none" />
        <Button type="submit" size="icon-sm" disabled={!title.trim()} aria-label="Adicionar"><Plus size={16} /></Button>
      </form>
    </Card>
  )
}
