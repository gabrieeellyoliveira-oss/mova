import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

/** Cabeçalho padrão dos widgets da Home: título + "Ver mais →" */
export function WidgetHeader({ title, to, linkLabel = 'Ver mais', subtitle, action }: { title: string; to?: string; linkLabel?: string; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="whitespace-nowrap text-base font-extrabold leading-tight text-vinho">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-vinho/55">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {action}
        {to && (
          <Link to={to} className="group inline-flex items-center gap-1 pt-0.5 text-xs font-medium text-vinho/55 hover:text-cereja">
            {linkLabel} <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  )
}
