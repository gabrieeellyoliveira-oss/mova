import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'creme' | 'quente' | 'rosa' | 'vinho' | 'oliva' | 'nevoa'

const tones: Record<Tone, string> = {
  quente: 'bg-quente text-tinta border border-vinho/[0.06]',
  creme: 'bg-creme-100 text-tinta border border-vinho/[0.06]',
  rosa: 'bg-rosa-100 text-vinho border border-rosa',
  vinho: 'bg-vinho text-rosa-50',
  oliva: 'bg-oliva-100 text-oliva-600 border border-oliva/20',
  nevoa: 'bg-nevoa/60 text-vinho border border-nevoa',
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone
  hover?: boolean
}

export function Card({ tone = 'quente', hover, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-3xl p-5 shadow-soft sm:p-6',
        tones[tone],
        hover && 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({
  title, subtitle, icon, action, className,
}: { title: ReactNode; subtitle?: ReactNode; icon?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-3', className)}>
      <div className="flex min-w-0 items-center gap-2.5">
        {icon && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-rosa-100 text-cereja">{icon}</span>}
        <div className="min-w-0">
          <h3 className="truncate font-heading text-[15px] leading-tight">{title}</h3>
          {subtitle && <p className="mt-0.5 truncate text-xs opacity-70">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
