import type { ReactNode } from 'react'
import { ChevronRight, Loader2, Mail, Play } from 'lucide-react'
import { useAuthForm } from '@/hooks/useAuthForm'
import { AuthScene } from '@/components/auth/AuthScene'
import { AuthGameWindow, WindowTitle } from '@/components/auth/AuthGameWindow'
import { MovaBrand } from '@/components/auth/MovaBrand'
import { GameInput } from '@/components/auth/GameInput'
import { GameToggle } from '@/components/auth/GameToggle'
import { PixelButton } from '@/components/game/PixelButton'
import { PixelIcon } from '@/components/game/PixelIcon'

/** Tela inicial do MOVA (cadastro/entrada) como a tela de título de um cozy game. */
export default function Login() {
  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden bg-[#2b0910] lg:h-dvh lg:overflow-hidden">
      {/* desktop: cenário inteiro; celular: cenário fixo com a personagem à vista */}
      <AuthScene className="absolute inset-0 hidden lg:block" fx={50} fy={66} cy={50} />
      <AuthScene className="fixed inset-0 lg:hidden" fx={35} fy={62} cx={50} cy={36} zoom={1.5} />
      <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#2b0910] via-[#2b0910]/70 to-transparent lg:hidden" />

      <div className="relative z-10 grid min-h-dvh lg:h-full lg:grid-cols-[60fr_40fr]">
        <div className="hidden justify-center pt-[7vh] short:pt-[3vh] lg:flex">
          <MovaBrand className="h-fit" />
        </div>
        <div className="flex flex-col items-center px-4 pb-6 pt-6 lg:justify-center lg:px-10 lg:py-6 short:py-3">
          <MovaBrand compact className="lg:hidden" />
          {/* espaço para a personagem aparecer no celular */}
          <div className="h-[44svh] min-h-[230px] shrink-0 lg:hidden" />
          <AuthPanel />
        </div>
      </div>
    </main>
  )
}

function ErrorLine({ message }: { message: string }) {
  return (
    <p role="alert" className="px-corners-sm flex items-start gap-2 bg-[#FBDDE0] px-3 py-2 text-sm font-medium text-cereja shadow-[inset_0_0_0_2px_rgba(150,20,21,0.35)]">
      <span className="font-pixel text-base font-bold leading-5">!</span>{message}
    </p>
  )
}

function Note({ children }: { children: ReactNode }) {
  return <p className="rounded-md border-2 border-[#E3A9AE] bg-[#FDF0F0] px-4 py-3 text-[15px] leading-snug text-[#5b2a33]">{children}</p>
}

