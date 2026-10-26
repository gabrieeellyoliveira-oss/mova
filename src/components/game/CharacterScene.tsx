import { Link } from 'react-router-dom'
import cenario from '@/assets/game/cenario-quarto.webp'
import { greeting } from '@/utils/date'
import { useNow } from '@/hooks/useNow'
import { useSettings } from '@/hooks/useData'
import { XPBar } from './XPBar'
import { cn } from '@/lib/cn'

export type DayPeriod = 'manha' | 'tarde' | 'noite'
export const dayPeriod = (d: Date): DayPeriod => {
  const h = d.getHours()
  return h >= 5 && h < 12 ? 'manha' : h >= 12 && h < 18 ? 'tarde' : 'noite'
}

const OPTIONS = [
  { label: 'Organizar meu dia', to: '/meu-dia' },
  { label: 'Cuidar de mim', to: '/saude' },
  { label: 'Estudar', to: '/estudos' },
  { label: 'Planejar algo', to: '/planejamento' },
  { label: 'Quero sair de casa', to: '/sair-de-casa' },
]

/** Luz do cenário por período (filtros + camadas de luz por cima da arte). */
const LIGHT: Record<DayPeriod, { filter: string; overlay: string; blend: string }> = {
  manha: { filter: 'brightness(1.07) saturate(0.92) hue-rotate(8deg)', overlay: 'linear-gradient(180deg, rgba(255,226,170,0.45), rgba(255,240,215,0.1) 60%)', blend: 'soft-light' },
  tarde: { filter: 'none', overlay: 'linear-gradient(180deg, rgba(255,214,190,0.12), transparent 70%)', blend: 'soft-light' },
  noite: { filter: 'brightness(0.62) saturate(1.15) hue-rotate(-12deg)', overlay: 'linear-gradient(180deg, rgba(25,12,60,0.55), rgba(40,10,40,0.25))', blend: 'multiply' },
}

/** Cenário da Home: quarto/home office em pixel art com boas-vindas e nível. */
export function CharacterScene() {
  const now = useNow()
  const { name } = useSettings()
  const period = dayPeriod(now)
  const light = LIGHT[period]

  return (
    <section className="relative overflow-hidden rounded-px border-2 border-px-line bg-vinho-950 shadow-pixel">
      <div className="relative h-[230px] sm:h-auto sm:aspect-[3/1]">
        <img src={cenario} alt="Quarto em pixel art: Gabi no notebook com a gata preta dormindo ao lado" className="pixelated absolute inset-0 h-full w-full object-cover object-[50%_45%] transition-[filter] duration-1000" style={{ filter: light.filter }} />
        <div className="pointer-events-none absolute inset-0 transition-opacity duration-1000" style={{ background: light.overlay, mixBlendMode: light.blend as never }} />
        {period === 'noite' && (
          <>
            {/* luminária acesa e janelas da cidade */}
            <div className="pointer-events-none absolute animate-glow rounded-full" style={{ left: '14%', top: '30%', width: '22%', height: '55%', background: 'radial-gradient(closest-side, rgba(255,190,120,0.55), transparent)', mixBlendMode: 'screen' }} />
            <div className="pointer-events-none absolute" style={{ left: '28%', top: '5%', width: '42%', height: '45%', background: 'radial-gradient(closest-side, rgba(255,170,120,0.35), transparent)', mixBlendMode: 'screen' }} />
            <div className="pointer-events-none absolute right-[8%] top-[22%] h-[30%] w-[12%] animate-glow rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(255,120,170,0.5), transparent)', mixBlendMode: 'screen' }} />
          </>
        )}
        {/* nível no canto do cenário */}
        <XPBar className="absolute right-3 top-3 hidden w-[220px] sm:block" />
        {/* boas-vindas (desktop: dentro do cenário) */}
        <Greeting name={name} now={now} className="absolute left-3 top-3 hidden w-[300px] md:block lg:left-5 lg:top-5" />
      </div>
      {/* boas-vindas (mobile: embaixo do cenário) */}
      <Greeting name={name} now={now} className="m-3 md:hidden" />
    </section>
  )
}

function Greeting({ name, now, className }: { name: string; now: Date; className?: string }) {
  return (
    <div className={cn('rounded-px border-2 border-px-line bg-px-panel/95 p-3 shadow-pixel', className)}>
      <p className="font-pixel text-[15px] font-semibold uppercase leading-snug text-vinho">{greeting(now)}, {name}!</p>
      <p className="font-pixel text-xl font-bold uppercase leading-tight text-cereja">O que vamos mover hoje?</p>
      <nav className="mt-2.5 space-y-1 rounded-md border-2 border-px-line/30 bg-white/60 p-1.5" aria-label="Atalhos do dia">
        {OPTIONS.map((o) => (
          <Link
            key={o.to}
            to={o.to}
            className="group flex items-center gap-2 rounded px-2 py-1 text-[13px] font-semibold text-vinho transition hover:bg-vinho-800 hover:text-rosa-50 focus-visible:bg-vinho-800 focus-visible:text-rosa-50 focus-visible:outline-none"
          >
            <span className="w-3 font-pixel text-cereja group-hover:text-rosa group-focus-visible:text-rosa">
              <span className="hidden group-hover:inline group-focus-visible:inline">▶</span>
              <span className="group-hover:hidden group-focus-visible:hidden">•</span>
            </span>
            {o.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
