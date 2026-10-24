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
