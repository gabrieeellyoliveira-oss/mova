import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { cn } from '@/lib/cn'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
  type?: 'email' | 'password' | 'text'
  icon?: ReactNode
  invalid?: boolean
}

/** Campo da tela de acesso: rótulo, ícone e olho para mostrar/esconder a senha. */
export const AuthField = forwardRef<HTMLInputElement, Props>(function AuthField({ label, type = 'text', icon, invalid, id, ...props }, ref) {
  const [show, setShow] = useState(false)
  const password = type === 'password'
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-tinta">{label}</label>
      <div className="relative mt-1.5">
        {password && <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-vinho/45" aria-hidden />}
        <input
          ref={ref}
          id={id}
          type={password && show ? 'text' : type}
          aria-invalid={invalid || undefined}
          className={cn(
            'h-12 w-full rounded-2xl border bg-white pr-12 text-[15px] text-tinta transition placeholder:text-vinho/35 focus:border-queimado focus:outline-none focus:ring-4 focus:ring-rosa/50',
            password ? 'pl-11' : 'pl-4',
            invalid ? 'border-[#C0466A]' : 'border-px-line',
          )}
          {...props}
        />
        {password ? (
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-vinho/60 hover:bg-rosa-50 hover:text-vinho" aria-label={show ? 'Esconder senha' : 'Mostrar senha'}>
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : (
          icon && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-vinho/45" aria-hidden>{icon}</span>
        )}
      </div>
    </div>
  )
})
