import { AuthScene } from './AuthScene'
import { MovaBrand } from './MovaBrand'

/** Enquanto confere a conta e baixa os dados da nuvem. */
export function BootScreen() {
  return (
    <main className="relative grid h-dvh w-full place-items-center overflow-hidden bg-[#2b0910]" aria-busy="true">
      <AuthScene className="absolute inset-0" fx={50} fy={66} cy={50} />
      <div className="absolute inset-0 bg-[#2b0910]/45" />
      <div className="relative flex flex-col items-center gap-5">
        <MovaBrand />
        <p className="flex items-center gap-2 font-pixel text-lg font-semibold text-[#FFF1EA] [text-shadow:0_2px_0_#2b0910]">
          Carregando seu jogo<span className="animate-pulse">…</span>
        </p>
      </div>
    </main>
  )
}
