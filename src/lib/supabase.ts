/**
 * Cliente do Supabase. Só existe quando VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
 * estão configuradas (Vercel → Environment Variables / arquivo .env.local).
 * Sem elas o MOVA continua funcionando só neste navegador, como antes.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const REMEMBER_KEY = 'mova:auth:remember'
/** "Lembrar de mim": guarda a sessão no localStorage; desligado, só até fechar o navegador. */
export const setRemember = (remember: boolean) => {
  try { localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0') } catch { /* bloqueado */ }
}
const remembering = () => { try { return localStorage.getItem(REMEMBER_KEY) !== '0' } catch { return true } }

const sessionStore = {
  getItem: (k: string) => { try { return localStorage.getItem(k) ?? sessionStorage.getItem(k) } catch { return null } },
  setItem: (k: string, v: string) => {
    try {
      const [keep, drop] = remembering() ? [localStorage, sessionStorage] : [sessionStorage, localStorage]
      keep.setItem(k, v)
      drop.removeItem(k)
    } catch { /* bloqueado */ }
  },
  removeItem: (k: string) => { try { localStorage.removeItem(k); sessionStorage.removeItem(k) } catch { /* bloqueado */ } },
}

export const supabase: SupabaseClient | null = url && anonKey
  ? createClient(url, anonKey, {
      auth: {
        storage: sessionStore,
        storageKey: 'mova:supabase:auth',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // links de confirmação/recuperação funcionam mesmo abertos em outro aparelho
        flowType: 'implicit',
      },
    })
  : null

export const cloudEnabled = !!supabase
