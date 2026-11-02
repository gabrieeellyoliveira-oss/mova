import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Hourglass, LogOut, Search, Settings, Trophy } from 'lucide-react'
import { useSettings } from '@/hooks/useData'
import { useNotifications } from '@/hooks/useNotifications'
import { useNow } from '@/hooks/useNow'
import { setFocusMode } from '@/hooks/useFocusMode'
import { signOut } from '@/lib/auth'
import { GlobalSearch } from './GlobalSearch'
import { cn } from '@/lib/cn'

const SEEN_KEY = 'mova:seen-notices'
const loadSeen = (): string[] => {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]') } catch { return [] }
}

/** Fecha o popover ao clicar fora. */
function useOutside<T extends HTMLElement>(open: boolean, close: () => void) {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && close()
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open, close])
  return ref
}

/** Iniciais do nome (até duas letras) para o círculo da conta. */
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || 'M'

const iconBtn = 'relative grid h-11 w-11 place-items-center rounded-full bg-white text-tinta shadow-pixel-sm transition hover:bg-rosa-50'
const popover = 'absolute right-0 top-[calc(100%+10px)] z-50 rounded-2xl border border-px-line bg-white p-2 shadow-lift animate-rise'

/** Busca, modo foco, lembretes e menu da conta (topo do app). */
export function HeaderActions({ compact }: { compact?: boolean }) {
  const settings = useSettings()
  const now = useNow()
  const notices = useNotifications(now)
  const nav = useNavigate()
  const [open, setOpen] = useState<'search' | 'bell' | 'me' | null>(null)
  const [seen, setSeen] = useState<string[]>(loadSeen)
  const close = () => setOpen(null)
  const searchRef = useOutside<HTMLDivElement>(open === 'search', close)
  const bellRef = useOutside<HTMLDivElement>(open === 'bell', close)
  const meRef = useOutside<HTMLDivElement>(open === 'me', close)
  const unread = notices.filter((n) => !seen.includes(n.id)).length

  const toggleBell = () => {
    setOpen((o) => (o === 'bell' ? null : 'bell'))
    const ids = notices.map((n) => n.id)
    setSeen(ids)
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(ids)) } catch { /* ignore */ }
  }

  return (
    <div className="flex items-center gap-1">
      <div ref={searchRef} className="relative">
        <button onClick={() => setOpen((o) => (o === 'search' ? null : 'search'))} className={iconBtn} aria-label="Buscar"><Search size={20} /></button>
        {open === 'search' && (
          <div className={cn(popover, 'w-[min(420px,calc(100vw-24px))] p-3')}>
            <GlobalSearch autoFocus onDone={close} />
          </div>
        )}
      </div>
      {!compact && <button onClick={() => setFocusMode(true)} className={iconBtn} aria-label="Modo foco" title="Modo foco"><Hourglass size={19} /></button>}
      <div ref={bellRef} className="relative">
        <button onClick={toggleBell} className={iconBtn} aria-label="Notificações">
          <Bell size={20} />
          {unread > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-cereja ring-2 ring-white" aria-label={`${unread} novas`} />}
        </button>
        {open === 'bell' && (
          <div className={cn(popover, 'w-[min(340px,calc(100vw-24px))]')}>
            <p className="px-3 pb-1 pt-2 text-sm font-bold text-tinta">Lembretes</p>
            {notices.length === 0 ? (
              <p className="px-3 pb-4 text-sm text-vinho/60">Tudo tranquilo por aqui.</p>
            ) : (
              notices.map((n) => (
                <button key={n.id} onClick={() => { nav(n.path); close() }} className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-rosa-50">
                  <span className="text-lg leading-none">{n.emoji}</span>
                  <span>
                    <span className="block text-sm font-semibold text-tinta">{n.title}</span>
                    <span className="block text-xs text-vinho/60">{n.text}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      <div ref={meRef} className="relative">
        <button onClick={() => setOpen((o) => (o === 'me' ? null : 'me'))} className="flex items-center gap-1 rounded-full p-0.5 pr-1.5 transition hover:bg-rosa-100" aria-label="Minha conta">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-vinho text-sm font-bold text-white">{initials(settings.name)}</span>
          <ChevronDown size={16} className="text-vinho" />
        </button>
        {open === 'me' && (
          <div className={cn(popover, 'w-56')}>
            <p className="px-3 pb-2 pt-1.5 text-sm font-bold text-tinta">Olá, {settings.name}!</p>
            <Link to="/conquistas" onClick={close} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-vinho hover:bg-rosa-50"><Trophy size={16} /> Conquistas</Link>
            <Link to="/perfil" onClick={close} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-vinho hover:bg-rosa-50"><Settings size={16} /> Configurações</Link>
            <button onClick={() => { close(); signOut() }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-vinho hover:bg-rosa-50"><LogOut size={16} /> Sair</button>
          </div>
        )}
      </div>
    </div>
  )
}
