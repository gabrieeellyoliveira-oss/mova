import { useState, type ReactNode } from 'react'
import { Star as StarIcon, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './Button'
import { Flower } from '@/components/doodles/Doodles'

export function EmptyState({ title, text, action, doodle }: { title: string; text?: string; action?: ReactNode; doodle?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-vinho/15 px-6 py-10 text-center">
      {doodle ?? <Flower size={44} className="animate-wiggle" />}
      <p className="mt-1 font-bold text-vinho">{title}</p>
      {text && <p className="max-w-xs text-sm text-vinho/60">{text}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function StarRating({ value, onChange, size = 20 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  if (!onChange)
    return (
      <div className="inline-flex gap-0.5" aria-label={`${value} de 5 estrelas`}>
        {[1, 2, 3, 4, 5].map((n) => <StarIcon key={n} size={size} className={n <= value ? 'fill-cereja text-cereja' : 'text-vinho/25'} />)}
      </div>
    )
  return (
    <div className="inline-flex gap-0.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n === value ? 0 : n)}
          className={'transition-transform hover:scale-110'}
          aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
        >
          <StarIcon size={size} className={n <= shown ? 'fill-cereja text-cereja' : 'text-vinho/25'} />
        </button>
      ))}
    </div>
  )
}

/** Botão de excluir com confirmação em dois cliques (sem diálogo extra). */
export function DeleteButton({ onConfirm, label = 'Excluir', compact }: { onConfirm: () => void; label?: string; compact?: boolean }) {
  const [armed, setArmed] = useState(false)
  return (
    <Button
      variant="danger"
      size={compact ? 'icon-sm' : 'md'}
      onClick={(e) => {
        e.stopPropagation()
        if (armed) onConfirm()
        else {
          setArmed(true)
          setTimeout(() => setArmed(false), 2500)
        }
      }}
      aria-label={label}
      title={armed ? 'Clique de novo para confirmar' : label}
      className={cn(armed && 'bg-cereja text-quente hover:bg-cereja', compact && armed && 'w-auto px-3')}
    >
      <Trash2 size={compact ? 15 : 16} />
      {(!compact || armed) && <span>{armed ? 'Confirmar?' : label}</span>}
    </Button>
  )
}

export function SectionTitle({ children, kicker, action, className }: { children: ReactNode; kicker?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 flex items-end justify-between gap-3', className)}>
      <div>
        {kicker && <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-queimado">{kicker}</p>}
        <h2 className="font-heading text-lg text-vinho sm:text-xl">{children}</h2>
      </div>
      {action}
    </div>
  )
}
