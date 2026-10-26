/**
 * Configuração central da gamificação do MOVA.
 * Altere os valores aqui: todo o XP é recalculado a partir dos dados reais.
 */
export const XP_VALUES = {
  tarefa: 5, // concluir uma tarefa (missão)
  estudo: 10, // cada sessão de foco/estudo registrada
  treino: 10, // marcar um hábito de treino
  leitura: 5, // a cada PAGES_PER_READING páginas lidas
  habito: 5, // marcar qualquer outro hábito
  role: 20, // realizar um rolê (lugar marcado como "fui" ou memória registrada)
  meta: 50, // concluir uma meta
} as const

export type XPSource = keyof typeof XP_VALUES

export const XP_LABELS: Record<XPSource, string> = {
  tarefa: 'Concluir tarefa',
  estudo: 'Estudar (sessão de foco)',
  treino: 'Treinar',
  leitura: 'Registrar leitura',
  habito: 'Cumprir hábito',
  role: 'Realizar um rolê',
  meta: 'Concluir meta',
}

/** Quantas páginas lidas valem um "registro de leitura" */
export const PAGES_PER_READING = 20

/** Nomes de hábitos tratados como treino quando o hábito não tem a marca `training` */
export const TRAINING_PATTERN = /academ|trein|muscul|corr|pilates|yoga/i

/* ---------- Níveis ---------- */
/** XP necessário para sair do nível `level` para o próximo (nível 12 → 600 XP) */
export const xpToNext = (level: number) => 50 * level
/** XP total acumulado no início do nível `level` */
export const xpAtLevelStart = (level: number) => 25 * level * (level - 1)
export function levelFromXp(total: number) {
  let level = 1
  while (xpAtLevelStart(level + 1) <= total) level++
  const into = total - xpAtLevelStart(level)
  const needed = xpToNext(level)
  return { level, into, needed, progress: Math.min(100, (into / needed) * 100) }
}
