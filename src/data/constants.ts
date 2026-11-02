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
  geral: { id: 'geral', label: 'Geral', path: '/', icon: Home, sprite: 'home', color: '#3E2723', soft: '#F5F0E6' },
  financas: { id: 'financas', label: 'Finanças', path: '/financas', icon: Wallet, sprite: 'coins', color: '#3E2723', soft: '#F9E1E8', tagline: 'Controle seus gastos e metas' },
  sair: { id: 'sair', label: 'Sair de casa', path: '/sair-de-casa', icon: PiggyBank, sprite: 'piggy', color: '#D99AAE', soft: '#FCF0F3', tagline: 'Seu cofre para a casa nova' },
  estudos: { id: 'estudos', label: 'Estudos', path: '/estudos', icon: GraduationCap, sprite: 'laptop', color: '#6E8B6A', soft: '#E6EDE1', tagline: 'Acompanhe seus cursos e progresso' },
  leitura: { id: 'leitura', label: 'Leitura', path: '/leitura', icon: BookOpen, sprite: 'book', color: '#3E2723', soft: '#F1EAF0', tagline: 'Seus livros e novas histórias' },
  metas: { id: 'metas', label: 'Metas', path: '/metas', icon: Target, sprite: 'target', color: '#3E2723', soft: '#EAE3D6', tagline: 'Conquiste o que importa' },
  rotina: { id: 'rotina', label: 'Rotina', path: '/agenda', icon: Repeat, sprite: 'dumbbell', color: '#B7798C', soft: '#F9E1E8', tagline: 'Seus hábitos e bem-estar' },
  trabalho: { id: 'trabalho', label: 'Trabalho', path: '/trabalho', icon: Briefcase, sprite: 'briefcase', color: '#6b3f26', soft: '#F1EAF0', tagline: 'Meta do mês e evolução' },
  notas: { id: 'notas', label: 'Notas', path: '/notas', icon: NotebookPen, sprite: 'note', color: '#4F6A4C', soft: '#E6EDE1' },
}
/** Área de uma tarefa (cai em "Geral" se a área não existir mais). */
export const areaMeta = (id: string): AreaMeta => AREAS[id as AreaId] ?? AREAS.geral

/** Menu principal (as três últimas ficam em "Mais" no topo). */
export const NAV_ITEMS: { label: string; path: string; sprite: IconName }[] = [
  { label: 'Dashboard', path: '/', sprite: 'home' },
  { label: 'Agenda', path: '/agenda', sprite: 'planner' },
  { label: 'Trabalho', path: '/trabalho', sprite: 'briefcase' },
  { label: 'Finanças', path: '/financas', sprite: 'coins' },
  { label: 'Sair de casa', path: '/sair-de-casa', sprite: 'piggy' },
  { label: 'Estudos', path: '/estudos', sprite: 'laptop' },
  { label: 'Leitura', path: '/leitura', sprite: 'book' },
  { label: 'Conquistas', path: '/conquistas', sprite: 'trophy' },
  { label: 'Configurações', path: '/perfil', sprite: 'gear' },
]

export const EVENT_CATEGORIES: Record<EventCategory, { label: string; color: string; soft: string }> = {
  trabalho: { label: 'Trabalho', color: '#3E2723', soft: '#F1EAF0' },
  estudos: { label: 'Estudos', color: '#6E8B6A', soft: '#E6EDE1' },
  role: { label: 'Rolê', color: '#D99AAE', soft: '#FCF0F3' },
  saude: { label: 'Saúde', color: '#3E2723', soft: '#F9E1E8' },
  pessoal: { label: 'Pessoal', color: '#B7798C', soft: '#F9E1E8' },
  casa: { label: 'Casa', color: '#8a6f5c', soft: '#F5F0E6' },
}

export const PRIORITIES: Record<Priority, { label: string; color: string }> = {
  alta: { label: 'Alta', color: '#3E2723' },
  media: { label: 'Média', color: '#D99AAE' },
  baixa: { label: 'Baixa', color: '#6E8B6A' },
}

export const EXPENSE_CATEGORIES: FinanceCategory[] = [
  'Casa', 'Alimentação', 'Transporte', 'Lazer', 'Estudos', 'Assinaturas', 'Compras', 'Saúde', 'Outros',
]
export const INCOME_CATEGORIES: FinanceCategory[] = ['Salário', 'Freela', 'Outros']

export const FINANCE_COLORS: Record<FinanceCategory, string> = {
  Casa: '#3E2723',
  Alimentação: '#3E2723',
  Transporte: '#D99AAE',
  Lazer: '#F4C9D6',
  Estudos: '#6E8B6A',
  Assinaturas: '#B7798C',
  Compras: '#8a6f5c',
  Saúde: '#4F6A4C',
  Outros: '#bfaeae',
  Salário: '#6E8B6A',
  Freela: '#D99AAE',
}

export const PAYMENT_METHODS: PaymentMethod[] = ['Pix', 'Crédito', 'Débito', 'Dinheiro', 'Boleto', 'Transferência']

export const BOOK_STATUS: Record<BookStatus, string> = {
  quero: 'Quero ler',
  lendo: 'Lendo',
  pausado: 'Pausado',
  lido: 'Lido',
}

export const GOAL_CATEGORIES: { id: GoalCategory; emoji: string; icon: LucideIcon; color: string }[] = [
  { id: 'Saúde & bem-estar', emoji: '🌿', icon: Dumbbell, color: '#D99AAE' },
  { id: 'Vida financeira', emoji: '🪙', icon: Coins, color: '#6E8B6A' },
  { id: 'Vida social', emoji: '💌', icon: Users, color: '#D99AAE' },
  { id: 'Desenvolvimento', emoji: '🌱', icon: Sprout, color: '#3E2723' },
  { id: 'Estudos', emoji: '📚', icon: GradCap, color: '#3E2723' },
  { id: 'Experiências', emoji: '✈️', icon: Plane, color: '#B7798C' },
  { id: 'Pessoal', emoji: '🍒', icon: Heart, color: '#3E2723' },
]
export const goalCategoryMeta = (c: GoalCategory) => GOAL_CATEGORIES.find((g) => g.id === c) ?? GOAL_CATEGORIES[0]

export const GOAL_STATUS: Record<GoalStatus, string> = {
  comecando: 'Começando',
  andamento: 'Em andamento',
  pausada: 'Pausada',
  concluida: 'Concluída',
}

export const COURSE_COLORS = ['#3E2723', '#3E2723', '#D99AAE', '#6E8B6A', '#B7798C', '#4F6A4C', '#8a6f5c']
export const BOOK_COLORS = ['#3E2723', '#3E2723', '#D99AAE', '#6E8B6A', '#B7798C', '#2A1A17', '#4F6A4C', '#8a6f5c']
export const PROJECT_COLORS = ['#3E2723', '#3E2723', '#D99AAE', '#F4C9D6', '#6E8B6A', '#B7798C', '#2A1A17']

/** Ícone de cada categoria de meta */
export const GOAL_ICONS: Record<GoalCategory, IconName> = {
  'Saúde & bem-estar': 'dumbbell', 'Vida financeira': 'coins', 'Vida social': 'heart', Desenvolvimento: 'tree',
  Estudos: 'laptop', Experiências: 'map', Pessoal: 'star',
}
