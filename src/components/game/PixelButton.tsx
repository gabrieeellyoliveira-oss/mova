import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { icon?: ReactNode; trailing?: ReactNode; tone?: 'vinho' | 'creme'; size?: 'md' | 'lg' }

/**
 * Botão de videogame: cantos em degrau, sombra sólida, sobe no hover e afunda ao pressionar.
 * A sombra fica no <button> (drop-shadow) e o recorte pixel no <span>, porque clip-path corta box-shadow.
 */
export const PixelButton = forwardRef<HTMLButtonElement, Props>(function PixelButton(
  { icon, trailing, tone = 'vinho', size = 'lg', className, children, type = 'button', ...props }, ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'group relative block w-full transition-[transform,filter] duration-100 ease-out',
        '[filter:drop-shadow(0_5px_0_#2b0910)] hover:-translate-y-0.5 hover:[filter:drop-shadow(0_7px_0_#2b0910)_brightness(1.08)]',
        'active:translate-y-[3px] active:[filter:drop-shadow(0_2px_0_#2b0910)]',
        'focus-visible:outline-none focus-visible:[filter:drop-shadow(0_5px_0_#2b0910)_drop-shadow(0_0_0_3px_#EFAFB3)]',
        'disabled:pointer-events-none disabled:opacity-60',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'px-corners relative flex w-full items-center justify-center gap-2.5 whitespace-nowrap overflow-hidden font-pixel font-bold uppercase tracking-[0.08em]',
          size === 'lg' ? 'h-14 short:h-12 px-4 text-[15px] tracking-[0.05em] sm:px-5 sm:text-lg sm:tracking-[0.08em]' : 'h-11 px-4 text-[15px]',
          tone === 'vinho'
            ? 'bg-vinho text-[#FFF1EA] shadow-[inset_0_0_0_3px_#2b0910,inset_0_0_0_5px_rgba(239,175,179,0.35),inset_0_-6px_0_rgba(0,0,0,0.18)]'
            : 'bg-[#FFF1EA] text-vinho shadow-[inset_0_0_0_3px_#520215,inset_0_-5px_0_rgba(82,2,21,0.1)]',
        )}
      >
        {/* brilho que passa no hover */}
        <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-white/15 opacity-0 group-hover:animate-shine group-hover:opacity-100" />
        {icon}
        <span className="relative">{children}</span>
        {trailing}
      </span>
    </button>
  )
})
