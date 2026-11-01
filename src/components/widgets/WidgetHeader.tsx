import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Icon, type IconName } from '@/components/ui/Icon'

/** Cabeçalho dos cards: ícone num quadradinho suave, título e "Ver mais →". */
export function WidgetHeader({ title, to, linkLabel = 'Ver mais', subtitle, action, sprite }: { title: string; to?: string; linkLabel?: string; subtitle?: ReactNode; action?: ReactNode; sprite?: IconName }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {sprite && <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rosa-50"><Icon name={sprite} size={20} /></span>}
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-tinta">{title}</h3>
          {subtitle && <p className="truncate text-xs text-vinho/60">{subtitle}</p>}
        </div>
      </div>
      <span className="flex shrink-0 items-center gap-2 text-xs">
        {action}
        {to && (
          <Link to={to} className="group inline-flex items-center gap-1 rounded-full bg-rosa-50 px-3 py-1.5 font-semibold text-vinho hover:bg-rosa-100">
            {linkLabel} <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
          </Link>
        )}
      </span>
    </div>
  )
}
