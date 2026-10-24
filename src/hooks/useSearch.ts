import { useMemo } from 'react'
import type { FormKind } from './useQuickAdd'
import {
  useBooks, useCourses, useEvents, useGoals, useNotes, useTasks, useTransactions, useVaultCosts,
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
  const notes = useNotes()
  const goals = useGoals()
  const courses = useCourses()
  const tx = useTransactions()

  return useMemo(() => {
    const q = normalize(query.trim())
    if (q.length < 2) return []
    const hit = (...s: (string | undefined)[]) => s.some((x) => x && normalize(x).includes(q))
    const out: SearchResult[] = []
    tasks.filter((t) => hit(t.title)).forEach((t) => out.push({ id: t.id, group: 'Tarefas', title: t.title, subtitle: t.done ? 'concluída' : 'pendente', path: '/', form: { kind: 'task', initial: t as never } }))
    events.filter((e) => hit(e.title, e.location, e.notes)).forEach((e) => out.push({ id: e.id, group: 'Agenda', title: e.title, subtitle: `${formatShort(e.date)} · ${e.time}`, path: '/', form: { kind: 'event', initial: e as never } }))
    costs.filter((c) => hit(c.name)).forEach((c) => out.push({ id: c.id, group: 'Cofre: sair de casa', title: c.name, subtitle: money(c.amount), path: '/sair-de-casa' }))
    books.filter((b) => hit(b.title, b.author)).forEach((b) => out.push({ id: b.id, group: 'Livros', title: b.title, subtitle: b.author, path: `/leitura?livro=${b.id}` }))
    notes.filter((n) => hit(n.title, n.content, ...n.tags)).forEach((n) => out.push({ id: n.id, group: 'Notas', title: n.title, subtitle: n.tags.map((t) => `#${t}`).join(' '), path: '/notas', form: { kind: 'note', initial: n as never } }))
    goals.filter((g) => hit(g.name, g.description)).forEach((g) => out.push({ id: g.id, group: 'Metas', title: g.name, subtitle: g.category, path: '/metas' }))
    courses.filter((c) => hit(c.name, c.institution)).forEach((c) => out.push({ id: c.id, group: 'Estudos', title: c.name, subtitle: c.institution, path: '/estudos' }))
    tx.filter((t) => hit(t.description, t.category)).slice(0, 6).forEach((t) => out.push({ id: t.id, group: 'Finanças', title: t.description, subtitle: `${money(t.amount)} · ${formatShort(t.date)}`, path: '/financas', form: { kind: 'transaction', initial: t as never } }))
    return out.slice(0, 30)
  }, [query, tasks, events, costs, books, notes, goals, courses, tx])
}
