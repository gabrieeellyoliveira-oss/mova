/**
 * Acesso local do MOVA.
 *
 * Enquanto os dados ficam só neste navegador (LocalStorage), o login também é
 * local: e-mail + hash SHA-256 da senha com sal. Protege o dashboard de quem
 * abrir o navegador, mas não é uma conta online. Quando o Supabase entrar,
 * trocar estas funções pelo Supabase Auth (signInWithPassword, signUp, signOut).
 */
import { useSyncExternalStore } from 'react'

interface Account {
  email: string
  salt: string
  hash: string
}

const ACCOUNT_KEY = 'mova:auth:account'
const SESSION_KEY = 'mova:auth:session'

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

let session: string | null = read<string>(sessionStorage, SESSION_KEY) ?? read<string>(localStorage, SESSION_KEY)
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export const hasAccount = () => !!read<Account>(localStorage, ACCOUNT_KEY)

export async function createAccount(email: string, password: string, remember: boolean) {
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)).buffer)
  write(localStorage, ACCOUNT_KEY, { email: normalizeEmail(email), salt, hash: await hashPassword(password, salt) } satisfies Account)
  startSession(normalizeEmail(email), remember)
}

/** Retorna uma mensagem de erro ou null quando deu certo. */
export async function signIn(email: string, password: string, remember: boolean): Promise<string | null> {
  const acc = read<Account>(localStorage, ACCOUNT_KEY)
  if (!acc) return 'Ainda não existe um acesso neste navegador.'
  if (normalizeEmail(email) !== acc.email) return 'Esse e-mail não é o deste acesso.'
  if ((await hashPassword(password, acc.salt)) !== acc.hash) return 'Senha incorreta. Tente de novo.'
  startSession(acc.email, remember)
  return null
}

function startSession(email: string, remember: boolean) {
  session = email
  write(remember ? localStorage : sessionStorage, SESSION_KEY, email)
  emit()
}

export function signOut() {
  session = null
  write(localStorage, SESSION_KEY, null)
  write(sessionStorage, SESSION_KEY, null)
  emit()
}

/** Esqueci a senha: apaga só o acesso (os dados do MOVA continuam). */
export function resetAccount() {
  write(localStorage, ACCOUNT_KEY, null)
  signOut()
}

export const useSession = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => session,
  )
