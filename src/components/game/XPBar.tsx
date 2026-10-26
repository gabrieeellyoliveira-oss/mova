import { useGame } from '@/game/useGame'
import { PixelIcon } from './PixelIcon'
import { cn } from '@/lib/cn'

/** Nível + barra de experiência. `variant` muda só o visual. */
export function XPBar({ variant = 'panel', className }: { variant?: 'panel' | 'sidebar' | 'compact'; className?: string }) {
  const g = useGame()
  if (variant === 'compact')
    return (
      <div className={cn('inline-flex items-center gap-1.5 rounded-md border-2 border-px-line bg-vinho-900 px-2 py-1 text-rosa-50 shadow-pixel-sm', className)} title={`${g.into} / ${g.needed} XP`}>
        <PixelIcon name="star" size={14} />
        <span className="whitespace-nowrap font-pixel text-xs font-semibold">NÍV. {g.level}</span>
      </div>
    )
  const dark = variant === 'sidebar'
  return (
    <div className={cn('rounded-px border-2 border-px-line p-2.5 shadow-pixel', dark ? 'bg-vinho-900 text-rosa-50' : 'bg-vinho-900/90 text-rosa-50 backdrop-blur-[1px]', className)}>
      <div className="flex items-center gap-2.5">
        <PixelIcon name="star" size={dark ? 26 : 32} className="drop-shadow-[0_0_6px_rgba(246,212,136,0.6)]" />
        <div className="min-w-0 flex-1">
          <p className="font-pixel text-sm font-semibold uppercase tracking-wider">Nível {g.level}</p>
          <div className="mt-1 h-2.5 overflow-hidden rounded-sm border border-black/40 bg-black/30">
            <div className="relative h-full bg-rosa transition-[width] duration-700" style={{ width: `${g.progress}%` }}>
              <span className="absolute inset-0 overflow-hidden"><span className="absolute inset-y-0 w-1/3 animate-shine bg-white/40" /></span>
            </div>
          </div>
          <p className="mt-1 font-pixel text-[11px] tabular-nums text-rosa-50/75">{g.into} / {g.needed} XP</p>
        </div>
      </div>
    </div>
  )
}

export function LevelBadge({ className }: { className?: string }) {
  return <XPBar variant="compact" className={className} />
}
