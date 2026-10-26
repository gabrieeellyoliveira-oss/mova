import { useSyncExternalStore } from 'react'
import { uid } from '@/utils/id'

import type { SpriteName } from '@/components/game/pixelSprites'
import { burst } from '@/game/fx'

export type ToastKind = 'check' | 'sparkle' | 'heart' | 'info' | 'achievement'
export interface Toast {
  id: string
  title: string
  text?: string
  kind: ToastKind
  sprite?: SpriteName
}

let toasts: Toast[] = []
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function toast(title: string, opts: { text?: string; kind?: ToastKind; duration?: number; sprite?: SpriteName } = {}) {
  const t: Toast = { id: uid(), title, text: opts.text, kind: opts.kind ?? 'check', sprite: opts.sprite }
  toasts = [...toasts.slice(-2), t]
  emit()
  setTimeout(() => dismissToast(t.id), opts.duration ?? 3200)
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

export function useToasts() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => toasts,
  )
}

/** Mensagens carinhosas dos marcos do MOVA */
export const celebrate = {
  task: () => toast('Missão concluída!', { kind: 'check', duration: 1800 }),
  book: (title: string) => toast('Livro concluído ✨', { text: `“${title}” agora faz parte de você.`, kind: 'sparkle' }),
  goal: () => { toast('Você moveu mais uma parte da sua vida.', { kind: 'sparkle', duration: 4000 }); burst() },
  project: (name: string) => { toast('Projeto entregue! ✦', { text: name, kind: 'achievement', sprite: 'briefcase', duration: 4500 }); burst() },
  focus: (min: number) => toast(`${min} minutos de foco ✨`, { text: 'Sessão registrada nos seus estudos.', kind: 'sparkle' }),
}
