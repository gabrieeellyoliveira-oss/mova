import { useStudyWeek, useTasks } from '@/hooks/useData'
import { relativeDay, today, weekDays } from '@/utils/date'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { toggleTask } from '@/components/tasks/TaskItem'
import { Flower } from '@/components/doodles/Doodles'
import { cn } from '@/lib/cn'
import { WidgetHeader } from './WidgetHeader'

export function StudyWeekWidget() {
  const w = useStudyWeek()
  const tasks = useTasks()
  const days = weekDays(today())
  const list = tasks
    .filter((t) => t.area === 'estudos' && (!t.date || (t.date >= days[0] && t.date <= days[6])))
    .sort((a, b) => (a.date ?? '9').localeCompare(b.date ?? '9'))
    .slice(0, 4)

  return (
    <Card className="relative overflow-hidden p-4 sm:p-5">
      <Flower size={44} className="absolute bottom-6 right-4 opacity-90" />
      <WidgetHeader title="Estudos da semana" to="/estudos" linkLabel="Ver todos" subtitle={`${w.hours.toFixed(1).replace('.', ',')}h de ${w.goalHours}h estudadas`} />
      {list.length ? (
        <ul className="space-y-3 pr-10">
          {list.map((t) => (
            <li key={t.id} className="flex items-start gap-3">
              <Checkbox checked={t.done} onChange={() => toggleTask(t)} label={t.title} size={24} />
              <div className="min-w-0">
                <p className={cn('truncate text-[15px] font-medium text-tinta', t.done && 'text-vinho/45 line-through')}>{t.title}</p>
                <p className="text-xs text-vinho/55">{t.date ? relativeDay(t.date) : 'sem dia definido'}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-vinho/60">Nenhum estudo planejado nesta semana.</p>
      )}
    </Card>
  )
}
