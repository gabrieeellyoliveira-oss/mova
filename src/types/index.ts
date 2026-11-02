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
  | 'trabalho'

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
export type PaymentMethod = 'Pix' | 'Crédito' | 'Débito' | 'Dinheiro' | 'Boleto' | 'Transferência' | 'Vale-alimentação'

export interface Transaction extends Entity {
  type: TransactionType
  description: string
  amount: number
  category: FinanceCategory
  date: ISODate
  method: PaymentMethod
  recurring: boolean
  note?: string
  /** Pagamento de uma conta do mês (`MonthlyBill.id`, ou 'cartao' para a fatura do cartão) */
  billId?: string
  /** Mês de referência (competência) da conta paga, `AAAA-MM` — as contas de um mês são pagas no mês seguinte */
  ref?: string
}

export interface FinancialGoal extends Entity {
  name: string
  current: number
  target: number
  deadline?: ISODate
  emoji?: string
}

/* ---------- Explorar / Vida social (lugares e rolês) ---------- */
export type PlaceCategory =
  | 'Cafés'
  | 'Restaurantes'
  | 'Museus'
  | 'Parques'
  | 'Eventos'
  | 'Cinema'
  | 'Compras'
  | 'Passeios'
  | 'Experiências'
  | 'Lugares diferentes'
export type PlaceStatus = 'quero' | 'planejado' | 'fui' | 'voltar'
export type PriceLevel = 0 | 30 | 50 | 100 | 200
export type Mood =
  | 'comer'
  | 'cafe'
  | 'conhecer'
  | 'relaxar'
  | 'diferente'
  | 'passear'
  | 'comprar'
  | 'cultura'
export type Company = 'sozinha' | 'acompanhada' | 'tanto faz'

export interface Place extends Entity {
  name: string
  category: PlaceCategory
  neighborhood: string
  city?: string
  /** Preço estimado por pessoa em R$ */
  price: number
  status: PlaceStatus
  favorite: boolean
  photo?: string
  moods: Mood[]
  goodFor: Company
  plannedFor?: ISODate
  plannedTime?: Time
  notes?: string
}

