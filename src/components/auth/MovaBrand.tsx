import { PixelIcon } from '@/components/game/PixelIcon'
import { cn } from '@/lib/cn'

// brilhos pixel ao redor do logo: [glifo, posição, tamanho, atraso]
const SPARKS: [string, string, string, string][] = [
  ['✦', 'left-[-6%] top-[18%]', 'text-[1.6em]', '0s'],
  ['✧', 'left-[8%] top-[-8%]', 'text-[1em]', '1.1s'],
  ['★', 'right-[-4%] top-[2%]', 'text-[0.9em]', '0.5s'],
  ['✦', 'right-[-9%] top-[34%]', 'text-[1.3em]', '1.8s'],
  ['✧', 'left-[16%] top-[64%]', 'text-[1.1em]', '2.4s'],
  ['✦', 'right-[14%] top-[66%]', 'text-[1.5em]', '0.8s'],
]

/** Logo MOVA da tela inicial: groovy em camadas rosa/vinho, cerejas penduradas e brilhos. */
export function MovaBrand({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn('relative flex flex-col items-center text-center', compact ? 'text-[13px]' : 'text-[clamp(14px,1.25vw,20px)]', className)}>
      {/* sombra difusa para o logo "sentar" no cenário, sem cara de card */}
      <div aria-hidden className="pointer-events-none absolute -inset-x-[18%] -inset-y-[14%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(43,9,16,0.7),rgba(43,9,16,0.42)_55%,transparent)] blur-xl" />
      <div className="relative">
        {SPARKS.map(([g, pos, size, delay], i) => (
          <span key={i} aria-hidden className={cn('absolute animate-twinkle font-pixel leading-none text-[#FFE6EA] [text-shadow:0_0_8px_rgba(255,200,210,0.8)]', pos, size)} style={{ animationDelay: delay }}>{g}</span>
        ))}
        <h1
          className={cn('relative font-logo leading-none text-[#FFD7DC]', compact ? 'text-[64px]' : 'text-[clamp(84px,9.5vw,150px)]')}
          style={{ textShadow: '0 0.035em 0 #F2A3AC, 0 0.07em 0 #D9707D, 0 0.105em 0 #961415, 0 0.14em 0 #520215, 0 0.2em 0.3em rgba(43,9,16,0.55)' }}
        >
          MOVA
        </h1>
      </div>
      <div className={cn('relative origin-top animate-sway', compact ? '-mt-1' : '-mt-[0.4em]')}>
        <PixelIcon name="cherries" size={compact ? 50 : 96} className="[filter:drop-shadow(0_3px_0_#2b0910)_drop-shadow(0_0_10px_rgba(239,175,179,0.45))]" title="Cerejas" />
      </div>
      <p className={cn('relative mt-[0.7em] flex items-center gap-2 font-pixel font-semibold tracking-[0.04em] text-[#FFF1EA] [text-shadow:0_2px_0_#2b0910]', compact ? 'text-[15px]' : 'text-[1.3em]')}>
        <span className="text-rosa">♥</span> Mais movimento, mais vida.
      </p>
    </div>
  )
}
