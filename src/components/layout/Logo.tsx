import { Sparkle } from '@/components/doodles/Doodles'
import { PixelIcon } from '@/components/game/PixelIcon'
import { cn } from '@/lib/cn'

/** Logo MOVA (Sooky 70s) com as cerejas. `light` = versão rosa para fundos escuros. */
export function Logo({ className, size = 'md', light }: { className?: string; size?: 'sm' | 'md'; light?: boolean }) {
  return (
    <div className={cn('relative inline-flex items-end gap-1', light ? 'text-[#F4A9B4]' : 'text-vinho', className)}>
      <span
        className={cn('block font-logo tracking-[0.01em]', size === 'md' ? 'text-[2.9rem]' : 'text-[1.9rem]', 'leading-none')}
        style={light ? { textShadow: '3px 3px 0 #961415' } : undefined}
      >
        MOVA
      </span>
      <PixelIcon name="cherry" size={size === 'md' ? 26 : 18} className="mb-1" />
      <Sparkle size={size === 'md' ? 14 : 10} className={cn('absolute -top-2 right-6', light ? 'text-rosa' : 'text-vinho')} strokeWidth={2.6} />
      <Sparkle size={size === 'md' ? 10 : 7} className={cn('absolute -bottom-1 -left-3', light ? 'text-rosa' : 'text-vinho')} strokeWidth={2.6} />
    </div>
  )
}
