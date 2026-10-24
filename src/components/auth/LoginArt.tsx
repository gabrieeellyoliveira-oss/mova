import centro from '@/assets/login/gabi-centro.webp'
import anel from '@/assets/login/anel.webp'
import { Sparkle } from '@/components/doodles/Doodles'
import { cn } from '@/lib/cn'

/**
 * Ilustração do login em camadas: o anel externo (textos e estrelas) gira devagar,
 * a Gabi fica parada no centro, o anel principal pulsa e um ponto de luz o percorre.
 * Posições em % da imagem original (1254px): centro do anel em (625, 598), raio 505.
 */
const CX = '49.84%'
const CY = '47.69%'

export function LoginArt({ className }: { className?: string }) {
  return (
    <div className={cn('relative aspect-square w-full select-none overflow-hidden', className)} aria-hidden>
      {/* anel externo girando em torno do centro do anel */}
      <img src={anel} alt="" draggable={false} className="absolute max-w-none animate-orbit-slow" style={{ left: '-1.994%', top: '-4.147%', width: '103.668%' }} />
      {/* Gabi + anel principal (parados) */}
      <img src={centro} alt="" draggable={false} className="absolute inset-0 h-full w-full" />
      {/* brilho pulsando no anel principal */}
      <div
        className="pointer-events-none absolute animate-glow rounded-full"
        style={{
          left: CX, top: CY, width: '80.6%', height: '80.6%', transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 28px 6px rgba(239,175,179,0.55), inset 0 0 36px 6px rgba(203,117,124,0.35)',
        }}
      />
      {/* ponto de luz percorrendo o anel principal */}
      <div className="pointer-events-none absolute animate-orbit-fast" style={{ left: CX, top: CY, width: '80.6%', height: '80.6%', marginLeft: '-40.3%', marginTop: '-40.3%' }}>
        <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rosa-50 shadow-[0_0_12px_5px_rgba(239,175,179,0.9)]" />
      </div>
      {/* estrelinhas piscando */}
      {[
        { l: '6%', t: '8%', s: 18, d: '0s' },
        { l: '90%', t: '12%', s: 14, d: '1.1s' },
        { l: '93%', t: '86%', s: 18, d: '0.6s' },
        { l: '4%', t: '90%', s: 12, d: '1.8s' },
        { l: '50%', t: '99%', s: 10, d: '2.4s' },
      ].map((p, i) => (
        <Sparkle key={i} size={p.s} className="absolute animate-twinkle text-cereja" style={{ left: p.l, top: p.t, animationDelay: p.d }} />
      ))}
    </div>
  )
}
