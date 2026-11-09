import { useSyncExternalStore } from 'react'

export type Route = 'hoje' | 'historico'

const read = (): Route => (window.location.hash.replace(/^#\/?/, '') === 'historico' ? 'historico' : 'hoje')
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
