/**
 * Leitor de agendas no formato iCal (.ics) — usado para conectar o Google Agenda
 * só com o link da agenda, sem login do Google.
 */
import { addDays, toISODate } from '@/utils/date'

export interface ExternalEvent {
  id: string
  title: string
  date: string // ISODate
  time: string // "HH:MM" ou "" quando é o dia todo
  endTime?: string
  allDay: boolean
  location?: string
  notes?: string
}

const GOOGLE_HOSTS = ['calendar.google.com', 'www.google.com']

/**
 * Aceita os formatos de link que o Google Agenda mostra e devolve o endereço .ics:
 * - Endereço secreto/público no formato iCal (…/calendar/ical/…/basic.ics)
 * - Link de compartilhamento (…/calendar/u/0?cid=…) ou de incorporar (…/calendar/embed?src=…)
 * - webcal://… ou só o ID da agenda (ex.: nome@gmail.com)
 */
export function toIcsUrl(input: string): string | null {
  let raw = input.trim()
  if (!raw) return null
  if (/^[^\s/@]+@[^\s/@]+\.[^\s/@]+$/.test(raw)) return publicIcs(raw)
  raw = raw.replace(/^webcals?:\/\//i, 'https://')
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' || !GOOGLE_HOSTS.includes(url.hostname)) return null
  if (/\/calendar\/ical\//.test(url.pathname)) return url.toString()
  const src = url.searchParams.get('src')
  if (src) return publicIcs(src)
  const cid = url.searchParams.get('cid')
  if (cid) {
    if (cid.includes('@')) return publicIcs(cid)
    try {
      const decoded = atob(cid.replace(/-/g, '+').replace(/_/g, '/'))
      if (decoded.includes('@') || decoded.includes('.')) return publicIcs(decoded)
    } catch { /* cid inválido */ }
  }
  return null
}
const publicIcs = (id: string) => `https://calendar.google.com/calendar/ical/${encodeURIComponent(id)}/public/basic.ics`

/* ---------- leitura do .ics ---------- */

type Props = Record<string, { value: string; params: Record<string, string> }[]>

function unfold(text: string) {
  return text.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '').split('\n')
}

function parseLine(line: string) {
  const i = line.indexOf(':')
  if (i < 0) return null
  const head = line.slice(0, i).split(';')
  const params: Record<string, string> = {}
  head.slice(1).forEach((p) => {
    const [k, v] = p.split('=')
    if (k && v) params[k.toUpperCase()] = v.replace(/^"|"$/g, '')
  })
  return { name: head[0].toUpperCase(), params, value: line.slice(i + 1) }
}

const unescape = (s: string) => s.replace(/\\n/gi, '\n').replace(/\\([,;\\])/g, '$1').trim()

/** Diferença (ms) entre o fuso informado e UTC naquele instante. */
function tzOffset(date: Date, timeZone: string) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(date)
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value)
    return Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second')) - date.getTime()
  } catch {
    return -date.getTimezoneOffset() * 60_000
  }
}

/** Converte um valor DATE/DATE-TIME do iCal para uma data local. */
function parseDate(value: string, params: Record<string, string>): { date: Date; allDay: boolean } | null {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/)
  if (!m) return null
  const [, y, mo, d, h, mi, s, z] = m
  if (!h || params.VALUE === 'DATE') return { date: new Date(+y, +mo - 1, +d), allDay: true }
  if (z) return { date: new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +(s ?? 0))), allDay: false }
  if (params.TZID) {
    const guess = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +(s ?? 0)))
    return { date: new Date(guess.getTime() - tzOffset(guess, params.TZID)), allDay: false }
  }
  return { date: new Date(+y, +mo - 1, +d, +h, +mi, +(s ?? 0)), allDay: false }
}

const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
const WEEKDAY: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 }

