import { useEffect, useRef, useState } from 'react'
import { useGame } from '@/game/useGame'
import { toast } from '@/hooks/useToast'
import { burst } from '@/game/fx'
import { PixelIcon } from './PixelIcon'
import { Button } from '@/components/ui/Button'

const LEVEL_KEY = 'mova:game:level'
const SEEN_KEY = 'mova:game:achievements'
const load = <T,>(k: string, fallback: T): T => {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fallback } catch { return fallback }
}
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* ignore */ } }

interface Particle { id: number; x: number; y: number; dx: number; dy: number; color: string; size: number }
const COLORS = ['#EFAFB3', '#E3A548', '#961415', '#FFF5F1', '#CB757C']

/**
 * Observa o XP/nível/conquistas e dá o feedback de jogo:
 * "+N XP" flutuante, LEVEL UP!, CONQUISTA DESBLOQUEADA! e explosão de estrelas.
 */
export function GameWatcher() {
  const g = useGame()
  const prevTotal = useRef<number | null>(null)
  const [floats, setFloats] = useState<{ id: number; amount: number }[]>([])
  const [levelUp, setLevelUp] = useState<number | null>(null)
  const [particles, setParticles] = useState<Particle[]>([])

  // +XP flutuante
  useEffect(() => {
    if (prevTotal.current !== null && g.total > prevTotal.current) {
      const id = Date.now()
      const amount = g.total - prevTotal.current // calcula antes: o ref muda logo abaixo
      setFloats((f) => [...f.slice(-2), { id, amount }])
      setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1700)
    }
    prevTotal.current = g.total
  }, [g.total])

  // LEVEL UP (o primeiro carregamento só registra o nível atual)
  useEffect(() => {
    const last = load<number | null>(LEVEL_KEY, null)
    if (last === null) save(LEVEL_KEY, g.level)
    else if (g.level > last) {
      setLevelUp(g.level)
      save(LEVEL_KEY, g.level)
      burst()
    } else if (g.level < last) save(LEVEL_KEY, g.level)
  }, [g.level])

  // conquistas novas
  useEffect(() => {
    const unlocked = g.achievements.filter((a) => a.unlocked).map((a) => a.id)
    const seen = load<string[] | null>(SEEN_KEY, null)
    if (seen === null) return save(SEEN_KEY, unlocked)
    const fresh = g.achievements.filter((a) => a.unlocked && !seen.includes(a.id))
    fresh.forEach((a) => toast('Conquista desbloqueada!', { text: a.title, kind: 'achievement', sprite: a.sprite, duration: 4500 }))
    if (fresh.length) { save(SEEN_KEY, Array.from(new Set([...seen, ...unlocked]))); burst() }
  }, [g.achievements])

  // explosão de estrelas/pixels
  useEffect(() => {
    const on = (e: Event) => {
      const { x, y } = (e as CustomEvent).detail ?? {}
      const cx = x ?? window.innerWidth / 2
      const cy = y ?? window.innerHeight / 2
      const batch: Particle[] = Array.from({ length: 18 }, (_, i) => {
        const ang = (i / 18) * Math.PI * 2
        const dist = 60 + Math.random() * 70
        return { id: Date.now() + i, x: cx, y: cy, dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist, color: COLORS[i % COLORS.length], size: 6 + (i % 3) * 3 }
      })
      setParticles((p) => [...p, ...batch])
      setTimeout(() => setParticles((p) => p.filter((q) => !batch.includes(q))), 800)
    }
    window.addEventListener('mova:burst', on)
    return () => window.removeEventListener('mova:burst', on)
  }, [])

  return (
    <>
      <div className="pointer-events-none fixed bottom-36 left-1/2 z-[70] -translate-x-1/2 lg:bottom-24">
        {floats.map((f) => (
          <div key={f.id} className="animate-xp-rise rounded-md border-2 border-px-line bg-px-gold px-3 py-1 font-pixel text-lg font-bold text-vinho-900 shadow-pixel-sm">+{f.amount} XP</div>
        ))}
      </div>
      {particles.map((p) => (
        <span
          key={p.id}
          className="pointer-events-none fixed z-[80] animate-burst"
          style={{ left: p.x, top: p.y, width: p.size, height: p.size, backgroundColor: p.color, boxShadow: '0 0 0 1px #2b0910', ['--bx' as string]: `${p.dx}px`, ['--by' as string]: `${p.dy}px` }}
        />
      ))}
      {levelUp !== null && (
        <div className="fixed inset-0 z-[75] grid place-items-center bg-vinho-950/60 p-6" onClick={() => setLevelUp(null)}>
          <div className="w-full max-w-sm animate-level-in rounded-px border-2 border-px-line bg-px-panel p-6 text-center shadow-pixel" onClick={(e) => e.stopPropagation()}>
            <PixelIcon name="star" size={64} className="mx-auto animate-bob" />
            <p className="mt-3 font-pixel text-4xl font-bold text-cereja">LEVEL UP!</p>
            <p className="mt-1 font-pixel text-lg text-vinho">Você chegou ao nível {levelUp} ✦</p>
            <Button className="mt-5 w-full" onClick={() => setLevelUp(null)}>Continuar</Button>
          </div>
        </div>
      )}
    </>
  )
}
