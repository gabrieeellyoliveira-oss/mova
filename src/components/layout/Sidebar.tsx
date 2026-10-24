import { NavLink } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { NAV_ITEMS } from '@/data/constants'
import { cn } from '@/lib/cn'
import { Logo } from './Logo'

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r border-vinho/[0.06] bg-quente lg:flex">
      <div className="px-8 pb-6 pt-8">
        <Logo />
      </div>
      <nav className="space-y-1 overflow-y-auto px-4">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3.5 rounded-2xl px-4 py-3 text-[15px] font-semibold transition-all',
                isActive ? 'bg-rosa-100 text-vinho' : 'text-vinho/80 hover:bg-rosa-50 hover:text-vinho',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={21} strokeWidth={isActive ? 2.5 : 1.9} className={cn('shrink-0 transition-transform group-hover:-rotate-6', isActive && 'fill-vinho/15')} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="relative mt-auto px-6 pb-6">
        <NavLink to="/perfil" className="flex items-center justify-center gap-1.5 text-xs font-semibold text-vinho/55 hover:text-vinho">
          <Settings size={13} /> Ajustes e dados
        </NavLink>
      </div>
    </aside>
  )
}
