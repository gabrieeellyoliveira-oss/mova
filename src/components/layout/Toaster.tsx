import { Check, Heart, Info, Sparkles } from 'lucide-react'
import { dismissToast, useToasts, type ToastKind } from '@/hooks/useToast'
import { PixelIcon } from '@/components/game/PixelIcon'
import { cn } from '@/lib/cn'

const icons: Record<Exclude<ToastKind, 'achievement'>, typeof Check> = { check: Check, sparkle: Sparkles, heart: Heart, info: Info }

/** GameToast: avisos curtos no estilo janela de jogo. */
export function Toaster() {
  const toasts = useToasts()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:pr-8">
      {toasts.map((t) => {
        const achievement = t.kind === 'achievement'
        const Icon = achievement ? null : icons[t.kind as Exclude<ToastKind, 'achievement'>]
        return (
          <button
            key={t.id}
            onClick={() => dismissToast(t.id)}
            className={cn(
              'pointer-events-auto relative flex max-w-sm items-center gap-3 rounded-px border-2 border-px-line px-3.5 py-2.5 text-left shadow-pixel animate-level-in',
              achievement ? 'bg-px-gold-soft text-vinho-900' : 'bg-vinho-900 text-rosa-50',
            )}
          >
            <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-md border-2 border-px-line', achievement ? 'bg-px-panel' : 'bg-cereja')}>
              {achievement ? <PixelIcon name={t.sprite ?? 'trophy'} size={24} /> : Icon && <Icon size={16} />}
            </span>
            <span>
              <span className="block font-pixel text-[15px] font-semibold uppercase tracking-wide">{t.title}</span>
              {t.text && <span className={cn('block text-xs', achievement ? 'text-vinho/80' : 'text-rosa-50/75')}>{t.text}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** Nome de jogo para o mesmo componente */
export const GameToast = Toaster
