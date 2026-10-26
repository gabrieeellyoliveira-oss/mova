import { useSyncExternalStore } from 'react'

/**
 * Controle global dos formulários (abrir "Novo gasto" ou "Guardar no cofre" de qualquer lugar,
 * inclusive do botão + do mobile). Cada formulário recebe `initial` opcional.
 */
export type FormKind = 'task' | 'transaction' | 'event' | 'deposit' | 'place' | 'book' | 'note'

export interface OpenForm {
  kind: FormKind
  /** item existente (edição) ou valores iniciais */
  initial?: Record<string, unknown>
}

let current: OpenForm | null = null
const listeners = new Set<() => void>()

export const openForm = (kind: FormKind, initial?: Record<string, unknown>) => {
  current = { kind, initial }
  listeners.forEach((l) => l())
}
export const closeForm = () => {
  current = null
  listeners.forEach((l) => l())
}

export const useOpenForm = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => current,
  )
