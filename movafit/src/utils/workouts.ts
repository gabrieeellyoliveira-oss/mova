import type { Focus, Intensity, ISODate, Workout } from '@/types'
import { addDays, monthKey, startOfWeek, today } from './date'

/** Foco do treino: nome, emoji e cor do bloco (paleta do mova). */
export const FOCUS: Record<Focus, { label: string; emoji: string; bg: string }> = {
  pernas: { label: 'Pernas e glúteos', emoji: '🍑', bg: 'bg-lavanda' },
  abdomen: { label: 'Abdômen', emoji: '🔥', bg: 'bg-px-gold-soft' },
  bracos: { label: 'Braços e costas', emoji: '💪', bg: 'bg-salvia-200' },
  corpo: { label: 'Corpo todo', emoji: '⚡', bg: 'bg-salvia' },
  cardio: { label: 'Cardio', emoji: '❤️', bg: 'bg-lavanda-200' },
  pilates: { label: 'Pilates', emoji: '🧘', bg: 'bg-lavanda-100' },
  alongamento: { label: 'Alongamento', emoji: '🌿', bg: 'bg-salvia-200' },
  outro: { label: 'Outro', emoji: '✨', bg: 'bg-px-gold-soft' },
}
export const FOCUS_LIST = Object.keys(FOCUS) as Focus[]

export const INTENSITY: Record<Intensity, string> = { leve: 'Leve', moderado: 'Moderado', intenso: 'Intenso' }

export const FEELINGS = [
  { value: 1, emoji: '😩', label: 'Pesado' },
  { value: 2, emoji: '😕', label: 'Difícil' },
  { value: 3, emoji: '🙂', label: 'Ok' },
  { value: 4, emoji: '😄', label: 'Bom' },
  { value: 5, emoji: '🤩', label: 'Incrível' },
]

export const sortByDate = (list: Workout[]) =>
  [...list].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))

/** Dias seguidos com treino, contando até hoje (ou até ontem, se hoje ainda não treinou). */
export function streak(list: Workout[], ref: ISODate = today()) {
  const days = new Set(list.map((w) => w.date))
  let day = days.has(ref) ? ref : addDays(ref, -1)
  let n = 0
  while (days.has(day)) { n++; day = addDays(day, -1) }
  return n
}

export function weekStats(list: Workout[], ref: ISODate = today()) {
  const start = startOfWeek(ref)
  const end = addDays(start, 6)
  const inWeek = list.filter((w) => w.date >= start && w.date <= end)
  return {
    count: inWeek.length,
    days: new Set(inWeek.map((w) => w.date)).size,
    minutes: inWeek.reduce((s, w) => s + (w.minutes || 0), 0),
  }
}

export function monthStats(list: Workout[], month: string) {
  const inMonth = list.filter((w) => monthKey(w.date) === month)
  const byFocus = new Map<Focus, number>()
  inMonth.forEach((w) => byFocus.set(w.focus, (byFocus.get(w.focus) ?? 0) + 1))
  const top = [...byFocus.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  return {
    list: inMonth,
    count: inMonth.length,
    days: new Set(inMonth.map((w) => w.date)).size,
    minutes: inMonth.reduce((s, w) => s + (w.minutes || 0), 0),
    top,
  }
}

/** Treinos diferentes feitos por último (para repetir com um toque). */
export function recentTemplates(list: Workout[], max = 6) {
  const seen = new Set<string>()
  const out: Workout[] = []
  for (const w of sortByDate(list)) {
    const k = w.title.trim().toLowerCase()
    if (!k || seen.has(k)) continue
    seen.add(k)
    out.push(w)
    if (out.length >= max) break
  }
  return out
}

export const formatMinutes = (m: number) => {
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const r = m % 60
  return r ? `${h}h${String(r).padStart(2, '0')}` : `${h}h`
}

/** Link digitado sem https:// também vale. */
export const normalizeLink = (s: string) => {
  const t = s.trim()
  if (!t) return ''
  return /^https?:\/\//i.test(t) ? t : `https://${t}`
}
export const linkDomain = (s: string) => {
  try { return new URL(normalizeLink(s)).hostname.replace(/^www\./, '') } catch { return s }
}
/** Miniatura quando o link é um vídeo do YouTube. */
export function youtubeThumb(s?: string) {
  if (!s) return null
  try {
    const u = new URL(normalizeLink(s))
    const host = u.hostname.replace(/^(www|m)\./, '')
    let id: string | null = null
    if (host === 'youtu.be') id = u.pathname.slice(1)
    else if (host === 'youtube.com') id = u.searchParams.get('v') ?? u.pathname.match(/\/(shorts|embed|live)\/([\w-]+)/)?.[2] ?? null
    return id && /^[\w-]{6,}$/.test(id) ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null
  } catch {
    return null
  }
}
