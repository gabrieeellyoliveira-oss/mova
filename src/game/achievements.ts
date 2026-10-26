import type { SpriteName } from '@/components/game/pixelSprites'
import type { Book, Experience, FinancialGoal, Goal, Habit, Place, Task, FocusSession, VaultCost, VaultEntry } from '@/types'
import { today } from '@/utils/date'
import { TRAINING_PATTERN } from './config'

export interface GameData {
  tasks: Task[]
  habits: Habit[]
  books: Book[]
  goals: Goal[]
  financialGoals: FinancialGoal[]
  places: Place[]
  experiences: Experience[]
  sessions: FocusSession[]
  vaultEntries: VaultEntry[]
  vaultCosts: VaultCost[]
  level: number
}

export const isTraining = (h: Habit) => h.training ?? TRAINING_PATTERN.test(h.name)

/** Rolês realizados: memórias + lugares marcados como "fui"/"quero voltar" sem memória */
export function rolesCount(places: Place[], experiences: Experience[]) {
  const withMemory = new Set(experiences.map((e) => e.placeId).filter(Boolean))
  return experiences.length + places.filter((p) => (p.status === 'fui' || p.status === 'voltar') && !withMemory.has(p.id)).length
}

export interface AchievementDef {
  id: string
  title: string
  description: string
  sprite: SpriteName
  progress: (d: GameData) => { current: number; target: number }
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'treino7', title: '7 dias de treino', description: 'Marque um hábito de treino 7 vezes.', sprite: 'dumbbell',
    progress: (d) => ({ current: d.habits.filter(isTraining).reduce((a, h) => a + h.log.length, 0), target: 7 }) },
  { id: 'livros5', title: '5 livros lidos', description: 'Termine 5 livros da sua estante.', sprite: 'book',
    progress: (d) => ({ current: d.books.filter((b) => b.status === 'lido').length, target: 5 }) },
  { id: 'metafin', title: 'Meta financeira', description: 'Complete uma meta financeira.', sprite: 'coins',
    progress: (d) => ({ current: d.financialGoals.filter((g) => g.current >= g.target).length, target: 1 }) },
  { id: 'rotina', title: 'Rotina em dia', description: 'Marque todos os hábitos no mesmo dia.', sprite: 'heart',
    progress: (d) => ({ current: d.habits.filter((h) => h.log.includes(today())).length, target: Math.max(1, d.habits.length) }) },
  { id: 'role', title: 'Saiu pra um rolê', description: 'Realize seu primeiro rolê.', sprite: 'cherry',
    progress: (d) => ({ current: rolesCount(d.places, d.experiences), target: 1 }) },
  { id: 'cafe', title: 'Conheceu um café novo', description: 'Vá a um café da sua lista.', sprite: 'cup',
    progress: (d) => ({ current: d.places.filter((p) => p.category === 'Cafés' && (p.status === 'fui' || p.status === 'voltar')).length, target: 1 }) },
  { id: 'meta1', title: 'Primeira meta concluída', description: 'Conclua uma meta.', sprite: 'star',
    progress: (d) => ({ current: d.goals.filter((g) => g.status === 'concluida').length, target: 1 }) },
  { id: 'foco10', title: 'Foco de ferro', description: 'Complete 10 sessões de foco.', sprite: 'hourglass',
    progress: (d) => ({ current: d.sessions.length, target: 10 }) },
  { id: 'missoes25', title: '25 missões', description: 'Conclua 25 tarefas.', sprite: 'check',
    progress: (d) => ({ current: d.tasks.filter((t) => t.done).length, target: 25 }) },
  { id: 'cofre50', title: 'Casa nova à vista', description: 'Chegue a 50% do cofre "Sair de casa".', sprite: 'piggy',
    progress: (d) => {
      const saved = d.vaultEntries.reduce((a, e) => a + (e.type === 'deposito' ? e.amount : -e.amount), 0)
      const target = d.vaultCosts.reduce((a, c) => a + c.amount, 0) || 1
      return { current: Math.max(0, Math.round((saved / target) * 100)), target: 50 }
    } },
  { id: 'explora5', title: 'Exploradora', description: 'Conheça 5 lugares da sua lista.', sprite: 'map',
    progress: (d) => ({ current: d.places.filter((p) => p.status === 'fui' || p.status === 'voltar').length, target: 5 }) },
  { id: 'nivel10', title: 'Nível 10', description: 'Chegue ao nível 10.', sprite: 'trophy',
    progress: (d) => ({ current: d.level, target: 10 }) },
]
