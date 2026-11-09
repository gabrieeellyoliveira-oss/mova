import { useSyncExternalStore } from 'react'
import { activeAdapter } from '@/lib/storage'

type Listener = () => void

/** Stores por chave, para a sincronização trocar o conteúdo quando chegam dados da nuvem. */
const registry = new Map<string, { get: () => unknown; hydrate: (value: unknown) => void }>()
/** Troca o conteúdo de um store sem gravar de novo (os dados vieram da nuvem). */
export const hydrateStore = (key: string, value: unknown) => registry.get(key)?.hydrate(value)
/** Chave e conteúdo atual de todos os stores (para a primeira subida à nuvem). */
export const snapshotStores = () => [...registry.entries()].map(([key, s]) => [key, s.get()] as const)

export interface Store<T> {
  get(): T
  set(next: T | ((prev: T) => T)): void
  subscribe(l: Listener): () => void
  reset(): void
}

/** Store reativo persistido pelo adapter ativo. */
export function createPersistedStore<T>(key: string, seed: () => T): Store<T> {
  let state: T = activeAdapter.load<T>(key) ?? seed()
  const listeners = new Set<Listener>()
  const emit = () => listeners.forEach((l) => l())
  registry.set(key, { get: () => state, hydrate: (value) => { state = value as T; emit() } })

  return {
    get: () => state,
    set(next) {
      state = typeof next === 'function' ? (next as (p: T) => T)(state) : next
      activeAdapter.save(key, state)
      emit()
    },
    subscribe(l) {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    reset() {
      state = seed()
      activeAdapter.save(key, state)
      emit()
    },
  }
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}
