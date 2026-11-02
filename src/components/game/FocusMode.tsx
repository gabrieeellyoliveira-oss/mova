import { useEffect, useMemo, useState } from 'react'
import { Pause, Play, Plus, RotateCcw, X } from 'lucide-react'
import { focusTimer, useFocusTimer } from '@/hooks/useFocusTimer'
import { setFocusMode, useFocusMode } from '@/hooks/useFocusMode'
import { useCourses, useTasks } from '@/hooks/useData'
import { db } from '@/store/db'
import { today } from '@/utils/date'
import { celebrate } from '@/hooks/useToast'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'

/** Modo foco: esconde o resto da interface e deixa só a missão atual e o cronômetro. */
export function FocusMode() {
  const open = useFocusMode()
  const t = useFocusTimer()
  const tasks = useTasks()
  const courses = useCourses().filter((c) => c.active)
  const pending = useMemo(() => tasks.filter((x) => !x.done && (!x.date || x.date <= today())), [tasks])
  const [taskId, setTaskId] = useState<string>('')
  const [draft, setDraft] = useState('')
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

  // cria a missão na hora (tarefa de hoje) e já deixa ela selecionada
  const createMission = () => {
    const title = draft.trim()
    if (!title) return
    const order = Math.max(-1, ...tasks.map((x) => x.order)) + 1
    const created = db.tasks.add({ title, done: false, priority: 'media', area: 'geral', order, date: today() })
    setTaskId(created.id)
    setDraft('')
  }

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
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_80%_0%,#ECE5FB_0%,#EBC3CF_45%,#3E2723_120%)] backdrop-blur" />
      <div className="relative w-full max-w-md animate-rise rounded-[28px] bg-white shadow-lift">
        <div className="flex items-center justify-between px-6 pb-1 pt-5">
          <span className="flex items-center gap-2 text-xl font-bold text-tinta"><Icon name="hourglass" size={22} /> Modo foco</span>
          <button onClick={() => setFocusMode(false)} className="grid h-9 w-9 place-items-center rounded-full bg-rosa-50 text-vinho hover:bg-rosa-100" aria-label="Sair do modo foco"><X size={16} /></button>
        </div>
        <div className="space-y-5 p-6 text-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-queimado">Agora</p>
            <p className="mt-1 text-2xl font-bold text-tinta">{mission?.title ?? course?.name ?? 'Foco livre'}</p>
          </div>
          {mission ? (
            <button type="button" onClick={() => setTaskId('')} className="text-xs font-semibold text-cereja hover:underline">Trocar tarefa</button>
          ) : (
            <div className="space-y-2">
              <form onSubmit={(e) => { e.preventDefault(); createMission() }} className="flex gap-2">
                <input
                  value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="No que você vai focar agora?" aria-label="Nova tarefa"
                  className="h-11 min-w-0 flex-1 rounded-xl border border-px-line bg-white px-3.5 text-sm text-tinta placeholder:text-vinho/40 focus:border-queimado focus:outline-none"
                />
                <Button type="submit" disabled={!draft.trim()}><Plus size={16} /> Criar</Button>
              </form>
              {pending.length > 0 && (
                <select value="" onChange={(e) => setTaskId(e.target.value)} className="h-11 w-full rounded-xl border border-px-line bg-white px-3.5 text-sm text-vinho focus:outline-none" aria-label="Escolher tarefa pendente">
                  <option value="">{course ? `Ou escolha uma pendente (agora: ${course.name})` : 'Ou escolha uma tarefa pendente'}</option>
                  {pending.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
                </select>
              )}
            </div>
          )}
          <p className="text-7xl font-extrabold tracking-tight tabular-nums text-vinho">{mm}:{ss}</p>
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
            Finalizar sessão{mission ? ' e concluir tarefa' : ''}
          </Button>
          <p className="text-xs text-vinho/55">O cronômetro continua rodando se você sair desta tela.</p>
        </div>
      </div>
    </div>
  )
}
