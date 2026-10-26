/**
 * Acesso ao MOVA.
 *
 * Com o Supabase configurado: Supabase Auth (e-mail + senha, confirmação e
 * recuperação de senha por e-mail) e os dados sincronizados na nuvem (`cloudSync`).
 * Sem ele: acesso local a este navegador (e-mail + hash SHA-256 com sal no
 * localStorage), como antes.
 */
import { useSyncExternalStore } from 'react'
import type { User } from '@supabase/supabase-js'
import { cloudEnabled, setRemember, supabase } from './supabase'
import { startSync, stopSync } from './cloudSync'

export { cloudEnabled }

interface Account {
  email: string
  salt: string
  hash: string
}

const ACCOUNT_KEY = 'mova:auth:account'
const SESSION_KEY = 'mova:auth:session'
const KNOWN_KEY = 'mova:auth:known'

const read = <T,>(s: Storage, k: string): T | null => {
  try {
    const raw = s.getItem(k)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}
const write = (s: Storage, k: string, v: unknown) => {
  try {
    if (v === null) s.removeItem(k)
    else s.setItem(k, JSON.stringify(v))
  } catch {
    /* armazenamento bloqueado */
  }
}

const toHex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
async function hashPassword(password: string, salt: string) {
  return toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${password}`)))
}
const normalizeEmail = (e: string) => e.trim().toLowerCase()

/* ---------- estado da sessão ---------- */

/** e-mail logado · null = ninguém · undefined = ainda carregando (nuvem) */
type SessionState = string | null | undefined
let session: SessionState = cloudEnabled ? undefined : read<string>(sessionStorage, SESSION_KEY) ?? read<string>(localStorage, SESSION_KEY)
/** Chegou pelo link de "esqueci minha senha": falta escolher a senha nova. */
let recovery = cloudEnabled && typeof window !== 'undefined' && /type=recovery/.test(window.location.hash)
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const setSession = (s: SessionState) => { session = s; emit() }

async function enter(user: User | null) {
  if (!user) {
    await stopSync()
    setSession(null)
    return
  }
  if (recovery) { setSession(null); return }
  try { localStorage.setItem(KNOWN_KEY, '1') } catch { /* bloqueado */ }
  await startSync(user.id)
  if (recovery) { setSession(null); return } // o link de recuperação chegou enquanto carregava
  setSession(user.email ?? 'conta')
}

if (supabase) {
  supabase.auth.getSession().then(({ data }) => enter(data.session?.user ?? null))
  supabase.auth.onAuthStateChange((event, s) => {
    if (event === 'PASSWORD_RECOVERY') { recovery = true; emit() }
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'PASSWORD_RECOVERY' || event === 'USER_UPDATED')
      setTimeout(() => enter(s?.user ?? null)) // fora do callback, como pede o supabase-js
  })
}

/* ---------- mensagens em português ---------- */

function pt(message: string) {
  const m = message.toLowerCase()
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.'
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail pelo link que enviamos e tente de novo.'
  if (m.includes('already registered') || m.includes('already been registered')) return 'Esse e-mail já tem acesso. Use "Continuar jogo".'
  if (m.includes('password should be') || m.includes('weak')) return 'Escolha uma senha mais forte (pelo menos 6 caracteres).'
  if (m.includes('rate limit') || m.includes('security purposes')) return 'Muitas tentativas seguidas. Espere um minutinho e tente de novo.'
  if (m.includes('signups not allowed') || m.includes('signup is disabled')) return 'Novos cadastros estão desligados neste MOVA.'
  if (m.includes('same') && m.includes('password')) return 'A senha nova precisa ser diferente da anterior.'
  if (m.includes('fetch') || m.includes('network')) return 'Sem conexão agora. Confira a internet e tente de novo.'
  return 'Algo deu errado. Tente de novo em instantes.'
}

/* ---------- ações ---------- */

export const hasAccount = () =>
  cloudEnabled ? (() => { try { return localStorage.getItem(KNOWN_KEY) === '1' } catch { return false } })() : !!read<Account>(localStorage, ACCOUNT_KEY)

/** Cria o acesso. Na nuvem pode pedir confirmação por e-mail antes de entrar. */
export async function createAccount(email: string, password: string, remember: boolean): Promise<{ error?: string; confirm?: boolean }> {
  if (supabase) {
    setRemember(remember)
    const { data, error } = await supabase.auth.signUp({ email: normalizeEmail(email), password, options: { emailRedirectTo: window.location.origin } })
    if (error) return { error: pt(error.message) }
    if (data.user && data.user.identities?.length === 0) return { error: pt('already registered') }
    return data.session ? {} : { confirm: true }
  }
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)).buffer)
  write(localStorage, ACCOUNT_KEY, { email: normalizeEmail(email), salt, hash: await hashPassword(password, salt) } satisfies Account)
  startLocalSession(normalizeEmail(email), remember)
  return {}
}

/** Retorna uma mensagem de erro ou null quando deu certo. */
export async function signIn(email: string, password: string, remember: boolean): Promise<string | null> {
  if (supabase) {
    setRemember(remember)
    const { error } = await supabase.auth.signInWithPassword({ email: normalizeEmail(email), password })
    return error ? pt(error.message) : null
  }
  const acc = read<Account>(localStorage, ACCOUNT_KEY)
  if (!acc) return 'Ainda não existe um acesso neste navegador.'
  if (normalizeEmail(email) !== acc.email) return 'Esse e-mail não é o deste acesso.'
  if ((await hashPassword(password, acc.salt)) !== acc.hash) return 'Senha incorreta. Tente de novo.'
  startLocalSession(acc.email, remember)
  return null
}

function startLocalSession(email: string, remember: boolean) {
  write(remember ? localStorage : sessionStorage, SESSION_KEY, email)
  setSession(email)
}

export async function signOut() {
  if (supabase) {
    await supabase.auth.signOut()
    return
  }
  write(localStorage, SESSION_KEY, null)
  write(sessionStorage, SESSION_KEY, null)
  setSession(null)
}

/** Nuvem: manda o link de recuperação para o e-mail. */
export async function requestPasswordReset(email: string): Promise<string | null> {
  if (!supabase) return null
  const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), { redirectTo: window.location.origin })
  return error ? pt(error.message) : null
}

/** Nuvem: grava a senha nova depois do link de recuperação e entra. */
export async function updatePassword(password: string): Promise<string | null> {
  if (!supabase) return null
  const { data, error } = await supabase.auth.updateUser({ password })
  if (error) return pt(error.message)
  recovery = false
  await enter(data.user)
  return null
}

/** Local: "esqueci a senha" apaga só o acesso (os dados do MOVA continuam). */
export function resetAccount() {
  write(localStorage, ACCOUNT_KEY, null)
  signOut()
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
export const useSession = () => useSyncExternalStore(subscribe, () => session)
export const useRecovery = () => useSyncExternalStore(subscribe, () => recovery)