function AuthPanel() {
  const f = useAuthForm()
  const creating = f.mode === 'criar'
  const footer = f.cloud ? 'Seu acesso e seus dados ficam salvos com segurança na nuvem.' : 'Seu acesso e seus dados ficam salvos de forma segura neste navegador.'
  const back = <button type="button" onClick={() => f.go('entrar')} className="mx-auto block text-sm font-semibold text-cereja hover:underline">← Voltar para Continuar jogo</button>

  // mensagens depois de enviar um e-mail
  if (f.mode === 'confirmar' || f.mode === 'enviado')
    return (
      <AuthGameWindow className="max-w-[480px]">
        <div key={f.mode} className="animate-rise space-y-5">
          <WindowTitle title={f.mode === 'confirmar' ? 'Quase lá!' : 'Link enviado'} subtitle={<>Mandamos um e-mail para <b className="text-vinho">{f.email.trim()}</b>.</>} />
          <Note>
            {f.mode === 'confirmar'
              ? 'Abra o e-mail e toque no link de confirmação. Depois é só voltar aqui e continuar o jogo.'
              : 'Abra o e-mail e toque no link para escolher uma senha nova. O link abre o MOVA direto na tela de senha.'}
          </Note>
          <p className="text-center text-xs text-[#8a5a62]">Não chegou? Olhe o spam ou as promoções.</p>
          {back}
        </div>
      </AuthGameWindow>
    )

  // local: não dá para recuperar senha
  if (f.mode === 'esqueci' && !f.cloud)
    return (
      <AuthGameWindow className="max-w-[480px]">
        <div key="esqueci" className="animate-rise space-y-5">
          <WindowTitle title="Esqueci a senha" subtitle="Seu acesso fica salvo só neste navegador, então não dá para recuperar a senha." />
          <Note>Você pode começar um acesso novo: <b className="text-vinho">seus dados do MOVA continuam aqui</b>, só o e-mail e a senha são trocados.</Note>
          <PixelButton icon={<PixelIcon name="cherries" size={28} />} onClick={f.startOver}>Criar novo acesso</PixelButton>
          {back}
        </div>
      </AuthGameWindow>
    )

  const titles: Record<'criar' | 'entrar' | 'esqueci' | 'nova-senha', [string, string]> = {
    criar: ['Novo jogo', 'Crie seu acesso ao MOVA e comece sua jornada.'],
    entrar: ['Continuar jogo', 'Que bom te ver de novo! Entre para continuar sua jornada.'],
    esqueci: ['Esqueci a senha', 'Digite seu e-mail e mandamos um link para escolher uma senha nova.'],
    'nova-senha': ['Senha nova', 'Escolha a senha nova do seu MOVA.'],
  }
  const mode = f.mode as keyof typeof titles
  const [title, subtitle] = titles[mode]
  const askEmail = mode !== 'nova-senha'
  const askPassword = mode !== 'esqueci'
  const askConfirm = mode === 'criar' || mode === 'nova-senha'
  const buttonLabel = { criar: 'Começar minha jornada', entrar: 'Continuar minha jornada', esqueci: 'Enviar link', 'nova-senha': 'Salvar senha nova' }[mode]
  const buttonIcon = f.busy ? <Loader2 size={22} className="animate-spin" /> : creating ? <PixelIcon name="cherries" size={30} /> : mode === 'entrar' ? <Play size={18} className="fill-current" /> : <PixelIcon name="sparkle" size={22} />

  return (
    <AuthGameWindow className="max-w-[480px]">
      <div key={f.mode} className="animate-rise">
        <WindowTitle title={title} subtitle={subtitle} />
        <form onSubmit={f.submit} className="mt-5 space-y-3.5 short:mt-3 short:space-y-2.5" noValidate>
          {askEmail && (
            <GameInput
              id="login-email" label="E-mail" type="email" autoComplete="email" placeholder="voce@email.com"
              value={f.email} onChange={(e) => f.setEmail(e.target.value)} icon={<Mail size={19} />} invalid={f.error?.field === 'email'}
            />
          )}
          {askPassword && (
            <GameInput
              id="login-password" label={mode === 'nova-senha' ? 'Senha nova' : 'Senha'} type="password" autoComplete={mode === 'entrar' ? 'current-password' : 'new-password'}
              placeholder={mode === 'entrar' ? 'Sua senha' : 'Pelo menos 6 caracteres'}
              value={f.password} onChange={(e) => f.setPassword(e.target.value)} invalid={f.error?.field === 'password'}
            />
          )}
          {askConfirm && (
            <GameInput
              id="login-confirm" label="Confirmar senha" type="password" autoComplete="new-password" placeholder="Repita a senha"
              value={f.confirm} onChange={(e) => f.setConfirm(e.target.value)} invalid={f.error?.field === 'confirm'}
            />
          )}
          {(mode === 'criar' || mode === 'entrar') && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <GameToggle checked={f.remember} onChange={f.setRemember} label="Lembrar de mim" />
              {mode === 'entrar' && <button type="button" onClick={() => f.go('esqueci')} className="text-sm font-semibold text-cereja hover:underline">Esqueci minha senha</button>}
            </div>
          )}
          {f.error && <ErrorLine message={f.error.message} />}
          <div className="pt-2">
            <PixelButton
              type="submit"
              disabled={f.busy}
              icon={buttonIcon}
              trailing={creating ? <ChevronRight size={22} strokeWidth={3} className="transition-transform group-hover:translate-x-0.5" /> : undefined}
            >
              {buttonLabel}
            </PixelButton>
          </div>
        </form>
        <p className="mt-5 text-center text-[13px] leading-snug text-[#8a5a62] short:mt-3">
          <span aria-hidden className="text-cereja/70">✦ </span>{footer}<span aria-hidden className="text-cereja/70"> ✦</span>
        </p>
        {creating ? (
          <p className="mt-3 text-center text-sm text-[#5b2a33]">
            Já começou sua jornada? <button type="button" onClick={() => f.go('entrar')} className="font-bold text-cereja hover:underline">Continuar jogo →</button>
          </p>
        ) : mode === 'entrar' ? (
          f.canCreate && (
            <p className="mt-3 text-center text-sm text-[#5b2a33]">
              Primeira vez por aqui? <button type="button" onClick={() => f.go('criar')} className="font-bold text-cereja hover:underline">Novo jogo →</button>
            </p>
          )
        ) : mode === 'esqueci' && <div className="mt-3">{back}</div>}
      </div>
    </AuthGameWindow>
  )
}
