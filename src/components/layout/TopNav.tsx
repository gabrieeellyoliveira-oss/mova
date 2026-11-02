import { Link, NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/data/constants'
import { Icon } from '@/components/ui/Icon'
import { Logo } from './Logo'
import { HeaderActions } from './HeaderActions'
import { cn } from '@/lib/cn'

// todas as abas direto no menu, sem "Mais" (Configurações fica só no menu do perfil)
const ORDER = ['/', '/agenda', '/financas', '/estudos', '/leitura', '/sair-de-casa', '/evolucao', '/diario', '/trabalho']
const items = ORDER.map((p) => NAV_ITEMS.find((i) => i.path === p)).filter((i): i is (typeof NAV_ITEMS)[number] => !!i)

/** Menu do topo (computador): logo, abas e ações da conta. */
export function TopNav() {
  return (
    <header className="sticky top-0 z-30 hidden bg-ink text-ink-fg lg:block">
      <div className="flex h-[72px] items-center gap-6 px-8">
        <Link to="/" className="shrink-0"><Logo light /></Link>
        <nav className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto" aria-label="Menu principal">
          {items.map(({ label, path, sprite }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition',
                isActive ? 'bg-lavanda text-ink' : 'text-ink-fg/75 hover:bg-ink-fg/10 hover:text-ink-fg',
              )}
            >
              <Icon name={sprite} size={16} />{label}
            </NavLink>
          ))}
        </nav>
        <HeaderActions />
      </div>
    </header>
  )
}