export interface Experience extends Entity {
  placeId?: string
  title: string
  date: ISODate
  photos: string[]
  rating: number
  spent: number
  with: string
  comment: string
  wouldReturn: boolean
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

/** Projeto de trabalho, com o mesmo controle da meta do mês (meta, ritmo e prazo) */
export type ProjectStatus = 'planejado' | 'andamento' | 'pausado' | 'concluido'
/** Como o avanço é medido: etapas concluídas ou um número com meta */
export type ProjectMetric = 'etapas' | 'moeda' | 'horas' | 'numero'

export interface ProjectStep {
  id: string
  title: string
  done: boolean
}

export interface ProjectEntry {
  id: string
  date: ISODate
  amount: number
  note?: string
}

export interface WorkProject extends Entity {
  name: string
  client?: string
  status: ProjectStatus
  start?: ISODate
  deadline?: ISODate
  metric: ProjectMetric
  /** Meta (quando a medida não é por etapas) */
  target: number
  /** Nome da unidade quando a medida é "número" (ex.: entregas, telas) */
  unitLabel?: string
  steps: ProjectStep[]
  entries: ProjectEntry[]
  color: string
  notes?: string
}

/* ---------- Conquistas criadas pela Gabi ---------- */
export interface CustomAchievement extends Entity {
  title: string
  description?: string
  /** Nome do sprite pixel (ver pixelSprites) */
  sprite: string
  /** Progresso: desbloqueia quando current >= target ("já conquistei" = 1 de 1) */
  current: number
  target: number
  unlockedAt?: ISODate
}

/* ---------- Conexões ---------- */
export interface Integrations {
  /** Link da agenda do Google (secreto/público iCal, compartilhamento ou incorporar) */
  googleCalendarUrl: string
}

/** Último resultado da leitura do Google Agenda (cache local) */
export interface GoogleCalendarCache {
  fetchedAt?: string
  name?: string
  error?: string
  events: { id: string; title: string; date: ISODate; time: Time | ''; endTime?: Time; allDay: boolean; location?: string; notes?: string }[]
}

/** LinkedIn conectado pelo link do perfil; números atualizados pela Gabi */
export interface LinkedInData {
  profileUrl: string
  name?: string
  headline?: string
  followers?: number
  connections?: number
  /** Meta de posts por mês */
  postsGoal: number
  /** Dias em que publicou */
  posts: ISODate[]
  updatedAt?: string
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
  /** Conta para a área Saúde & bem-estar */
  health?: boolean
  /** É treino (vale mais XP) */
  training?: boolean
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
  /** Salário mensal (R$) */
  salary?: number
  /** Vale-alimentação mensal (R$) */
  mealVoucher?: number
  /** Dia do mês em que o salário cai */
  payday?: number
  /** Valor da fatura do cartão de crédito do mês (R$) */
  creditCard?: number
}

/** Conta que se paga todo mês (aluguel, internet…). */
export interface MonthlyBill extends Entity {
  name: string
  amount: number
  dueDay?: number
  category?: FinanceCategory
}

/* ---------- Evolução (treinos) ---------- */
export type WorkoutKind = 'musculacao' | 'corrida' | 'caminhada' | 'bike' | 'natacao' | 'pilates' | 'yoga' | 'funcional' | 'danca' | 'outro'

/** Um treino feito. */
export interface Workout extends Entity {
  date: ISODate
  kind: WorkoutKind
  minutes: number
  note?: string
}

/** Registro da evolução do corpo: foto e/ou medidas de um dia. */
export interface BodyCheckin extends Entity {
  date: ISODate
  photo?: string
  weight?: number
  waist?: number
  hip?: number
  arm?: number
  thigh?: number
  note?: string
}

/* ---------- Diário ---------- */
/** Uma página do diário: texto, fotos e como foi o dia. */
export interface JournalEntry extends Entity {
  date: ISODate
  title?: string
  mood?: string
  text: string
  photos: string[]
  favorite?: boolean
  /** Pasta (diário) onde a página fica — opcional. */
  folderId?: string
}

/** Pasta do diário (ex.: "Diário pessoal", "Raivas do trabalho"). */
export interface JournalFolder extends Entity {
  name: string
  color: string
  cover?: string
}

/* ---------- Faculdade ---------- */
/** Curso de graduação (ex.: RH na Unigrande). */
export type DegreeLevel = 'graduacao' | 'pos' | 'mba' | 'tecnico' | 'mestrado' | 'outro'

export interface Degree extends Entity {
  name: string
  institution: string
  level?: DegreeLevel
  done?: boolean
  /** Média mínima para passar (padrão 7) */
  passGrade?: number
  currentSemester: number
  totalSemesters: number
}

export type AssignmentKind = 'extensao' | 'trabalho' | 'prova' | 'atividade' | 'tcc'
export type AssignmentStatus = 'a-fazer' | 'fazendo' | 'entregue'

/** Trabalho, prova ou atividade da faculdade, com etapas para acompanhar. */
export interface Assignment extends Entity {
  degreeId?: string
  title: string
  subject?: string
  kind: AssignmentKind
  dueDate?: ISODate
  status: AssignmentStatus
  steps: { text: string; done: boolean }[]
  grade?: number
  notes?: string
  /** Fixado no card da Visão geral */
  pinned?: boolean
}

/** Disciplina de um curso (como no portal do aluno): notas, faltas e situação. */
export interface Discipline extends Entity {
  degreeId: string
  name: string
  semester: number
  professor?: string
  n1?: number
  n2?: number
  n3?: number
  absences?: number
  status: 'cursando' | 'aprovada' | 'reprovada'
}
