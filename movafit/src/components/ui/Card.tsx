import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'creme' | 'quente' | 'rosa' | 'vinho' | 'oliva' | 'nevoa'

// cards creme com borda de 2px em tinta e sombra deslocada; "tom" muda o fundo
const tones: Record<Tone, string> = {
  quente: 'bg-px-panel text-tinta',
  creme: 'bg-px-gold-soft text-tinta',
  rosa: 'bg-lavanda text-ink',
  vinho: 'bg-ink text-ink-fg',
  oliva: 'bg-salvia text-ink',
  nevoa: 'bg-nevoa text-ink',
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone
  hover?: boolean
}

export function Card({ tone = 'quente', hover, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-px border-2 border-ink p-5 shadow-pixel sm:p-6',
        tones[tone],
        hover && 'transition-[transform,box-shadow] duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-lift',
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
          {icon && <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-lavanda text-ink [&_svg]:h-5 [&_svg]:w-5">{icon}</span>}
          <span className="truncate">{title}</span>
        </span>
        {action && <span className="shrink-0 text-xs font-medium">{action}</span>}
      </div>
      {subtitle && <p className="mt-1 truncate text-xs text-tinta/60">{subtitle}</p>}
    </div>
  )
}
