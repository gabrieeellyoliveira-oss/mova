import { cn } from '@/lib/cn'

/** Logo "mova*": Fraunces bem forte, minúsculas, com asterisco lavanda. `light` = creme (sobre a tinta). */
export function Logo({ className, size = 'md', light }: { className?: string; size?: 'sm' | 'md' | 'lg'; light?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex select-none items-baseline font-serif font-extrabold leading-none tracking-tight',
        size === 'lg' ? 'text-6xl sm:text-7xl' : size === 'md' ? 'text-[32px]' : 'text-[26px]',
        light ? 'text-ink-fg' : 'text-ink',
        className,
      )}
      aria-label="mova"
    >
      mova<span className="text-lavanda" aria-hidden>*</span>
    </span>
  )
}
