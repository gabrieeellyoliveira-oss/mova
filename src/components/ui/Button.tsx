import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'soft' | 'light' | 'danger' | 'olive'
type Size = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'

// botões arredondados e suaves; afundam um pouquinho ao clicar
const pressable = 'active:scale-[0.97]'
const variants: Record<Variant, string> = {
  primary: cn('bg-vinho text-white shadow-soft hover:bg-vinho-700', pressable),
  secondary: cn('bg-vinho-900 text-white hover:bg-vinho', pressable),
  soft: cn('bg-rosa-100 text-vinho hover:bg-rosa', pressable),
  light: cn('bg-white text-vinho shadow-pixel-sm hover:bg-rosa-50', pressable),
  olive: cn('bg-oliva text-white hover:bg-oliva-600', pressable),
  ghost: 'text-vinho hover:bg-vinho/10',
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
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-queimado focus-visible:ring-offset-2 focus-visible:ring-offset-px-field',
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

