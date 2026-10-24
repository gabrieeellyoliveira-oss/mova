import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import avatar from '@/assets/avatar.webp'
import { useSettings } from '@/hooks/useData'
import { useNotifications } from '@/hooks/useNotifications'
import { useNow } from '@/hooks/useNow'
import { GlobalSearch } from './GlobalSearch'
import { Logo } from './Logo'
import { cn } from '@/lib/cn'

const SEEN_KEY = 'mova:seen-notices'
const loadSeen = (): string[] => {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]') } catch { return [] }
}

export function Topbar() {
  const settings = useSettings()
  const now = useNow()
  const notices = useNotifications(now)
  const [openBell, setOpenBell] = useState(false)
  const [mobileSearch, setMobileSearch] = useState(false)
  const [seen, setSeen] = useState<string[]>(loadSeen)
  const bell = useRef<HTMLDivElement>(null)
  const nav = useNavigate()
  const unread = notices.filter((n) => !seen.includes(n.id)).length

  useEffect(() => {
    const onDown = (e: MouseEvent) => !bell.current?.contains(e.target as Node) && setOpenBell(false)
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const toggleBell = () => {
    setOpenBell((o) => !o)
    const ids = notices.map((n) => n.id)
    setSeen(ids)
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(ids)) } catch { /* ignore */ }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-vinho/[0.06] bg-creme/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:h-[72px] sm:px-6 lg:px-8">
        <Link to="/" className="pl-2 lg:hidden"><Logo size="sm" /></Link>
        <GlobalSearch className="hidden max-w-md flex-1 md:block" />
        <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
          <button onClick={() => setMobileSearch(true)} className="grid h-10 w-10 place-items-center rounded-full text-vinho hover:bg-vinho/5 md:hidden" aria-label="Buscar">
            <Search size={20} />
          </button>
          <div ref={bell} className="relative">
            <button onClick={toggleBell} className="relative grid h-10 w-10 place-items-center rounded-full bg-quente text-vinho shadow-soft hover:bg-rosa-50" aria-label="Notificações">
              <Bell size={19} />
              {unread > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-cereja px-1 text-[10px] font-bold text-quente">{unread}</span>}
            </button>
            {openBell && (
              <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(340px,calc(100vw-32px))] rounded-3xl bg-quente p-2 shadow-lift animate-rise">
                <p className="px-3 pb-1 pt-2 text-sm font-extrabold text-vinho">lembretes gentis</p>
                {notices.length === 0 ? (
                  <p className="px-3 pb-4 text-sm text-vinho/60">Tudo tranquilo por aqui. Aproveita o dia 🌷</p>
                ) : (
                  notices.map((n) => (
                    <button key={n.id} onClick={() => { nav(n.path); setOpenBell(false) }} className="flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-rosa-50">
                      <span className="text-lg leading-none">{n.emoji}</span>
                      <span>
                        <span className="block text-sm font-semibold text-vinho">{n.title}</span>
                        <span className="block text-xs text-vinho/60">{n.text}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <Link to="/perfil" className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 hover:bg-vinho/5 sm:pr-4">
            <img src={avatar} alt="" className="h-10 w-10 rounded-full bg-rosa-100 object-cover ring-2 ring-rosa" />
            <span className="hidden text-sm font-bold text-vinho sm:block">Olá, {settings.name}!</span>
          </Link>
        </div>
      </div>
      <div className={cn('fixed inset-0 z-50 bg-creme p-4 md:hidden', mobileSearch ? 'block' : 'hidden')}>
        {mobileSearch && (
          <div className="flex items-center gap-2">
            <GlobalSearch className="flex-1" autoFocus onDone={() => setMobileSearch(false)} />
            <button onClick={() => setMobileSearch(false)} className="px-2 text-sm font-semibold text-vinho">Fechar</button>
          </div>
        )}
      </div>
    </header>
  )
}
