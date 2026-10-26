import { useMemo } from 'react'
import type { ProjectMetric, ProjectStatus, WorkProject } from '@/types'
import { db, workSettingsStore } from '@/store/db'
import { useCollection } from '@/store/collections'
import { useStore } from '@/store/createStore'
import { addDays, daysBetween, today, weekdayIndex } from '@/utils/date'
import { money, ratio } from '@/utils/format'

/** Dias úteis (0 = segunda … 6 = domingo) — guardados em workSettings */
export const useWorkSettings = () => useStore(workSettingsStore)

export const PROJECT_STATUS: Record<ProjectStatus, { label: string; color: string; soft: string }> = {
  planejado: { label: 'Planejado', color: '#8a6f5c', soft: '#F3E9DF' },
  andamento: { label: 'Em andamento', color: '#961415', soft: '#f8dcde' },
  pausado: { label: 'Pausado', color: '#5f5f37', soft: '#E6E4CF' },
  concluido: { label: 'Entregue', color: '#520215', soft: '#EFAFB3' },
}

export const PROJECT_METRICS: Record<ProjectMetric, string> = {
  etapas: 'Etapas',
  moeda: 'Dinheiro (R$)',
  horas: 'Horas',
  numero: 'Quantidade',
}

/** Formata um valor do projeto na unidade dele. */
export function formatProject(n: number, p: Pick<WorkProject, 'metric' | 'unitLabel'>) {
  const v = Math.round(n * 10) / 10
  if (p.metric === 'moeda') return money(n)
  if (p.metric === 'horas') return `${v.toLocaleString('pt-BR')}h`
  if (p.metric === 'etapas') return `${v.toLocaleString('pt-BR')} ${v === 1 ? 'etapa' : 'etapas'}`
  return `${v.toLocaleString('pt-BR')}${p.unitLabel ? ` ${p.unitLabel}` : ''}`
}

/**
 * O mesmo controle da meta do mês, por projeto: quanto já foi feito, o ritmo esperado
 * até o prazo (pelos dias úteis de "Como eu meço"), quanto falta e quanto fazer por dia útil.
 */
export function projectStats(p: WorkProject, workDays: number[], t = today()) {
  const steps = p.metric === 'etapas'
  const total = steps ? p.steps.length : p.target
  const achieved = steps ? p.steps.filter((s) => s.done).length : p.entries.reduce((a, e) => a + e.amount, 0)
  const done = p.status === 'concluido'
  const progress = done ? 100 : ratio(achieved, total)
  const remaining = Math.max(0, total - achieved)

  let expected: number | null = null
  let daysLeft: number | null = null
  let perDay: number | null = null
  let calendarDaysLeft: number | null = null
  if (p.deadline && !done) {
    const start = p.start ?? p.createdAt.slice(0, 10)
    const days: string[] = []
    for (let d = start, i = 0; d <= p.deadline && i < 1500; d = addDays(d, 1), i++) if (workDays.includes(weekdayIndex(d))) days.push(d)
    const elapsed = days.filter((d) => d < t).length
    daysLeft = days.filter((d) => d >= t).length
    expected = days.length ? Math.min(total, (total * elapsed) / days.length) : total
    perDay = daysLeft ? remaining / daysLeft : null
    calendarDaysLeft = daysBetween(t, p.deadline)
  }
  const pace = expected === null ? null : achieved - expected // positivo = adiantada
  return {
    total, achieved, progress, remaining, expected, pace, daysLeft, perDay, calendarDaysLeft,
    expectedPct: expected === null ? null : ratio(expected, total),
    overdue: calendarDaysLeft !== null && calendarDaysLeft < 0 && remaining > 0,
    behind: pace !== null && pace < 0 && remaining > 0,
  }
}
export type ProjectStats = ReturnType<typeof projectStats>

export function useProjects() {
  const projects = useCollection(db.workProjects)
  const { workDays } = useWorkSettings()
  return useMemo(() => {
    const order: Record<ProjectStatus, number> = { andamento: 0, planejado: 1, pausado: 2, concluido: 3 }
    return projects
      .map((p) => ({ project: p, stats: projectStats(p, workDays) }))
      .sort((a, b) => order[a.project.status] - order[b.project.status] || (a.project.deadline ?? '9999').localeCompare(b.project.deadline ?? '9999'))
  }, [projects, workDays])
}
