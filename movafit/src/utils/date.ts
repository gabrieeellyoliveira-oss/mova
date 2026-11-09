import type { ISODate } from '@/types'

const pad = (n: number) => String(n).padStart(2, '0')

export const toISODate = (d: Date): ISODate => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const fromISODate = (s: ISODate) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const today = (): ISODate => toISODate(new Date())

export const addDays = (s: ISODate, n: number): ISODate => {
  const d = fromISODate(s)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}
export const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1)

/** Segunda-feira da semana da data */
export const startOfWeek = (s: ISODate): ISODate => {
  const d = fromISODate(s)
  const day = (d.getDay() + 6) % 7
  return addDays(s, -day)
}
export const weekDays = (s: ISODate): ISODate[] => {
  const start = startOfWeek(s)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export const monthKey = (s: ISODate) => s.slice(0, 7)
export const sameMonth = (a: ISODate, b: ISODate) => monthKey(a) === monthKey(b)
export const daysBetween = (a: ISODate, b: ISODate) =>
  Math.round((fromISODate(b).getTime() - fromISODate(a).getTime()) / 86_400_000)

export const WEEKDAYS_SHORT = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']
export const WEEKDAYS_MINI = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
export const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]
export const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3))

export const weekdayIndex = (s: ISODate) => (fromISODate(s).getDay() + 6) % 7

export const formatLong = (s: ISODate) => {
  const d = fromISODate(s)
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}
export const formatShort = (s: ISODate) => {
  const d = fromISODate(s)
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
}
export const formatDayMonthYear = (s: ISODate) => fromISODate(s).toLocaleDateString('pt-BR')

export const relativeDay = (s: ISODate) => {
  const diff = daysBetween(today(), s)
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'amanhã'
  if (diff === -1) return 'ontem'
  if (diff > 1 && diff < 7) return `em ${diff} dias`
  if (diff < -1 && diff > -30) return `há ${-diff} dias`
  return formatShort(s)
}

export const greeting = (date = new Date()) => {
  const h = date.getHours()
  if (h >= 5 && h < 12) return 'Bom dia'
  if (h >= 12 && h < 18) return 'Boa tarde'
  return 'Boa noite'
}

/** Matriz do mês (semanas começando na segunda) com null para dias fora do mês */
export const monthMatrix = (year: number, month: number): (ISODate | null)[][] => {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7
  const total = new Date(year, month + 1, 0).getDate()
  const cells: (ISODate | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: total }, (_, i) => toISODate(new Date(year, month, i + 1))),
  ]
  while (cells.length % 7) cells.push(null)
  const weeks: (ISODate | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}
