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
  geral: { id: 'geral', label: 'Geral', path: '/', icon: Home, sprite: 'home', color: '#0C0A0E', soft: '#F1EFF4' },
  financas: { id: 'financas', label: 'Finanças', path: '/financas', icon: Wallet, sprite: 'coins', color: '#0C0A0E', soft: '#DCD1F4', tagline: 'Controle seus gastos e metas' },
  sair: { id: 'sair', label: 'Sair de casa', path: '/sair-de-casa', icon: PiggyBank, sprite: 'piggy', color: '#C3AEEC', soft: '#EBE4FA', tagline: 'Seu cofre para a casa nova' },
  estudos: { id: 'estudos', label: 'Estudos', path: '/estudos', icon: GraduationCap, sprite: 'laptop', color: '#376139', soft: '#D2E5C8', tagline: 'Acompanhe seus cursos e progresso' },
  leitura: { id: 'leitura', label: 'Leitura', path: '/leitura', icon: BookOpen, sprite: 'book', color: '#0C0A0E', soft: '#EBE4FA', tagline: 'Seus livros e novas histórias' },
  metas: { id: 'metas', label: 'Metas', path: '/metas', icon: Target, sprite: 'target', color: '#0C0A0E', soft: '#EBE7E0', tagline: 'Conquiste o que importa' },
  rotina: { id: 'rotina', label: 'Rotina', path: '/agenda', icon: Repeat, sprite: 'dumbbell', color: '#702335', soft: '#DCD1F4', tagline: 'Seus hábitos e bem-estar' },
  trabalho: { id: 'trabalho', label: 'Trabalho', path: '/trabalho', icon: Briefcase, sprite: 'briefcase', color: '#6b3f26', soft: '#EBE4FA', tagline: 'Meta do mês e evolução' },
  notas: { id: 'notas', label: 'Notas', path: '/notas', icon: NotebookPen, sprite: 'note', color: '#2A4B2C', soft: '#D2E5C8' },
}
/** Área de uma tarefa (cai em "Geral" se a área não existir mais). */
export const areaMeta = (id: string): AreaMeta => AREAS[id as AreaId] ?? AREAS.geral

/** Abas do app (Configurações fica só no menu do perfil). */
export const NAV_ITEMS: { label: string; path: string; sprite: IconName }[] = [
  { label: 'Dashboard', path: '/', sprite: 'home' },
  { label: 'Agenda', path: '/agenda', sprite: 'planner' },
  { label: 'Trabalho', path: '/trabalho', sprite: 'briefcase' },
  { label: 'Sair de casa', path: '/sair-de-casa', sprite: 'piggy' },
  { label: 'Estudos', path: '/estudos', sprite: 'laptop' },
  { label: 'Leitura', path: '/leitura', sprite: 'book' },
  { label: 'Evolução', path: '/evolucao', sprite: 'dumbbell' },
  { label: 'Diário', path: '/diario', sprite: 'note' },
  { label: 'Configurações', path: '/perfil', sprite: 'gear' },
]

export const EVENT_CATEGORIES: Record<EventCategory, { label: string; color: string; soft: string }> = {
  trabalho: { label: 'Trabalho', color: '#0C0A0E', soft: '#EBE4FA' },
  estudos: { label: 'Estudos', color: '#376139', soft: '#D2E5C8' },
  role: { label: 'Rolê', color: '#C3AEEC', soft: '#EBE4FA' },
  saude: { label: 'Saúde', color: '#0C0A0E', soft: '#DCD1F4' },
  pessoal: { label: 'Pessoal', color: '#702335', soft: '#DCD1F4' },
  casa: { label: 'Casa', color: '#8a6f5c', soft: '#F1EFF4' },
}

export const PRIORITIES: Record<Priority, { label: string; color: string }> = {
  alta: { label: 'Alta', color: '#0C0A0E' },
  media: { label: 'Média', color: '#C3AEEC' },
  baixa: { label: 'Baixa', color: '#376139' },
}

export const EXPENSE_CATEGORIES: FinanceCategory[] = [
  'Casa', 'Alimentação', 'Transporte', 'Lazer', 'Estudos', 'Assinaturas', 'Compras', 'Saúde', 'Outros',
]
export const INCOME_CATEGORIES: FinanceCategory[] = ['Salário', '13º salário', 'Freela', 'Outros']

export const FINANCE_COLORS: Record<FinanceCategory, string> = {
  Casa: '#0C0A0E',
  Alimentação: '#0C0A0E',
  Transporte: '#C3AEEC',
  Lazer: '#C3AEEC',
  Estudos: '#376139',
  Assinaturas: '#702335',
  Compras: '#8a6f5c',
  Saúde: '#2A4B2C',
  Outros: '#bfaeae',
  Salário: '#376139',
  '13º salário': '#376139',
  Freela: '#C3AEEC',
}

export const PAYMENT_METHODS: PaymentMethod[] = ['Pix', 'Crédito', 'Débito', 'Dinheiro', 'Boleto', 'Transferência', 'Vale-alimentação']

export const BOOK_STATUS: Record<BookStatus, string> = {
  quero: 'Quero ler',
  lendo: 'Lendo',
  pausado: 'Pausado',
  lido: 'Lido',
}

export const GOAL_CATEGORIES: { id: GoalCategory; emoji: string; icon: LucideIcon; color: string }[] = [
  { id: 'Saúde & bem-estar', emoji: '🌿', icon: Dumbbell, color: '#C3AEEC' },
  { id: 'Vida financeira', emoji: '🪙', icon: Coins, color: '#376139' },
  { id: 'Vida social', emoji: '💌', icon: Users, color: '#C3AEEC' },
  { id: 'Desenvolvimento', emoji: '🌱', icon: Sprout, color: '#0C0A0E' },
  { id: 'Estudos', emoji: '📚', icon: GradCap, color: '#0C0A0E' },
  { id: 'Experiências', emoji: '✈️', icon: Plane, color: '#702335' },
  { id: 'Pessoal', emoji: '🍒', icon: Heart, color: '#0C0A0E' },
]
export const goalCategoryMeta = (c: GoalCategory) => GOAL_CATEGORIES.find((g) => g.id === c) ?? GOAL_CATEGORIES[0]

export const GOAL_STATUS: Record<GoalStatus, string> = {
  comecando: 'Começando',
  andamento: 'Em andamento',
  pausada: 'Pausada',
  concluida: 'Concluída',
}

export const COURSE_COLORS = ['#0C0A0E', '#0C0A0E', '#C3AEEC', '#376139', '#702335', '#2A4B2C', '#8a6f5c']
export const BOOK_COLORS = ['#0C0A0E', '#0C0A0E', '#C3AEEC', '#376139', '#702335', '#0C0A0E', '#2A4B2C', '#8a6f5c']
export const PROJECT_COLORS = ['#0C0A0E', '#0C0A0E', '#C3AEEC', '#C3AEEC', '#376139', '#702335', '#0C0A0E']

/** Ícone de cada categoria de meta */
export const GOAL_ICONS: Record<GoalCategory, IconName> = {
  'Saúde & bem-estar': 'dumbbell', 'Vida financeira': 'coins', 'Vida social': 'heart', Desenvolvimento: 'tree',
  Estudos: 'laptop', Experiências: 'map', Pessoal: 'star',
}
