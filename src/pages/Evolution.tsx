import { useState } from 'react'
import { Camera, Pencil } from 'lucide-react'
import type { BodyCheckin } from '@/types'
import { useBodyCheckins } from '@/hooks/useData'
import { formatShort } from '@/utils/date'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Misc'
import { CheckinForm } from '@/components/evolution/forms'
import { cn } from '@/lib/cn'

const longDate = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

/** Evolução: só o antes e depois (a primeira e a última foto, ou as que a Gabi escolher). */
export default function Evolution() {
  const checkins = useBodyCheckins()
  const [edit, setEdit] = useState<BodyCheckin | 'new' | null>(null)
  const [pick, setPick] = useState<{ antes?: string; agora?: string }>({})
  const photos = [...checkins].filter((c) => c.photo).sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))
  const before = photos.find((c) => c.id === pick.antes) ?? photos[0]
  const after = photos.find((c) => c.id === pick.agora) ?? (photos.length > 1 ? photos[photos.length - 1] : undefined)

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-[2rem] border-2 border-ink bg-ink p-7 text-ink-fg sm:p-9 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-lavanda">antes e depois</p>
          <p className="mt-2 font-serif text-3xl font-bold sm:text-4xl">Evolução</p>
          <p className="mt-2 text-ink-fg/75">{photos.length ? `${photos.length} ${photos.length === 1 ? 'foto' : 'fotos'} · ${before && after ? `${formatShort(before.date)} → ${formatShort(after.date)}` : 'falta só mais uma para comparar'}` : 'Tire uma foto no mesmo lugar e na mesma luz de tempos em tempos.'}</p>
        </div>
        <Button size="lg" onClick={() => setEdit('new')}><Camera size={18} /> Adicionar foto</Button>
      </section>

      {photos.length === 0 ? (
        <EmptyState title="Nenhuma foto ainda" text="Adicione a primeira foto — ela vira o seu “antes”." action={<Button size="sm" onClick={() => setEdit('new')}><Camera size={14} /> Adicionar foto</Button>} />
      ) : (
        <>
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {[{ c: before, label: 'Antes' }, { c: after, label: 'Agora' }].map(({ c, label }) => (
              <figure key={label} className="min-w-0">
                {c ? (
                  <button onClick={() => setEdit(c)} className="relative block aspect-[3/4] w-full overflow-hidden rounded-3xl border-2 border-ink bg-creme-100 shadow-pixel">
                    <img src={c.photo} alt={`${label} — ${longDate(c.date)}`} className="h-full w-full object-cover" />
                    <span className="absolute left-3 top-3 rounded-full border-2 border-ink bg-lavanda px-3 py-1 text-sm font-semibold text-ink">{label}</span>
                  </button>
                ) : (
                  <button onClick={() => setEdit('new')} className="grid aspect-[3/4] w-full place-items-center rounded-3xl border-2 border-dashed border-ink/30 text-tinta/60 transition hover:border-ink hover:text-ink">
                    <span className="flex flex-col items-center gap-2 text-sm font-semibold"><Camera size={26} /> Adicionar a foto de agora</span>
                  </button>
                )}
                {c && <figcaption className="mt-3 font-serif text-xl font-bold">{longDate(c.date)}{c.note && <span className="mt-0.5 block font-sans text-sm font-normal text-tinta/60">{c.note}</span>}</figcaption>}
              </figure>
            ))}
          </div>

          {photos.length > 2 && (
            <section>
              <h2 className="mb-1 font-serif text-xl font-bold">Escolher fotos para comparar</h2>
              <p className="mb-4 text-sm text-tinta/60">Toque em “Antes” ou “Agora” embaixo de uma foto.</p>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {photos.map((c) => (
                  <div key={c.id} className="w-28 shrink-0">
                    <div className={cn('relative aspect-[3/4] overflow-hidden rounded-2xl border-2 border-ink', (c.id === before?.id || c.id === after?.id) && 'ring-4 ring-lavanda')}>
                      <img src={c.photo} alt={`Foto de ${formatShort(c.date)}`} className="h-full w-full object-cover" />
                      <button onClick={() => setEdit(c)} className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full border-2 border-ink bg-quente" aria-label={`Editar foto de ${formatShort(c.date)}`}><Pencil size={12} /></button>
                    </div>
                    <p className="mt-1 text-xs font-semibold">{formatShort(c.date)}</p>
                    <div className="mt-1 flex gap-1">
                      <button onClick={() => setPick((p) => ({ ...p, antes: c.id }))} className={cn('flex-1 rounded-full border-2 border-ink py-0.5 text-[11px] font-semibold', c.id === before?.id ? 'bg-lavanda' : 'bg-quente')}>Antes</button>
                      <button onClick={() => setPick((p) => ({ ...p, agora: c.id }))} className={cn('flex-1 rounded-full border-2 border-ink py-0.5 text-[11px] font-semibold', c.id === after?.id ? 'bg-lavanda' : 'bg-quente')}>Agora</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {edit && <CheckinForm initial={edit === 'new' ? undefined : edit} onClose={() => setEdit(null)} />}
    </div>
  )
}
