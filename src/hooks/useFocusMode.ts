import { useSyncExternalStore } from 'react'

/** Modo foco: tela calma com a missão atual e o cronômetro. */
let open = false
const listeners = new Set<() => void>()
export const setFocusMode = (v: boolean) => { open = v; listeners.forEach((l) => l()) }
export const useFocusMode = () =>
  useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => open)
