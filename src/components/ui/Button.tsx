import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'soft' | 'light' | 'danger' | 'olive'
type Size = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'

// botões "de jogo": borda escura, sombra dura embaixo e afundam ao clicar
const pressable = 'border-2 border-px-line shadow-pixel-sm active:translate-y-[2px] active:shadow-pixel-press'
const variants: Record<Variant, string> = {
  primary: cn('bg-cereja text-rosa-50 hover:bg-cereja-600', pressable),
  secondary: cn('bg-vinho text-rosa-50 hover:bg-vinho-700', pressable),
  soft: cn('bg-rosa-100 text-vinho hover:bg-rosa', pressable),
  light: cn('bg-px-panel text-vinho hover:bg-rosa-50', pressable),
  olive: cn('bg-oliva text-rosa-50 hover:bg-oliva-600', pressable),
  ghost: 'text-vinho hover:bg-vinho/10',
  danger: 'text-cereja hover:bg-cereja/10',
}
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2',
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
        'inline-flex shrink-0 items-center justify-center rounded-lg font-bold transition-[transform,box-shadow,background-color] duration-100',
        'hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-queimado focus-visible:ring-offset-2 focus-visible:ring-offset-px-field',
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

/** Nome de jogo para o mesmo botão */
export const PixelButton = Button
