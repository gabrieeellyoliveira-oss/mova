import { linkedinStore } from '@/store/db'
import { monthKey, today } from '@/utils/date'
import type { LinkedInData } from '@/types'

/** Aceita linkedin.com/in/usuario (com ou sem https/www) e devolve o link completo. */
export function normalizeLinkedIn(input: string): string | null {
  const raw = input.trim().replace(/^(https?:\/\/)?(www\.|[a-z]{2}\.)?/i, '')
  const m = raw.match(/^linkedin\.com\/(in|company)\/([^/?#\s]+)/i)
  return m ? `https://www.linkedin.com/${m[1].toLowerCase()}/${m[2]}` : null
}

export const updateLinkedIn = (patch: Partial<LinkedInData>) =>
  linkedinStore.set({ ...linkedinStore.get(), ...patch, updatedAt: new Date().toISOString() })

export const logLinkedInPost = () => updateLinkedIn({ posts: [...linkedinStore.get().posts, today()] })
export const undoLinkedInPost = () => {
  const posts = [...linkedinStore.get().posts]
  const i = posts.lastIndexOf(today())
  if (i >= 0) posts.splice(i, 1)
  updateLinkedIn({ posts })
}
export const postsThisMonth = (d: LinkedInData) => d.posts.filter((p) => monthKey(p) === monthKey(today())).length

const GOOD_DAYS = [2, 3, 4] // terça, quarta e quinta (getDay)
const WEEKDAY = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

export interface PostAdvice {
  /** Dia sugerido para o próximo post */
  next: string
  /** Frase curta: "Hoje", "Amanhã", "Quarta, 4 de nov" */
  when: string
  /** Por que esse dia */
  reason: string
  /** Seu ritmo atual, se der para calcular */
  rhythm?: string
  daysSince?: number
}

/**
 * Analisa os dias em que a Gabi postou e sugere quando postar de novo.
 * Regras: manter um intervalo parecido com o dela (entre 2 e 4 dias, o ritmo de 2–3 posts por semana
 * que costuma manter o alcance), não deixar passar de 7 dias parada, e cair de terça a quinta, de manhã.
 */
export function postingAdvice(posts: string[], from = today()): PostAdvice {
  const days = [...new Set(posts)].filter((d) => d <= from).sort()
  const toDate = (s: string) => new Date(`${s}T12:00:00`)
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const diff = (a: string, b: string) => Math.round((toDate(b).getTime() - toDate(a).getTime()) / 86_400_000)
  const add = (s: string, n: number) => { const d = toDate(s); d.setDate(d.getDate() + n); return iso(d) }
  const toGoodDay = (s: string) => { let d = s; for (let i = 0; i < 7 && !GOOD_DAYS.includes(toDate(d).getDay()); i++) d = add(d, 1); return d }
  const isGood = (s: string) => GOOD_DAYS.includes(toDate(s).getDay())
  /** Dia bom (ter–qui) mais perto do ideal, sem ficar antes de `min` nem passar 2 dias do ideal. */
  const nearGood = (ideal: string, min: string) => {
    for (let k = 0; k <= 2; k++) {
      const back = add(ideal, -k)
      if (back >= min && isGood(back)) return back
      const fwd = add(ideal, k)
      if (isGood(fwd)) return fwd
    }
    return ideal
  }
  const label = (s: string) => {
    const n = diff(from, s)
    if (n <= 0) return 'Hoje'
    if (n === 1) return 'Amanhã'
    const d = toDate(s)
    return `${WEEKDAY[d.getDay()].replace(/^./, (c) => c.toUpperCase())}, ${d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '')}`
  }

  if (!days.length) {
    const next = toGoodDay(from)
    return { next, when: label(next), reason: 'Ainda não tem post registrado. Comece nesta semana: de terça a quinta, entre 8h e 10h, costuma ter mais alcance.' }
  }

  const last = days[days.length - 1]
  const daysSince = diff(last, from)
  const gaps = days.slice(-7).map((d, i, a) => (i ? diff(a[i - 1], d) : 0)).slice(1).filter((g) => g > 0)
  const avg = gaps.length ? gaps.reduce((a, g) => a + g, 0) / gaps.length : null
  const target = Math.min(4, Math.max(2, Math.round(avg ?? 3)))
  const last28 = days.filter((d) => diff(d, from) < 28).length
  const rhythm = avg ? `Seu ritmo: 1 post a cada ${Math.round(avg)} ${Math.round(avg) === 1 ? 'dia' : 'dias'} · ${last28} nas últimas 4 semanas` : `${last28} ${last28 === 1 ? 'post' : 'posts'} nas últimas 4 semanas`

  if (daysSince === 0) {
    const next = nearGood(add(from, target), add(from, 2))
    return { next, when: label(next), daysSince, rhythm, reason: `Você postou hoje 🎉 Dê um respiro de uns ${target} dias para o post render e volte de manhã, entre 8h e 10h.` }
  }
  if (daysSince >= 7) {
    const next = GOOD_DAYS.includes(toDate(from).getDay()) || daysSince >= 10 ? from : toGoodDay(from)
    return { next, when: label(next), daysSince, rhythm, reason: `Faz ${daysSince} dias sem postar — perfil parado perde alcance. Volte ${next === from ? 'hoje' : 'no próximo dia bom'}, entre 8h e 10h, com algo leve (um aprendizado da semana, por exemplo).` }
  }
  let ideal = add(last, target)
  if (ideal < from) ideal = from
  let next = nearGood(ideal, from > add(last, 2) ? from : add(last, 2))
  if (diff(last, next) > 7) next = add(last, 7)
  return { next, when: label(next), daysSince, rhythm, reason: `Seu último post foi há ${daysSince} ${daysSince === 1 ? 'dia' : 'dias'}. Mantendo um intervalo de ~${target} dias e caindo de terça a quinta, o próximo rende mais entre 8h e 10h.` }
}
