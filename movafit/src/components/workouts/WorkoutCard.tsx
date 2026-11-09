import { Clock, ExternalLink, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Workout } from '@/types'
import { relativeDay } from '@/utils/date'
import { FEELINGS, FOCUS, INTENSITY, formatMinutes, linkDomain, youtubeThumb } from '@/utils/workouts'
import { openEditWorkout, repeatWorkout } from '@/hooks/useWorkoutForm'

/** Um treino feito: foco, nome, duração, intensidade, como me senti, link e anotações. */
export function WorkoutCard({ w, compact }: { w: Workout; compact?: boolean }) {
  const focus = FOCUS[w.focus]
  const feeling = FEELINGS.find((f) => f.value === w.feeling)
  const thumb = !compact ? youtubeThumb(w.link) : null
  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-3xl border-2 border-ink bg-quente shadow-pixel transition-[transform,box-shadow] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-lift">
      <button type="button" onClick={() => openEditWorkout(w)} className="absolute inset-0 z-0 rounded-3xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lavanda" aria-label={`Editar ${w.title}`} />
      {thumb && <img src={thumb} alt="" loading="lazy" className="pointer-events-none aspect-video w-full border-b-2 border-ink object-cover" />}
      <div className="pointer-events-none relative flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-2 border-ink text-xl', focus.bg)} aria-hidden>{focus.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-tinta/55">{relativeDay(w.date)} · {focus.label}</p>
            <h3 className="truncate text-lg font-bold leading-tight">{w.title}</h3>
          </div>
          {feeling && <span className="text-2xl leading-none" title={feeling.label} aria-label={`Me senti: ${feeling.label}`}>{feeling.emoji}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1 rounded-full bg-lavanda-100 px-2.5 py-1"><Clock size={13} /> {formatMinutes(w.minutes)}</span>
          <span className="rounded-full bg-salvia-200 px-2.5 py-1">{INTENSITY[w.intensity]}</span>
        </div>
        {!compact && w.notes && <p className="line-clamp-3 whitespace-pre-line text-sm text-tinta/75">{w.notes}</p>}
      </div>
      {!compact && (
        <div className="relative z-10 flex items-center gap-2 px-4 pb-4">
          {w.link && (
            <a href={w.link} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-1.5 rounded-full border-2 border-ink bg-quente px-3 py-1 text-xs font-semibold hover:bg-lavanda-100">
              <ExternalLink size={13} className="shrink-0" /> <span className="truncate">{linkDomain(w.link)}</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => repeatWorkout(w)}
            className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-ink bg-lavanda px-3 py-1 text-xs font-semibold hover:brightness-105"
          >
            <RotateCcw size={13} /> Fazer de novo
          </button>
        </div>
      )}
    </article>
  )
}
