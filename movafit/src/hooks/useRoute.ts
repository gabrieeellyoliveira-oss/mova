import { useSyncExternalStore } from 'react'

export type Route = 'hoje' | 'programas' | 'historico' | 'evolucao'
const ROUTES: Route[] = ['hoje', 'programas', 'historico', 'evolucao']

const read = (): Route => {
  const r = window.location.hash.replace(/^#\/?/, '').split('?')[0] as Route
  return ROUTES.includes(r) ? r : 'hoje'
}
const subscribe = (l: () => void) => {
  window.addEventListener('hashchange', l)
  return () => window.removeEventListener('hashchange', l)
}

/** Rota pelo # da URL (funciona em qualquer hospedagem estática). */
export const useRoute = () => useSyncExternalStore(subscribe, read)
export const navigate = (r: Route) => {
  window.location.hash = r === 'hoje' ? '/' : `/${r}`
  window.scrollTo({ top: 0 })
}
