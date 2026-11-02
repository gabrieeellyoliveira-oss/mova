import type { ReactNode } from 'react'
import { ArrowRight, Loader2, Mail } from 'lucide-react'
import { useAuthForm } from '@/hooks/useAuthForm'
import { AuthField } from '@/components/auth/AuthField'
import { Logo } from '@/components/layout/Logo'
import { Toggle } from '@/components/ui/Form'

/** Tela de acesso: saudação de um lado, formulário do outro. */
export default function Login() {
  return (
    <main className="grid min-h-dvh w-full bg-creme lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <section className="relative hidden overflow-hidden bg-rosa p-12 lg:flex lg:flex-col">
        <Logo />
        <div className="relative z-10 mt-[10vh] max-w-md">
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-tinta">Que bom te ver por aqui!</h1>
          <p className="mt-4 text-lg leading-snug text-tinta/70">Suas tarefas, estudos e finanças em um só lugar.</p>
        </div>
      </section>
      <section className="flex flex-col items-center justify-center px-5 py-10 sm:px-10">
        <div className="mb-8 lg:hidden"><Logo /></div>
        <div className="w-full max-w-[420px]">
          <AuthPanel />
        </div>
      </section>
    </main>
  )
}

function ErrorLine({ message }: { message: string }) {
  return <p role="alert" className="rounded-2xl bg-pastel-pink px-4 py-2.5 text-sm font-medium text-[#9B2C4F]">{message}</p>
}

function Note({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl bg-rosa-50 px-4 py-3 text-[15px] leading-snug text-tinta/80">{children}</p>
}

function Title({ title, subtitle }: { title: string; subtitle: ReactNode }) {
  return (
    <header>
      <h2 className="text-3xl font-extrabold tracking-tight text-tinta">{title}</h2>
      <p className="mt-2 text-[15px] text-tinta/65">{subtitle}</p>
    </header>
  )
}

const primary = 'flex h-12 w-full items-center justify-center gap-2 rounded-full bg-vinho text-[15px] font-semibold text-white shadow-soft transition hover:bg-vinho-700 active:scale-[0.99] disabled:opacity-60'
const link = 'font-semibold text-vinho hover:underline'

function AuthPanel() {
  const f = useAuthForm()
  const creating = f.mode === 'criar'
  const footer = f.cloud ? 'Seu acesso e seus dados ficam salvos com segurança na nuvem.' : 'Seu acesso e seus dados ficam salvos neste navegador.'
  const back = <button type="button" onClick={() => f.go('entrar')} className={`text-sm ${link}`}>← Voltar para entrar</button>

  if (f.mode === 'confirmar' || f.mode === 'enviado')
    return (
      <div key={f.mode} className="animate-rise space-y-6">
        <Title title={f.mode === 'confirmar' ? 'Quase lá!' : 'Link enviado'} subtitle={<>Mandamos um e-mail para <b className="text-vinho">{f.email.trim()}</b>.</>} />
        <Note>
          {f.mode === 'confirmar'
            ? 'Abra o e-mail e toque no link de confirmação. Depois é só voltar aqui e entrar.'
            : 'Abra o e-mail e toque no link para escolher uma senha nova. O link abre o MOVA direto na tela de senha.'}
        </Note>
        <p className="text-xs text-tinta/55">Não chegou? Olhe o spam ou as promoções.</p>
        {back}
      </div>
    )

  if (f.mode === 'esqueci' && !f.cloud)
    return (
      <div key="esqueci" className="animate-rise space-y-6">
        <Title title="Esqueci a senha" subtitle="Seu acesso fica salvo só neste navegador, então não dá para recuperar a senha." />
        <Note>Você pode criar um acesso novo: <b className="text-vinho">seus dados do MOVA continuam aqui</b>, só o e-mail e a senha são trocados.</Note>
        <button type="button" onClick={f.startOver} className={primary}>Criar novo acesso</button>
        {back}
      </div>
    )

  const titles: Record<'criar' | 'entrar' | 'esqueci' | 'nova-senha', [string, string]> = {
    criar: ['Criar acesso', 'Crie seu acesso ao MOVA para começar.'],
    entrar: ['Entrar', 'Que bom te ver de novo! Entre para continuar.'],
    esqueci: ['Esqueci a senha', 'Digite seu e-mail e mandamos um link para escolher uma senha nova.'],
    'nova-senha': ['Senha nova', 'Escolha a senha nova do seu MOVA.'],
  }
  const mode = f.mode as keyof typeof titles
  const [title, subtitle] = titles[mode]
  const askEmail = mode !== 'nova-senha'
  const askPassword = mode !== 'esqueci'
  const askConfirm = mode === 'criar' || mode === 'nova-senha'
  const buttonLabel = { criar: 'Criar acesso', entrar: 'Entrar', esqueci: 'Enviar link', 'nova-senha': 'Salvar senha nova' }[mode]

  return (
    <div key={f.mode} className="animate-rise">
      <Title title={title} subtitle={subtitle} />
      <form onSubmit={f.submit} className="mt-7 space-y-4" noValidate>
        {askEmail && (
          <AuthField
            id="login-email" label="E-mail" type="email" autoComplete="email" placeholder="voce@email.com"
            value={f.email} onChange={(e) => f.setEmail(e.target.value)} icon={<Mail size={18} />} invalid={f.error?.field === 'email'}
          />
        )}
        {askPassword && (
          <AuthField
            id="login-password" label={mode === 'nova-senha' ? 'Senha nova' : 'Senha'} type="password" autoComplete={mode === 'entrar' ? 'current-password' : 'new-password'}
            placeholder={mode === 'entrar' ? 'Sua senha' : 'Pelo menos 6 caracteres'}
            value={f.password} onChange={(e) => f.setPassword(e.target.value)} invalid={f.error?.field === 'password'}
          />
        )}
        {askConfirm && (
          <AuthField
            id="login-confirm" label="Confirmar senha" type="password" autoComplete="new-password" placeholder="Repita a senha"
            value={f.confirm} onChange={(e) => f.setConfirm(e.target.value)} invalid={f.error?.field === 'confirm'}
          />
        )}
        {(mode === 'criar' || mode === 'entrar') && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <Toggle checked={f.remember} onChange={f.setRemember} label="Lembrar de mim" />
            {mode === 'entrar' && <button type="button" onClick={() => f.go('esqueci')} className={`text-sm ${link}`}>Esqueci minha senha</button>}
          </div>
        )}
        {f.error && <ErrorLine message={f.error.message} />}
        <button type="submit" disabled={f.busy} className={`${primary} mt-2`}>
          {f.busy && <Loader2 size={18} className="animate-spin" />}
          {buttonLabel}
          {!f.busy && <ArrowRight size={18} />}
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-tinta/70">
        {creating ? (
          <>Já tem acesso? <button type="button" onClick={() => f.go('entrar')} className={link}>Entrar</button></>
        ) : mode === 'entrar' ? (
          f.canCreate && <>Primeira vez por aqui? <button type="button" onClick={() => f.go('criar')} className={link}>Criar acesso</button></>
        ) : mode === 'esqueci' && back}
      </div>
      <p className="mt-8 text-center text-xs text-tinta/50">{footer}</p>
    </div>
  )
}
