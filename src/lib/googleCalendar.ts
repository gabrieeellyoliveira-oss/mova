import { useEffect, useMemo } from 'react'
import type { CalendarEvent } from '@/types'
import { googleCalendarCache, integrationsStore } from '@/store/db'
import { useStore } from '@/store/createStore'
import { addDays, today } from '@/utils/date'
import { parseIcs, toIcsUrl } from './ical'

const REFRESH_MS = 15 * 60_000
let inflight: Promise<void> | null = null

/** Busca o .ics (via /api/ical) e guarda os eventos dos últimos 60 e próximos 180 dias. */
export function syncGoogleCalendar(): Promise<void> {
  const link = integrationsStore.get().googleCalendarUrl
  const ics = toIcsUrl(link)
  if (!ics) {
    googleCalendarCache.set({ events: [], error: link ? 'Link não reconhecido.' : undefined })
    return Promise.resolve()
  }
  inflight ??= (async () => {
    try {
      const res = await fetch(`/api/ical?url=${encodeURIComponent(ics)}`)
      const body = await res.text()
      if (!res.ok) throw new Error(res.status === 422 || res.status === 404 ? 'private' : body || `HTTP ${res.status}`)
      const t = today()
      const { name, events } = parseIcs(body, addDays(t, -60), addDays(t, 180))
      googleCalendarCache.set({ fetchedAt: new Date().toISOString(), name, events })
    } catch (e) {
      const msg = e instanceof Error && e.message === 'private'
        ? 'Não consegui ler essa agenda. Use o "Endereço secreto no formato iCal" ou deixe a agenda pública.'
        : 'Não consegui atualizar a agenda agora. Tento de novo daqui a pouco.'
      googleCalendarCache.set({ ...googleCalendarCache.get(), error: msg })
    } finally {
      inflight = null
    }
  })()
  return inflight
}

export function connectGoogleCalendar(link: string) {
  integrationsStore.set({ ...integrationsStore.get(), googleCalendarUrl: link.trim() })
  googleCalendarCache.set({ events: [] })
  return syncGoogleCalendar()
}

export function disconnectGoogleCalendar() {
  integrationsStore.set({ ...integrationsStore.get(), googleCalendarUrl: '' })
  googleCalendarCache.set({ events: [] })
}

/** Mantém a agenda do Google atualizada enquanto o app está aberto. */
export function useGoogleCalendarSync() {
  const { googleCalendarUrl } = useStore(integrationsStore)
  useEffect(() => {
    if (!googleCalendarUrl) return
    const stale = () => {
      const at = googleCalendarCache.get().fetchedAt
      return !at || Date.now() - new Date(at).getTime() > REFRESH_MS
    }
    if (stale()) syncGoogleCalendar()
    const id = setInterval(() => { if (stale()) syncGoogleCalendar() }, 60_000)
    return () => clearInterval(id)
  }, [googleCalendarUrl])
}

/** Evento da agenda (do MOVA ou do Google, que é só leitura). */
export type AgendaEvent = CalendarEvent & { source?: 'google'; allDay?: boolean; endTime?: string }

export function useGoogleEvents(): AgendaEvent[] {
  const { googleCalendarUrl } = useStore(integrationsStore)
  const cache = useStore(googleCalendarCache)
  return useMemo(() => (googleCalendarUrl ? cache.events.map((e) => ({
    id: `g:${e.id}`, createdAt: '', title: e.title, date: e.date, time: e.time || '', category: 'pessoal' as const,
    location: e.location, notes: e.notes, source: 'google' as const, allDay: e.allDay, endTime: e.endTime,
  })) : []), [googleCalendarUrl, cache])
}
