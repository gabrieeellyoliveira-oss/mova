import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { clamp } from '@/utils/format'

export function Progress({
  value, color = '#961415', track, className, height = 8,
}: { value: number; color?: string; track?: string; className?: string; height?: number }) {
  return (
    <div className={cn('w-full overflow-hidden rounded-full bg-vinho/[0.08]', className)} style={{ height, backgroundColor: track }}>
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${clamp(value)}%`, backgroundColor: color }}
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}

/** Anel de progresso (usado em leitura/estudos) */
export function Ring({ value, size = 64, stroke = 7, color = '#961415', track = 'rgba(82,2,21,0.1)', children }: { value: number; size?: number; stroke?: number; color?: string; track?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (clamp(value) / 100) * c}
          style={{ transition: 'stroke-dashoffset .8s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}
