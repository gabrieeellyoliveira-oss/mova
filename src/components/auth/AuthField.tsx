import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { cn } from '@/lib/cn'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
  type?: 'email' | 'password' | 'text'
  icon?: ReactNode
  invalid?: boolean
}

/** Campo da tela de acesso (sobre o cartão escuro): contorno claro, ícone à esquerda e olho para a senha. */
export const AuthField = forwardRef<HTMLInputElement, Props>(function AuthField({ label, type = 'text', icon, invalid, id, ...props }, ref) {
  const [show, setShow] = useState(false)
  const password = type === 'password'
  const lead = password ? <Lock size={22} strokeWidth={1.6} /> : icon
  return (
    <div>
      <label htmlFor={id} className="sr-only">{label}</label>
      <div className="relative">
        {lead && <span className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-ink-fg/90" aria-hidden>{lead}</span>}
        <input
          ref={ref}
          id={id}
          type={password && show ? 'text' : type}
          aria-invalid={invalid || undefined}
          className={cn(
            'h-[68px] w-full rounded-2xl border-2 bg-transparent text-lg text-ink-fg transition placeholder:text-ink-fg/80 focus:outline-none focus:ring-4 focus:ring-lavanda/40',
            lead ? 'pl-[68px]' : 'pl-6',
            password ? 'pr-16' : 'pr-6',
            invalid ? 'border-[#E07A8C]' : 'border-ink-fg/85 focus:border-lavanda',
          )}
          {...props}
        />
        {password && (
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-ink-fg/90 hover:bg-ink-fg/10" aria-label={show ? 'Esconder senha' : 'Mostrar senha'}>
            {show ? <Eye size={22} strokeWidth={1.6} /> : <EyeOff size={22} strokeWidth={1.6} />}
          </button>
        )}
      </div>
    </div>
  )
})
