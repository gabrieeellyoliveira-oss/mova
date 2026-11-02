import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

/** Caixa de marcar: quadrada, borda de tinta, preenchida ao marcar. */
export function Checkbox({
  checked, onChange, label, color = '#0C0A0E', size = 22,
}: { checked: boolean; onChange: (v: boolean) => void; label?: string; color?: string; size?: number }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onChange(!checked)
      }}
      className={cn(
        'grid shrink-0 place-items-center rounded-md border-2 border-ink transition-transform duration-150 hover:scale-105 active:scale-95',
        checked ? 'animate-pop' : 'bg-quente',
      )}
      style={{ width: size, height: size, backgroundColor: checked ? color : undefined }}
    >
      {checked && <svg viewBox="0 0 24 24" width={size * 0.7} height={size * 0.7} fill="none" stroke="#F6F1E7" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
    </button>
  )
}

export { Icon }
