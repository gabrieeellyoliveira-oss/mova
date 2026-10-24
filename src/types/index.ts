/** Data no formato ISO curto: "2026-10-24" */
export type ISODate = string
/** Horário "HH:mm" */
export type Time = string

export interface Entity {
  id: string
  createdAt: string
}

/* ---------- Áreas do MOVA ---------- */
export type AreaId =
  | 'geral'
  | 'financas'
  | 'sair'
  | 'estudos'
  | 'leitura'
  | 'metas'
  | 'rotina'
  | 'notas'

/* ---------- Agenda ---------- */
export type EventCategory = 'trabalho' | 'estudos' | 'role' | 'saude' | 'pessoal' | 'casa'

export interface CalendarEvent extends Entity {
  title: string
  date: ISODate
  time: Time
  category: EventCategory
  location?: string
  notes?: string
}

/* ---------- Tarefas ---------- */
export type Priority = 'baixa' | 'media' | 'alta'

export interface Task extends Entity {
  title: string
  done: boolean
  priority: Priority
  area: AreaId
  /** Dia em que a tarefa está planejada (usado no planner semanal) */
  date?: ISODate
  order: number
  completedAt?: string
}

/* ---------- Finanças ---------- */
export type TransactionType = 'receita' | 'despesa'
export type FinanceCategory =
  | 'Casa'
  | 'Alimentação'
  | 'Transporte'
  | 'Lazer'
  | 'Estudos'
  | 'Assinaturas'
  | 'Compras'
  | 'Saúde'
  | 'Outros'
  | 'Salário'
  | 'Freela'
export type PaymentMethod = 'Pix' | 'Crédito' | 'Débito' | 'Dinheiro' | 'Boleto' | 'Transferência'

export interface Transaction extends Entity {
  type: TransactionType
  description: string
  amount: number
  category: FinanceCategory
  date: ISODate
  method: PaymentMethod
  recurring: boolean
  note?: string
}

export interface FinancialGoal extends Entity {
  name: string
  current: number
  target: number
  deadline?: ISODate
  emoji?: string
}

/* ---------- Sair de casa (cofre da mudança) ---------- */
export type VaultEntryType = 'deposito' | 'retirada'

export interface VaultEntry extends Entity {
  type: VaultEntryType
  amount: number
  date: ISODate
  note?: string
}

/** Custo previsto da mudança; a soma dos custos é a meta do cofre */
export interface VaultCost extends Entity {
  name: string
  amount: number
  order: number
}

export interface VaultSettings {
  /** Meta usada quando não há custos cadastrados */
  manualTarget: number
  /** Quando quero sair de casa (opcional) */
  targetDate?: ISODate
}

/* ---------- Trabalho (meta do mês) ---------- */
export type WorkUnit = 'moeda' | 'numero'

export interface WorkSettings {
  /** Nome do que é medido: "Vendas", "Clientes"… */
  metricName: string
  unit: WorkUnit
  /** Dias úteis (0 = segunda … 6 = domingo) */
  workDays: number[]
}

/** Meta de um mês ("2026-10") */
export interface WorkGoal extends Entity {
  month: string
  target: number
}

/** Resultado registrado num dia */
export interface WorkEntry extends Entity {
  date: ISODate
  amount: number
  note?: string
}

/* ---------- Estudos ---------- */
export interface Course extends Entity {
  name: string
  institution: string
  modules: number
  lessonsTotal: number
  lessonsDone: number
  deadline?: ISODate
  notes?: string
  color: string
  active: boolean
}

export interface FocusSession extends Entity {
  courseId?: string
  minutes: number
  date: ISODate
  label?: string
}

/* ---------- Leitura ---------- */
export type BookStatus = 'quero' | 'lendo' | 'pausado' | 'lido'

export interface Book extends Entity {
  title: string
  author: string
  cover?: string
  coverColor: string
  pages: number
  currentPage: number
  status: BookStatus
  favorite: boolean
  startedAt?: ISODate
  finishedAt?: ISODate
  rating?: number
  comments?: string
  quotes: string[]
}

/* ---------- Metas ---------- */
export type GoalCategory =
  | 'Saúde & bem-estar'
  | 'Vida financeira'
  | 'Vida social'
  | 'Desenvolvimento'
  | 'Estudos'
  | 'Experiências'
  | 'Pessoal'
export type GoalStatus = 'comecando' | 'andamento' | 'pausada' | 'concluida'

export interface GoalStep {
  id: string
  title: string
  done: boolean
}

export interface Goal extends Entity {
  name: string
  description?: string
  category: GoalCategory
  deadline?: ISODate
  /** Usado quando a meta não tem etapas */
  manualProgress: number
  steps: GoalStep[]
  status: GoalStatus
}

/* ---------- Rotina ---------- */
export interface Habit extends Entity {
  name: string
  emoji: string
  color: string
  /** Dias (ISODate) em que o hábito foi feito */
  log: ISODate[]
  /** Meta de vezes por semana */
  weeklyTarget: number
}

/* ---------- Planejamento ---------- */
export interface WeeklyPriority extends Entity {
  /** Segunda-feira da semana */
  weekStart: ISODate
  title: string
  done: boolean
}

/* ---------- Notas ---------- */
export interface Note extends Entity {
  title: string
  content: string
  tags: string[]
  favorite: boolean
  color: 'creme' | 'rosa' | 'vinho' | 'oliva' | 'nevoa'
  updatedAt: string
}

/* ---------- Ajustes ---------- */
export interface Settings {
  name: string
  monthlyBudget: number
  weeklyStudyHours: number
  yearlyBooksGoal: number
}
