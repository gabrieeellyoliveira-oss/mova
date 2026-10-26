import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { NAV_ITEMS } from '@/data/constants'
import { signOut } from '@/lib/auth'
import { setFocusMode } from '@/hooks/useFocusMode'
import { PixelIcon } from '@/components/game/PixelIcon'
import { XPBar } from '@/components/game/XPBar'
import { cn } from '@/lib/cn'
import { Logo } from './Logo'

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r-2 border-black/40 bg-vinho-950 text-rosa-50 lg:flex">
      <div className="px-6 pb-2 pt-5">
        <Logo light />
      </div>
      <div className="px-3 pb-3"><XPBar variant="sidebar" /></div>
      <nav className="flex-1 overflow-y-auto px-3 pb-2" aria-label="Menu principal">
        {NAV_ITEMS.map(({ label, path, sprite }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-lg border-2 px-3 py-1 text-[14px] font-semibold transition-[transform,background-color] duration-100',
                isActive ? 'border-px-line bg-rosa-100 text-vinho shadow-pixel-sm' : 'border-transparent text-rosa-50/80 hover:translate-x-0.5 hover:bg-white/[0.06] hover:text-rosa-50',
              )
            }
          >
            <PixelIcon name={sprite} size={20} className="transition-transform group-hover:-translate-y-px" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-2 px-3 pb-3 pt-2">
        <button
          onClick={() => setFocusMode(true)}
          className="flex w-full items-center gap-3 rounded-lg border-2 border-px-line bg-cereja px-3 py-2 font-pixel text-[15px] font-semibold uppercase tracking-wide text-rosa-50 shadow-pixel-sm transition hover:-translate-y-px active:translate-y-px active:shadow-pixel-press"
        >
          <PixelIcon name="hourglass" size={20} /> Modo foco
        </button>
        <div className="rounded-px border-2 border-rosa/30 bg-white/[0.04] px-3 py-2 text-center">
          <p className="font-pixel text-[15px] leading-snug text-rosa">Mais movimento, mais vida. ♥</p>
        </div>
        <button onClick={signOut} className="flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-rosa-50/50 hover:text-rosa">
          <LogOut size={13} /> Sair
        </button>
      </div>
    </aside>
  )
}
