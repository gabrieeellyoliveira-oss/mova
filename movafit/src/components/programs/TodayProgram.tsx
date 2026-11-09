import { Check, Coffee, ExternalLink, Play, Sparkles } from 'lucide-react'
import { cn } from '@/lib/cn'
import { db, fitSettings } from '@/store/db'
import { useStore } from '@/store/createStore'
import type { Program, ProgramDay } from '@/data/programs'
import { today } from '@/utils/date'
import { dayLabel, dayMinutes, guessFocus, programState, videoThumb } from '@/utils/programs'
import { formatMinutes } from '@/utils/workouts'
import { navigate } from '@/hooks/useRoute'

/** Concluir um dia do programa: marca o dia e registra o treino (descanso só marca). */
export function completeDay(program: Program, day: ProgramDay) {
  const date = today()
  fitSettings.set((s) => (s.program ? { ...s, program: { ...s.program, done: { ...s.program.done, [day.day]: date } } } : s))
  if (day.rest) return
  db.workouts.add({
    date,
    title: `${program.name} · Dia ${day.day}${day.title ? ` · ${day.title}` : ''}`,
    focus: day.focus ?? guessFocus(day.title),
    minutes: dayMinutes(program, day),
    intensity: 'moderado',
    link: day.videos[0],
    programId: program.id,
    programDay: day.day,
  })
}

/** Desfazer: tira a marca do dia e o treino registrado por ele. */
export function undoDay(program: Program, day: ProgramDay) {
  fitSettings.set((s) => {
    if (!s.program) return s
    const done = { ...s.program.done }
    delete done[day.day]
    return { ...s, program: { ...s.program, done } }
  })
  db.workouts.store.set((list) => list.filter((w) => !(w.programId === program.id && w.programDay === day.day)))
}

/** Os vídeos de um dia, com miniatura e botão para abrir no YouTube. */
export function DayVideos({ day, dark }: { day: ProgramDay; dark?: boolean }) {
  if (!day.videos.length) return null
  return (
    <div className={cn('grid gap-3', day.videos.length > 1 && 'sm:grid-cols-2')}>
      {day.videos.map((v, i) => (
        <a
          key={v + i}
          href={v}
          target="_blank"
          rel="noreferrer"
          className={cn('group relative block overflow-hidden rounded-2xl border-2', dark ? 'border-ink-fg/30' : 'border-ink')}
        >
          {videoThumb(v) && <img src={videoThumb(v)} alt="" loading="lazy" className="aspect-video w-full object-cover transition group-hover:scale-[1.02]" />}
          <span className="absolute inset-0 grid place-items-center bg-ink/20 transition group-hover:bg-ink/10">
            <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-lavanda text-ink shadow-pixel"><Play size={24} fill="currentColor" /></span>
          </span>
          {day.videos.length > 1 && <span className="absolute left-2 top-2 rounded-full border-2 border-ink bg-quente px-2.5 py-0.5 text-xs font-bold text-ink">Vídeo {i + 1}</span>}
        </a>
      ))}
    </div>
  )
}

