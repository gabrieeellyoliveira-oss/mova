import type {
  Book, CalendarEvent, Course, Experience, FinancialGoal, FocusSession, Goal, Habit,
  Note, Place, Settings, Task, Transaction, WeeklyPriority,
} from '@/types'
import * as seed from '@/data/seed'
import { createCollection } from './collections'
import { createPersistedStore } from './createStore'

/**
 * Todas as coleções do MOVA. Cada uma é persistida separadamente pelo adapter
 * em `lib/storage.ts` (hoje LocalStorage).
 */
const places = createCollection<Place>('places', seed.seedPlaces)
const courses = createCollection<Course>('courses', seed.seedCourses)

export const db = {
  events: createCollection<CalendarEvent>('events', seed.seedEvents),
  tasks: createCollection<Task>('tasks', seed.seedTasks),
  transactions: createCollection<Transaction>('transactions', seed.seedTransactions),
  financialGoals: createCollection<FinancialGoal>('financialGoals', seed.seedFinancialGoals),
  places,
  experiences: createCollection<Experience>('experiences', () => seed.seedExperiences(places.store.get())),
  courses,
  focusSessions: createCollection<FocusSession>('focusSessions', () => seed.seedFocusSessions(courses.store.get())),
  books: createCollection<Book>('books', seed.seedBooks),
  goals: createCollection<Goal>('goals', seed.seedGoals),
  habits: createCollection<Habit>('habits', seed.seedHabits),
  priorities: createCollection<WeeklyPriority>('priorities', seed.seedPriorities),
  notes: createCollection<Note>('notes', seed.seedNotes),
}

export const settingsStore = createPersistedStore<Settings>('settings', seed.seedSettings)

export type CollectionName = keyof typeof db

/** Exporta tudo como JSON (backup). */
export const exportAll = () => ({
  version: 1,
  exportedAt: new Date().toISOString(),
  settings: settingsStore.get(),
  ...Object.fromEntries(Object.entries(db).map(([k, c]) => [k, c.store.get()])),
})

export const importAll = (data: Record<string, unknown>) => {
  if (data.settings) settingsStore.set(data.settings as Settings)
  for (const [k, c] of Object.entries(db)) {
    if (Array.isArray(data[k])) (c.store.set as (v: unknown) => void)(data[k])
  }
}

/** Volta para os dados de exemplo. */
export const resetAll = () => {
  settingsStore.reset()
  // ordem importa: places/courses antes de experiences/focusSessions
  for (const c of Object.values(db)) c.store.reset()
}
