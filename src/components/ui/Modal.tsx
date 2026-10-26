import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { PixelIcon } from '@/components/game/PixelIcon'

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

/** Janela de jogo: barra de título escura, painel claro, rodapé com ações. */
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
      <div className="absolute inset-0 bg-vinho-950/55 animate-[rise_.15s_ease-out]" onClick={onClose} />
      <div
        ref={panel}
        className={cn(
          'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-px border-2 border-px-line bg-px-panel shadow-pixel animate-level-in sm:rounded-px',
          widths[size],
        )}
      >
        <div className="flex items-center justify-between gap-3 bg-vinho-800 px-4 py-2.5 text-rosa-50" style={{ boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.25)' }}>
          <div className="flex min-w-0 items-center gap-2">
            <PixelIcon name="cherry" size={20} />
            <h2 className="truncate font-pixel text-lg font-semibold uppercase tracking-wide">{title}</h2>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-md border-2 border-rosa-50/30 text-rosa-50 hover:bg-white/10" aria-label="Fechar">
            <X size={16} />
          </button>
        </div>
        {subtitle && <p className="border-b-2 border-dashed border-vinho/15 px-5 py-2 text-sm text-vinho/70">{subtitle}</p>}
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t-2 border-px-line/20 bg-px-soft/70 px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

/** Nome de jogo para a mesma janela */
export const GameModal = Modal
