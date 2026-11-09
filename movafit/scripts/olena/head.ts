/**
 * Projetos GRATUITOS da Olena Starodubets, como ela publica em olenastarodubets.com:
 * a ordem dos dias e o link de cada vídeo no YouTube (os vídeos abrem no canal dela).
 * Os títulos e a duração vêm do próprio YouTube; o foco de cada dia e a análise para
 * emagrecer (mix, perWeek, avgMinutes, fatLossScore) foram calculados a partir deles.
 *
 * GERADO em nov/2026 por um script (páginas do site + títulos do YouTube). Para atualizar
 * um projeto, refaça a extração; não edite os dias à mão.
 */
import type { Focus } from '@/types'

export interface ProgramDay {
  day: number
  rest?: boolean
  /** dia opcional (ex.: "OPCIONAL: CARDIO+ABS") */
  optional?: boolean
  /** título do vídeo principal no YouTube */
  title?: string
  minutes?: number
  focus?: Focus
  videos: string[]
}

export interface ProgramMix {
  pernas: number
  bracos: number
  corpo: number
  cardio: number
  abdomen: number
  alongamento: number
  /** dias com cardio dentro do treino */
  comCardio: number
}

export interface Program {
  id: string
  name: string
  /** página do projeto no site da Olena */
  url: string
  minutesPerDay: number
  minutesLabel: string
  level: string
  summary: string
  /** por que é bom (ou não) para emagrecer */
  fatLossWhy?: string
  /** dias de treino por foco */
  mix: ProgramMix
  /** treinos por semana */
  perWeek: number
  avgMinutes: number
  /** nota de 0 a 10 para emagrecer (força 3–4x, cardio 1–4x, descanso, duração) */
  fatLossScore: number
  days: ProgramDay[]
}

