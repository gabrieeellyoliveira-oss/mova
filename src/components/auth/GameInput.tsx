import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { cn } from '@/lib/cn'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
  type?: 'email' | 'password' | 'text'
  /** Ícone à direita (ex.: envelope). Campos de senha mostram o olho no lugar. */
  icon?: ReactNode
  invalid?: boolean
}

/** Campo de formulário da janela de jogo: rótulo pixel, conteúdo em fonte limpa. */
export const GameInput = forwardRef<HTMLInputElement, Props>(function GameInput({ label, type = 'text', icon, invalid, id, className, ...props }, ref) {
  const [show, setShow] = useState(false)
  const password = type === 'password'
  return (
    <div className={className}>
      <label htmlFor={id} className="font-pixel text-[13px] font-bold uppercase tracking-[0.1em] text-vinho">{label}</label>
      <div className="relative mt-1.5">
        {password && <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C27880]" aria-hidden />}
        <input
          ref={ref}
          id={id}
          type={password && show ? 'text' : type}
          aria-invalid={invalid || undefined}
          className={cn(
            'h-12 w-full rounded-md border-2 bg-[#FDF0F0] pr-11 font-sans text-[15px] text-tinta transition-[border-color,box-shadow] placeholder:text-[#C99398]',
            'focus:border-cereja focus:bg-[#FFF7F6] focus:outline-none focus:ring-[3px] focus:ring-rosa/45',
            password ? 'pl-10' : 'pl-4',
            invalid ? 'border-cereja' : 'border-[#E3A9AE]',
          )}
          {...props}
        />
        {password ? (
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded text-[#B4626B] transition hover:text-vinho" aria-label={show ? 'Esconder senha' : 'Mostrar senha'}>
            {show ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        ) : (
          icon && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B4626B]" aria-hidden>{icon}</span>
        )}
      </div>
    </div>
  )
})
