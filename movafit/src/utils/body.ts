import type { BodyCheckin } from '@/types'

export type MeasureKey = 'weight' | 'waist' | 'hip' | 'arm' | 'thigh'

export const MEASURES: { key: MeasureKey; label: string; unit: string; placeholder: string }[] = [
  { key: 'weight', label: 'Peso', unit: 'kg', placeholder: '65,0' },
  { key: 'waist', label: 'Cintura', unit: 'cm', placeholder: '72' },
  { key: 'hip', label: 'Quadril', unit: 'cm', placeholder: '98' },
  { key: 'arm', label: 'Braço', unit: 'cm', placeholder: '28' },
  { key: 'thigh', label: 'Coxa', unit: 'cm', placeholder: '56' },
]

/** "65,4" / "65.4" → 65.4; vazio ou inválido → undefined */
export function parseNum(s: string): number | undefined {
  const t = s.trim().replace(',', '.')
  if (!t) return undefined
  const n = Number(t)
  return Number.isFinite(n) && n > 0 ? Math.round(n * 10) / 10 : undefined
}

export const fmt = (n: number, digits = 1) => n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: digits })
export const signed = (n: number, unit: string) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${fmt(Math.abs(n))} ${unit}`

export const byDate = (list: BodyCheckin[]) => [...list].sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))

/** Primeira e última medida de um tipo (para mostrar quanto mudou). */
export function series(list: BodyCheckin[], key: MeasureKey) {
  const pts = byDate(list).filter((c) => c[key] != null).map((c) => ({ date: c.date, value: c[key] as number }))
  const first = pts[0]
  const last = pts[pts.length - 1]
  return { pts, first, last, delta: first && last && pts.length > 1 ? Math.round((last.value - first.value) * 10) / 10 : undefined }
}
