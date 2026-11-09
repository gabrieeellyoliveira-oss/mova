import { useState } from 'react'
import { Camera, Link2, Loader2, Pencil, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { CheckinForm } from '@/components/evolution/CheckinForm'
import { WeightChart } from '@/components/evolution/WeightChart'
import { db, fitSettings } from '@/store/db'
import { useCollection } from '@/store/collections'
import { useStore } from '@/store/createStore'
import { useSharedReady } from '@/lib/cloudSync'
import type { BodyCheckin } from '@/types'
import { formatShort } from '@/utils/date'
import { MEASURES, byDate, fmt, parseNum, series, signed } from '@/utils/body'

const longDate = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
const MOVA_EVOLUCAO = 'https://mova-eosin.vercel.app/#/evolucao'

/** Evolução do corpo: peso, medidas e antes e depois. Os mesmos registros da Evolução do mova. */
export default function Evolution() {
  const checkins = useCollection(db.bodyCheckins)
  const workouts = useCollection(db.workouts)
  const settings = useStore(fitSettings)
  const ready = useSharedReady()
  const [edit, setEdit] = useState<BodyCheckin | 'new' | null>(null)
  const [pick, setPick] = useState<{ antes?: string; agora?: string }>({})

  const weight = series(checkins, 'weight')
  const waist = series(checkins, 'waist')
  const photos = byDate(checkins).filter((c) => c.photo)
  const before = photos.find((c) => c.id === pick.antes) ?? photos[0]
  const after = photos.find((c) => c.id === pick.agora) ?? (photos.length > 1 ? photos[photos.length - 1] : undefined)
  const sinceFirst = byDate(checkins)[0]?.date
  const workoutsSince = sinceFirst ? workouts.filter((w) => w.date >= sinceFirst).length : 0
  const toGoal = settings.goalWeight && weight.last ? Math.round((weight.last.value - settings.goalWeight) * 10) / 10 : undefined
  const bmi = settings.heightCm && weight.last ? weight.last.value / (settings.heightCm / 100) ** 2 : undefined
  const open = (c: BodyCheckin | 'new') => ready && setEdit(c)

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* capa */}
      <section className="rounded-[2rem] border-2 border-ink bg-ink p-6 text-ink-fg shadow-pixel sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.3em] text-lavanda">evolução</p>
            {weight.last ? (
              <>
                <p className="mt-2 font-serif text-5xl font-bold sm:text-6xl">{fmt(weight.last.value)} <span className="text-2xl text-ink-fg/70">kg</span></p>
                <p className="mt-2 text-ink-fg/80">
                  {weight.delta != null ? `${signed(weight.delta, 'kg')} desde ${formatShort(weight.first!.date)}` : `Medido em ${formatShort(weight.last.date)}`}
                  {waist.delta != null && ` · cintura ${signed(waist.delta, 'cm')}`}
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 font-serif text-4xl font-bold sm:text-5xl">Comece pelo seu ponto de partida</p>
                <p className="mt-2 max-w-xl text-ink-fg/80">Registre o peso, a cintura e uma foto. Para emagrecer, a cintura e as fotos contam mais que a balança.</p>
              </>
            )}
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink-fg/60"><Link2 size={14} /> Ligado à Evolução do mova: o que você atualiza lá aparece aqui, e vice-versa.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!ready}
              onClick={() => open('new')}
              className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-lavanda bg-lavanda px-6 font-semibold text-ink transition hover:brightness-105 disabled:opacity-60"
            >
              {ready ? <Plus size={18} /> : <Loader2 size={18} className="animate-spin" />} {ready ? 'Novo registro' : 'Conectando ao mova…'}
            </button>
            <a href={MOVA_EVOLUCAO} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center rounded-full border-2 border-ink-fg/80 px-5 text-sm font-semibold hover:bg-ink-fg/10">Ver no mova</a>
          </div>
        </div>
      </section>

      {/* números */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <GoalCard toGoal={toGoal} />
        <Card tone="oliva" className="!p-4 sm:!p-5">
          <p className="text-sm font-semibold">Treinos no período</p>
          <p className="mt-1 font-serif text-3xl font-bold sm:text-4xl">{workoutsSince}</p>
          <p className="mt-1 text-xs text-ink/70">{sinceFirst ? `desde ${formatShort(sinceFirst)}` : 'depois do 1º registro'}</p>
        </Card>
        <Card tone="creme" className="!p-4 sm:!p-5">
          <p className="text-sm font-semibold">IMC</p>
          <p className="mt-1 font-serif text-3xl font-bold sm:text-4xl">{bmi ? fmt(bmi) : '—'}</p>
          <HeightInput />
        </Card>
        <Card className="!p-4 sm:!p-5">
          <p className="text-sm font-semibold">Registros</p>
          <p className="mt-1 font-serif text-3xl font-bold sm:text-4xl">{checkins.length}</p>
          <p className="mt-1 text-xs text-tinta/60">{photos.length} {photos.length === 1 ? 'foto' : 'fotos'}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* peso */}
        <Card>
          <h2 className="px-titlebar">Peso</h2>
          <WeightChart points={weight.pts} goal={settings.goalWeight} />
        </Card>

        {/* medidas */}
        <Card>
          <h2 className="px-titlebar">Medidas</h2>
          <ul className="mt-3 divide-y-2 divide-ink/10">
            {MEASURES.filter((m) => m.key !== 'weight').map((m) => {
              const s = series(checkins, m.key)
              return (
                <li key={m.key} className="flex items-center justify-between gap-3 py-3">
                  <span className="font-semibold">{m.label}</span>
                  <span className="text-right">
                    <span className="font-serif text-xl font-bold">{s.last ? `${fmt(s.last.value)} ${m.unit}` : '—'}</span>
                    {s.delta != null && (
                      <span className={cn('ml-2 rounded-full px-2 py-0.5 text-xs font-semibold', s.delta < 0 ? 'bg-salvia-200 text-salvia-deep' : s.delta > 0 ? 'bg-lavanda-100' : 'bg-creme-100')}>
                        {signed(s.delta, m.unit)}
                      </span>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="mt-2 text-xs text-tinta/60">Comparando o primeiro e o último registro de cada medida.</p>
        </Card>
      </div>

      {/* antes e depois */}
      <section>
        <div className="flex items-end justify-between gap-3">
          <h2 className="px-titlebar">Antes e depois</h2>
          {ready && <button type="button" onClick={() => open('new')} className="inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4"><Camera size={16} /> Adicionar foto</button>}
        </div>
        {photos.length === 0 ? (
          <Card tone="creme" className="mt-3 text-center">
            <p className="font-serif text-lg font-bold">Nenhuma foto ainda</p>
            <p className="mt-1 text-sm text-tinta/70">Tire uma foto no mesmo lugar e na mesma luz a cada 2–4 semanas. A primeira vira o seu “antes”.</p>
          </Card>
        ) : (
          <>
            <div className="mx-auto mt-3 grid max-w-4xl grid-cols-2 gap-3 sm:gap-6">
              {[{ c: before, label: 'Antes' }, { c: after, label: 'Agora' }].map(({ c, label }) => (
                <figure key={label} className="min-w-0">
                  {c ? (
                    <button type="button" onClick={() => open(c)} className="relative block aspect-[3/4] w-full overflow-hidden rounded-3xl border-2 border-ink bg-creme-100 shadow-pixel">
                      <img src={c.photo} alt={`${label} — ${longDate(c.date)}`} className="h-full w-full object-cover" />
                      <span className="absolute left-3 top-3 rounded-full border-2 border-ink bg-lavanda px-3 py-1 text-sm font-semibold text-ink">{label}</span>
                    </button>
                  ) : (
                    <button type="button" onClick={() => open('new')} className="grid aspect-[3/4] w-full place-items-center rounded-3xl border-2 border-dashed border-ink/30 text-tinta/60 transition hover:border-ink hover:text-ink">
                      <span className="flex flex-col items-center gap-2 px-2 text-center text-sm font-semibold"><Camera size={26} /> Foto de agora</span>
                    </button>
                  )}
                  {c && (
                    <figcaption className="mt-2 font-serif text-base font-bold sm:text-xl">
                      {longDate(c.date)}
                      {c.weight != null && <span className="block font-sans text-sm font-normal text-tinta/60">{fmt(c.weight)} kg{c.waist != null && ` · cintura ${fmt(c.waist)} cm`}</span>}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
            {photos.length > 2 && (
              <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
                {photos.map((c) => (
                  <div key={c.id} className="w-24 shrink-0">
                    <div className={cn('relative aspect-[3/4] overflow-hidden rounded-2xl border-2 border-ink', (c.id === before?.id || c.id === after?.id) && 'ring-4 ring-lavanda')}>
                      <img src={c.photo} alt={`Foto de ${formatShort(c.date)}`} className="h-full w-full object-cover" />
                    </div>
                    <p className="mt-1 text-xs font-semibold">{formatShort(c.date)}</p>
                    <div className="mt-1 flex gap-1">
                      <button type="button" onClick={() => setPick((p) => ({ ...p, antes: c.id }))} className={cn('flex-1 rounded-full border-2 border-ink py-0.5 text-[11px] font-semibold', c.id === before?.id ? 'bg-lavanda' : 'bg-quente')}>Antes</button>
                      <button type="button" onClick={() => setPick((p) => ({ ...p, agora: c.id }))} className={cn('flex-1 rounded-full border-2 border-ink py-0.5 text-[11px] font-semibold', c.id === after?.id ? 'bg-lavanda' : 'bg-quente')}>Agora</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* registros */}
      {checkins.length > 0 && (
        <Card>
          <h2 className="px-titlebar">Todos os registros</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-tinta/55">
                  <th className="py-2 pr-3">Data</th>
                  {MEASURES.map((m) => <th key={m.key} className="py-2 pr-3">{m.label}</th>)}
                  <th className="py-2 pr-3">Foto</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {[...byDate(checkins)].reverse().map((c) => (
                  <tr key={c.id} className="border-t-2 border-ink/10">
                    <td className="py-2.5 pr-3 font-semibold">{formatShort(c.date)} {c.date.slice(0, 4)}</td>
                    {MEASURES.map((m) => <td key={m.key} className="py-2.5 pr-3">{c[m.key] != null ? fmt(c[m.key] as number) : '—'}</td>)}
                    <td className="py-2.5 pr-3">{c.photo ? '📷' : '—'}</td>
                    <td className="py-2.5 text-right">
                      <button type="button" disabled={!ready} onClick={() => open(c)} className="grid h-8 w-8 place-items-center rounded-full border-2 border-ink bg-quente hover:bg-lavanda-100 disabled:opacity-40" aria-label={`Editar registro de ${formatShort(c.date)}`}>
                        <Pencil size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {edit && <CheckinForm initial={edit === 'new' ? undefined : edit} onClose={() => setEdit(null)} />}
    </div>
  )
}

function GoalCard({ toGoal }: { toGoal?: number }) {
  const settings = useStore(fitSettings)
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(settings.goalWeight ? String(settings.goalWeight).replace('.', ',') : '')
  const save = () => {
    fitSettings.set((s) => ({ ...s, goalWeight: parseNum(value) }))
    setEditing(false)
  }
  return (
    <Card tone="rosa" className="!p-4 sm:!p-5">
      <p className="text-sm font-semibold">Meta de peso</p>
      {editing ? (
        <form onSubmit={(e) => { e.preventDefault(); save() }} className="mt-2 flex gap-2">
          <input autoFocus inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} onBlur={save} placeholder="kg" className="h-10 w-full min-w-0 rounded-xl border-2 border-ink bg-quente px-3 font-serif text-lg font-bold" aria-label="Meta de peso em kg" />
        </form>
      ) : (
        <button type="button" onClick={() => setEditing(true)} className="mt-1 text-left">
          <span className="block font-serif text-3xl font-bold sm:text-4xl">{settings.goalWeight ? `${fmt(settings.goalWeight)}` : '—'}<span className="text-lg text-ink/60"> kg ✎</span></span>
        </button>
      )}
      <p className="mt-1 text-xs text-ink/70">{toGoal == null ? 'toque para definir' : toGoal > 0 ? `faltam ${fmt(toGoal)} kg` : 'meta alcançada! 🎉'}</p>
    </Card>
  )
}

function HeightInput() {
  const settings = useStore(fitSettings)
  return (
    <label className="mt-1 flex items-center gap-1 text-xs text-ink/70">
      altura
      <input
        inputMode="numeric"
        defaultValue={settings.heightCm ?? ''}
        onBlur={(e) => fitSettings.set((s) => ({ ...s, heightCm: parseNum(e.target.value) }))}
        placeholder="160"
        className="h-6 w-12 rounded-md border border-ink/40 bg-quente/70 px-1 text-center font-semibold"
        aria-label="Altura em cm"
      />
      cm
    </label>
  )
}
