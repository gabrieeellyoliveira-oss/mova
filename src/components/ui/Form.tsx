import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const control =
  'w-full rounded-xl border border-px-line bg-white px-3.5 text-sm text-tinta placeholder:text-vinho/35 transition focus:border-queimado focus:outline-none focus:ring-2 focus:ring-rosa/70'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => (
  <input ref={ref} className={cn(control, 'h-11', className)} {...p} />
))
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => (
  <textarea ref={ref} className={cn(control, 'min-h-[90px] resize-y py-3', className)} {...p} />
))
Textarea.displayName = 'Textarea'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...p }, ref) => (
  <select
    ref={ref}
    className={cn(
      control,
      'h-11 cursor-pointer appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%278%27 fill=%27none%27 stroke=%27%235B2448%27 stroke-width=%271.8%27 stroke-linecap=%27round%27%3E%3Cpath d=%27M1 1.5l5 5 5-5%27/%3E%3C/svg%3E")] bg-[right_14px_center] bg-no-repeat pr-9',
      className,
    )}
    {...p}
  >
    {children}
  </select>
))
Select.displayName = 'Select'

/**
 * Campo com rótulo. `group` = vários controles (botões, chips, cores): usa um grupo com nome
 * em vez de <label>, para o clique no rótulo não acionar o primeiro botão.
 */
export function Field({ label, hint, children, className, group }: { label: string; hint?: string; children: ReactNode; className?: string; group?: boolean }) {
  const id = useId()
  const title = <span id={id} className="mb-1.5 block text-[13px] font-semibold text-vinho/80">{label}</span>
  const help = hint && <span className="mt-1 block text-xs text-vinho/50">{hint}</span>
  if (group) return <div role="group" aria-labelledby={id} className={cn('block', className)}>{title}{children}{help}</div>
  return <label className={cn('block', className)}>{title}{children}{help}</label>
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-sm text-tinta"
    >
      <span className={cn('relative h-6 w-11 rounded-full transition', checked ? 'bg-vinho' : 'bg-nevoa')}>
        <span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all', checked ? 'left-[24px]' : 'left-1')} />
      </span>
      {label}
    </button>
  )
}
