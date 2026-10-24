import type {
  Book, CalendarEvent, Course, FinancialGoal, FocusSession, Goal, Habit,
  Note, Settings, Task, Transaction, VaultCost, VaultEntry, VaultSettings, WeeklyPriority,
  WorkEntry, WorkGoal, WorkSettings,
} from '@/types'
import * as seed from '@/data/seed'
import { createCollection } from './collections'
import { createPersistedStore } from './createStore'

/**
 * Todas as coleções do MOVA. Cada uma é persistida separadamente pelo adapter
 * em `lib/storage.ts` (hoje LocalStorage).
 */
const courses = createCollection<Course>('courses', seed.seedCourses)

export const db = {
  events: createCollection<CalendarEvent>('events', seed.seedEvents),
  tasks: createCollection<Task>('tasks', seed.seedTasks),
  transactions: createCollection<Transaction>('transactions', seed.seedTransactions),
  financialGoals: createCollection<FinancialGoal>('financialGoals', seed.seedFinancialGoals),
  vaultEntries: createCollection<VaultEntry>('vaultEntries', seed.seedVaultEntries),
  vaultCosts: createCollection<VaultCost>('vaultCosts', seed.seedVaultCosts),
  workGoals: createCollection<WorkGoal>('workGoals', seed.seedWorkGoals),
  workEntries: createCollection<WorkEntry>('workEntries', seed.seedWorkEntries),
  courses,
  focusSessions: createCollection<FocusSession>('focusSessions', () => seed.seedFocusSessions(courses.store.get())),
  books: createCollection<Book>('books', seed.seedBooks),
  goals: createCollection<Goal>('goals', seed.seedGoals),
  habits: createCollection<Habit>('habits', seed.seedHabits),
  priorities: createCollection<WeeklyPriority>('priorities', seed.seedPriorities),
  notes: createCollection<Note>('notes', seed.seedNotes),
}

export const settingsStore = createPersistedStore<Settings>('settings', seed.seedSettings)
export const vaultSettingsStore = createPersistedStore<VaultSettings>('vaultSettings', seed.seedVaultSettings)
export const workSettingsStore = createPersistedStore<WorkSettings>('workSettings', seed.seedWorkSettings)

export type CollectionName = keyof typeof db

/** Exporta tudo como JSON (backup). */
export const exportAll = () => ({
  version: 1,
  exportedAt: new Date().toISOString(),
  settings: settingsStore.get(),
  vaultSettings: vaultSettingsStore.get(),
  workSettings: workSettingsStore.get(),
  ...Object.fromEntries(Object.entries(db).map(([k, c]) => [k, c.store.get()])),
})

export const importAll = (data: Record<string, unknown>) => {
  if (data.settings) settingsStore.set(data.settings as Settings)
  if (data.vaultSettings) vaultSettingsStore.set(data.vaultSettings as VaultSettings)
  if (data.workSettings) workSettingsStore.set(data.workSettings as WorkSettings)
  for (const [k, c] of Object.entries(db)) {
    if (Array.isArray(data[k])) (c.store.set as (v: unknown) => void)(data[k])
  }
}

/** Volta para os dados de exemplo. */
export const resetAll = () => {
  settingsStore.reset()
  vaultSettingsStore.reset()
  workSettingsStore.reset()
  // ordem importa: courses antes de focusSessions
  for (const c of Object.values(db)) c.store.reset()
}
