import { PixelIcon } from '@/components/game/PixelIcon'
import { cn } from '@/lib/cn'

/** Caixa de marcar estilo jogo (quadrada, borda escura, check em pixel). */
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
        'grid shrink-0 place-items-center rounded-[5px] border-2 border-px-line transition-transform duration-150 hover:scale-105 active:scale-95',
        checked ? 'animate-pop' : 'bg-white/80',
      )}
      style={{ width: size, height: size, backgroundColor: checked ? color : undefined }}
    >
      {checked && <svg viewBox="0 0 8 8" width={size * 0.62} height={size * 0.62} shapeRendering="crispEdges" aria-hidden><path d="M1 4h1v1h1v1h1V5h1V4h1V3h1V2h1v1H7v1H6v1H5v1H4v1H3V6H2V5H1z" fill="#FFF5F1" /></svg>}
    </button>
  )
}

export { PixelIcon }
