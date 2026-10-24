import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createAccount, hasAccount, resetAccount, signIn } from '@/lib/auth'
import { LoginArt } from '@/components/auth/LoginArt'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/Button'
import { Field, Input, Toggle } from '@/components/ui/Form'

export default function Login() {
  const [mode, setMode] = useState<'entrar' | 'criar'>(() => (hasAccount() ? 'entrar' : 'criar'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [forgot, setForgot] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Digite um e-mail válido.')
    if (mode === 'criar') {
      if (password.length < 6) return setError('A senha precisa ter pelo menos 6 caracteres.')
      if (password !== confirm) return setError('As senhas não são iguais.')
    }
    setBusy(true)
    try {
      if (mode === 'criar') await createAccount(email, password, remember)
      else {
        const err = await signIn(email, password, remember)
        if (err) setError(err)
      }
    } catch {
      setError('Não foi possível entrar neste navegador. Tente atualizar a página.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-dvh overflow-x-hidden bg-[#FAE8D7] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="flex items-center justify-center px-6 pb-2 pt-8 lg:p-12">
        <LoginArt className="max-w-[300px] sm:max-w-[400px] lg:max-w-[600px]" />
      </div>

      <div className="flex items-start justify-center px-4 pb-10 lg:items-center lg:p-12">
        <div className="w-full max-w-md rounded-4xl bg-quente p-7 shadow-lift animate-rise sm:p-9">
          <Logo />
          <h1 className="mt-6 font-display text-3xl leading-tight text-vinho">
            {mode === 'entrar' ? 'Que bom te ver de novo' : 'Vamos começar?'}
          </h1>
          <p className="mt-1.5 text-sm text-vinho/70">
            {mode === 'entrar' ? 'Entre para continuar movendo o seu dia.' : 'Crie seu acesso ao MOVA neste navegador.'}
          </p>

          {forgot ? (
            <div className="mt-6 space-y-4 rounded-3xl bg-rosa-50 p-5">
              <p className="text-sm text-vinho">
                Como o acesso fica salvo neste navegador, não dá para recuperar a senha. Você pode criar um acesso novo: <b>seus dados do MOVA continuam aqui</b>.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => { resetAccount(); setForgot(false); setMode('criar'); setPassword(''); setConfirm(''); setError(null) }}>Criar novo acesso</Button>
                <Button variant="ghost" onClick={() => setForgot(false)}>Voltar</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
              <Field label="E-mail">
                <Input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
              </Field>
              <Field label="Senha">
                <div className="relative">
                  <Input
                    id="login-password" type={show ? 'text' : 'password'} autoComplete={mode === 'entrar' ? 'current-password' : 'new-password'}
                    value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'criar' ? 'Pelo menos 6 caracteres' : 'Sua senha'} className="pr-11"
                  />
                  <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-vinho/50 hover:text-vinho" aria-label={show ? 'Esconder senha' : 'Mostrar senha'}>
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </Field>
              {mode === 'criar' && (
                <Field label="Confirmar senha">
                  <Input id="login-confirm" type={show ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repita a senha" />
                </Field>
              )}
              <div className="flex items-center justify-between gap-3">
                <Toggle checked={remember} onChange={setRemember} label="Lembrar de mim" />
                {mode === 'entrar' && (
                  <button type="button" onClick={() => setForgot(true)} className="text-xs font-semibold text-cereja hover:underline">Esqueci minha senha</button>
                )}
              </div>
              {error && <p role="alert" className="rounded-2xl bg-rosa-100 px-4 py-2.5 text-sm font-medium text-cereja">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy && <Loader2 size={18} className="animate-spin" />}
                {mode === 'entrar' ? 'Entrar' : 'Criar acesso'}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-vinho/50">Seu acesso e seus dados ficam salvos só neste navegador.</p>
        </div>
      </div>
    </div>
  )
}
