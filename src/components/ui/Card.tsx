import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'creme' | 'quente' | 'rosa' | 'vinho' | 'oliva' | 'nevoa'

// painéis de jogo: borda escura, sombra dura e fundo por "tom"
const tones: Record<Tone, string> = {
  quente: 'bg-px-panel text-tinta',
  creme: 'bg-[#fbeee9] text-tinta',
  rosa: 'bg-px-soft text-vinho',
  vinho: 'bg-vinho-900 text-rosa-50',
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
        'min-w-0 rounded-px border-2 border-px-line p-4 shadow-pixel sm:p-5',
        tones[tone],
        hover && 'transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-pixel-glow',
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
          {icon && <span className="grid shrink-0 place-items-center text-rosa [&_svg]:h-4 [&_svg]:w-4">{icon}</span>}
          <span className="truncate">{title}</span>
        </span>
        {action && <span className="shrink-0 font-sans text-xs normal-case tracking-normal">{action}</span>}
      </div>
      {subtitle && <p className="mt-1.5 truncate px-1 text-xs text-vinho/60">{subtitle}</p>}
    </div>
  )
}
