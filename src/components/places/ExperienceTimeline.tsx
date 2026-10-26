import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import type { Experience } from '@/types'
import { useExperiences } from '@/hooks/useData'
import { formatLong, relativeDay } from '@/utils/date'
import { money } from '@/utils/format'
import { Button } from '@/components/ui/Button'
import { EmptyState, SectionTitle, StarRating } from '@/components/ui/Misc'
import { Heart, Flower } from '@/components/doodles/Doodles'
import { ExperienceForm } from './ExperienceForm'

export function ExperienceTimeline() {
  const exps = [...useExperiences()].sort((a, b) => b.date.localeCompare(a.date))
  const [editing, setEditing] = useState<Partial<Experience> | null>(null)

  return (
    <section>
      <SectionTitle kicker="pequenas memórias" action={<Button size="sm" variant="secondary" onClick={() => setEditing({})}><Plus size={14} /> Registrar</Button>}>
        Coisas que vivi
      </SectionTitle>
      {exps.length === 0 ? (
        <EmptyState title="Sua linha do tempo começa no próximo rolê" />
      ) : (
        <ol className="relative ml-3 space-y-6 border-l-2 border-dashed border-queimado/40 pl-7">
          {exps.map((e, i) => (
            <li key={e.id} className="relative animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
              <span className="absolute -left-[42px] top-1 grid h-7 w-7 place-items-center rounded-full bg-creme">
                {i % 2 ? <Flower size={24} /> : <Heart size={22} className="fill-rosa text-cereja" />}
              </span>
              <article className={`relative rounded-px border-2 border-px-line bg-quente p-5 shadow-pixel-sm transition hover:shadow-pixel ${i % 2 ? 'sm:rotate-[0.4deg]' : 'sm:-rotate-[0.4deg]'}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-queimado first-letter:uppercase">{formatLong(e.date)} · {relativeDay(e.date)}</p>
                    <h3 className="text-lg font-extrabold text-vinho">{e.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating value={e.rating} size={15} />
                    <button onClick={() => setEditing(e)} className="grid h-8 w-8 place-items-center rounded-full text-vinho/50 hover:bg-vinho/5" aria-label="Editar memória"><Pencil size={14} /></button>
                  </div>
                </div>
                {e.photos.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {e.photos.map((p, j) => (
                      <img key={j} src={p} alt="" className={`h-28 w-28 shrink-0 rounded-xl border-4 border-quente object-cover shadow-pixel-sm ${j % 2 ? 'rotate-2' : '-rotate-2'}`} />
                    ))}
                  </div>
                )}
                {e.comment && <p className="mt-3 text-[15px] italic leading-relaxed text-vinho/85">“{e.comment}”</p>}
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
                  {e.with && <span className="rounded-full bg-rosa-100 px-2.5 py-1 text-vinho">com {e.with}</span>}
                  <span className="rounded-full bg-creme-200 px-2.5 py-1 text-vinho">{e.spent ? money(e.spent) : 'de graça'}</span>
                  <span className="rounded-full bg-oliva-100 px-2.5 py-1 text-oliva-600">{e.wouldReturn ? 'iria de novo' : 'uma vez bastou'}</span>
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}
      {editing && <ExperienceForm initial={editing} onClose={() => setEditing(null)} />}
    </section>
  )
}
