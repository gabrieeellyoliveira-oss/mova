import { Link } from 'react-router-dom'
import { PixelIcon, type SpriteName } from '@/components/game/PixelIcon'

/** Áreas principais como botões de menu de jogo. */
const ITEMS: { label: string; to: string; sprite: SpriteName }[] = [
  { label: 'Rotina', to: '/rotina', sprite: 'dumbbell' },
  { label: 'Estudos', to: '/estudos', sprite: 'laptop' },
  { label: 'Leitura', to: '/leitura', sprite: 'book' },
  { label: 'Metas', to: '/metas', sprite: 'target' },
  { label: 'Finanças', to: '/financas', sprite: 'coins' },
  { label: 'Vida social', to: '/vida-social', sprite: 'cherry' },
  { label: 'Explorar', to: '/explorar', sprite: 'map' },
  { label: 'Saúde', to: '/saude', sprite: 'heart' },
]

export function AreaMenu() {
  return (
    <nav className="grid grid-cols-4 gap-2 sm:gap-3 xl:grid-cols-8" aria-label="Áreas">
      {ITEMS.map((it) => (
        <Link
          key={it.to}
          to={it.to}
          className="group flex flex-col items-center gap-1.5 rounded-px border-2 border-px-line bg-px-panel px-1 pb-2 pt-3 shadow-pixel transition-[transform,box-shadow] duration-150 hover:-translate-y-[3px] hover:bg-rosa-50 hover:shadow-pixel-glow active:translate-y-px active:shadow-pixel-press"
        >
          <span className="grid h-12 w-12 place-items-center rounded-md bg-px-soft transition-transform group-hover:scale-105 sm:h-14 sm:w-14">
            <PixelIcon name={it.sprite} size={36} />
          </span>
          <span className="font-pixel text-[13px] font-semibold text-vinho sm:text-sm">{it.label}</span>
        </Link>
      ))}
    </nav>
  )
}
