import { useMemo } from 'react'
import { useEvents } from './useData'
import { useGoogleEvents, type AgendaEvent } from '@/lib/googleCalendar'

/** Compromissos do MOVA + eventos do Google Agenda conectado (somente leitura). */
export function useAgendaEvents(): AgendaEvent[] {
  const own = useEvents()
  const google = useGoogleEvents()
  return useMemo(() => [...own, ...google], [own, google])
}
