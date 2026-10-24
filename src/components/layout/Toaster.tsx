import { Check, Heart, Info, Sparkles } from 'lucide-react'
import { dismissToast, useToasts, type ToastKind } from '@/hooks/useToast'
import { Sparkle } from '@/components/doodles/Doodles'

const icons: Record<ToastKind, typeof Check> = { check: Check, sparkle: Sparkles, heart: Heart, info: Info }

export function Toaster() {
  const toasts = useToasts()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:pr-8">
      {toasts.map((t) => {
        const Icon = icons[t.kind]
        return (
          <button
            key={t.id}
            onClick={() => dismissToast(t.id)}
            className="pointer-events-auto relative flex max-w-sm items-center gap-3 rounded-3xl bg-vinho px-4 py-3 text-left text-rosa-50 shadow-lift animate-rise"
          >
            {t.kind === 'sparkle' && (
              <>
                <Sparkle size={16} className="absolute -left-1 -top-2 text-rosa animate-sparkle" />
                <Sparkle size={12} className="absolute -right-1 top-1 text-queimado animate-sparkle [animation-delay:.2s]" />
                <Sparkle size={10} className="absolute bottom-0 left-1/2 text-rosa animate-sparkle [animation-delay:.4s]" />
              </>
            )}
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cereja animate-pop"><Icon size={16} /></span>
            <span>
              <span className="block text-sm font-bold">{t.title}</span>
              {t.text && <span className="block text-xs text-rosa-50/75">{t.text}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}
