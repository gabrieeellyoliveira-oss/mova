import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'creme' | 'quente' | 'rosa' | 'vinho' | 'oliva' | 'nevoa'

// cards brancos com borda suave e sombra leve; "tom" muda o fundo
const tones: Record<Tone, string> = {
  quente: 'bg-px-panel text-tinta',
  creme: 'bg-rosa-50 text-tinta',
  rosa: 'bg-rosa-100 text-vinho',
  vinho: 'bg-vinho text-white',
  oliva: 'bg-oliva-100 text-oliva-600',
  nevoa: 'bg-nevoa text-vinho',
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone
  hover?: boolean
}

export function Card({ tone = 'quente', hover, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-px border border-px-line p-5 shadow-pixel sm:p-6',
        tones[tone],
        hover && 'transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lift',
        className,
      )}
      {...props}
    />
  )
}

/** Nome de jogo para o mesmo painel */
export const GameCard = Card

/** Barra de título do painel (estilo janela de jogo). */
export function CardHeader({
  title, subtitle, icon, action, className,
}: { title: ReactNode; subtitle?: ReactNode; icon?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4', className)}>
      <div className="px-titlebar justify-between">
        <span className="flex min-w-0 items-center gap-2">
          {icon && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rosa-50 text-vinho [&_svg]:h-[18px] [&_svg]:w-[18px]">{icon}</span>}
          <span className="truncate">{title}</span>
        </span>
        {action && <span className="shrink-0 text-xs font-medium">{action}</span>}
      </div>
      {subtitle && <p className="mt-1 truncate text-sm text-vinho/60">{subtitle}</p>}
    </div>
  )
}
