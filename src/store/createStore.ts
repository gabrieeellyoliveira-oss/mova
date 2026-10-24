import { useSyncExternalStore } from 'react'
import { activeAdapter } from '@/lib/storage'

type Listener = () => void

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
