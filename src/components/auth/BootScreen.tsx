import { Logo } from '@/components/layout/Logo'

/** Enquanto confere a conta e baixa os dados da nuvem. */
export function BootScreen() {
  return (
    <main className="grid h-dvh w-full place-items-center bg-creme" aria-busy="true">
      <div className="flex flex-col items-center gap-4">
        <Logo />
        <span className="h-1.5 w-28 overflow-hidden rounded-full bg-rosa-100"><span className="block h-full w-1/3 animate-shine rounded-full bg-vinho" /></span>
        <p className="text-sm text-tinta/60">Carregando seu MOVA…</p>
      </div>
    </main>
  )
}
