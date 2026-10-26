import { memo } from 'react'
import { PALETTE, SPRITES, type SpriteName } from './pixelSprites'
import { cn } from '@/lib/cn'

/** Converte o sprite em retângulos (um por sequência horizontal da mesma cor). */
const runsCache = new Map<SpriteName, { x: number; y: number; w: number; c: string }[]>()
function runs(name: SpriteName) {
  const cached = runsCache.get(name)
  if (cached) return cached
  const out: { x: number; y: number; w: number; c: string }[] = []
  SPRITES[name].forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const ch = row[x]
      if (ch === '.') { x++; continue }
      let w = 1
      while (row[x + w] === ch) w++
      out.push({ x, y, w, c: PALETTE[ch] })
      x += w
    }
  })
  runsCache.set(name, out)
  return out
}

export const PixelIcon = memo(function PixelIcon({
  name, size = 24, className, title,
}: { name: SpriteName; size?: number; className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 12 12" width={size} height={size} shapeRendering="crispEdges"
      className={cn('shrink-0', className)} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {runs(name).map((r, i) => <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.c} />)}
    </svg>
  )
})

export type { SpriteName }
