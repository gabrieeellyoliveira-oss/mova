import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

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

/** Janela por cima da tela: título, conteúdo e rodapé com ações. */
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
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px] animate-[rise_.15s_ease-out]" onClick={onClose} />
      <div
        ref={panel}
        className={cn(
          'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] border-2 border-ink bg-quente shadow-lift animate-rise sm:rounded-[28px]',
          widths[size],
        )}
      >
        <div className="flex items-center justify-between gap-3 px-6 pb-1 pt-5">
          <h2 className="truncate font-serif text-2xl font-bold text-tinta">{title}</h2>
          <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-quente text-ink hover:bg-lavanda" aria-label="Fechar">
            <X size={16} />
          </button>
        </div>
        {subtitle && <p className="px-6 text-sm text-tinta/60">{subtitle}</p>}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t-2 border-ink px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

/** Nome de jogo para a mesma janela */
