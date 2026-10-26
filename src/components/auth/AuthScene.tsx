import cenario from '@/assets/login/quarto-entardecer.webp'
import { cn } from '@/lib/cn'

// Coordenadas em pixels da arte original (1536 × 1024); viram % do quadro.
const W = 1536
const H = 1024
const at = (x: number, y: number) => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` })

// janelas da cidade que acendem/apagam de vez em quando: [x, y, duração s, atraso s]
const CITY: [number, number, number, number][] = [
  [581, 441, 11, 0], [655, 470, 13, 4], [741, 456, 9, 2], [871, 451, 12, 6], [1001, 466, 10, 1],
  [1061, 471, 14, 8], [1082, 431, 12, 3], [641, 521, 15, 7], [911, 481, 11, 5], [701, 506, 13, 9],
]
// brilhos no céu: [x, y, atraso s]
const STARS: [number, number, number][] = [[650, 175, 0], [760, 135, 1.4], [885, 205, 2.6], [1020, 160, 0.7], [575, 250, 2]]

/**
 * Cenário da tela inicial: a imagem preenche o espaço como `background-size: cover`
 * (via unidades de container) e pequenos elementos separados animam luzes e brilhos —
 * a imagem em si nunca é animada.
 */
export function AuthScene({ className, fx = 50, fy = 50, cx = fx, cy = fy, zoom = 1 }: {
  className?: string
  /** ponto da arte (em %) que fica alinhado ao ponto (cx, cy) do espaço */
  fx?: number; fy?: number; cx?: number; cy?: number
  /** > 1 aproxima além do "cover" */
  zoom?: number
}) {
  const w = `calc(max(100cqw, 150cqh) * ${zoom})`
  const h = `calc(max(100cqh, 66.667cqw) * ${zoom})`
  return (
    <div aria-hidden className={cn('pointer-events-none overflow-hidden [container-type:size]', className)}>
      <div
        className="absolute"
        style={{ width: w, height: h, left: `calc(${cx}cqw - ${w} * ${fx / 100})`, top: `calc(${cy}cqh - ${h} * ${fy / 100})` }}
      >
        <img src={cenario} alt="" className="absolute inset-0 h-full w-full select-none" draggable={false} />
        {/* sol, luminária, velas e neon */}
        <span className="absolute h-[13%] w-[13%] -translate-x-1/2 -translate-y-1/2 animate-glow rounded-full bg-[radial-gradient(closest-side,rgba(255,196,140,0.45),transparent)] mix-blend-screen" style={at(795, 405)} />
        <span className="absolute h-[22%] w-[16%] -translate-x-1/2 -translate-y-1/2 animate-flicker rounded-full bg-[radial-gradient(closest-side,rgba(255,190,120,0.5),transparent)] mix-blend-screen" style={at(128, 528)} />
        <span className="absolute h-[6%] w-[4%] -translate-x-1/2 -translate-y-1/2 animate-flicker rounded-full bg-[radial-gradient(closest-side,rgba(255,214,140,0.7),transparent)] mix-blend-screen [animation-delay:1.5s]" style={at(425, 548)} />
        <span className="absolute h-[6%] w-[4%] -translate-x-1/2 -translate-y-1/2 animate-flicker rounded-full bg-[radial-gradient(closest-side,rgba(255,214,140,0.7),transparent)] mix-blend-screen [animation-delay:3s]" style={at(1388, 572)} />
        <span className="absolute h-[12%] w-[8%] -translate-x-1/2 -translate-y-1/2 animate-neon rounded-full bg-[radial-gradient(closest-side,rgba(255,80,140,0.6),transparent)] mix-blend-screen" style={at(1398, 285)} />
        <span className="absolute h-[5%] w-[4%] -translate-x-1/2 -translate-y-1/2 animate-neon rounded-full bg-[radial-gradient(closest-side,rgba(255,110,170,0.55),transparent)] mix-blend-screen [animation-delay:2s]" style={at(688, 830)} />
        {CITY.map(([x, y, d, delay], i) => (
          <span key={i} className="absolute h-[0.45%] w-[0.35%] animate-city-light bg-[#FFD98F] shadow-[0_0_6px_2px_rgba(255,210,130,0.6)]" style={{ ...at(x, y), animationDuration: `${d}s`, animationDelay: `${delay}s` }} />
        ))}
        {STARS.map(([x, y, delay], i) => (
          <span key={i} className="absolute -translate-x-1/2 -translate-y-1/2 animate-twinkle font-pixel text-[clamp(8px,0.9vw,15px)] leading-none text-[#FFE9EC] [text-shadow:0_0_6px_rgba(255,220,230,0.9)]" style={{ ...at(x, y), animationDelay: `${delay}s` }}>✦</span>
        ))}
      </div>
      {/* vinheta suave para profundidade */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_45%,transparent_55%,rgba(43,9,16,0.45))]" />
    </div>
  )
}
