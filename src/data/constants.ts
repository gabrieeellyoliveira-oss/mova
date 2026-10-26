import {
  Coins, Dumbbell, GraduationCap as GradCap, Heart, Plane, Sprout, Users,
  BookOpen, GraduationCap, Home, LucideIcon,
  Briefcase, NotebookPen, PiggyBank, Repeat, Target, Wallet,
} from 'lucide-react'
import type { SpriteName } from '@/components/game/pixelSprites'
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
  sprite: SpriteName
  /** cor de destaque */
  color: string
  /** fundo suave */
  soft: string
  tagline?: string
}

export const AREAS: Record<AreaId, AreaMeta> = {
  geral: { id: 'geral', label: 'Geral', path: '/', icon: Home, sprite: 'home', color: '#520215', soft: '#F6EDE3' },
  financas: { id: 'financas', label: 'Finanças', path: '/financas', icon: Wallet, sprite: 'coins', color: '#961415', soft: '#f8dcde', tagline: 'Controle seus gastos e metas' },
  sair: { id: 'sair', label: 'Sair de casa', path: '/sair-de-casa', icon: PiggyBank, sprite: 'piggy', color: '#CB757C', soft: '#fcefef', tagline: 'Seu cofre para a casa nova' },
  estudos: { id: 'estudos', label: 'Estudos', path: '/estudos', icon: GraduationCap, sprite: 'laptop', color: '#7A7A4A', soft: '#E6E4CF', tagline: 'Acompanhe seus cursos e progresso' },
  leitura: { id: 'leitura', label: 'Leitura', path: '/leitura', icon: BookOpen, sprite: 'book', color: '#520215', soft: '#EFE3D6', tagline: 'Seus livros e novas histórias' },
  metas: { id: 'metas', label: 'Metas', path: '/metas', icon: Target, sprite: 'target', color: '#961415', soft: '#DFD1D1', tagline: 'Conquiste o que importa' },
  rotina: { id: 'rotina', label: 'Rotina', path: '/meu-dia', icon: Repeat, sprite: 'dumbbell', color: '#b8565e', soft: '#f8dcde', tagline: 'Seus hábitos e bem-estar' },
  trabalho: { id: 'trabalho', label: 'Trabalho', path: '/trabalho', icon: Briefcase, sprite: 'briefcase', color: '#6b3f26', soft: '#EFE3D6', tagline: 'Meta do mês e evolução' },
  notas: { id: 'notas', label: 'Notas', path: '/notas', icon: NotebookPen, sprite: 'note', color: '#5f5f37', soft: '#E6E4CF' },
}
/** Área de uma tarefa (cai em "Geral" se a área não existir mais). */
export const areaMeta = (id: string): AreaMeta => AREAS[id as AreaId] ?? AREAS.geral

/** Menu principal (ordem do redesign; Trabalho, Sair de casa e Notas continuam). */
export const NAV_ITEMS: { label: string; path: string; sprite: SpriteName }[] = [
  { label: 'Início', path: '/', sprite: 'home' },
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
  trabalho: { label: 'Trabalho', color: '#520215', soft: '#EFE3D6' },
  estudos: { label: 'Estudos', color: '#7A7A4A', soft: '#E6E4CF' },
  role: { label: 'Rolê', color: '#CB757C', soft: '#fcefef' },
  saude: { label: 'Saúde', color: '#961415', soft: '#f8dcde' },
  pessoal: { label: 'Pessoal', color: '#b8565e', soft: '#f8dcde' },
  casa: { label: 'Casa', color: '#8a6f5c', soft: '#F6EDE3' },
}

export const PRIORITIES: Record<Priority, { label: string; color: string }> = {
  alta: { label: 'Alta', color: '#961415' },
  media: { label: 'Média', color: '#CB757C' },
  baixa: { label: 'Baixa', color: '#7A7A4A' },
}

export const EXPENSE_CATEGORIES: FinanceCategory[] = [
  'Casa', 'Alimentação', 'Transporte', 'Lazer', 'Estudos', 'Assinaturas', 'Compras', 'Saúde', 'Outros',
]
export const INCOME_CATEGORIES: FinanceCategory[] = ['Salário', 'Freela', 'Outros']

export const FINANCE_COLORS: Record<FinanceCategory, string> = {
  Casa: '#520215',
  Alimentação: '#961415',
  Transporte: '#CB757C',
  Lazer: '#EFAFB3',
  Estudos: '#7A7A4A',
  Assinaturas: '#b8565e',
  Compras: '#8a6f5c',
  Saúde: '#5f5f37',
  Outros: '#bfaeae',
  Salário: '#7A7A4A',
  Freela: '#CB757C',
}

export const PAYMENT_METHODS: PaymentMethod[] = ['Pix', 'Crédito', 'Débito', 'Dinheiro', 'Boleto', 'Transferência']

export const BOOK_STATUS: Record<BookStatus, string> = {
  quero: 'Quero ler',
  lendo: 'Lendo',
  pausado: 'Pausado',
  lido: 'Lido',
}

export const GOAL_CATEGORIES: { id: GoalCategory; emoji: string; icon: LucideIcon; color: string }[] = [
  { id: 'Saúde & bem-estar', emoji: '🌿', icon: Dumbbell, color: '#CB757C' },
  { id: 'Vida financeira', emoji: '🪙', icon: Coins, color: '#7A7A4A' },
  { id: 'Vida social', emoji: '💌', icon: Users, color: '#CB757C' },
  { id: 'Desenvolvimento', emoji: '🌱', icon: Sprout, color: '#520215' },
  { id: 'Estudos', emoji: '📚', icon: GradCap, color: '#961415' },
  { id: 'Experiências', emoji: '✈️', icon: Plane, color: '#b8565e' },
  { id: 'Pessoal', emoji: '🍒', icon: Heart, color: '#961415' },
]
export const goalCategoryMeta = (c: GoalCategory) => GOAL_CATEGORIES.find((g) => g.id === c) ?? GOAL_CATEGORIES[0]

export const GOAL_STATUS: Record<GoalStatus, string> = {
  comecando: 'Começando',
  andamento: 'Em andamento',
  pausada: 'Pausada',
  concluida: 'Concluída',
}

export const COURSE_COLORS = ['#961415', '#520215', '#CB757C', '#7A7A4A', '#b8565e', '#5f5f37', '#8a6f5c']
export const BOOK_COLORS = ['#961415', '#520215', '#CB757C', '#7A7A4A', '#b8565e', '#3a010f', '#5f5f37', '#8a6f5c']
export const PROJECT_COLORS = ['#961415', '#520215', '#CB757C', '#EFAFB3', '#7A7A4A', '#b8565e', '#3a010f']

