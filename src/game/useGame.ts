import { useMemo } from 'react'
import { db } from '@/store/db'
import { useCollection } from '@/store/collections'
import { PAGES_PER_READING, XP_LABELS, XP_VALUES, levelFromXp, type XPSource } from './config'
import { ACHIEVEMENTS, isTraining, rolesCount, type GameData } from './achievements'

/** Estado do "jogo": XP, nível e conquistas — tudo derivado dos dados reais. */
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
    const data: GameData = { tasks, habits, books, goals, financialGoals, places, experiences, sessions, vaultEntries, vaultCosts, level: lvl.level }
    const achievements = ACHIEVEMENTS.map((a) => {
      const p = a.progress(data)
      return { ...a, ...p, unlocked: p.current >= p.target }
    })
    return { total, ...lvl, breakdown, achievements }
  }, [tasks, habits, books, goals, financialGoals, places, experiences, sessions, vaultEntries, vaultCosts])
}

export type GameState = ReturnType<typeof useGame>
