import { cn } from '@/lib/cn'

/** Interruptor da janela de jogo: desligado = creme com vinho; ligado = vinho com indicador rosa claro. */
export function GameToggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="group inline-flex items-center gap-3 text-[15px] text-tinta">
      <span className={cn('relative h-7 w-[52px] rounded-full border-2 border-vinho transition-colors duration-200', checked ? 'bg-vinho' : 'bg-[#FFF1EA]')}>
        <span
          className={cn(
            'absolute top-[3px] h-[18px] w-[18px] rounded-full transition-all duration-200 ease-out',
            checked ? 'left-[27px] bg-[#FBD3D6] shadow-[0_0_0_2px_rgba(255,255,255,0.25)]' : 'left-[3px] bg-vinho',
          )}
        />
      </span>
      {label}
    </button>
  )
}
