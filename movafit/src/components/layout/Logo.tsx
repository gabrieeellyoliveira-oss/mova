import { cn } from '@/lib/cn'

/** Logo "movafit*": Fraunces bem forte, minúsculas, "fit" em sálvia e asterisco lavanda. `light` = sobre a tinta. */
export function Logo({ className, size = 'md', light }: { className?: string; size?: 'sm' | 'md' | 'lg'; light?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex select-none items-baseline font-serif font-extrabold leading-none tracking-tight',
        size === 'lg' ? 'text-6xl sm:text-7xl short:sm:text-6xl' : size === 'md' ? 'text-[30px]' : 'text-[24px]',
        light ? 'text-ink-fg' : 'text-ink',
        className,
      )}
      aria-label="movafit"
    >
      mova<span className={light ? 'text-salvia' : 'text-salvia-deep'}>fit</span>
      <span className="text-lavanda" aria-hidden>*</span>
    </span>
  )
}
