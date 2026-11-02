import { Check, Heart, Info, Sparkles } from 'lucide-react'
import { dismissToast, useToasts, type ToastKind } from '@/hooks/useToast'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

const icons: Record<Exclude<ToastKind, 'achievement'>, typeof Check> = { check: Check, sparkle: Sparkles, heart: Heart, info: Info }

/** Avisos curtos no canto da tela (toque para fechar). */
export function Toaster() {
  const toasts = useToasts()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:pr-8">
      {toasts.map((t) => {
        const achievement = t.kind === 'achievement'
        const KindIcon = achievement ? null : icons[t.kind as Exclude<ToastKind, 'achievement'>]
        return (
          <button
            key={t.id}
            onClick={() => dismissToast(t.id)}
            className="pointer-events-auto relative flex max-w-sm items-center gap-3 rounded-2xl border-2 border-ink bg-quente px-4 py-3 text-left shadow-lift animate-rise"
          >
            <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', achievement ? 'bg-pastel-yellow' : 'bg-rosa-100')}>
              {achievement ? <Icon name={t.sprite ?? 'trophy'} size={20} /> : KindIcon && <KindIcon size={18} className="text-vinho" />}
            </span>
            <span>
              <span className="block text-sm font-bold text-tinta">{t.title}</span>
              {t.text && <span className="block text-xs text-vinho/70">{t.text}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}
