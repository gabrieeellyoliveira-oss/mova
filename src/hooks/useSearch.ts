import { useMemo } from 'react'
import type { FormKind } from './useQuickAdd'
import {
  useBooks, useCourses, useEvents, useTasks, useVaultCosts,
} from './useData'
import { normalize, money } from '@/utils/format'
import { formatShort } from '@/utils/date'

export interface SearchResult {
  id: string
  group: string
  title: string
  subtitle?: string
  path: string
  /** se definido, abre o formulário de edição */
  form?: { kind: FormKind; initial: Record<string, unknown> }
}

export function useGlobalSearch(query: string): SearchResult[] {
  const tasks = useTasks()
  const events = useEvents()
  const costs = useVaultCosts()
  const books = useBooks()
  const courses = useCourses()

  return useMemo(() => {
    const q = normalize(query.trim())
    if (q.length < 2) return []
    const hit = (...s: (string | undefined)[]) => s.some((x) => x && normalize(x).includes(q))
    const out: SearchResult[] = []
    tasks.filter((t) => hit(t.title)).forEach((t) => out.push({ id: t.id, group: 'Tarefas', title: t.title, subtitle: t.done ? 'concluída' : 'pendente', path: '/', form: { kind: 'task', initial: t as never } }))
    events.filter((e) => hit(e.title, e.location, e.notes)).forEach((e) => out.push({ id: e.id, group: 'Agenda', title: e.title, subtitle: `${formatShort(e.date)} · ${e.time}`, path: '/', form: { kind: 'event', initial: e as never } }))
    costs.filter((c) => hit(c.name)).forEach((c) => out.push({ id: c.id, group: 'Cofre: sair de casa', title: c.name, subtitle: money(c.amount), path: '/sair-de-casa' }))
    books.filter((b) => hit(b.title, b.author)).forEach((b) => out.push({ id: b.id, group: 'Livros', title: b.title, subtitle: b.author, path: `/leitura?livro=${b.id}` }))
    courses.filter((c) => hit(c.name, c.institution)).forEach((c) => out.push({ id: c.id, group: 'Estudos', title: c.name, subtitle: c.institution, path: '/estudos' }))
    return out.slice(0, 30)
  }, [query, tasks, events, costs, books, courses])
}
