import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'soft' | 'light' | 'danger' | 'olive'
type Size = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'

const variants: Record<Variant, string> = {
  primary: 'bg-cereja text-quente hover:bg-cereja-600 shadow-soft',
  secondary: 'bg-vinho text-quente hover:bg-vinho-700 shadow-soft',
  soft: 'bg-rosa-100 text-vinho hover:bg-rosa',
  light: 'bg-quente text-vinho hover:bg-creme-100 shadow-soft',
  ghost: 'text-vinho hover:bg-vinho/5',
  danger: 'bg-transparent text-cereja hover:bg-cereja/10',
  olive: 'bg-oliva text-quente hover:bg-oliva-600 shadow-soft',
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
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-queimado focus-visible:ring-offset-2 focus-visible:ring-offset-creme',
        'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
