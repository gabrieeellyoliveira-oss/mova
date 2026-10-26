import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { clamp } from '@/utils/format'

/** Barra de progresso no estilo de jogo: trilho com borda e segmentos. */
export function Progress({
  value, color = '#961415', track, className, height = 8, segmented = true,
}: { value: number; color?: string; track?: string; className?: string; height?: number; segmented?: boolean }) {
  return (
    <div className={cn('px-track w-full', segmented && 'px-segments', className)} style={{ height: height + 4, backgroundColor: track }}>
      <div
        className="px-fill transition-[width] duration-700 ease-out"
        style={{ width: `${clamp(value)}%`, backgroundColor: color }}
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}

/** Anel de progresso (usado no cofre, trabalho, estudos e rotina) */
export function Ring({ value, size = 64, stroke = 7, color = '#961415', track = 'rgba(82,2,21,0.12)', children }: { value: number; size?: number; stroke?: number; color?: string; track?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="butt"
          strokeDasharray={c} strokeDashoffset={c - (clamp(value) / 100) * c}
          style={{ transition: 'stroke-dashoffset .8s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}
