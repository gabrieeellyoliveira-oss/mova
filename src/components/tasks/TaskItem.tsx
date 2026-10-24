import type { DragEvent } from 'react'
import { useState } from 'react'
import { GripVertical, Pencil } from 'lucide-react'
import type { Task } from '@/types'
import { AREAS, PRIORITIES } from '@/data/constants'
import { db } from '@/store/db'
import { celebrate } from '@/hooks/useToast'
import { openForm } from '@/hooks/useQuickAdd'
import { Checkbox } from '@/components/ui/Checkbox'
import { DeleteButton } from '@/components/ui/Misc'
import { cn } from '@/lib/cn'

export function toggleTask(t: Task) {
  const done = !t.done
  db.tasks.update(t.id, { done, completedAt: done ? new Date().toISOString() : undefined })
  if (done) celebrate.task()
}

export function TaskItem({
  task, draggable, onDragStart, onDragOver, onDrop, compact,
}: {
  task: Task
  draggable?: boolean
  onDragStart?: () => void
  onDragOver?: (e: DragEvent) => void
  onDrop?: () => void
  compact?: boolean
}) {
  const [justDone, setJustDone] = useState(false)
  const area = AREAS[task.area]
  return (
    <li
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        'group flex items-center gap-3 rounded-2xl px-2 py-2 transition-all hover:bg-creme-100',
        justDone && 'animate-pop',
      )}
    >
      {draggable && <GripVertical size={14} className="hidden shrink-0 cursor-grab text-vinho/25 sm:block" />}
      <Checkbox
        checked={task.done}
        color={PRIORITIES[task.priority].color}
        label={task.title}
        onChange={() => {
          if (!task.done) { setJustDone(true); setTimeout(() => setJustDone(false), 400) }
          toggleTask(task)
        }}
      />
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium transition-all', task.done ? 'text-vinho/40 line-through decoration-queimado decoration-2' : 'text-tinta')}>
          {task.title}
        </p>
        {!compact && (
          <p className="mt-0.5 flex items-center gap-2 text-[11px] text-vinho/50">
            <span className="inline-flex items-center gap-1"><area.icon size={11} />{area.label}</span>
            <span className="h-1 w-1 rounded-full bg-vinho/20" />
            <span style={{ color: PRIORITIES[task.priority].color }}>{PRIORITIES[task.priority].label}</span>
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center sm:hidden sm:group-hover:flex sm:group-focus-within:flex">
        <button onClick={() => openForm('task', task as never)} className="grid h-8 w-8 place-items-center rounded-full text-vinho/60 hover:bg-vinho/5" aria-label="Editar tarefa">
          <Pencil size={14} />
        </button>
        <DeleteButton compact onConfirm={() => db.tasks.remove(task.id)} />
      </div>
    </li>
  )
}
