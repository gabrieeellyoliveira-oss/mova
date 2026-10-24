import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { ISODate } from '@/types'
import { db } from '@/store/db'
import { usePriorities } from '@/hooks/useData'
import { Checkbox } from '@/components/ui/Checkbox'
import { Cherry } from '@/components/doodles/Doodles'
import { celebrate } from '@/hooks/useToast'
import { cn } from '@/lib/cn'

export function WeeklyPriorities({ weekStart }: { weekStart: ISODate }) {
  const items = usePriorities().filter((p) => p.weekStart === weekStart)
  const [title, setTitle] = useState('')
  return (
    <section className="relative overflow-hidden rounded-4xl bg-rosa-100 p-6 shadow-soft">
      <Cherry size={44} className="absolute -right-1 -top-1 rotate-12" />
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-queimado">o que não pode faltar</p>
      <h2 className="mb-4 mt-1 font-heading text-xl text-vinho">Prioridades da semana</h2>
      <ol className="space-y-2">
        {items.map((p, i) => (
          <li key={p.id} className="group flex items-center gap-3 rounded-2xl bg-quente px-3 py-2.5 shadow-soft">
            <span className="w-4 text-center text-lg font-extrabold text-queimado">{i + 1}</span>
            <Checkbox checked={p.done} onChange={(v) => { db.priorities.update(p.id, { done: v }); if (v) celebrate.task() }} label={p.title} />
            <input
              value={p.title}
              onChange={(e) => db.priorities.update(p.id, { title: e.target.value })}
              className={cn('min-w-0 flex-1 bg-transparent text-sm font-semibold focus:outline-none', p.done && 'text-vinho/40 line-through')}
              aria-label={`Prioridade ${i + 1}`}
            />
            <button onClick={() => db.priorities.remove(p.id)} className="text-vinho/30 hover:text-cereja sm:opacity-0 sm:group-hover:opacity-100" aria-label="Remover prioridade"><X size={15} /></button>
          </li>
        ))}
      </ol>
      {items.length < 3 ? (
        <form onSubmit={(e) => { e.preventDefault(); if (title.trim()) { db.priorities.add({ weekStart, title: title.trim(), done: false }); setTitle('') } }} className="mt-2 flex items-center gap-2 rounded-2xl border-2 border-dashed border-queimado/40 py-1 pl-4 pr-1">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`Prioridade ${items.length + 1} de 3…`} className="h-9 flex-1 bg-transparent text-sm placeholder:text-vinho/40 focus:outline-none" />
          <button type="submit" className="grid h-8 w-8 place-items-center rounded-full bg-cereja text-quente" aria-label="Adicionar prioridade"><Plus size={15} /></button>
        </form>
      ) : (
        <p className="mt-3 text-xs text-vinho/60">Três já é bastante. O resto pode esperar 💛</p>
      )}
    </section>
  )
}
