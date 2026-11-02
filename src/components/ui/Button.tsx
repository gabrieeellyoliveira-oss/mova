import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'soft' | 'light' | 'danger' | 'olive'
type Size = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'

// botões em pílula: lavanda com borda de tinta (principal), tinta, contorno ou suaves
const pressable = 'active:scale-[0.97]'
const variants: Record<Variant, string> = {
  primary: cn('border-2 border-ink bg-lavanda text-ink hover:brightness-105', pressable),
  secondary: cn('border-2 border-ink bg-ink text-ink-fg hover:bg-ink-soft', pressable),
  soft: cn('border-2 border-ink bg-lavanda-100 text-ink hover:bg-lavanda-200', pressable),
  light: cn('border-2 border-ink bg-quente text-ink hover:bg-lavanda-100', pressable),
  olive: cn('border-2 border-ink bg-salvia text-ink hover:brightness-105', pressable),
  ghost: 'text-ink hover:bg-ink/10',
  danger: 'text-cereja hover:bg-cereja/10',
}
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3.5 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-7 text-[15px] gap-2',
  icon: 'h-10 w-10',
  'icon-sm': 'h-8 w-8',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold transition-[transform,box-shadow,background-color] duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavanda focus-visible:ring-offset-2 focus-visible:ring-offset-px-field',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

