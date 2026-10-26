import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { PixelIcon, type SpriteName } from '@/components/game/PixelIcon'

/** Barra de título dos widgets (janela de jogo) com "Ver mais →". */
export function WidgetHeader({ title, to, linkLabel = 'Ver mais', subtitle, action, sprite }: { title: string; to?: string; linkLabel?: string; subtitle?: ReactNode; action?: ReactNode; sprite?: SpriteName }) {
  return (
    <div className="mb-3">
      <div className="px-titlebar justify-between">
        <span className="flex min-w-0 items-center gap-2">
          {sprite && <PixelIcon name={sprite} size={18} />}
          <span className="truncate">{title}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2 font-sans text-xs normal-case tracking-normal">
          {action}
          {to && (
            <Link to={to} className="group inline-flex items-center gap-1 font-medium text-rosa-50/75 hover:text-rosa">
              {linkLabel} <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
            </Link>
          )}
        </span>
      </div>
      {subtitle && <p className="mt-1.5 px-1 text-xs text-vinho/60">{subtitle}</p>}
    </div>
  )
}
