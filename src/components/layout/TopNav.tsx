import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { NAV_ITEMS } from '@/data/constants'
import { Icon } from '@/components/ui/Icon'
import { Logo } from './Logo'
import { HeaderActions } from './HeaderActions'
import { cn } from '@/lib/cn'

// ordem da referência; o resto fica em "Mais" (Configurações fica só no menu do perfil)
const MAIN = ['/', '/agenda', '/financas', '/estudos', '/leitura', '/sair-de-casa']
const main = MAIN.map((p) => NAV_ITEMS.find((i) => i.path === p)!).filter(Boolean)
const more = NAV_ITEMS.filter((i) => !MAIN.includes(i.path) && i.path !== '/perfil')

/** Menu do topo (computador): logo, abas, "Mais" e ações da conta. */
export function TopNav() {
  const { pathname } = useLocation()
  const [openMore, setOpenMore] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  useEffect(() => setOpenMore(false), [pathname])
  useEffect(() => {
    if (!openMore) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (!moreRef.current?.contains(t) && !dropRef.current?.contains(t)) setOpenMore(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [openMore])
  const moreActive = more.some((i) => pathname.startsWith(i.path))

  return (
    <header className="sticky top-0 z-30 hidden bg-creme/85 backdrop-blur-md lg:block">
      <div className="mx-auto flex h-[76px] max-w-[1600px] items-center gap-4 px-6">
        <Link to="/" className="shrink-0 pr-2"><Logo /></Link>
        <nav className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto pl-6" aria-label="Menu principal">
          {main.map(({ label, path, sprite }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => cn(
                'flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-[15px] font-medium transition-colors',
                isActive ? 'bg-vinho text-white shadow-soft' : 'text-tinta/85 hover:bg-rosa-100 hover:text-vinho',
              )}
            >
              {({ isActive }) => (<><Icon name={sprite} size={18} className={isActive ? 'text-white' : undefined} />{label}</>)}
            </NavLink>
          ))}
          <div ref={moreRef} className="relative shrink-0">
            <button onClick={() => setOpenMore((o) => !o)} className={cn('flex items-center gap-1 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors', moreActive ? 'bg-vinho text-white' : 'text-tinta/80 hover:bg-rosa-100')}>
              Mais <ChevronDown size={15} />
            </button>
          </div>
        </nav>
        <HeaderActions />
      </div>
      {openMore && (
        <div ref={dropRef} className="absolute z-50 rounded-2xl border border-px-line bg-white p-2 shadow-lift animate-rise" style={{ left: moreRef.current ? moreRef.current.getBoundingClientRect().left : 0, top: 70 }}>
          {more.map(({ label, path, sprite }) => (
            <Link key={path} to={path} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-vinho hover:bg-rosa-50"><Icon name={sprite} size={17} />{label}</Link>
          ))}
        </div>
      )}
    </header>
  )
}