/** "Treino do dia" do programa ativo (na tela Hoje e no topo de Programas). */
export function TodayProgram() {
  const settings = useStore(fitSettings)
  const st = programState(settings.program)

  if (!st)
    return (
      <section className="flex flex-col gap-4 rounded-[2rem] border-2 border-ink bg-lavanda p-6 shadow-pixel sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <p className="flex items-center gap-2 font-serif text-2xl font-bold"><Sparkles size={22} /> Qual treino fazer hoje?</p>
          <p className="mt-1 max-w-xl text-sm text-ink/75">Escolha um projeto da Olena e o MOVAFIT mostra o vídeo de cada dia, na ordem certa.</p>
        </div>
        <button type="button" onClick={() => navigate('programas')} className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full border-2 border-ink bg-ink px-6 font-semibold text-ink-fg hover:bg-ink-soft">
          Escolher programa
        </button>
      </section>
    )

  const { program, doneToday, next, finished, doneCount, total } = st
  const pct = Math.round((doneCount / total) * 100)
  const show = doneToday ?? next

  return (
    <section className="overflow-hidden rounded-[2rem] border-2 border-ink bg-quente shadow-pixel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink bg-lavanda px-5 py-4 sm:px-7">
        <button type="button" onClick={() => navigate('programas')} className="min-w-0 text-left">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/60">Treino do dia · {program.name}</p>
          <p className="font-serif text-2xl font-bold">
            {finished ? 'Programa concluído! 🎉' : show ? `Dia ${show.day} de ${total}` : ''}
          </p>
        </button>
        <div className="flex w-full items-center gap-3 sm:w-56">
          <div className="h-3 flex-1 overflow-hidden rounded-full border-2 border-ink bg-quente"><div className="h-full rounded-full bg-ink" style={{ width: `${pct}%` }} /></div>
          <span className="text-sm font-bold">{pct}%</span>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-7">
        {finished ? (
          <div className="space-y-3">
            <p className="text-tinta/75">Você terminou os {total} dias do {program.name}. Registre seu peso e medidas na Evolução e escolha o próximo programa.</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => navigate('evolucao')} className="inline-flex h-11 items-center rounded-full border-2 border-ink bg-salvia px-5 text-sm font-semibold">Registrar evolução</button>
              <button type="button" onClick={() => navigate('programas')} className="inline-flex h-11 items-center rounded-full border-2 border-ink bg-lavanda px-5 text-sm font-semibold">Escolher próximo</button>
            </div>
          </div>
        ) : show ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:items-center">
            {show.videos.length > 0 && <div className="lg:order-1"><DayVideos day={{ ...show, videos: show.videos.slice(0, 1) }} /></div>}
            <div className="space-y-4 lg:order-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-serif text-2xl font-bold leading-tight sm:text-3xl">
                {show.rest ? <span className="inline-flex items-center gap-2"><Coffee size={24} /> Dia de descanso</span> : dayLabel(show)}
              </h2>
              {!show.rest && <span className="rounded-full bg-lavanda-100 px-3 py-1 text-sm font-semibold">{formatMinutes(dayMinutes(program, show))}{show.optional ? ' · opcional' : ''}</span>}
            </div>
            {show.rest && <p className="text-sm text-tinta/70">Descansar faz parte: é quando o músculo se recupera. Se quiser, faça uma caminhada leve ou alongamento{show.videos.length ? ' com o vídeo abaixo' : ''}.</p>}
            {show.optional && !doneToday && <p className="text-sm text-tinta/70">Dia opcional: se estiver cansada, pode só marcar e seguir. Para emagrecer, vale fazer.</p>}
            {show.videos.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-tinta/70">Hoje são {show.videos.length} vídeos:</span>
                {show.videos.map((v, i) => (
                  <a key={v + i} href={v} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-quente px-3 py-1 text-xs font-semibold hover:bg-lavanda-100"><ExternalLink size={12} /> Vídeo {i + 1}</a>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {doneToday ? (
                <>
                  <span className="inline-flex h-11 items-center gap-2 rounded-full border-2 border-ink bg-salvia px-5 text-sm font-semibold"><Check size={18} /> Feito hoje</span>
                  <button type="button" onClick={() => undoDay(program, doneToday)} className="text-sm font-semibold text-tinta/60 underline underline-offset-4 hover:text-ink">desfazer</button>
                  {next && <span className="w-full text-sm text-tinta/70">Amanhã: <b>Dia {next.day}</b> · {dayLabel(next)}</span>}
                </>
              ) : (
                <>
                  <button type="button" onClick={() => completeDay(program, show)} className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-ink bg-ink px-6 font-semibold text-ink-fg hover:bg-ink-soft">
                    <Check size={18} /> {show.rest ? 'Descansei hoje' : 'Fiz o treino'}
                  </button>
                  {show.videos[0] && (
                    <a href={show.videos[0]} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-ink bg-quente px-5 text-sm font-semibold hover:bg-lavanda-100">
                      <ExternalLink size={16} /> Abrir no YouTube
                    </a>
                  )}
                </>
              )}
            </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
