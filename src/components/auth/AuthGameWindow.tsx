import type { ReactNode } from 'react'
import { PixelIcon } from '@/components/game/PixelIcon'
import { cn } from '@/lib/cn'

/**
 * Janela de menu de jogo antigo: moldura vinho com cantos em degrau, miolo creme com
 * filete rosa e cerejas penduradas no canto.
 */
export function AuthGameWindow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn('relative w-full animate-window-in', className)}>
      {/* cerejas decorativas no canto superior direito */}
      <div aria-hidden className="absolute -right-3 -top-8 z-20 origin-top animate-sway sm:-right-5 sm:-top-10">
        <PixelIcon name="cherries" size={58} className="[filter:drop-shadow(0_3px_0_#2b0910)] sm:h-[68px] sm:w-[68px]" />
      </div>
      <div className="[filter:drop-shadow(6px_8px_0_rgba(43,9,16,0.55))]">
        <div className="px-corners bg-vinho p-[7px]">
          <div className="px-corners bg-[#E89AA2] p-[3px]">
            <div className="px-corners relative bg-[#FFF5F0] px-5 py-5 sm:px-8 sm:py-7 short:py-4 lg:max-h-[calc(100dvh-64px)] lg:overflow-y-auto">
              <span aria-hidden className="absolute left-3 top-3 animate-twinkle font-pixel text-sm leading-none text-cereja/70">✦</span>
              <span aria-hidden className="absolute bottom-3 left-3 animate-twinkle font-pixel text-xs leading-none text-cereja/60 [animation-delay:1.2s]">✧</span>
              <span aria-hidden className="absolute bottom-3 right-3 animate-twinkle font-pixel text-sm leading-none text-cereja/70 [animation-delay:2s]">✦</span>
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Título centralizado da janela (✦ NOVO JOGO ✦). */
export function WindowTitle({ title, subtitle }: { title: string; subtitle: ReactNode }) {
  return (
    <header className="text-center">
      <h2 className="flex items-center justify-center gap-3 font-pixel text-[28px] font-bold uppercase leading-none tracking-[0.08em] text-vinho sm:text-[32px] short:text-[26px]">
        <span aria-hidden className="text-lg text-cereja">✦</span>{title}<span aria-hidden className="text-lg text-cereja">✦</span>
      </h2>
      <p className="mx-auto mt-2.5 max-w-[320px] text-[15px] leading-snug text-[#5b2a33] short:mt-1.5 short:text-sm">{subtitle}</p>
    </header>
  )
}
