import { PixelIcon, type SpriteName } from './PixelIcon'
import { cn } from '@/lib/cn'

/** Medalha de conquista: bloqueada (cinza + cadeado + progresso) ou desbloqueada (brilho). */
export function Achievement({
  title, description, sprite, unlocked, current, target, size = 'md', onClick,
}: { title: string; description?: string; sprite: SpriteName; unlocked: boolean; current: number; target: number; size?: 'sm' | 'md'; onClick?: () => void }) {
  const pct = Math.min(100, (current / target) * 100)
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag type={onClick ? 'button' : undefined} onClick={onClick} className={cn('group flex flex-col items-center text-center', size === 'sm' ? 'gap-1.5' : 'gap-2', onClick && 'cursor-pointer rounded-lg p-1 hover:bg-white/50')} title={description}>
      <div
        className={cn(
          'relative grid place-items-center border-2 border-px-line transition-transform duration-200 group-hover:-translate-y-0.5',
          size === 'sm' ? 'h-14 w-14' : 'h-20 w-20',
          unlocked ? 'bg-cereja shadow-pixel-glow' : 'bg-nevoa shadow-pixel-sm',
        )}
        style={{ clipPath: 'polygon(25% 0, 75% 0, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0 75%, 0 25%)' }}
      >
        <div className={cn('grid place-items-center', !unlocked && 'opacity-40 grayscale')}>
          <PixelIcon name={sprite} size={size === 'sm' ? 28 : 40} />
        </div>
        {!unlocked && <PixelIcon name="lock" size={size === 'sm' ? 14 : 18} className="absolute bottom-1 right-2" />}
      </div>
      <p className={cn('font-pixel font-semibold leading-tight', size === 'sm' ? 'text-[11px]' : 'text-sm', unlocked ? 'text-vinho' : 'text-vinho/50')}>{title}</p>
      {size === 'md' && description && <p className="max-w-[140px] text-[11px] leading-snug text-vinho/55">{description}</p>}
      {!unlocked && size === 'md' && (
        <div className="w-full max-w-[96px]">
          <div className="h-1.5 overflow-hidden rounded-sm bg-vinho/15"><div className="h-full bg-queimado" style={{ width: `${pct}%` }} /></div>
          <p className="mt-0.5 text-[10px] tabular-nums text-vinho/50">{Math.min(current, target)} / {target}</p>
        </div>
      )}
    </Tag>
  )
}
