import type { Entity } from '@/types'
import { uid, nowISO } from '@/utils/id'
import { createPersistedStore, useStore, type Store } from './createStore'

/** Repositório genérico para coleções de entidades (CRUD). */
export interface Collection<T extends Entity> {
  store: Store<T[]>
  add(data: Omit<T, 'id' | 'createdAt'>): T
  update(id: string, patch: Partial<T>): void
  remove(id: string): void
  replaceAll(items: T[]): void
  get(id: string): T | undefined
}

export function createCollection<T extends Entity>(key: string, seed: () => T[]): Collection<T> {
  const store = createPersistedStore<T[]>(key, seed)
  return {
    store,
    add(data) {
      const item = { ...data, id: uid(), createdAt: nowISO() } as T
      store.set((prev) => [...prev, item])
      return item
    },
    update(id, patch) {
      store.set((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
    },
    remove(id) {
      store.set((prev) => prev.filter((i) => i.id !== id))
    },
    replaceAll(items) {
      store.set(items)
    },
    get(id) {
      return store.get().find((i) => i.id === id)
    },
  }
}

export function useCollection<T extends Entity>(c: Collection<T>): T[] {
  return useStore(c.store)
}
