import type { Task } from '@/types'
import { AREAS } from '@/data/constants'
import { XP_VALUES } from '@/game/config'
import { Checkbox } from '@/components/ui/Checkbox'
import { toggleTask } from '@/components/tasks/TaskItem'
import { PixelIcon } from './PixelIcon'
import { cn } from '@/lib/cn'

/** Tarefa do dia como missão de jogo (+XP ao concluir). */
export function DailyMission({ task, compact }: { task: Task; compact?: boolean }) {
  const area = AREAS[task.area] ?? AREAS.geral
  return (
    <li className={cn('group flex items-center gap-3 rounded-lg border-2 px-2.5 transition-all', compact ? 'py-1.5' : 'py-2', task.done ? 'border-oliva/30 bg-oliva-100/60' : 'border-transparent bg-white/50 hover:border-px-line/30 hover:bg-white/80')}>
      <Checkbox checked={task.done} onChange={() => toggleTask(task)} label={task.title} size={compact ? 20 : 22} />
      <PixelIcon name={area.sprite} size={compact ? 16 : 18} className={cn(task.done && 'opacity-50')} />
      <span className={cn('min-w-0 flex-1 truncate text-sm font-medium', task.done ? 'text-vinho/45 line-through decoration-2' : 'text-tinta')}>{task.title}</span>
      <span className={cn('shrink-0 rounded px-1.5 py-0.5 font-pixel text-[11px] font-semibold', task.done ? 'bg-oliva text-rosa-50' : 'bg-px-gold-soft text-vinho')}>
        {task.done ? '✓ ' : '+'}{XP_VALUES.tarefa} XP
      </span>
    </li>
  )
}
