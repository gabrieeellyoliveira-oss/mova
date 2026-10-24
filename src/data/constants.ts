import {
  Coins, Dumbbell, GraduationCap as GradCap, Heart, Plane, Sprout, Users,
  BookOpen, CalendarDays, Coffee, Film, GraduationCap, Home, Landmark, LucideIcon,
  Map, NotebookPen, Repeat, ShoppingBag, Sparkles, Target, Ticket, Trees,
  UtensilsCrossed, Wallet, Compass, Footprints,
} from 'lucide-react'
import type {
  AreaId, BookStatus, Company, EventCategory, FinanceCategory, GoalCategory, GoalStatus,
  Mood, PaymentMethod, PlaceCategory, PlaceStatus, Priority,
} from '@/types'

export interface AreaMeta {
  id: AreaId
  label: string
  path: string
  icon: LucideIcon
  /** cor de destaque */
  color: string
  /** fundo suave */
  soft: string
  tagline?: string
}

export const AREAS: Record<AreaId, AreaMeta> = {
  geral: { id: 'geral', label: 'Geral', path: '/', icon: Home, color: '#520215', soft: '#F6EDE3' },
  financas: { id: 'financas', label: 'Finanças', path: '/financas', icon: Wallet, color: '#961415', soft: '#f8dcde', tagline: 'Controle seus gastos e metas' },
  sair: { id: 'sair', label: 'Sair de casa', path: '/sair-de-casa', icon: Compass, color: '#CB757C', soft: '#fcefef', tagline: 'Planeje rolês e explore lugares' },
  estudos: { id: 'estudos', label: 'Estudos', path: '/estudos', icon: GraduationCap, color: '#7A7A4A', soft: '#E6E4CF', tagline: 'Acompanhe seus cursos e progresso' },
  leitura: { id: 'leitura', label: 'Leitura', path: '/leitura', icon: BookOpen, color: '#520215', soft: '#EFE3D6', tagline: 'Seus livros e novas histórias' },
  metas: { id: 'metas', label: 'Metas', path: '/metas', icon: Target, color: '#961415', soft: '#DFD1D1', tagline: 'Conquiste o que importa' },
  rotina: { id: 'rotina', label: 'Rotina', path: '/rotina', icon: Repeat, color: '#b8565e', soft: '#f8dcde', tagline: 'Seus hábitos e bem-estar' },
  notas: { id: 'notas', label: 'Notas', path: '/notas', icon: NotebookPen, color: '#5f5f37', soft: '#E6E4CF' },
}

export const NAV_ITEMS: { label: string; path: string; icon: LucideIcon }[] = [
  { label: 'Início', path: '/', icon: Home },
  { label: 'Planejamento', path: '/planejamento', icon: CalendarDays },
  { label: 'Finanças', path: '/financas', icon: Wallet },
  { label: 'Sair de casa', path: '/sair-de-casa', icon: Compass },
  { label: 'Estudos', path: '/estudos', icon: GraduationCap },
  { label: 'Leitura', path: '/leitura', icon: BookOpen },
  { label: 'Metas', path: '/metas', icon: Target },
  { label: 'Rotina', path: '/rotina', icon: Repeat },
  { label: 'Notas', path: '/notas', icon: NotebookPen },
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

export const PLACE_CATEGORIES: { id: PlaceCategory; icon: LucideIcon; color: string }[] = [
  { id: 'Cafés', icon: Coffee, color: '#961415' },
  { id: 'Restaurantes', icon: UtensilsCrossed, color: '#520215' },
  { id: 'Museus', icon: Landmark, color: '#7A7A4A' },
  { id: 'Parques', icon: Trees, color: '#5f5f37' },
  { id: 'Eventos', icon: Ticket, color: '#CB757C' },
  { id: 'Cinema', icon: Film, color: '#3a010f' },
  { id: 'Compras', icon: ShoppingBag, color: '#b8565e' },
  { id: 'Passeios', icon: Footprints, color: '#8a6f5c' },
  { id: 'Experiências', icon: Sparkles, color: '#961415' },
  { id: 'Lugares diferentes', icon: Map, color: '#520215' },
]
export const placeCategoryMeta = (c: PlaceCategory) => PLACE_CATEGORIES.find((p) => p.id === c) ?? PLACE_CATEGORIES[0]

export const PLACE_STATUS: Record<PlaceStatus, { label: string; color: string; soft: string }> = {
  quero: { label: 'Quero conhecer', color: '#961415', soft: '#f8dcde' },
  planejado: { label: 'Planejado', color: '#520215', soft: '#EFE3D6' },
  fui: { label: 'Fui', color: '#5f5f37', soft: '#E6E4CF' },
  voltar: { label: 'Quero voltar', color: '#b8565e', soft: '#fcefef' },
}

export const MOODS: { id: Mood; label: string; emoji: string }[] = [
  { id: 'comer', label: 'comer', emoji: '🍝' },
  { id: 'cafe', label: 'tomar café', emoji: '☕' },
  { id: 'conhecer', label: 'conhecer algo', emoji: '🗺️' },
  { id: 'relaxar', label: 'relaxar', emoji: '🌿' },
  { id: 'diferente', label: 'fazer algo diferente', emoji: '✨' },
  { id: 'passear', label: 'passear', emoji: '👟' },
  { id: 'comprar', label: 'comprar', emoji: '🛍️' },
  { id: 'cultura', label: 'cultura', emoji: '🎭' },
]

export const BUDGETS: { label: string; max: number | null }[] = [
  { label: 'Grátis', max: 0 },
  { label: 'Até R$30', max: 30 },
  { label: 'Até R$50', max: 50 },
  { label: 'Até R$100', max: 100 },
  { label: 'Tanto faz', max: null },
]

export const COMPANIES: Company[] = ['sozinha', 'acompanhada', 'tanto faz']

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
export const HABIT_COLORS = ['#961415', '#520215', '#CB757C', '#EFAFB3', '#7A7A4A', '#b8565e', '#3a010f']

