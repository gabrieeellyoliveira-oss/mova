import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Checkbox({
  checked, onChange, label, color = '#961415', size = 22,
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
        'grid shrink-0 place-items-center rounded-[9px] border-2 transition-all duration-200 hover:scale-105',
        checked ? 'animate-pop' : 'bg-quente',
      )}
      style={{ width: size, height: size, borderColor: color, backgroundColor: checked ? color : undefined }}
    >
      {checked && <Check size={size * 0.62} strokeWidth={3.2} className="text-quente" />}
    </button>
  )
}
