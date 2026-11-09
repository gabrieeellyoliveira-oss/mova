import { useState, type ReactNode } from 'react'
import { CalendarDays, Cloud, CloudOff, ExternalLink, House, LogOut, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Logo } from './Logo'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Form'
import { navigate, useRoute, type Route } from '@/hooks/useRoute'
import { openNewWorkout } from '@/hooks/useWorkoutForm'
import { signOut, useSession, cloudEnabled } from '@/lib/auth'
import { syncStatus } from '@/lib/cloudSync'
import { fitSettings } from '@/store/db'
import { useStore } from '@/store/createStore'

const TABS: { route: Route; label: string; icon: ReactNode }[] = [
  { route: 'hoje', label: 'Hoje', icon: <House size={18} /> },
  { route: 'historico', label: 'Histórico', icon: <CalendarDays size={18} /> },
]

const MOVA_URL = 'https://mova-eosin.vercel.app'

/** Cabeçalho em tinta com abas em pílula (computador) e barra de baixo (celular), como no mova. */
export function AppShell({ children }: { children: ReactNode }) {
  const route = useRoute()
  const email = useSession() ?? ''
  const [account, setAccount] = useState(false)
  const initial = (email[0] ?? 'm').toUpperCase()

  return (
    <div className="min-h-dvh pb-28 md:pb-10">
      <header className="sticky top-0 z-30 bg-ink text-ink-fg">
        <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={() => navigate('hoje')} aria-label="Ir para Hoje"><Logo light size="sm" /></button>
          <nav className="ml-6 hidden items-center gap-1.5 md:flex" aria-label="Abas">
            {TABS.map((t) => (
              <button
                key={t.route}
                type="button"
                onClick={() => navigate(t.route)}
                aria-current={route === t.route ? 'page' : undefined}
                className={cn(
                  'inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition',
                  route === t.route ? 'bg-lavanda text-ink' : 'text-ink-fg/80 hover:bg-ink-fg/10 hover:text-ink-fg',
                )}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => openNewWorkout()}
              className="hidden h-10 items-center gap-2 rounded-full border-2 border-lavanda bg-lavanda px-4 text-sm font-semibold text-ink hover:brightness-105 md:inline-flex"
            >
              <Plus size={18} /> Registrar treino
            </button>
            <button
              type="button"
              onClick={() => setAccount(true)}
              className="grid h-10 w-10 place-items-center rounded-full bg-salvia font-serif text-lg font-bold text-ink ring-2 ring-transparent transition hover:ring-lavanda"
              aria-label="Minha conta"
            >
              {initial}
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 pt-5 sm:px-6 sm:pt-6 lg:px-8">{children}</main>

      {/* celular: Hoje · + · Histórico */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-ink bg-quente pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Abas">
        <div className="grid h-[68px] grid-cols-3 items-center">
          <BottomTab tab={TABS[0]} active={route === 'hoje'} />
          <div className="grid place-items-center">
            <button
              type="button"
              onClick={() => openNewWorkout()}
              className="-mt-8 grid h-16 w-16 place-items-center rounded-full border-2 border-ink bg-lavanda text-ink shadow-pixel active:translate-x-0.5 active:translate-y-0.5 active:shadow-pixel-sm"
              aria-label="Registrar treino"
            >
              <Plus size={30} strokeWidth={2.4} />
            </button>
          </div>
          <BottomTab tab={TABS[1]} active={route === 'historico'} />
        </div>
      </nav>

      <AccountModal open={account} onClose={() => setAccount(false)} email={email} />
    </div>
  )
}

function BottomTab({ tab, active }: { tab: (typeof TABS)[number]; active: boolean }) {
  return (
    <button
      type="button"
      onClick={() => navigate(tab.route)}
      aria-current={active ? 'page' : undefined}
      className={cn('flex flex-col items-center gap-0.5 text-[11px] font-semibold', active ? 'text-ink' : 'text-ink/50')}
    >
      <span className={cn('grid h-8 w-14 place-items-center rounded-full transition', active && 'bg-lavanda')}>{tab.icon}</span>
      {tab.label}
    </button>
  )
}

function AccountModal({ open, onClose, email }: { open: boolean; onClose: () => void; email: string }) {
  const settings = useStore(fitSettings)
  const sync = useStore(syncStatus)
  const online = sync.state === 'ok' || sync.state === 'syncing'
  return (
    <Modal open={open} onClose={onClose} title="Minha conta" size="sm">
      <div className="space-y-6">
        <div className="rounded-3xl border-2 border-ink bg-lavanda-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-tinta/55">Conectada como</p>
          <p className="truncate font-semibold">{email}</p>
          {cloudEnabled && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-tinta/70">
              {online ? <Cloud size={14} /> : <CloudOff size={14} />}
              {sync.state === 'syncing' ? 'Salvando na nuvem…' : online ? 'Treinos salvos na nuvem' : 'Sem conexão: salvo neste aparelho e envia depois'}
            </p>
          )}
        </div>
        <Field label="Minha meta: treinos por semana" group>
          <div className="grid grid-cols-6 gap-2">
            {[2, 3, 4, 5, 6, 7].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={settings.weeklyGoal === n}
                onClick={() => fitSettings.set((s) => ({ ...s, weeklyGoal: n }))}
                className={cn(
                  'h-11 rounded-2xl border-2 border-ink font-serif text-lg font-bold transition',
                  settings.weeklyGoal === n ? 'bg-ink text-ink-fg' : 'bg-quente hover:bg-lavanda-100',
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </Field>
        <div className="flex flex-wrap gap-2">
          <a href={MOVA_URL} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-ink bg-quente px-4 text-sm font-semibold hover:bg-lavanda-100">
            <ExternalLink size={16} /> Abrir o mova
          </a>
          <Button variant="secondary" onClick={() => { onClose(); signOut() }}>
            <LogOut size={16} /> Sair
          </Button>
        </div>
      </div>
    </Modal>
  )
}
