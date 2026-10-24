import { useState } from 'react'
import { Pause, Play, RotateCcw, Square } from 'lucide-react'
import { focusTimer, useFocusTimer } from '@/hooks/useFocusTimer'
import { useCourses } from '@/hooks/useData'
import { Ring } from '@/components/ui/Progress'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { Cup } from '@/components/doodles/Doodles'

const PRESETS = [25, 45, 60]

export function FocusTimer() {
  const t = useFocusTimer()
  const courses = useCourses().filter((c) => c.active)
  const [custom, setCustom] = useState('')
  const total = t.duration * 60
  const mm = String(Math.floor(t.remaining / 60)).padStart(2, '0')
  const ss = String(t.remaining % 60).padStart(2, '0')
  const started = t.remaining < total

  return (
    <div className="relative overflow-hidden rounded-4xl bg-vinho p-6 text-rosa-50 shadow-lift sm:p-7">
      <Cup size={46} className="absolute right-5 top-5 -rotate-6" />
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-rosa">um tempinho só pra você</p>
      <h2 className="mt-1 font-display text-5xl leading-[0.9]">Foco</h2>
      <div className="my-6 flex justify-center">
        <Ring value={(1 - t.remaining / total) * 100} size={200} stroke={12} color="#EFAFB3" track="rgba(239,175,179,0.16)">
          <div className="text-center">
            <p className="text-5xl font-extrabold tabular-nums tracking-tight text-rosa-50">{mm}:{ss}</p>
            <p className="mt-1 text-xs text-rosa-50/60">{t.running ? 'respira e vai' : started ? 'pausado' : `${t.duration} minutos`}</p>
          </div>
        </Ring>
      </div>
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        {PRESETS.map((m) => (
          <Chip key={m} disabled={t.running} active={t.duration === m} onClick={() => focusTimer.setDuration(m)} className={t.duration === m ? 'border-rosa bg-rosa text-vinho' : 'border-rosa-50/20 bg-transparent text-rosa-50 hover:bg-white/10'}>
            {m} min
          </Chip>
        ))}
        <form onSubmit={(e) => { e.preventDefault(); const n = Number(custom); if (n > 0 && n <= 240) focusTimer.setDuration(n); setCustom('') }} className="flex">
          <input value={custom} disabled={t.running} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ''))} placeholder="personalizado" className="h-[30px] w-28 rounded-full border border-rosa-50/20 bg-transparent px-3 text-xs text-rosa-50 placeholder:text-rosa-50/50 focus:border-rosa focus:outline-none" aria-label="Minutos personalizados" />
        </form>
      </div>
      <select value={t.courseId ?? ''} onChange={(e) => focusTimer.setCourse(e.target.value || undefined)} className="mb-5 h-10 w-full rounded-full border border-rosa-50/20 bg-vinho-900/40 px-4 text-sm text-rosa-50 focus:outline-none" aria-label="Curso">
        <option value="">Estudo livre</option>
        {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <div className="flex items-center justify-center gap-2">
        {t.running ? (
          <Button size="lg" variant="light" onClick={focusTimer.pause}><Pause size={18} /> Pausar</Button>
        ) : (
          <Button size="lg" variant="light" onClick={focusTimer.start}><Play size={18} /> {started ? 'Continuar' : 'Começar foco'}</Button>
        )}
        {started && (
          <>
            <Button size="icon" variant="ghost" className="text-rosa-50 hover:bg-white/10" onClick={focusTimer.finishEarly} title="Encerrar e registrar" aria-label="Encerrar e registrar"><Square size={16} /></Button>
            <Button size="icon" variant="ghost" className="text-rosa-50 hover:bg-white/10" onClick={focusTimer.reset} title="Recomeçar" aria-label="Recomeçar"><RotateCcw size={16} /></Button>
          </>
        )}
      </div>
    </div>
  )
}
