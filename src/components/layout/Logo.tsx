import { cn } from '@/lib/cn'

/** Logo MOVA: letras fortes em roxo com uma estrelinha amarela. `light` = branco. */
export function Logo({ className, size = 'md', light }: { className?: string; size?: 'sm' | 'md'; light?: boolean }) {
  return (
    <span
      className={cn('relative inline-flex select-none items-baseline pr-3 font-logo leading-none', size === 'md' ? 'text-[30px]' : 'text-[23px]', light ? 'text-white' : 'text-vinho', className)}
      aria-label="MOVA"
    >
      MOVA
      <svg aria-hidden viewBox="0 0 24 24" className="absolute -top-1.5 right-0 h-[0.5em] w-[0.5em]">
        <path d="M12 0c.8 6.2 5 10.6 12 12-7 1.4-11.2 5.8-12 12-.8-6.2-5-10.6-12-12C7 10.6 11.2 6.2 12 0z" fill="#F4C9D6" />
      </svg>
    </span>
  )
}
