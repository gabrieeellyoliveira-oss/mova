import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { HeaderActions } from './HeaderActions'

/** Barra do topo no celular/tablet: logo e ações da conta. */
export function Topbar() {
  return (
    <header className="sticky top-0 z-30 bg-ink text-ink-fg lg:hidden">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/"><Logo size="sm" light /></Link>
        <HeaderActions compact />
      </div>
    </header>
  )
}
