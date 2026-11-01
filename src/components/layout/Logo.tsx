import { cn } from '@/lib/cn'

/** Logo MOVA: letras fortes em ameixa, com a perna direita do último A em pêssego. `light` = branco. */
export function Logo({ className, size = 'md', light }: { className?: string; size?: 'sm' | 'md'; light?: boolean }) {
  return (
    <span
      className={cn('inline-flex select-none items-baseline font-logo leading-none', size === 'md' ? 'text-[28px]' : 'text-[22px]', light ? 'text-white' : 'text-vinho', className)}
      aria-label="MOVA"
    >
      MOV
      <span className={light ? 'text-white' : 'bg-[linear-gradient(100deg,#5B2448_0%,#5B2448_55%,#E9A27C_56%,#E9A27C_100%)] bg-clip-text text-transparent'}>A</span>
    </span>
  )
}
