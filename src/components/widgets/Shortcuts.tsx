import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { AREAS } from '@/data/constants'
import type { AreaId } from '@/types'
import { cn } from '@/lib/cn'

/** Cada atalho com ícone próprio e cor de destaque */
const ITEMS: { id: AreaId; bg: string; text: string; sub: string; chip: string }[] = [
  { id: 'financas', bg: 'bg-rosa-100', text: 'text-vinho', sub: 'text-cereja/80', chip: 'bg-quente/80 text-vinho' },
  { id: 'sair', bg: 'bg-[#c9d3a8]', text: 'text-vinho', sub: 'text-oliva-600', chip: 'bg-quente/70 text-vinho' },
  { id: 'estudos', bg: 'bg-rosa-100', text: 'text-vinho', sub: 'text-cereja/80', chip: 'bg-quente/80 text-vinho' },
  { id: 'leitura', bg: 'bg-creme-200', text: 'text-vinho', sub: 'text-cereja/80', chip: 'bg-quente/80 text-vinho' },
  { id: 'metas', bg: 'bg-cereja', text: 'text-rosa-50', sub: 'text-rosa-50/85', chip: 'bg-rosa-50 text-cereja' },
  { id: 'rotina', bg: 'bg-rosa', text: 'text-vinho', sub: 'text-vinho/75', chip: 'bg-quente/80 text-vinho' },
]

export function Shortcuts() {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 min-[1360px]:grid-cols-6">
      {ITEMS.map((it, i) => {
        const a = AREAS[it.id]
        return (
          <Link
            key={it.id}
            to={a.path}
            className={cn('group relative flex min-h-[150px] flex-col justify-between gap-4 rounded-3xl p-4 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift animate-rise', it.bg)}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-start justify-between">
              <a.icon size={34} strokeWidth={1.8} className={cn('transition-transform group-hover:-rotate-6', it.text)} />
              <span className={cn('grid h-7 w-7 place-items-center rounded-full transition group-hover:translate-x-0.5', it.chip)}>
                <ChevronRight size={15} strokeWidth={2.6} />
              </span>
            </div>
            <div>
              <p className={cn('font-heading text-[17px] leading-tight', it.text)}>{a.label}</p>
              <p className={cn('mt-1 text-[13px] leading-snug', it.sub)}>{a.tagline}</p>
            </div>
          </Link>
        )
      })}
    </section>
  )
}
