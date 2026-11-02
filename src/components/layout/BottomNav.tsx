import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { BookOpen, CalendarPlus, ListTodo, PiggyBank, Plus, Wallet } from 'lucide-react'
import { Icon, type IconName } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { openForm, type FormKind } from '@/hooks/useQuickAdd'

const items: ({ label: string; path: string; sprite: IconName } | null)[] = [
  { label: 'Início', path: '/', sprite: 'home' },
  { label: 'Agenda', path: '/agenda', sprite: 'planner' },
  null,
  { label: 'Finanças', path: '/financas', sprite: 'coins' },
  { label: 'Perfil', path: '/perfil', sprite: 'user' },
]

export const QUICK_ACTIONS: { kind: FormKind; label: string; icon: typeof Plus; color: string }[] = [
  { kind: 'task', label: 'Nova tarefa', icon: ListTodo, color: '#3E2723' },
  { kind: 'transaction', label: 'Novo gasto', icon: Wallet, color: '#3E2723' },
  { kind: 'event', label: 'Novo compromisso', icon: CalendarPlus, color: '#D99AAE' },
  { kind: 'deposit', label: 'Guardar no cofre', icon: PiggyBank, color: '#6E8B6A' },
  { kind: 'book', label: 'Nova leitura', icon: BookOpen, color: '#B7798C' },
]

export function BottomNav() {
  const [open, setOpen] = useState(false)
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-vinho-950/30 backdrop-blur-[2px]" />
          <div className="absolute inset-x-4 bottom-28 mx-auto grid max-w-sm grid-cols-2 gap-2 rounded-3xl bg-white p-4 shadow-lift animate-rise">
            <p className="col-span-2 px-1 pb-1 text-base font-bold text-tinta">O que vamos anotar?</p>
            {QUICK_ACTIONS.map(({ kind, label, icon: Icon, color }) => (
              <button
                key={kind}
                onClick={() => { setOpen(false); openForm(kind) }}
                className="flex items-center gap-2.5 rounded-2xl bg-rosa-50 px-2.5 py-2.5 text-left text-[13px] font-semibold text-vinho last:odd:col-span-2 active:scale-[0.98]"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-white" style={{ backgroundColor: color }}><Icon size={16} /></span>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-px-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2">
          {items.map((it) =>
            it ? (
              <NavLink
                key={it.path} to={it.path} end={it.path === '/'}
                className={({ isActive }) => cn('flex w-16 flex-col items-center gap-1 py-2 text-[11px] font-semibold transition', isActive ? 'text-vinho' : 'text-vinho/45')}
              >
                {({ isActive }) => (
                  <>
                    <Icon name={it.sprite} size={22} className={cn('transition-colors', isActive ? 'text-vinho' : 'text-vinho/45')} />
                    {it.label}
                  </>
                )}
              </NavLink>
            ) : (
              <button
                key="plus"
                onClick={() => setOpen((o) => !o)}
                aria-label="Menu rápido de adicionar"
                className={cn('-mt-6 grid h-14 w-14 place-items-center rounded-full bg-vinho text-white shadow-lift ring-4 ring-white transition-transform active:scale-95', open && 'rotate-45')}
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
