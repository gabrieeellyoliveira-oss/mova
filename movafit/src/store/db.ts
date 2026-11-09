import type { FitSettings, Workout } from '@/types'
import { createCollection } from './collections'
import { createPersistedStore } from './createStore'

/** Dados do MOVAFIT (cada um vira `fit:<chave>` na nuvem). */
export const db = {
  workouts: createCollection<Workout>('workouts', () => []),
}

export const fitSettings = createPersistedStore<FitSettings>('settings', () => ({ weeklyGoal: 4 }))

export const resetAll = () => {
  fitSettings.reset()
  db.workouts.store.reset()
}
