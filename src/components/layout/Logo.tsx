import { Sparkle } from '@/components/doodles/Doodles'
import { cn } from '@/lib/cn'

export function Logo({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' }) {
  return (
    <div className={cn('relative inline-block text-vinho', className)}>
      <span className={cn('block font-display leading-[0.8] tracking-[0.01em]', size === 'md' ? 'text-[2.9rem]' : 'text-[1.9rem]')}>MOVA</span>
      <Sparkle size={size === 'md' ? 16 : 11} className="absolute -right-3 -top-1 text-vinho" strokeWidth={2.6} />
      <Sparkle size={size === 'md' ? 10 : 7} className="absolute -right-5 top-4 text-vinho" strokeWidth={2.6} />
      <Sparkle size={size === 'md' ? 11 : 8} className="absolute -bottom-1 -left-3 text-vinho" strokeWidth={2.6} />
    </div>
  )
}
