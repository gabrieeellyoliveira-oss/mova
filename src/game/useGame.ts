import { useMemo } from 'react'
import { db } from '@/store/db'
import { useCollection } from '@/store/collections'
import { PAGES_PER_READING, XP_LABELS, XP_VALUES, levelFromXp, type XPSource } from './config'
import { ACHIEVEMENTS, isTraining, rolesCount, type GameData } from './achievements'
import type { IconName } from '@/components/ui/Icon'

/** Estado do "jogo": XP, nível e conquistas — tudo derivado dos dados reais. */
export interface GameAchievement {
  id: string
  /** id da conquista criada pela Gabi (as do jogo não têm) */
  customId?: string
  title: string
  description: string
  sprite: IconName
  current: number
  target: number
  unlocked: boolean
}

export function useGame() {
  const tasks = useCollection(db.tasks)
  const habits = useCollection(db.habits)
  const books = useCollection(db.books)
  const goals = useCollection(db.goals)
  const financialGoals = useCollection(db.financialGoals)
  const places = useCollection(db.places)
  const experiences = useCollection(db.experiences)
  const sessions = useCollection(db.focusSessions)
  const vaultEntries = useCollection(db.vaultEntries)
  const vaultCosts = useCollection(db.vaultCosts)
  const workProjects = useCollection(db.workProjects)
  const custom = useCollection(db.customAchievements)

  return useMemo(() => {
    const trainingLogs = habits.filter(isTraining).reduce((a, h) => a + h.log.length, 0)
    const otherLogs = habits.filter((h) => !isTraining(h)).reduce((a, h) => a + h.log.length, 0)
    const pages = books.reduce((a, b) => a + b.currentPage, 0)
    const counts: Record<XPSource, number> = {
      tarefa: tasks.filter((t) => t.done).length,
      estudo: sessions.length,
      treino: trainingLogs,
      leitura: Math.floor(pages / PAGES_PER_READING),
      habito: otherLogs,
      role: rolesCount(places, experiences),
      meta: goals.filter((g) => g.status === 'concluida').length,
    }
    const breakdown = (Object.keys(XP_VALUES) as XPSource[]).map((k) => ({
      key: k, label: XP_LABELS[k], each: XP_VALUES[k], count: counts[k], xp: counts[k] * XP_VALUES[k],
    }))
    const total = breakdown.reduce((a, b) => a + b.xp, 0)
    const lvl = levelFromXp(total)
    const data: GameData = { tasks, habits, books, goals, financialGoals, places, experiences, sessions, vaultEntries, vaultCosts, workProjects, level: lvl.level }
    const achievements: GameAchievement[] = [
      ...ACHIEVEMENTS.map(({ id, title, description, sprite, progress }) => {
        const p = progress(data)
        return { id, title, description, sprite, ...p, unlocked: p.current >= p.target }
      }),
      // criadas pela Gabi
      ...custom.map((c) => ({
        id: `c:${c.id}`, customId: c.id, title: c.title, description: c.description ?? '', sprite: c.sprite as IconName,
        current: c.current, target: Math.max(1, c.target), unlocked: c.current >= Math.max(1, c.target),
      })),
    ]
    return { total, ...lvl, breakdown, achievements }
  }, [tasks, habits, books, goals, financialGoals, places, experiences, sessions, vaultEntries, vaultCosts, workProjects, custom])
}

export type GameState = ReturnType<typeof useGame>
