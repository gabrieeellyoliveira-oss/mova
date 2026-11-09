import { Logo } from '@/components/layout/Logo'

/** Enquanto confere a conta e baixa os dados da nuvem. */
export function BootScreen() {
  return (
    <main className="grid h-dvh w-full place-items-center bg-ink" aria-busy="true">
      <div className="flex flex-col items-center gap-5">
        <Logo size="lg" light />
        <span className="h-2 w-28 overflow-hidden rounded-full border border-ink-fg/40"><span className="block h-full w-1/3 animate-shine rounded-full bg-lavanda" /></span>
        <p className="text-sm text-ink-fg/60">Carregando seus treinos…</p>
      </div>
    </main>
  )
}
