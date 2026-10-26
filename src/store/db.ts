import type {
  Book, CalendarEvent, Course, FinancialGoal, FocusSession, Goal, Habit,
  Experience, Note, Place, Settings, Task, Transaction, VaultCost, VaultEntry, VaultSettings, WeeklyPriority,
  WorkEntry, WorkGoal, WorkSettings, WorkProject, Integrations, GoogleCalendarCache, LinkedInData,
} from '@/types'
import * as seed from '@/data/seed'
import { createCollection } from './collections'
import { createPersistedStore } from './createStore'

/**
 * Todas as coleções do MOVA. Cada uma é persistida separadamente pelo adapter
 * em `lib/storage.ts` (hoje LocalStorage).
 */
const courses = createCollection<Course>('courses', seed.seedCourses)
const places = createCollection<Place>('places', seed.seedPlaces)

export const db = {
  events: createCollection<CalendarEvent>('events', seed.seedEvents),
  tasks: createCollection<Task>('tasks', seed.seedTasks),
  transactions: createCollection<Transaction>('transactions', seed.seedTransactions),
  financialGoals: createCollection<FinancialGoal>('financialGoals', seed.seedFinancialGoals),
  places,
  experiences: createCollection<Experience>('experiences', () => seed.seedExperiences(places.store.get())),
  vaultEntries: createCollection<VaultEntry>('vaultEntries', seed.seedVaultEntries),
  vaultCosts: createCollection<VaultCost>('vaultCosts', seed.seedVaultCosts),
  workGoals: createCollection<WorkGoal>('workGoals', seed.seedWorkGoals),
  workEntries: createCollection<WorkEntry>('workEntries', seed.seedWorkEntries),
  workProjects: createCollection<WorkProject>('workProjects', () => []),
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
export const integrationsStore = createPersistedStore<Integrations>('integrations', () => ({ googleCalendarUrl: '' }))
export const googleCalendarCache = createPersistedStore<GoogleCalendarCache>('googleCalendarCache', () => ({ events: [] }))
export const linkedinStore = createPersistedStore<LinkedInData>('linkedin', () => ({ profileUrl: '', postsGoal: 4, posts: [] }))

export type CollectionName = keyof typeof db

/** Exporta tudo como JSON (backup). */
export const exportAll = () => ({
  version: 1,
  exportedAt: new Date().toISOString(),
  settings: settingsStore.get(),
  vaultSettings: vaultSettingsStore.get(),
  workSettings: workSettingsStore.get(),
  integrations: integrationsStore.get(),
  linkedin: linkedinStore.get(),
  ...Object.fromEntries(Object.entries(db).map(([k, c]) => [k, c.store.get()])),
})

export const importAll = (data: Record<string, unknown>) => {
  if (data.settings) settingsStore.set(data.settings as Settings)
  if (data.vaultSettings) vaultSettingsStore.set(data.vaultSettings as VaultSettings)
  if (data.workSettings) workSettingsStore.set(data.workSettings as WorkSettings)
  if (data.integrations) integrationsStore.set(data.integrations as Integrations)
  if (data.linkedin) linkedinStore.set(data.linkedin as LinkedInData)
  for (const [k, c] of Object.entries(db)) {
    if (Array.isArray(data[k])) (c.store.set as (v: unknown) => void)(data[k])
  }
}

/** Volta para os dados de exemplo. */
export const resetAll = () => {
  settingsStore.reset()
  vaultSettingsStore.reset()
  workSettingsStore.reset()
  // conexões (Google Agenda, LinkedIn) são mantidas
  // ordem importa: places/courses antes de experiences/focusSessions
  for (const c of Object.values(db)) c.store.reset()
}
