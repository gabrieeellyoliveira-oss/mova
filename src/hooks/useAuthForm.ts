import { useState, type FormEvent } from 'react'
import { createAccount, hasAccount, resetAccount, signIn } from '@/lib/auth'

export type AuthMode = 'criar' | 'entrar' | 'esqueci'

/** Lógica da tela de acesso (sem visual): campos, validação e chamadas ao acesso local. */
export function useAuthForm() {
  const [mode, setMode] = useState<AuthMode>(() => (hasAccount() ? 'entrar' : 'criar'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<{ field?: 'email' | 'password' | 'confirm'; message: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const go = (m: AuthMode) => {
    setMode(m)
    setError(null)
    setPassword('')
    setConfirm('')
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError({ field: 'email', message: 'Digite um e-mail válido.' })
    if (mode === 'criar') {
      if (password.length < 6) return setError({ field: 'password', message: 'A senha precisa ter pelo menos 6 caracteres.' })
      if (password !== confirm) return setError({ field: 'confirm', message: 'As senhas não coincidem.' })
    } else if (!password) return setError({ field: 'password', message: 'Digite sua senha.' })
    setBusy(true)
    try {
      if (mode === 'criar') await createAccount(email, password, remember)
      else {
        const err = await signIn(email, password, remember)
        if (err) setError({ field: err.includes('Senha') ? 'password' : 'email', message: err })
      }
    } catch {
      setError({ message: 'Não foi possível entrar neste navegador. Tente atualizar a página.' })
    } finally {
      setBusy(false)
    }
  }

  /** Esqueci a senha: apaga só o acesso (os dados do MOVA continuam) e volta para "Novo jogo". */
  const startOver = () => {
    resetAccount()
    go('criar')
  }

  return {
    mode, go, email, setEmail, password, setPassword, confirm, setConfirm, remember, setRemember,
    error, busy, submit, startOver, canCreate: !hasAccount(),
  }
}
