import { useState } from 'react'
import { Check, Clock, Coffee, ExternalLink, Flame, Play, RotateCcw, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { DayVideos, TodayProgram, completeDay, undoDay } from '@/components/programs/TodayProgram'
import { FatLossGuide } from '@/components/programs/FatLossGuide'
import { PROGRAMS, RECOMMENDED, type Program, type ProgramDay } from '@/data/programs'
import { fitSettings } from '@/store/db'
import { useStore } from '@/store/createStore'
import { formatShort, today } from '@/utils/date'
import { dayLabel, dayMinutes, programState } from '@/utils/programs'
import { formatMinutes } from '@/utils/workouts'
import { MixBar } from '@/components/programs/MixBar'

export default function Programs() {
  const settings = useStore(fitSettings)
  const st = programState(settings.program)
  const [openDay, setOpenDay] = useState<ProgramDay | null>(null)
  const [preview, setPreview] = useState<Program | null>(null)

  const start = (p: Program) => {
    if (st && !st.finished && st.program.id !== p.id && !window.confirm(`Trocar o ${st.program.name} pelo ${p.name}? O progresso do programa atual será zerado (os treinos registrados continuam no histórico).`)) return
    fitSettings.set((s) => ({ ...s, program: { id: p.id, start: today(), done: {} } }))
    setPreview(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const stop = () => {
    if (!window.confirm('Parar este programa? Os treinos registrados continuam no histórico.')) return
    fitSettings.set((s) => ({ ...s, program: undefined }))
  }

  const ordered = [...PROGRAMS].sort((a, b) => (RECOMMENDED.indexOf(a.id) + 1 || 99) - (RECOMMENDED.indexOf(b.id) + 1 || 99))

  return (
    <div className="space-y-6 sm:space-y-8">
      <TodayProgram />

      {/* todos os dias do programa ativo */}
      {st && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="px-titlebar">{st.program.name}</h2>
              <p className="text-sm text-tinta/60">Começou em {formatShort(st.active.start)} · {st.doneCount} de {st.total} dias feitos · toque num dia para ver os vídeos</p>
            </div>
            <div className="flex gap-2">
              <a href={st.program.url} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full border-2 border-ink bg-quente px-3.5 text-xs font-semibold hover:bg-lavanda-100"><ExternalLink size={14} /> Página do projeto</a>
              <button type="button" onClick={stop} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-cereja hover:bg-cereja/10"><X size={14} /> Parar</button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {st.program.days.map((d) => {
              const done = st.active.done[d.day]
              const isNext = st.next?.day === d.day && !st.doneToday
              return (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => setOpenDay(d)}
                  className={cn(
                    'flex min-h-[76px] flex-col items-start justify-between rounded-2xl border-2 p-2 text-left transition hover:-translate-y-0.5',
                    done ? 'border-ink bg-salvia' : isNext ? 'border-ink bg-lavanda shadow-pixel-sm' : 'border-ink/25 bg-quente hover:border-ink',
                  )}
                  aria-label={`Dia ${d.day}: ${dayLabel(d)}${done ? ', feito' : ''}`}
                >
                  <span className="flex w-full items-center justify-between font-serif text-lg font-bold">
                    {d.day}
                    {done ? <Check size={16} /> : d.rest ? <Coffee size={15} className="text-tinta/50" /> : d.optional ? <span className="text-[10px] font-sans font-semibold text-tinta/50">opc.</span> : null}
                  </span>
                  <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-tinta/70">{d.rest ? 'Descanso' : d.title ?? formatMinutes(dayMinutes(st.program, d))}</span>
                </button>
              )
            })}
          </div>
        </Card>
      )}

      <FatLossGuide onStart={(id) => { const p = PROGRAMS.find((x) => x.id === id); if (p) setPreview(p) }} activeId={st?.program.id} />

      {/* catálogo */}
      <section>
        <h2 className="px-titlebar">Projetos da Olena</h2>
        <p className="mt-1 text-sm text-tinta/60">Os projetos gratuitos do site dela, com o vídeo de cada dia. Os vídeos abrem no YouTube dela.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ordered.map((p) => {
            const active = st?.program.id === p.id
            const rec = RECOMMENDED.includes(p.id)
            return (
              <article key={p.id} className={cn('flex flex-col rounded-3xl border-2 border-ink bg-quente p-5 shadow-pixel', active && 'bg-lavanda-100')}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xl font-bold leading-tight">{p.name}</h3>
                  {rec && <span className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-ink bg-salvia px-2 py-0.5 text-[11px] font-bold"><Flame size={12} /> emagrecer</span>}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-semibold">
                  <span className="rounded-full bg-lavanda-100 px-2.5 py-1">{p.days.length} dias · {p.perWeek}x/sem</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-px-gold-soft px-2.5 py-1"><Clock size={12} /> {p.minutesLabel}</span>
                  <span className="rounded-full bg-salvia-200 px-2.5 py-1">{p.level}</span>
                </div>
                <p className="mt-3 text-sm text-tinta/75">{p.summary}</p>
                <MixBar p={p} />
                <div className="mt-4 flex flex-wrap gap-2">
                  {active ? (
                    <span className="inline-flex h-10 items-center gap-1.5 rounded-full border-2 border-ink bg-ink px-4 text-sm font-semibold text-ink-fg"><Check size={16} /> Fazendo agora</span>
                  ) : (
                    <Button onClick={() => setPreview(p)}><Play size={15} /> Ver e começar</Button>
                  )}
                  {<a href={p.url} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-full border-2 border-ink px-3.5 text-xs font-semibold hover:bg-lavanda-100"><ExternalLink size={14} /> Site</a>}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* um dia do programa ativo */}
      {st && openDay && (
        <Modal
          open
          onClose={() => setOpenDay(null)}
          title={`Dia ${openDay.day}`}
          subtitle={`${st.program.name} · ${openDay.rest ? 'descanso' : `${dayLabel(openDay)} · ${formatMinutes(dayMinutes(st.program, openDay))}`}`}
          footer={
            st.active.done[openDay.day] ? (
              <>
                <span className="mr-auto text-sm text-tinta/70">Feito em {formatShort(st.active.done[openDay.day])}</span>
                <Button variant="light" onClick={() => { undoDay(st.program, openDay); setOpenDay(null) }}><RotateCcw size={15} /> Desmarcar</Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => { completeDay(st.program, openDay); setOpenDay(null) }}><Check size={16} /> {openDay.rest ? 'Descansei hoje' : 'Fiz este treino hoje'}</Button>
            )
          }
        >
          {openDay.videos.length ? <DayVideos day={openDay} /> : <p className="text-tinta/70">Dia de descanso, sem vídeo. Uma caminhada leve ajuda.</p>}
        </Modal>
      )}

      {/* prévia de um programa antes de começar */}
      {preview && (
        <Modal
          open
          onClose={() => setPreview(null)}
          title={preview.name}
          subtitle={`${preview.days.length} dias · ${preview.minutesLabel} · ${preview.level}`}
          size="lg"
          footer={<>
            <Button variant="light" onClick={() => setPreview(null)}>Fechar</Button>
            <Button onClick={() => start(preview)}><Play size={15} /> Começar hoje</Button>
          </>}
        >
          <p className="text-sm text-tinta/75">{preview.summary}</p>
          <ol className="mt-4 divide-y-2 divide-ink/10">
            {preview.days.map((d) => (
              <li key={d.day} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-ink font-serif font-bold">{d.day}</span>
                <span className="min-w-0 flex-1 truncate font-semibold">{d.rest ? 'Descanso' : dayLabel(d)}{d.optional && <span className="font-normal text-tinta/55"> · opcional</span>}</span>
                {!d.rest && <span className="shrink-0 text-tinta/60">{formatMinutes(dayMinutes(preview, d))}</span>}
                {d.videos[0] && <a href={d.videos[0]} target="_blank" rel="noreferrer" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-ink hover:bg-lavanda-100" aria-label={`Abrir vídeo do dia ${d.day}`}><Play size={13} /></a>}
              </li>
            ))}
          </ol>
        </Modal>
      )}
    </div>
  )
}
