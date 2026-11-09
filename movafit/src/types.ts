export type ISODate = string

export interface Entity {
  id: string
  createdAt: string
}

export type Focus = 'pernas' | 'abdomen' | 'bracos' | 'corpo' | 'cardio' | 'pilates' | 'alongamento' | 'outro'
export type Intensity = 'leve' | 'moderado' | 'intenso'

/** Um treino feito. */
export interface Workout extends Entity {
  date: ISODate
  title: string
  focus: Focus
  minutes: number
  intensity: Intensity
  /** 1 (péssimo) a 5 (incrível) */
  feeling?: number
  /** link do vídeo/aula que eu segui */
  link?: string
  notes?: string
}

export interface FitSettings {
  /** quantos treinos por semana eu quero fazer */
  weeklyGoal: number
}
