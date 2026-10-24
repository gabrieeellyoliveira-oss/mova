import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { BookOpen, CalendarDays, CalendarPlus, Home, ListTodo, NotebookPen, PiggyBank, Plus, User, Wallet } from 'lucide-react'
import { cn } from '@/lib/cn'
import { openForm, type FormKind } from '@/hooks/useQuickAdd'

const items = [
  { label: 'Início', path: '/', icon: Home },
  { label: 'Planejar', path: '/planejamento', icon: CalendarDays },
  null,
  { label: 'Cofre', path: '/sair-de-casa', icon: PiggyBank },
  { label: 'Perfil', path: '/perfil', icon: User },
]

export const QUICK_ACTIONS: { kind: FormKind; label: string; icon: typeof Plus; color: string }[] = [
  { kind: 'task', label: 'Nova tarefa', icon: ListTodo, color: '#961415' },
  { kind: 'transaction', label: 'Novo gasto', icon: Wallet, color: '#520215' },
  { kind: 'event', label: 'Novo compromisso', icon: CalendarPlus, color: '#CB757C' },
  { kind: 'deposit', label: 'Guardar no cofre', icon: PiggyBank, color: '#7A7A4A' },
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
          <div className="absolute inset-x-4 bottom-28 mx-auto grid max-w-sm grid-cols-2 gap-2.5 rounded-4xl bg-creme p-4 shadow-lift animate-rise">
            <p className="col-span-2 px-1 pb-1 text-base font-extrabold text-vinho">o que vamos anotar?</p>
            {QUICK_ACTIONS.map(({ kind, label, icon: Icon, color }) => (
              <button
                key={kind}
                onClick={() => { setOpen(false); openForm(kind) }}
                className="flex items-center gap-2.5 rounded-2xl bg-quente px-3 py-3 text-left text-[13px] font-semibold text-vinho shadow-soft active:scale-95"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-quente" style={{ backgroundColor: color }}><Icon size={16} /></span>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-vinho/10 bg-quente/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2">
          {items.map((it) =>
            it ? (
              <NavLink
                key={it.path} to={it.path} end={it.path === '/'}
                className={({ isActive }) => cn('flex w-16 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition', isActive ? 'text-cereja' : 'text-vinho/55')}
              >
                <it.icon size={21} />
                {it.label}
              </NavLink>
            ) : (
              <button
                key="plus"
                onClick={() => setOpen((o) => !o)}
                aria-label="Menu rápido de adicionar"
                className={cn('-mt-7 grid h-14 w-14 place-items-center rounded-full bg-cereja text-quente shadow-lift ring-4 ring-creme transition-transform', open && 'rotate-45')}
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