/** Datas (ISODate) em que um evento recorrente acontece dentro da janela. */
function expandRule(rule: string, start: Date, from: string, to: string, exdates: Set<string>): string[] {
  const r = Object.fromEntries(rule.split(';').map((p) => p.split('=')).map(([k, v]) => [k?.toUpperCase(), v]))
  const freq = r.FREQ
  const interval = Math.max(1, Number(r.INTERVAL) || 1)
  const count = r.COUNT ? Number(r.COUNT) : Infinity
  const until = r.UNTIL ? parseDate(r.UNTIL, {})?.date : undefined
  const untilISO = until ? toISODate(until) : '9999-12-31'
  const byDay = r.BYDAY ? r.BYDAY.split(',').map((x) => { const mm = x.match(/^([+-]?\d+)?([A-Z]{2})$/); return mm ? { n: mm[1] ? Number(mm[1]) : 0, wd: WEEKDAY[mm[2]] } : null }).filter(Boolean) as { n: number; wd: number }[] : []
  const byMonthDay = r.BYMONTHDAY ? r.BYMONTHDAY.split(',').map(Number) : []
  const startISO = toISODate(start)
  const sd = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const weekStart = (d: Date) => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x }
  const sw = weekStart(sd)

  const matches = (d: Date) => {
    const days = Math.round((d.getTime() - sd.getTime()) / 86_400_000)
    const months = (d.getFullYear() - sd.getFullYear()) * 12 + d.getMonth() - sd.getMonth()
    switch (freq) {
      case 'DAILY':
        return days % interval === 0 && (!byDay.length || byDay.some((b) => b.wd === d.getDay()))
      case 'WEEKLY': {
        const weeks = Math.round((weekStart(d).getTime() - sw.getTime()) / (7 * 86_400_000))
        const wds = byDay.length ? byDay.map((b) => b.wd) : [sd.getDay()]
        return weeks % interval === 0 && wds.includes(d.getDay())
      }
      case 'MONTHLY': {
        if (months % interval !== 0) return false
        if (byMonthDay.length) {
          const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
          return byMonthDay.some((md) => (md > 0 ? md : last + md + 1) === d.getDate())
        }
        if (byDay.length) {
          const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
          return byDay.some((b) => {
            if (b.wd !== d.getDay()) return false
            if (!b.n) return true
            const nth = Math.ceil(d.getDate() / 7)
            const nthFromEnd = Math.ceil((last - d.getDate() + 1) / 7)
            return b.n > 0 ? nth === b.n : nthFromEnd === -b.n
          })
        }
        return d.getDate() === sd.getDate()
      }
      case 'YEARLY':
        return months % (12 * interval) === 0 && d.getDate() === sd.getDate()
      default:
        return false
    }
  }

  const out: string[] = []
  let n = 0
  const end = to < untilISO ? to : untilISO
  for (let iso = startISO, guard = 0; iso <= end && n < count && guard < 6000; iso = addDays(iso, 1), guard++) {
    const [y, m, dd] = iso.split('-').map(Number)
    const d = new Date(y, m - 1, dd)
    if (!matches(d)) continue
    n++
    if (iso >= from && !exdates.has(iso)) out.push(iso)
  }
  return out
}

/** Lê o .ics e devolve os eventos entre `from` e `to` (ISODate), já com recorrências. */
export function parseIcs(text: string, from: string, to: string): { name?: string; events: ExternalEvent[] } {
  const lines = unfold(text)
  if (!lines.some((l) => l.startsWith('BEGIN:VCALENDAR'))) throw new Error('not-ics')
  let name: string | undefined
  const raw: Props[] = []
  let cur: Props | null = null
  let depth = 0
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { cur = {}; depth = 0; continue }
    if (line === 'END:VEVENT') { if (cur) raw.push(cur); cur = null; continue }
    if (cur) {
      if (line.startsWith('BEGIN:')) depth++
      else if (line.startsWith('END:')) depth--
      else if (depth === 0) {
        const p = parseLine(line)
        if (p) (cur[p.name] ??= []).push({ value: p.value, params: p.params })
      }
    } else if (line.startsWith('X-WR-CALNAME:')) name = unescape(line.slice(13))
  }

  // ocorrências editadas (RECURRENCE-ID) substituem a data original da série
  const overridden = new Set<string>()
  raw.forEach((e) => {
    const rid = e['RECURRENCE-ID']?.[0]
    const uid = e.UID?.[0]?.value
    if (rid && uid) { const d = parseDate(rid.value, rid.params); if (d) overridden.add(`${uid}|${toISODate(d.date)}`) }
  })

  const events: ExternalEvent[] = []
  for (const e of raw) {
    if (e.STATUS?.[0]?.value === 'CANCELLED') continue
    const ds = e.DTSTART?.[0]
    if (!ds) continue
    const start = parseDate(ds.value, ds.params)
    if (!start) continue
    const de = e.DTEND?.[0]
    const end = de ? parseDate(de.value, de.params) : null
    const uid = e.UID?.[0]?.value ?? `${ds.value}-${e.SUMMARY?.[0]?.value}`
    const durationMs = end ? end.date.getTime() - start.date.getTime() : 0
    const base = {
      title: unescape(e.SUMMARY?.[0]?.value ?? '(sem título)'),
      allDay: start.allDay,
      location: e.LOCATION?.[0] ? unescape(e.LOCATION[0].value) || undefined : undefined,
      notes: e.DESCRIPTION?.[0] ? unescape(e.DESCRIPTION[0].value).slice(0, 500) || undefined : undefined,
    }
    const make = (iso: string): ExternalEvent => {
      const [y, m, d] = iso.split('-').map(Number)
      const s = new Date(y, m - 1, d, start.date.getHours(), start.date.getMinutes())
      return {
        ...base,
        id: `${uid}|${iso}`,
        date: iso,
        time: start.allDay ? '' : hhmm(s),
        endTime: start.allDay || !durationMs ? undefined : hhmm(new Date(s.getTime() + durationMs)),
      }
    }
    const rule = e.RRULE?.[0]?.value
    if (rule && !e['RECURRENCE-ID']) {
      const ex = new Set<string>()
      e.EXDATE?.forEach((x) => x.value.split(',').forEach((v) => { const d = parseDate(v, x.params); if (d) ex.add(toISODate(d.date)) }))
      expandRule(rule, start.date, from, to, ex).forEach((iso) => { if (!overridden.has(`${uid}|${iso}`)) events.push(make(iso)) })
    } else {
      const iso = toISODate(start.date)
      if (iso >= from && iso <= to) events.push(make(iso))
    }
  }
  events.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  return { name, events }
}
