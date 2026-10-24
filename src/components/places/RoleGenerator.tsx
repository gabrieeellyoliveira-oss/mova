import { useState } from 'react'
import { MapPin, RefreshCw, Shuffle } from 'lucide-react'
import type { Company, Mood, Place } from '@/types'
import { BUDGETS, COMPANIES, MOODS } from '@/data/constants'
import { usePlaces } from '@/hooks/useData'
import { Chip } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { PlaceCover } from './PlaceCover'
import { Arrow, Sparkle, Squiggle } from '@/components/doodles/Doodles'

/** Escolhe um lugar cadastrado que combine com orçamento, vontade e companhia. */
export function pickPlace(places: Place[], budget: number | null, moods: Mood[], company: Company, exclude?: string) {
  const pool = places.filter((p) => p.status !== 'fui' || p.favorite).filter((p) => p.id !== exclude)
  const fitsBudget = (p: Place) => budget === null || p.price <= budget
  const fitsMood = (p: Place) => !moods.length || p.moods.some((m) => moods.includes(m))
  const fitsCompany = (p: Place) => company === 'tanto faz' || p.goodFor === 'tanto faz' || p.goodFor === company
  const tiers = [
    pool.filter((p) => fitsBudget(p) && fitsMood(p) && fitsCompany(p)),
    pool.filter((p) => fitsBudget(p) && fitsMood(p)),
    pool.filter((p) => fitsBudget(p)),
  ]
  for (const [i, t] of tiers.entries()) {
    if (t.length) {
      // favoritos e "quero voltar" têm um pouquinho mais de chance
      const weighted = t.flatMap((p) => (p.favorite || p.status === 'voltar' ? [p, p] : [p]))
      return { place: weighted[Math.floor(Math.random() * weighted.length)], relaxed: i > 0 }
    }
  }
  return null
}

export function RoleGenerator({ onGo }: { onGo: (p: Place) => void }) {
  const places = usePlaces()
  const [budget, setBudget] = useState<number | null>(null)
  const [moods, setMoods] = useState<Mood[]>([])
  const [company, setCompany] = useState<Company>('tanto faz')
  const [result, setResult] = useState<ReturnType<typeof pickPlace> | undefined>()
  const [spin, setSpin] = useState(false)

  const generate = () => {
    setSpin(true)
    setTimeout(() => {
      setResult(pickPlace(places, budget, moods, company, result?.place.id))
      setSpin(false)
    }, 450)
  }

  return (
    <section className="relative overflow-hidden rounded-4xl bg-vinho p-6 text-rosa-50 shadow-lift sm:p-8">
      <Sparkle size={22} className="absolute right-8 top-8 text-rosa" />
      <Sparkle size={12} className="absolute right-16 top-16 text-queimado" />
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-rosa">bateu a preguiça?</p>
          <h2 className="mt-1 font-display text-5xl leading-[0.9] sm:text-6xl">Não sei o que fazer.</h2>
          <Squiggle width={140} className="mb-5 text-queimado" />
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-bold">Quanto quero gastar?</p>
              <div className="flex flex-wrap gap-2">
                {BUDGETS.map((b) => (
                  <Chip key={b.label} active={budget === b.max} onClick={() => setBudget(b.max)} className={budget === b.max ? 'border-rosa bg-rosa text-vinho' : 'border-rosa-50/20 bg-transparent text-rosa-50 hover:bg-white/10 hover:border-rosa'}>{b.label}</Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold">Estou com vontade de:</p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => {
                  const on = moods.includes(m.id)
                  return (
                    <Chip key={m.id} active={on} onClick={() => setMoods(on ? moods.filter((x) => x !== m.id) : [...moods, m.id])} className={on ? 'border-rosa bg-rosa text-vinho' : 'border-rosa-50/20 bg-transparent text-rosa-50 hover:bg-white/10 hover:border-rosa'}>
                      {m.label}
                    </Chip>
                  )
                })}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold">Estou indo:</p>
              <div className="flex flex-wrap gap-2">
                {COMPANIES.map((c) => (
                  <Chip key={c} active={company === c} onClick={() => setCompany(c)} className={company === c ? 'border-rosa bg-rosa text-vinho' : 'border-rosa-50/20 bg-transparent text-rosa-50 hover:bg-white/10 hover:border-rosa'}>{c}</Chip>
                ))}
              </div>
            </div>
            <Button size="lg" variant="light" onClick={generate} className="mt-1">
              <Shuffle size={17} className={spin ? 'animate-spin' : ''} /> Me tira de casa ✨
            </Button>
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          {result === undefined ? (
            <div className="relative text-center">
              <Arrow size={70} className="absolute -left-16 top-0 hidden -scale-x-100 rotate-[200deg] text-rosa lg:block" />
              <p className="font-heading text-lg leading-snug text-rosa">responde aqui do lado<br />e eu escolho por você</p>
            </div>
          ) : result === null ? (
            <div className="rounded-3xl bg-vinho-900/50 p-6 text-center">
              <p className="font-bold">Nenhum lugar cadastrado combina ainda.</p>
              <p className="mt-1 text-sm text-rosa-50/70">Adicione lugares em “Quero conhecer” — ou tente “Tanto faz” no orçamento.</p>
            </div>
          ) : (
            <div className={`w-full max-w-sm overflow-hidden rounded-3xl bg-quente text-tinta shadow-lift ${spin ? 'opacity-40' : 'animate-rise'}`}>
              <div className="aspect-[16/10]"><PlaceCover place={result.place} /></div>
              <div className="p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-queimado">que tal…</p>
                <p className="text-xl font-extrabold text-vinho">{result.place.name}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-vinho/60"><MapPin size={12} />{result.place.neighborhood} · {result.place.price ? `~R$${result.place.price}` : 'grátis'} · {result.place.category}</p>
                {result.relaxed && <p className="mt-2 text-xs text-vinho/60">Não achei um encaixe perfeito, mas esse chega bem perto 💛</p>}
                <div className="mt-4 flex gap-2">
                  <Button className="flex-1" onClick={() => onGo(result.place)}>Bora! Planejar</Button>
                  <Button variant="soft" size="icon" onClick={generate} aria-label="Outra sugestão"><RefreshCw size={16} /></Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
