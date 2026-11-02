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
    <header className="sticky top-0 z-30 hidden bg-ink text-ink-fg lg:block">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-6 px-6">
        <Link to="/" className="shrink-0"><Logo light /></Link>
        <nav className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto" aria-label="Menu principal">
          {main.map(({ label, path, sprite }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition',
                isActive ? 'bg-lavanda text-ink' : 'text-ink-fg/75 hover:bg-ink-fg/10 hover:text-ink-fg',
              )}
            >
              {({ isActive }) => (<><Icon name={sprite} size={16} className={isActive ? 'text-ink' : undefined} />{label}</>)}
            </NavLink>
          ))}
          <div ref={moreRef} className="relative shrink-0">
            <button onClick={() => setOpenMore((o) => !o)} className={cn('flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition', moreActive ? 'bg-lavanda text-ink' : 'text-ink-fg/75 hover:bg-ink-fg/10 hover:text-ink-fg')}>
              Mais <ChevronDown size={16} />
            </button>
          </div>
        </nav>
        <HeaderActions />
      </div>
      {openMore && (
        <div ref={dropRef} className="absolute z-50 rounded-3xl border-2 border-ink bg-quente p-2 text-tinta shadow-pixel animate-rise" style={{ left: moreRef.current ? moreRef.current.getBoundingClientRect().left : 0, top: 64 }}>
          {more.map(({ label, path, sprite }) => (
            <Link key={path} to={path} className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-medium text-tinta hover:bg-lavanda-100"><Icon name={sprite} size={17} />{label}</Link>
          ))}
        </div>
      )}
    </header>
  )
}
