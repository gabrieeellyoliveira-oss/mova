import type { ReactNode } from 'react'
import { PixelIcon, type SpriteName } from './PixelIcon'
import { Progress } from '@/components/ui/Progress'
import { XP_VALUES } from '@/game/config'
import { cn } from '@/lib/cn'

/** Meta como quest: principal (grande) ou secundária (compacta). */
export function Quest({
  title, sprite, progress, current, total, kind = 'side', done, subtitle, onClick, children,
}: {
  title: string; sprite: SpriteName; progress: number; current?: number; total?: number
  kind?: 'main' | 'side'; done?: boolean; subtitle?: ReactNode; onClick?: () => void; children?: ReactNode
}) {
  const main = kind === 'main'
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-px border-2 border-px-line shadow-pixel transition-transform duration-200 hover:-translate-y-0.5',
        main ? 'bg-vinho-900 p-5 text-rosa-50' : 'bg-px-panel p-4 text-tinta',
        onClick && 'cursor-pointer',
      )}
    >
      <p className={cn('mb-2 font-pixel text-[12px] font-semibold uppercase tracking-[0.14em]', main ? 'text-rosa' : 'text-cereja')}>
        {main ? '★ Quest principal' : 'Side quest'}{done && ' · concluída'}
      </p>
      <div className="flex items-start gap-3">
        <span className={cn('grid shrink-0 place-items-center rounded-md border-2 border-px-line', main ? 'h-14 w-14 bg-rosa-100' : 'h-11 w-11 bg-rosa-50')}>
          <PixelIcon name={sprite} size={main ? 34 : 26} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={cn('font-heading leading-tight', main ? 'text-2xl' : 'text-lg', done && 'line-through decoration-2 opacity-70')}>{title}</h3>
          {subtitle && <div className={cn('mt-0.5 text-xs', main ? 'text-rosa-50/70' : 'text-vinho/60')}>{subtitle}</div>}
        </div>
        <span className={cn('shrink-0 rounded border-2 border-px-line px-1.5 py-0.5 font-pixel text-[11px] font-semibold', main ? 'bg-px-gold text-vinho-900' : 'bg-px-gold-soft text-vinho')}>+{XP_VALUES.meta} XP</span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Progress value={progress} color={done ? '#7A7A4A' : main ? '#EFAFB3' : '#961415'} track={main ? '#2b0910' : undefined} height={main ? 10 : 8} className="flex-1" />
        <span className={cn('shrink-0 font-pixel text-sm font-semibold tabular-nums', main ? 'text-rosa' : 'text-vinho')}>
          {total ? `${current} / ${total}` : `${Math.round(progress)}%`}
        </span>
      </div>
      {children}
    </div>
  )
}
