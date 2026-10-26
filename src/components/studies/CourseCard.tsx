import { CalendarClock, Minus, Pencil, Plus } from 'lucide-react'
import type { Course } from '@/types'
import { db } from '@/store/db'
import { ratio } from '@/utils/format'
import { relativeDay } from '@/utils/date'
import { celebrate } from '@/hooks/useToast'
import { Progress } from '@/components/ui/Progress'

export function CourseCard({ course, minutes, onEdit }: { course: Course; minutes: number; onEdit: () => void }) {
  const p = ratio(course.lessonsDone, course.lessonsTotal)
  const bump = (n: number) => {
    const lessonsDone = Math.max(0, Math.min(course.lessonsTotal, course.lessonsDone + n))
    db.courses.update(course.id, { lessonsDone })
    if (lessonsDone === course.lessonsTotal && n > 0) celebrate.goal()
  }
  return (
    <article className={`relative overflow-hidden rounded-px border-2 border-px-line bg-quente p-5 shadow-pixel-sm transition-all hover:-translate-y-0.5 hover:shadow-pixel ${course.active ? '' : 'opacity-70'}`}>
      <span className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: course.color }} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: course.color }}>{course.institution || 'Curso'}</p>
          <h3 className="font-extrabold leading-snug text-vinho">{course.name}</h3>
        </div>
        <button onClick={onEdit} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-vinho/50 hover:bg-vinho/5" aria-label="Editar curso"><Pencil size={14} /></button>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-vinho/60">
        <span>{course.modules} módulos</span>
        <span>{course.lessonsDone}/{course.lessonsTotal} aulas</span>
        <span>{Math.round(minutes / 60)}h focadas</span>
        {course.deadline && <span className="inline-flex items-center gap-1"><CalendarClock size={12} /> prazo {relativeDay(course.deadline)}</span>}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Progress value={p} color={course.color} height={9} className="flex-1" />
        <span className="w-10 text-right text-sm font-extrabold" style={{ color: course.color }}>{Math.round(p)}%</span>
      </div>
      {course.notes && <p className="mt-3 rounded-2xl bg-creme-100 px-3 py-2 text-xs text-vinho/75">{course.notes}</p>}
      <div className="mt-3 flex items-center gap-1.5">
        <span className="mr-auto text-xs font-semibold text-vinho/60">{p >= 100 ? 'Concluído ✨' : 'aula feita?'}</span>
        <button onClick={() => bump(-1)} className="grid h-8 w-8 place-items-center rounded-full bg-creme-200 text-vinho hover:bg-rosa-100" aria-label="Menos uma aula"><Minus size={14} /></button>
        <button onClick={() => bump(1)} className="grid h-8 w-8 place-items-center rounded-full text-quente hover:opacity-90" style={{ backgroundColor: course.color }} aria-label="Mais uma aula"><Plus size={14} /></button>
      </div>
    </article>
  )
}
