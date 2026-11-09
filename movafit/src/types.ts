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
  /** treino feito dentro de um programa (ex.: dia 5 do Projeto MOVE) */
  programId?: string
  programDay?: number
}

/** Registro da evolução do corpo: foto e/ou medidas (o MESMO formato e os mesmos dados do mova). */
export interface BodyCheckin extends Entity {
  date: ISODate
  photo?: string
  weight?: number
  waist?: number
  hip?: number
  arm?: number
  thigh?: number
  note?: string
}

/** Programa que estou fazendo: qual, quando comecei e os dias concluídos (dia → data). */
export interface ActiveProgram {
  id: string
  start: ISODate
  done: Record<number, ISODate>
}

export interface FitSettings {
  /** quantos treinos por semana eu quero fazer */
  weeklyGoal: number
  program?: ActiveProgram
  /** meta de peso (kg), opcional */
  goalWeight?: number
  heightCm?: number
}
