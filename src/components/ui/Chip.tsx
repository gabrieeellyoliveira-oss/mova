import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Chip({
  active, className, children, ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-md border-2 px-3 py-1 text-xs font-bold transition-[transform,background-color] duration-100 active:translate-y-px',
        active
          ? 'border-px-line bg-vinho-800 text-rosa-50 shadow-pixel-sm'
          : 'border-vinho/20 bg-px-panel text-vinho hover:-translate-y-px hover:border-px-line hover:bg-rosa-50',
        className,
      )}
      {...p}
    >
      {children}
    </button>
  )
}

export function Badge({ color, soft, children, className }: { color: string; soft?: string; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold', className)}
      style={{ color, backgroundColor: soft ?? `${color}1f` }}
    >
      {children}
    </span>
  )
}

export function Segmented<T extends string>({
  options, value, onChange, className,
}: { options: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={cn('inline-flex rounded-lg border-2 border-px-line bg-vinho-800 p-0.5', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-bold transition',
            value === o.value ? 'bg-rosa text-vinho shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)]' : 'text-rosa-50/70 hover:text-rosa-50',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
