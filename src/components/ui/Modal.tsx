import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Cherry } from '@/components/doodles/Doodles'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const widths = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-3xl' }

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const first = panel.current?.querySelector<HTMLElement>('input, textarea, select')
    first?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-vinho-900/40 backdrop-blur-[2px] animate-[rise_.2s_ease-out]" onClick={onClose} />
      <div
        ref={panel}
        className={cn(
          'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-4xl bg-creme shadow-lift animate-rise sm:rounded-4xl',
          widths[size],
        )}
      >
        <div className="relative flex items-start justify-between gap-4 border-b border-vinho/10 px-6 pb-4 pt-6">
          <Cherry size={34} className="absolute -top-1 right-16 rotate-12 opacity-90" />
          <div>
            <h2 className="font-display text-[2rem] leading-[0.9] text-vinho">{title}</h2>
            {subtitle && <p className="mt-1.5 text-sm text-vinho/70">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-vinho hover:bg-vinho/5" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-vinho/10 bg-creme-100/60 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
