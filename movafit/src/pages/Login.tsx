import type { ReactNode } from 'react'
import { Loader2, Mail } from 'lucide-react'
import { useAuthForm } from '@/hooks/useAuthForm'
import { AuthField } from '@/components/auth/AuthField'
import { Logo } from '@/components/layout/Logo'

/** Tela de acesso no estilo do mova: cartão escuro com o formulário e um painel lavanda. */
export default function Login() {
  return (
    <main className="flex min-h-dvh w-full bg-creme p-3 sm:p-6 lg:px-8">
      <div className="grid w-full overflow-hidden rounded-[2.5rem] bg-ink p-3 text-ink-fg sm:rounded-[3rem] md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:p-4">
        <section className="order-2 flex flex-col items-center justify-center px-5 pb-8 pt-6 sm:px-10 md:order-1 md:px-12 md:py-10 lg:px-16 short:md:py-6">
          <div className="w-full max-w-[440px]">
            <AuthPanel />
          </div>
        </section>
        <WeekPanel />
      </div>
    </main>
  )
}

/** Painel decorativo: uma semana de treinos marcada. */
function WeekPanel() {
  const week: [string, string | null][] = [['S', '🍑'], ['T', '🔥'], ['Q', null], ['Q', '💪'], ['S', '🧘'], ['S', null], ['D', null]]
  return (
    <div className="order-1 flex flex-col justify-between gap-6 rounded-[2rem] bg-lavanda p-6 text-ink sm:p-8 md:order-2 md:min-h-[540px] md:rounded-[2.25rem] md:p-12" aria-hidden>
      <p className="font-serif text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">Treino em casa,<br />no seu ritmo.</p>
      <div className="rounded-3xl border-2 border-ink bg-quente p-4 shadow-pixel sm:p-5">
        <p className="text-sm font-semibold">Minha semana</p>
        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {week.map(([d, e], i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="text-[11px] font-bold text-ink/55">{d}</span>
              <span className={`grid aspect-square w-full max-w-12 place-items-center rounded-full border-2 text-base sm:text-xl ${e ? 'border-ink bg-salvia-200' : 'border-ink/30'}`}>{e}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 font-serif text-2xl font-bold">4 treinos <span className="text-base font-normal text-ink/60">nesta semana</span></p>
      </div>
    </div>
  )
}

function ErrorLine({ message }: { message: string }) {
  return <p role="alert" className="rounded-2xl border-2 border-cereja bg-cereja/40 px-4 py-2.5 text-sm font-medium text-ink-fg">{message}</p>
}

function Note({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border-2 border-ink-fg/25 px-4 py-3 text-[15px] leading-snug text-ink-fg/85">{children}</p>
}

function Brand({ title, subtitle = 'Seus treinos em casa, registrados com leveza.' }: { title: string; subtitle?: ReactNode }) {
  return (
    <header>
      <h2 className="sr-only">{title}</h2>
      <Logo size="lg" light />
      <p className="mt-4 text-lg text-ink-fg/85 short:mt-2 short:text-base">{subtitle}</p>
    </header>
  )
}

function Or() {
  return (
    <div className="flex items-center gap-5 py-1 text-sm text-ink-fg/80" aria-hidden>
      <span className="h-px flex-1 bg-ink-fg/60" /> ou <span className="h-px flex-1 bg-ink-fg/60" />
    </div>
  )
}

const primary = 'flex h-14 short:h-12 w-full items-center justify-center gap-2 rounded-2xl bg-lavanda text-base font-semibold text-ink transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60'
const outline = 'flex h-14 short:h-12 w-full items-center justify-center rounded-full border-2 border-ink-fg/90 text-base font-semibold text-ink-fg transition hover:bg-ink-fg/10 active:scale-[0.99]'
const link = 'text-sm text-ink-fg underline decoration-ink-fg/70 underline-offset-4 hover:decoration-ink-fg'

function AuthPanel() {
  const f = useAuthForm()
  const footer = f.cloud ? 'Mesma conta do mova. Seus treinos ficam salvos com segurança na nuvem.' : 'Seu acesso e seus dados ficam salvos neste navegador.'
  const back = <button type="button" onClick={() => f.go('entrar')} className={outline}>Voltar para entrar</button>

  if (f.mode === 'confirmar' || f.mode === 'enviado')
    return (
      <div key={f.mode} className="animate-rise space-y-6">
        <Brand title={f.mode === 'confirmar' ? 'Quase lá!' : 'Link enviado'} subtitle={<>{f.mode === 'confirmar' ? 'Quase lá!' : 'Link enviado.'} Mandamos um e-mail para <b>{f.email.trim()}</b>.</>} />
        <Note>
          {f.mode === 'confirmar'
            ? 'Abra o e-mail e toque no link de confirmação. Depois é só voltar aqui e entrar.'
            : 'Abra o e-mail e toque no link para escolher uma senha nova. O link abre o movafit direto na tela de senha.'}
        </Note>
        <p className="text-xs text-ink-fg/55">Não chegou? Olhe o spam ou as promoções.</p>
        {back}
      </div>
    )

  if (f.mode === 'esqueci' && !f.cloud)
    return (
      <div key="esqueci" className="animate-rise space-y-6">
        <Brand title="Esqueci a senha" subtitle="Esqueci minha senha" />
        <Note>Seu acesso fica salvo só neste navegador, então não dá para recuperar a senha. Você pode criar um acesso novo: <b>seus treinos continuam aqui</b>, só o e-mail e a senha são trocados.</Note>
        <button type="button" onClick={f.startOver} className={primary}>Criar novo acesso</button>
        {back}
      </div>
    )

  const subtitles: Record<'criar' | 'entrar' | 'esqueci' | 'nova-senha', string> = {
    criar: 'Crie sua conta para começar (ela também vale no mova).',
    entrar: 'Entre com a mesma conta do mova.',
    esqueci: 'Digite seu e-mail e mandamos um link para escolher uma senha nova.',
    'nova-senha': 'Escolha sua senha nova.',
  }
  const mode = f.mode as keyof typeof subtitles
  const askEmail = mode !== 'nova-senha'
  const askPassword = mode !== 'esqueci'
  const askConfirm = mode === 'criar' || mode === 'nova-senha'
  const buttonLabel = { criar: 'Criar conta', entrar: 'Entrar', esqueci: 'Enviar link', 'nova-senha': 'Salvar senha nova' }[mode]

  return (
    <div key={f.mode} className="animate-rise">
      <Brand title={{ criar: 'Criar conta', entrar: 'Entrar', esqueci: 'Esqueci a senha', 'nova-senha': 'Senha nova' }[mode]} subtitle={subtitles[mode]} />
      <form onSubmit={f.submit} className="mt-10 space-y-5 short:mt-6 short:space-y-3.5" noValidate>
        {askEmail && (
          <AuthField
            id="login-email" label="E-mail" type="email" autoComplete="email" placeholder="E-mail"
            value={f.email} onChange={(e) => f.setEmail(e.target.value)} icon={<Mail size={22} strokeWidth={1.6} />} invalid={f.error?.field === 'email'}
          />
        )}
        {askPassword && (
          <AuthField
            id="login-password" label={mode === 'nova-senha' ? 'Senha nova' : 'Senha'} type="password" autoComplete={mode === 'entrar' ? 'current-password' : 'new-password'}
            placeholder={mode === 'nova-senha' ? 'Senha nova' : 'Senha'}
            value={f.password} onChange={(e) => f.setPassword(e.target.value)} invalid={f.error?.field === 'password'}
          />
        )}
        {askConfirm && (
          <AuthField
            id="login-confirm" label="Confirmar senha" type="password" autoComplete="new-password" placeholder="Confirmar senha"
            value={f.confirm} onChange={(e) => f.setConfirm(e.target.value)} invalid={f.error?.field === 'confirm'}
          />
        )}
        {(mode === 'criar' || mode === 'entrar') && (
          <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-ink-fg/80">
            <input type="checkbox" role="switch" aria-label="Lembrar de mim" aria-checked={f.remember} checked={f.remember} onChange={(e) => f.setRemember(e.target.checked)} className="h-4 w-4 accent-[#C3AEEC]" />
            Lembrar de mim
          </label>
        )}
        {f.error && <ErrorLine message={f.error.message} />}
        <button type="submit" disabled={f.busy} className={`${primary} !mt-7 short:!mt-5`}>
          {f.busy && <Loader2 size={18} className="animate-spin" />}
          {buttonLabel}
        </button>
      </form>
      <div className="mt-6 space-y-6 short:mt-4 short:space-y-4">
        {mode === 'entrar' && <p className="text-center"><button type="button" onClick={() => f.go('esqueci')} className={link}>Esqueci minha senha</button></p>}
        {mode === 'entrar' && f.canCreate && (<><Or /><button type="button" onClick={() => f.go('criar')} className={outline}>Criar conta</button></>)}
        {mode === 'criar' && (<><Or /><button type="button" onClick={() => f.go('entrar')} className={outline}>Já tenho conta</button></>)}
        {mode === 'esqueci' && back}
      </div>
      <p className="mt-8 text-center text-xs text-ink-fg/45 short:mt-5">{footer}</p>
    </div>
  )
}
