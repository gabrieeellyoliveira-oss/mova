import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Chip({
  active, className, children, ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150',
        active
          ? 'border-ink bg-lavanda text-ink'
          : 'border-ink bg-quente text-ink hover:bg-lavanda-100',
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
      className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold', className)}
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
    <div className={cn('inline-flex rounded-full border-2 border-ink bg-quente p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
            value === o.value ? 'bg-ink text-ink-fg' : 'text-ink/60 hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
