import type { ReactNode } from 'react'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/cn'

/** Meta em destaque (principal) ou compacta (as próximas). */
export function Quest({
  title, sprite, progress, current, total, kind = 'side', done, subtitle, onClick, children,
}: {
  title: string; sprite: IconName; progress: number; current?: number; total?: number
  kind?: 'main' | 'side'; done?: boolean; subtitle?: ReactNode; onClick?: () => void; children?: ReactNode
}) {
  const main = kind === 'main'
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-[24px] border border-px-line shadow-pixel transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lift',
        main ? 'bg-[linear-gradient(135deg,#5B2448,#8E5A80)] p-6 text-white' : 'bg-white p-5 text-tinta',
        onClick && 'cursor-pointer',
      )}
    >
      <p className={cn('mb-3 text-xs font-semibold uppercase tracking-[0.14em]', main ? 'text-rosa' : 'text-queimado')}>
        {main ? 'Meta principal' : 'Próxima meta'}{done && ' · concluída'}
      </p>
      <div className="flex items-start gap-3">
        <span className={cn('grid shrink-0 place-items-center rounded-2xl', main ? 'h-14 w-14 bg-white/15' : 'h-11 w-11 bg-rosa-50')}>
          <Icon name={sprite} size={main ? 28 : 22} className={main ? 'text-white' : undefined} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={cn('font-bold leading-tight', main ? 'text-2xl' : 'text-lg', done && 'line-through decoration-2 opacity-70')}>{title}</h3>
          {subtitle && <div className={cn('mt-0.5 text-sm', main ? 'text-white/75' : 'text-tinta/60')}>{subtitle}</div>}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Progress value={progress} color={done ? '#5E9474' : main ? '#FFFFFF' : '#5B2448'} track={main ? 'rgba(255,255,255,0.25)' : undefined} height={main ? 10 : 8} className="flex-1" />
        <span className={cn('shrink-0 text-sm font-semibold tabular-nums', main ? 'text-white' : 'text-vinho')}>
          {total ? `${current} / ${total}` : `${Math.round(progress)}%`}
        </span>
      </div>
      {children}
    </div>
  )
}
