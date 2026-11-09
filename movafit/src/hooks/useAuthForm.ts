import { useEffect, useState, type FormEvent } from 'react'
import { cloudEnabled, createAccount, hasAccount, requestPasswordReset, resetAccount, signIn, updatePassword, useRecovery } from '@/lib/auth'

/**
 * criar / entrar · esqueci (nuvem: pede o e-mail; local: explica) · confirmar (nuvem: link
 * de confirmação enviado) · enviado (link de recuperação enviado) · nova-senha (voltou pelo link)
 */
export type AuthMode = 'criar' | 'entrar' | 'esqueci' | 'confirmar' | 'enviado' | 'nova-senha'
type Field = 'email' | 'password' | 'confirm'

/** Lógica da tela de acesso (sem visual): campos, validação e chamadas ao acesso. */
export function useAuthForm() {
  const recovery = useRecovery()
  const [mode, setMode] = useState<AuthMode>(() => (recovery ? 'nova-senha' : cloudEnabled || hasAccount() ? 'entrar' : 'criar'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<{ field?: Field; message: string } | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (recovery) setMode('nova-senha') }, [recovery])

  const go = (m: AuthMode) => {
    setMode(m)
    setError(null)
    setPassword('')
    setConfirm('')
  }
  const fail = (message: string, field?: Field) => setError({ field, message })
  const validEmail = () => /^\S+@\S+\.\S+$/.test(email.trim())
  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    try { await fn() } catch { fail('Não foi possível continuar agora. Tente atualizar a página.') } finally { setBusy(false) }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (mode === 'nova-senha') {
      if (password.length < 6) return fail('A senha precisa ter pelo menos 6 caracteres.', 'password')
      if (password !== confirm) return fail('As senhas não coincidem.', 'confirm')
      return run(async () => { const err = await updatePassword(password); if (err) fail(err, 'password') })
    }
    if (!validEmail()) return fail('Digite um e-mail válido.', 'email')
    if (mode === 'esqueci') {
      return run(async () => { const err = await requestPasswordReset(email); if (err) fail(err, 'email'); else go('enviado') })
    }
    if (mode === 'criar') {
      if (password.length < 6) return fail('A senha precisa ter pelo menos 6 caracteres.', 'password')
      if (password !== confirm) return fail('As senhas não coincidem.', 'confirm')
      return run(async () => {
        const r = await createAccount(email, password, remember)
        if (r.error) fail(r.error, 'email')
        else if (r.confirm) go('confirmar')
      })
    }
    if (!password) return fail('Digite sua senha.', 'password')
    return run(async () => {
      const err = await signIn(email, password, remember)
      if (err) fail(err, /senha/i.test(err) ? 'password' : 'email')
    })
  }

  /** Local: "esqueci a senha" apaga só o acesso (os dados do MOVA continuam) e volta para "Novo jogo". */
  const startOver = () => {
    resetAccount()
    go('criar')
  }

  return {
    mode, go, email, setEmail, password, setPassword, confirm, setConfirm, remember, setRemember,
    error, busy, submit, startOver, cloud: cloudEnabled, canCreate: cloudEnabled || !hasAccount(),
  }
}
