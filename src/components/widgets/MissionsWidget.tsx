import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { db } from '@/store/db'
import { useTasks } from '@/hooks/useData'
import { today } from '@/utils/date'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Misc'
import { DailyMission } from '@/components/game/DailyMission'
import { WidgetHeader } from './WidgetHeader'

/** Missões de hoje (tarefas do dia e atrasadas abertas). */
export function MissionsWidget({ limit = 6 }: { limit?: number }) {
  const tasks = useTasks()
  const [title, setTitle] = useState('')
  const t = today()
  const list = useMemo(
    () => [...tasks]
      .filter((x) => x.date === t || (!!x.date && x.date < t && !x.done))
      .sort((a, b) => Number(a.done) - Number(b.done) || a.order - b.order),
    [tasks, t],
  )
  const done = list.filter((x) => x.done).length
  const add = () => {
    if (!title.trim()) return
    const max = Math.max(-1, ...tasks.map((x) => x.order))
    db.tasks.add({ title: title.trim(), done: false, priority: 'media', area: 'geral', order: max + 1, date: t })
    setTitle('')
  }
  return (
    <Card className="flex flex-col">
      <WidgetHeader title="Missões de hoje" sprite="check" to="/meu-dia" linkLabel="Meu dia" subtitle={list.length ? `${done} de ${list.length} concluídas` : undefined} />
      {list.length === 0 ? (
        <EmptyState title="Dia livre de missões" text="Aproveita pra viver um pouco." />
      ) : (
        <ul className="space-y-1.5">{list.slice(0, limit).map((task) => <DailyMission key={task.id} task={task} compact />)}</ul>
      )}
      <form onSubmit={(e) => { e.preventDefault(); add() }} className="mt-3 flex items-center gap-2 rounded-lg border-2 border-dashed border-vinho/25 bg-white/40 py-1 pl-3 pr-1">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nova missão…" className="h-8 flex-1 bg-transparent text-sm placeholder:text-vinho/40 focus:outline-none" aria-label="Nova missão" />
        <Button type="submit" size="icon-sm" disabled={!title.trim()} aria-label="Adicionar missão"><Plus size={16} /></Button>
      </form>
    </Card>
  )
}
