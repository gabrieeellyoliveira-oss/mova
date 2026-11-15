import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { BookOpen, CalendarPlus, ListTodo, PiggyBank, Plus } from 'lucide-react'
import { Icon, type IconName } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { openForm, type FormKind } from '@/hooks/useQuickAdd'

const items: ({ label: string; path: string; sprite: IconName } | null)[] = [
  { label: 'Início', path: '/', sprite: 'home' },
  { label: 'Agenda', path: '/agenda', sprite: 'planner' },
  null,
  { label: 'Sair de casa', path: '/sair-de-casa', sprite: 'piggy' },
  { label: 'Perfil', path: '/perfil', sprite: 'user' },
]

export const QUICK_ACTIONS: { kind: FormKind; label: string; icon: typeof Plus; color: string }[] = [
  { kind: 'task', label: 'Nova tarefa', icon: ListTodo, color: '#C3AEEC' },
  { kind: 'event', label: 'Novo compromisso', icon: CalendarPlus, color: '#FAF1DF' },
  { kind: 'deposit', label: 'Guardar no cofre', icon: PiggyBank, color: '#DCD1F4' },
  { kind: 'book', label: 'Nova leitura', icon: BookOpen, color: '#D2E5C8' },
]

export function BottomNav() {
  const [open, setOpen] = useState(false)
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" />
          <div className="absolute inset-x-4 bottom-28 mx-auto grid max-w-sm grid-cols-2 gap-2 rounded-3xl border-2 border-ink bg-quente p-4 shadow-pixel animate-rise">
            <p className="col-span-2 px-1 pb-1 font-serif text-lg font-bold text-tinta">O que vamos anotar?</p>
            {QUICK_ACTIONS.map(({ kind, label, icon: Icon, color }) => (
              <button
                key={kind}
                onClick={() => { setOpen(false); openForm(kind) }}
                className="flex items-center gap-2.5 rounded-2xl border-2 border-ink bg-quente px-2.5 py-2.5 text-left text-[13px] font-semibold text-tinta last:odd:col-span-2 active:scale-[0.98]"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-ink" style={{ backgroundColor: color }}><Icon size={16} /></span>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-quente pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2">
          {items.map((it) =>
            it ? (
              <NavLink
                key={it.path} to={it.path} end={it.path === '/'}
                className={({ isActive }) => cn('flex w-16 flex-col items-center gap-1 py-2 text-[11px] font-semibold transition', isActive ? 'text-ink' : 'text-ink/45')}
              >
                {({ isActive }) => (
                  <>
                    <Icon name={it.sprite} size={22} className={cn('transition-colors', isActive ? 'text-ink' : 'text-ink/45')} />
                    {it.label}
                  </>
                )}
              </NavLink>
            ) : (
              <button
                key="plus"
                onClick={() => setOpen((o) => !o)}
                aria-label="Menu rápido de adicionar"
                className={cn('-mt-6 grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-lavanda text-ink shadow-pixel-sm transition-transform active:scale-95', open && 'rotate-45')}
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
