import {
  Coins, Dumbbell, GraduationCap as GradCap, Heart, Plane, Sprout, Users,
  BookOpen, GraduationCap, Home, LucideIcon,
  Briefcase, NotebookPen, PiggyBank, Repeat, Target, Wallet,
} from 'lucide-react'
import type { IconName } from '@/components/ui/Icon'
import type {
  AreaId, BookStatus, EventCategory, FinanceCategory, GoalCategory, GoalStatus,
  PaymentMethod, Priority,
} from '@/types'

export interface AreaMeta {
  id: AreaId
  label: string
  path: string
  icon: LucideIcon
  /** ícone em pixel art */
  sprite: IconName
  /** cor de destaque */
  color: string
  /** fundo suave */
  soft: string
  tagline?: string
}

export const AREAS: Record<AreaId, AreaMeta> = {
  geral: { id: 'geral', label: 'Geral', path: '/', icon: Home, sprite: 'home', color: '#5B2448', soft: '#F7F2F6' },
  financas: { id: 'financas', label: 'Finanças', path: '/financas', icon: Wallet, sprite: 'coins', color: '#6E2E58', soft: '#F2E7EF', tagline: 'Controle seus gastos e metas' },
  sair: { id: 'sair', label: 'Sair de casa', path: '/sair-de-casa', icon: PiggyBank, sprite: 'piggy', color: '#B58AA8', soft: '#F9F4F8', tagline: 'Seu cofre para a casa nova' },
  estudos: { id: 'estudos', label: 'Estudos', path: '/estudos', icon: GraduationCap, sprite: 'laptop', color: '#5E9474', soft: '#E2F1E8', tagline: 'Acompanhe seus cursos e progresso' },
  leitura: { id: 'leitura', label: 'Leitura', path: '/leitura', icon: BookOpen, sprite: 'book', color: '#5B2448', soft: '#F1EAF0', tagline: 'Seus livros e novas histórias' },
  metas: { id: 'metas', label: 'Metas', path: '/metas', icon: Target, sprite: 'target', color: '#6E2E58', soft: '#E7DEE5', tagline: 'Conquiste o que importa' },
  rotina: { id: 'rotina', label: 'Rotina', path: '/meu-dia', icon: Repeat, sprite: 'dumbbell', color: '#9B5C86', soft: '#F2E7EF', tagline: 'Seus hábitos e bem-estar' },
  trabalho: { id: 'trabalho', label: 'Trabalho', path: '/trabalho', icon: Briefcase, sprite: 'briefcase', color: '#6b3f26', soft: '#F1EAF0', tagline: 'Meta do mês e evolução' },
  notas: { id: 'notas', label: 'Notas', path: '/notas', icon: NotebookPen, sprite: 'note', color: '#3F6E52', soft: '#E2F1E8' },
}
/** Área de uma tarefa (cai em "Geral" se a área não existir mais). */
export const areaMeta = (id: string): AreaMeta => AREAS[id as AreaId] ?? AREAS.geral

/** Menu principal (as três últimas ficam em "Mais" no topo). */
export const NAV_ITEMS: { label: string; path: string; sprite: IconName }[] = [
  { label: 'Visão geral', path: '/', sprite: 'home' },
  { label: 'Meu dia', path: '/meu-dia', sprite: 'day' },
  { label: 'Agenda', path: '/agenda', sprite: 'planner' },
  { label: 'Trabalho', path: '/trabalho', sprite: 'briefcase' },
  { label: 'Metas', path: '/metas', sprite: 'target' },
  { label: 'Finanças', path: '/financas', sprite: 'coins' },
  { label: 'Sair de casa', path: '/sair-de-casa', sprite: 'piggy' },
  { label: 'Estudos', path: '/estudos', sprite: 'laptop' },
  { label: 'Leitura', path: '/leitura', sprite: 'book' },
  { label: 'Notas', path: '/notas', sprite: 'note' },
  { label: 'Conquistas', path: '/conquistas', sprite: 'trophy' },
  { label: 'Configurações', path: '/perfil', sprite: 'gear' },
]

