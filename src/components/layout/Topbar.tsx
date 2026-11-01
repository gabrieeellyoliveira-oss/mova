import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { HeaderActions } from './HeaderActions'

/** Barra do topo no celular/tablet: logo e ações da conta. */
export function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-px-line/70 bg-creme/90 backdrop-blur-md lg:hidden">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/"><Logo size="sm" /></Link>
        <HeaderActions compact />
      </div>
    </header>
  )
}
