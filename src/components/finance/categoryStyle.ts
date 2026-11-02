import {
  ArrowDownLeft, BookOpen, Briefcase, Car, Gamepad2, HeartPulse, Home, Package, Repeat, ShoppingBag, Utensils, type LucideIcon,
} from 'lucide-react'
import type { FinanceCategory, Transaction } from '@/types'

export interface CategoryStyle { icon: LucideIcon; bg: string; fg: string }

/** Ícone e cor de cada tipo de movimentação (entradas sempre em verde). */
export const CATEGORY_STYLE: Record<FinanceCategory, CategoryStyle> = {
  Alimentação: { icon: Utensils, bg: '#ECC980', fg: '#0C0A0E' },
  Casa: { icon: Home, bg: '#C3AEEC', fg: '#0C0A0E' },
  Transporte: { icon: Car, bg: '#D9864A', fg: '#0C0A0E' },
  Lazer: { icon: Gamepad2, bg: '#F2B8C6', fg: '#0C0A0E' },
  Estudos: { icon: BookOpen, bg: '#A8CA96', fg: '#0C0A0E' },
  Assinaturas: { icon: Repeat, bg: '#DCD1F4', fg: '#0C0A0E' },
  Compras: { icon: ShoppingBag, bg: '#702335', fg: '#F6F1E7' },
  Saúde: { icon: HeartPulse, bg: '#E07A8C', fg: '#0C0A0E' },
  Outros: { icon: Package, bg: '#EBE7E0', fg: '#0C0A0E' },
  Salário: { icon: Briefcase, bg: '#376139', fg: '#F6F1E7' },
  Freela: { icon: ArrowDownLeft, bg: '#376139', fg: '#F6F1E7' },
}

const INCOME: CategoryStyle = { icon: ArrowDownLeft, bg: '#376139', fg: '#F6F1E7' }

/** Estilo de uma movimentação: entrada (Pix, salário, extra) = verde; saída = cor da categoria. */
export const styleOf = (t: Pick<Transaction, 'type' | 'category'>): CategoryStyle =>
  t.type === 'receita' ? (t.category === 'Salário' ? CATEGORY_STYLE.Salário : INCOME) : CATEGORY_STYLE[t.category] ?? CATEGORY_STYLE.Outros
