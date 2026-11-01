import { useEffect } from 'react'
import { useGame } from '@/game/useGame'
import { toast } from '@/hooks/useToast'

const SEEN_KEY = 'mova:game:achievements'
const load = <T,>(k: string, fallback: T): T => {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fallback } catch { return fallback }
}
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* ignore */ } }

/** Avisa quando uma conquista é desbloqueada (o primeiro carregamento só registra as atuais). */
export function GameWatcher() {
  const { achievements } = useGame()
  useEffect(() => {
    const unlocked = achievements.filter((a) => a.unlocked).map((a) => a.id)
    const seen = load<string[] | null>(SEEN_KEY, null)
    if (seen === null) return save(SEEN_KEY, unlocked)
    const fresh = achievements.filter((a) => a.unlocked && !seen.includes(a.id))
    fresh.forEach((a) => toast('Conquista desbloqueada!', { text: a.title, kind: 'achievement', sprite: a.sprite, duration: 4500 }))
    if (fresh.length) save(SEEN_KEY, Array.from(new Set([...seen, ...unlocked])))
  }, [achievements])
  return null
}
