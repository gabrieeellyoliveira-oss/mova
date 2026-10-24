import { Plus } from 'lucide-react'
import gabi from '@/assets/gabi-e-gata.webp'
import { greeting } from '@/utils/date'
import { useNow } from '@/hooks/useNow'
import { useSettings } from '@/hooks/useData'
import { openForm } from '@/hooks/useQuickAdd'
import { Heart, Sparkle, Star, Flower } from '@/components/doodles/Doodles'

const SPINES = [
  { label: 'Planos', bg: '#d9a6a9' },
  { label: 'Estudos', bg: '#e8c4c1' },
  { label: 'Livros', bg: '#d9a6a9' },
  { label: 'Vida social', bg: '#e8c4c1' },
  { label: 'Finanças', bg: '#d9a6a9' },
]

export function WelcomeBanner() {
  const now = useNow()
  const { name } = useSettings()
  return (
    <section className="relative overflow-hidden rounded-4xl bg-vinho text-rosa-50 shadow-lift">
      <div className="absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(ellipse_at_70%_60%,#961415_0%,transparent_65%)] opacity-70" />
      <Heart size={30} className="absolute left-[55%] top-8 hidden -rotate-12 text-rosa lg:block" />
      <Heart size={22} className="absolute left-[51%] top-20 hidden rotate-12 text-rosa lg:block" />
      <Flower size={26} className="absolute left-[50%] bottom-24 hidden opacity-90 lg:block" />
      <Star size={36} className="absolute right-[22%] top-8 hidden rotate-12 text-rosa md:block" />
      <Sparkle size={14} className="absolute right-6 top-6 text-rosa md:hidden" />

      <div className="relative grid items-end md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="relative z-10 px-6 pb-7 pt-7 sm:px-8 sm:pb-8 sm:pt-8">
          <p className="text-sm font-extrabold uppercase tracking-[0.06em] text-rosa-50 sm:text-base">
            {greeting(now)}, {name}.
          </p>
          <h1 className="mt-2 font-display text-[2.5rem] leading-[1.05] text-rosa-50 sm:text-[3.1rem] min-[1360px]:text-[3.4rem]">
            O que vamos mover hoje?
          </h1>
          <p className="mt-3 text-[15px] font-medium text-rosa-50/90 sm:text-base">Pequenas ações, uma vida gigante.</p>
          <button
            onClick={() => openForm('event')}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-rosa px-5 text-[15px] font-bold text-vinho shadow-soft transition hover:bg-rosa-100 active:scale-[0.97]"
          >
            <Plus size={18} strokeWidth={2.6} /> Novo compromisso
          </button>
        </div>
        <div className="relative flex items-end justify-center md:justify-end">
          <img
            src={gabi}
            alt="Ilustração da Gabi com o notebook e a gata preta dormindo ao lado"
            className="relative z-10 -mb-1 w-full max-w-[440px] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.25)] md:-ml-24 md:w-[135%] md:max-w-none"
          />
          <div className="absolute bottom-3 right-3 z-20 hidden flex-col items-end gap-1 xl:flex">
            {SPINES.map((s, i) => (
              <span
                key={s.label}
                className="block rounded-[4px] border border-vinho/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-vinho shadow-sm"
                style={{ backgroundColor: s.bg, width: `${112 + (i % 2) * 10}px`, marginRight: `${(i % 3) * 4}px` }}
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