export const EVENT_CATEGORIES: Record<EventCategory, { label: string; color: string; soft: string }> = {
  trabalho: { label: 'Trabalho', color: '#5B2448', soft: '#F1EAF0' },
  estudos: { label: 'Estudos', color: '#5E9474', soft: '#E2F1E8' },
  role: { label: 'Rolê', color: '#B58AA8', soft: '#F9F4F8' },
  saude: { label: 'Saúde', color: '#6E2E58', soft: '#F2E7EF' },
  pessoal: { label: 'Pessoal', color: '#9B5C86', soft: '#F2E7EF' },
  casa: { label: 'Casa', color: '#8a6f5c', soft: '#F7F2F6' },
}

export const PRIORITIES: Record<Priority, { label: string; color: string }> = {
  alta: { label: 'Alta', color: '#6E2E58' },
  media: { label: 'Média', color: '#B58AA8' },
  baixa: { label: 'Baixa', color: '#5E9474' },
}

export const EXPENSE_CATEGORIES: FinanceCategory[] = [
  'Casa', 'Alimentação', 'Transporte', 'Lazer', 'Estudos', 'Assinaturas', 'Compras', 'Saúde', 'Outros',
]
export const INCOME_CATEGORIES: FinanceCategory[] = ['Salário', 'Freela', 'Outros']

export const FINANCE_COLORS: Record<FinanceCategory, string> = {
  Casa: '#5B2448',
  Alimentação: '#6E2E58',
  Transporte: '#B58AA8',
  Lazer: '#E9D7E5',
  Estudos: '#5E9474',
  Assinaturas: '#9B5C86',
  Compras: '#8a6f5c',
  Saúde: '#3F6E52',
  Outros: '#bfaeae',
  Salário: '#5E9474',
  Freela: '#B58AA8',
}

export const PAYMENT_METHODS: PaymentMethod[] = ['Pix', 'Crédito', 'Débito', 'Dinheiro', 'Boleto', 'Transferência']

export const BOOK_STATUS: Record<BookStatus, string> = {
  quero: 'Quero ler',
  lendo: 'Lendo',
  pausado: 'Pausado',
  lido: 'Lido',
}

export const GOAL_CATEGORIES: { id: GoalCategory; emoji: string; icon: LucideIcon; color: string }[] = [
  { id: 'Saúde & bem-estar', emoji: '🌿', icon: Dumbbell, color: '#B58AA8' },
  { id: 'Vida financeira', emoji: '🪙', icon: Coins, color: '#5E9474' },
  { id: 'Vida social', emoji: '💌', icon: Users, color: '#B58AA8' },
  { id: 'Desenvolvimento', emoji: '🌱', icon: Sprout, color: '#5B2448' },
  { id: 'Estudos', emoji: '📚', icon: GradCap, color: '#6E2E58' },
  { id: 'Experiências', emoji: '✈️', icon: Plane, color: '#9B5C86' },
  { id: 'Pessoal', emoji: '🍒', icon: Heart, color: '#6E2E58' },
]
export const goalCategoryMeta = (c: GoalCategory) => GOAL_CATEGORIES.find((g) => g.id === c) ?? GOAL_CATEGORIES[0]

export const GOAL_STATUS: Record<GoalStatus, string> = {
  comecando: 'Começando',
  andamento: 'Em andamento',
  pausada: 'Pausada',
  concluida: 'Concluída',
}

export const COURSE_COLORS = ['#6E2E58', '#5B2448', '#B58AA8', '#5E9474', '#9B5C86', '#3F6E52', '#8a6f5c']
export const BOOK_COLORS = ['#6E2E58', '#5B2448', '#B58AA8', '#5E9474', '#9B5C86', '#3E1631', '#3F6E52', '#8a6f5c']
export const PROJECT_COLORS = ['#6E2E58', '#5B2448', '#B58AA8', '#E9D7E5', '#5E9474', '#9B5C86', '#3E1631']

/** Ícone de cada categoria de meta */
export const GOAL_ICONS: Record<GoalCategory, IconName> = {
  'Saúde & bem-estar': 'dumbbell', 'Vida financeira': 'coins', 'Vida social': 'heart', Desenvolvimento: 'tree',
  Estudos: 'laptop', Experiências: 'map', Pessoal: 'star',
}
