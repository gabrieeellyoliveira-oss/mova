import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { BookOpen, CalendarPlus, ListTodo, MapPin, NotebookPen, PiggyBank, Plus, Wallet } from 'lucide-react'
import { PixelIcon, type SpriteName } from '@/components/game/PixelIcon'
import { cn } from '@/lib/cn'
import { openForm, type FormKind } from '@/hooks/useQuickAdd'

const items: ({ label: string; path: string; sprite: SpriteName } | null)[] = [
  { label: 'Início', path: '/', sprite: 'home' },
  { label: 'Meu dia', path: '/meu-dia', sprite: 'check' },
  null,
  { label: 'Explorar', path: '/explorar', sprite: 'map' },
  { label: 'Perfil', path: '/perfil', sprite: 'user' },
]

export const QUICK_ACTIONS: { kind: FormKind; label: string; icon: typeof Plus; color: string }[] = [
  { kind: 'task', label: 'Nova tarefa', icon: ListTodo, color: '#961415' },
  { kind: 'transaction', label: 'Novo gasto', icon: Wallet, color: '#520215' },
  { kind: 'event', label: 'Novo compromisso', icon: CalendarPlus, color: '#CB757C' },
  { kind: 'deposit', label: 'Guardar no cofre', icon: PiggyBank, color: '#7A7A4A' },
  { kind: 'place', label: 'Novo lugar', icon: MapPin, color: '#b8565e' },
  { kind: 'book', label: 'Nova leitura', icon: BookOpen, color: '#b8565e' },
  { kind: 'note', label: 'Nova nota', icon: NotebookPen, color: '#5f5f37' },
]

export function BottomNav() {
  const [open, setOpen] = useState(false)
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-vinho-900/30 backdrop-blur-[2px]" />
          <div className="absolute inset-x-4 bottom-28 mx-auto grid max-w-sm grid-cols-2 gap-2 rounded-px border-2 border-px-line bg-px-panel p-3 shadow-pixel animate-level-in">
            <p className="col-span-2 px-1 pb-1 font-pixel text-lg font-semibold uppercase text-vinho">O que vamos anotar?</p>
            {QUICK_ACTIONS.map(({ kind, label, icon: Icon, color }) => (
              <button
                key={kind}
                onClick={() => { setOpen(false); openForm(kind) }}
                className="flex items-center gap-2.5 rounded-lg border-2 border-px-line/40 bg-white/70 px-2.5 py-2.5 text-left text-[13px] font-semibold text-vinho last:odd:col-span-2 active:translate-y-px"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border-2 border-px-line text-rosa-50" style={{ backgroundColor: color }}><Icon size={16} /></span>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-black/40 bg-vinho-950 pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2">
          {items.map((it) =>
            it ? (
              <NavLink
                key={it.path} to={it.path} end={it.path === '/'}
                className={({ isActive }) => cn('flex w-16 flex-col items-center gap-1 py-2 font-pixel text-[12px] font-semibold transition', isActive ? 'text-rosa' : 'text-rosa-50/55')}
              >
                {({ isActive }) => (
                  <>
                    <PixelIcon name={it.sprite} size={22} className={cn('transition-transform', isActive && '-translate-y-0.5')} />
                    {it.label}
                  </>
                )}
              </NavLink>
            ) : (
              <button
                key="plus"
                onClick={() => setOpen((o) => !o)}
                aria-label="Menu rápido de adicionar"
                className={cn('-mt-6 grid h-14 w-14 place-items-center rounded-lg border-2 border-px-line bg-cereja text-rosa-50 shadow-pixel ring-4 ring-vinho-950 transition-transform active:translate-y-px', open && 'rotate-45')}
              >
                <Plus size={26} strokeWidth={2.6} />
              </button>
            ),
          )}
        </div>
      </nav>
    </>
  )
}
