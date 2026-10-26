import { useEffect, useMemo, useState } from 'react'
import { Pause, Play, RotateCcw, X } from 'lucide-react'
import cenario from '@/assets/game/cenario-quarto.webp'
import { focusTimer, useFocusTimer } from '@/hooks/useFocusTimer'
import { setFocusMode, useFocusMode } from '@/hooks/useFocusMode'
import { useCourses, useTasks } from '@/hooks/useData'
import { db } from '@/store/db'
import { today } from '@/utils/date'
import { celebrate } from '@/hooks/useToast'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { XP_VALUES } from '@/game/config'
import { PixelIcon } from './PixelIcon'

/** Modo foco: esconde o resto da interface e deixa só a missão atual e o cronômetro. */
export function FocusMode() {
  const open = useFocusMode()
  const t = useFocusTimer()
  const tasks = useTasks()
  const courses = useCourses().filter((c) => c.active)
  const pending = useMemo(() => tasks.filter((x) => !x.done && (!x.date || x.date <= today())), [tasks])
  const [taskId, setTaskId] = useState<string>('')
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFocusMode(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  if (!open) return null

  const mission = pending.find((x) => x.id === taskId)
  const total = t.duration * 60
  const mm = String(Math.floor(t.remaining / 60)).padStart(2, '0')
  const ss = String(t.remaining % 60).padStart(2, '0')
  const started = t.remaining < total
  const course = courses.find((c) => c.id === t.courseId)

  const finish = () => {
    focusTimer.finishEarly()
    if (mission) {
      db.tasks.update(mission.id, { done: true, completedAt: new Date().toISOString() })
      celebrate.task()
    }
    setFocusMode(false)
  }

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Modo foco">
      <img src={cenario} alt="" className="pixelated absolute inset-0 h-full w-full object-cover" style={{ filter: 'brightness(0.45) saturate(0.9) blur(2px)' }} />
      <div className="absolute inset-0 bg-vinho-950/40" />
      <div className="relative w-full max-w-md animate-level-in rounded-px border-2 border-px-line bg-px-panel shadow-pixel">
        <div className="flex items-center justify-between bg-vinho-800 px-4 py-2.5 text-rosa-50" style={{ boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.25)' }}>
          <span className="flex items-center gap-2 font-pixel text-lg font-semibold uppercase tracking-wide"><PixelIcon name="hourglass" size={20} /> Modo foco</span>
          <button onClick={() => setFocusMode(false)} className="grid h-8 w-8 place-items-center rounded-md border-2 border-rosa-50/30 hover:bg-white/10" aria-label="Sair do modo foco"><X size={16} /></button>
        </div>
        <div className="space-y-5 p-6 text-center">
          <div>
            <p className="font-pixel text-[13px] font-semibold uppercase tracking-[0.14em] text-cereja">Missão atual</p>
            <p className="mt-1 font-heading text-2xl text-vinho">{mission?.title ?? course?.name ?? 'Foco livre'}</p>
          </div>
          <select value={taskId} onChange={(e) => setTaskId(e.target.value)} className="h-10 w-full rounded-lg border-2 border-vinho/25 bg-white/80 px-3 text-sm text-vinho focus:outline-none" aria-label="Escolher missão">
            <option value="">{course ? `Estudar: ${course.name}` : 'Sem missão específica'}</option>
            {pending.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
          </select>
          <p className="font-pixel text-7xl font-bold tabular-nums text-vinho">{mm}:{ss}</p>
          <div className="flex justify-center gap-2">
            {[25, 45, 60].map((m) => (
              <Chip key={m} active={t.duration === m} disabled={t.running} onClick={() => focusTimer.setDuration(m)}>{m} min</Chip>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2">
            {t.running ? (
              <Button size="lg" variant="secondary" onClick={focusTimer.pause}><Pause size={18} /> Pausar</Button>
            ) : (
              <Button size="lg" onClick={focusTimer.start}><Play size={18} /> {started ? 'Continuar' : 'Começar'}</Button>
            )}
            {started && <Button size="icon" variant="ghost" onClick={focusTimer.reset} aria-label="Recomeçar"><RotateCcw size={16} /></Button>}
          </div>
          <Button variant="olive" className="w-full" onClick={finish} disabled={!started && !mission}>
            Finalizar sessão · +{XP_VALUES.estudo} XP{mission ? ` +${XP_VALUES.tarefa}` : ''}
          </Button>
          <p className="text-xs text-vinho/55">O cronômetro continua rodando se você sair desta tela.</p>
        </div>
      </div>
    </div>
  )
}
