const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const brlShort = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export const money = (v: number) => brl.format(v)
export const moneyShort = (v: number) => brlShort.format(v)
export const pct = (v: number) => `${Math.round(v)}%`
export const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v))
export const ratio = (a: number, b: number) => (b <= 0 ? 0 : clamp((a / b) * 100))

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

export const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Lê valores digitados no formato brasileiro: "1.500", "1.500,90", "1500,9", "R$ 2.000". */
export function parseMoney(raw: string | number): number {
  if (typeof raw === 'number') return raw
  let s = raw.replace(/[^\d.,-]/g, '')
  if (!s) return NaN
  const lastComma = s.lastIndexOf(','), lastDot = s.lastIndexOf('.')
  if (lastComma >= 0 && lastDot >= 0) {
    s = lastComma > lastDot ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '')
  } else if (lastComma >= 0) {
    s = /^-?\d{1,3}(,\d{3}){2,}$/.test(s) ? s.replace(/,/g, '') : s.replace(/,(?=.*,)/g, '').replace(',', '.')
  } else if (lastDot >= 0 && /^-?\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, '')
  }
  return Number(s)
}

/** Valor salvo → texto para o campo (vírgula como decimal). */
export const moneyInput = (n?: number | null) => (n || n === 0 ? String(n).replace('.', ',') : '')
