import type {
  Book, CalendarEvent, Course, FinancialGoal, FocusSession, Goal, Habit,
  Note, Settings, Task, Transaction, VaultCost, VaultEntry, VaultSettings, WeeklyPriority,
} from '@/types'
import { addDays, startOfWeek, today, toISODate } from '@/utils/date'
import { uid } from '@/utils/id'

/**
 * Dados de exemplo gerados relativos ao dia de hoje,
 * para que o MOVA sempre abra "vivo" na primeira execução.
 */
const t = () => today()
const d = (offset: number) => addDays(t(), offset)
const base = () => ({ id: uid(), createdAt: new Date().toISOString() })
const monthDay = (monthsAgo: number, day: number) => {
  const now = new Date()
  const last = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0).getDate()
  const dt = new Date(now.getFullYear(), now.getMonth() - monthsAgo, Math.min(day, last))
  // nunca no futuro dentro do mês atual
  if (monthsAgo === 0 && dt > now) return toISODate(now)
  return toISODate(dt)
}

export const seedSettings = (): Settings => ({
  name: 'Gabi',
  monthlyBudget: 3200,
  weeklyStudyHours: 6,
  yearlyBooksGoal: 18,
})

export const seedEvents = (): CalendarEvent[] => [
  { ...base(), title: 'Reunião Cardápio Web', date: d(0), time: '10:00', category: 'trabalho', location: 'Google Meet' },
  { ...base(), title: 'Estudos', date: d(0), time: '14:00', category: 'estudos', notes: '1h de foco' },
  { ...base(), title: 'Café novo', date: d(0), time: '17:00', category: 'role', location: 'Meireles' },
  { ...base(), title: 'Academia', date: d(0), time: '19:00', category: 'saude', notes: 'Treino A' },
  { ...base(), title: 'Dentista', date: d(2), time: '09:30', category: 'saude', location: 'Aldeota' },
  { ...base(), title: 'Cinema com a Lu', date: d(3), time: '20:00', category: 'role', location: 'Cinema do Dragão' },
  { ...base(), title: 'Feira do bairro', date: d(5), time: '08:00', category: 'casa' },
  { ...base(), title: 'Mentoria UX', date: d(1), time: '18:30', category: 'estudos', location: 'Online' },
  { ...base(), title: 'Almoço em família', date: d(-2), time: '12:30', category: 'pessoal' },
]

export const seedTasks = (): Task[] => {
  const items: [string, Task['priority'], Task['area'], number | undefined, boolean][] = [
    ['Responder e-mails', 'media', 'geral', 0, true],
    ['Organizar o planner', 'baixa', 'geral', 0, false],
    ['Estudar 1h', 'alta', 'estudos', 0, false],
    ['Pesquisar apartamentos', 'media', 'sair', 0, false],
    ['Ler 20 páginas', 'media', 'leitura', 0, false],
    ['Pagar conta de luz', 'alta', 'financas', 1, false],
    ['Aula 7 do curso de UX', 'media', 'estudos', 1, false],
    ['Skincare noturno caprichado', 'baixa', 'rotina', 2, false],
    ['Revisar metas do mês', 'media', 'metas', 3, false],
    ['Visitar apartamento no Benfica', 'baixa', 'sair', 5, false],
    ['Exercícios de inglês', 'media', 'estudos', 4, false],
    ['Marcar consulta no oftalmo', 'media', 'geral', undefined, false],
    ['Trocar a capinha do celular', 'baixa', 'geral', undefined, false],
    ['Testar a receita de bolo de laranja', 'baixa', 'rotina', undefined, false],
  ]
  return items.map(([title, priority, area, off, done], i) => ({
    ...base(), title, priority, area, done, order: i,
    date: off === undefined ? undefined : d(off),
    completedAt: done ? new Date().toISOString() : undefined,
  }))
}

export const seedTransactions = (): Transaction[] => {
  const tx = (
    monthsAgo: number, day: number, type: Transaction['type'], description: string,
    amount: number, category: Transaction['category'], method: Transaction['method'], recurring = false,
  ): Transaction => ({ ...base(), type, description, amount, category, date: monthDay(monthsAgo, day), method, recurring })

  const list: Transaction[] = []
  for (let m = 5; m >= 0; m--) {
    const wiggle = (n: number) => Math.round(n * (0.85 + ((m * 37) % 30) / 100))
    list.push(
      tx(m, 5, 'receita', 'Salário', 4800, 'Salário', 'Transferência', true),
      tx(m, 6, 'despesa', 'Aluguel', 1350, 'Casa', 'Pix', true),
      tx(m, 8, 'despesa', 'Streaming + música', 55.8, 'Assinaturas', 'Crédito', true),
      tx(m, 10, 'despesa', 'Mercado do mês', wiggle(620), 'Alimentação', 'Débito'),
      tx(m, 12, 'despesa', 'Uber e ônibus', wiggle(210), 'Transporte', 'Crédito'),
      tx(m, 15, 'despesa', 'Academia', 119.9, 'Saúde', 'Crédito', true),
      tx(m, 18, 'despesa', 'Rolês e cafés', wiggle(260), 'Lazer', 'Crédito'),
    )
    if (m % 2 === 0) list.push(tx(m, 20, 'receita', 'Freela de design', 900 + m * 80, 'Freela', 'Pix'))
    if (m % 3 === 1) list.push(tx(m, 22, 'despesa', 'Roupinha nova', wiggle(240), 'Compras', 'Crédito'))
  }
  list.push(
    tx(0, 3, 'despesa', 'Curso de UX Writing', 189, 'Estudos', 'Pix'),
    tx(0, 2, 'despesa', 'Farmácia', 64.5, 'Saúde', 'Débito'),
    tx(0, 1, 'despesa', 'Livro "Tudo é rio"', 49.9, 'Compras', 'Crédito'),
  )
  return list
}

export const seedFinancialGoals = (): FinancialGoal[] => [
  { ...base(), name: 'Reserva de emergência', current: 2500, target: 10000, emoji: '🛟', deadline: d(300) },
  { ...base(), name: 'Viagem para Lisboa', current: 3200, target: 8000, emoji: '✈️', deadline: d(240) },
  { ...base(), name: 'Notebook novo', current: 1450, target: 6500, emoji: '💻' },
]

export const seedVaultSettings = (): VaultSettings => ({
  manualTarget: 15000,
  targetDate: d(300),
})

export const seedVaultCosts = (): VaultCost[] =>
  ([
    ['Caução (2 aluguéis)', 2400],
    ['Primeiro aluguel', 1200],
    ['Frete da mudança', 600],
    ['Móveis básicos', 3500],
    ['Eletrodomésticos', 2800],
    ['Enxoval e utensílios', 900],
    ['Reserva para os primeiros meses', 3600],
  ] as const).map(([name, amount], order) => ({ ...base(), name, amount, order }))

export const seedVaultEntries = (): VaultEntry[] => {
  const e = (monthsAgo: number, day: number, amount: number, note?: string, type: VaultEntry['type'] = 'deposito'): VaultEntry =>
    ({ ...base(), type, amount, date: monthDay(monthsAgo, day), note })
  return [
    e(7, 6, 500, 'Primeiro depósito!'),
    e(6, 6, 450),
    e(5, 6, 500),
    e(5, 21, 300, 'Parte do freela'),
    e(4, 6, 400),
    e(3, 6, 500),
    e(3, 15, 200, 'Conserto do celular', 'retirada'),
    e(2, 6, 550),
    e(1, 6, 500),
    e(1, 20, 450, 'Freela de design'),
    e(0, 6, 600),
  ]
}

export const seedCourses = (): Course[] => [
  { ...base(), name: 'UX Writing na prática', institution: 'Alura', modules: 6, lessonsTotal: 32, lessonsDone: 19, deadline: d(30), color: '#961415', active: true, notes: 'Fazer o projeto final sobre onboarding.' },
  { ...base(), name: 'Inglês — Conversação B2', institution: 'Cultura Inglesa', modules: 10, lessonsTotal: 40, lessonsDone: 12, deadline: d(90), color: '#7A7A4A', active: true },
  { ...base(), name: 'Ilustração digital', institution: 'Domestika', modules: 5, lessonsTotal: 24, lessonsDone: 6, color: '#CB757C', active: true },
  { ...base(), name: 'Excel para a vida', institution: 'YouTube', modules: 3, lessonsTotal: 12, lessonsDone: 12, color: '#520215', active: false },
]

export const seedFocusSessions = (courses: Course[]): FocusSession[] => {
  const ws = startOfWeek(t())
  const sessions: FocusSession[] = []
  const pattern = [45, 25, 60, 45, 25, 0, 30]
  for (let i = 0; i < 7; i++) {
    const date = addDays(ws, i)
    if (date > t() || !pattern[i]) continue
    sessions.push({ ...base(), courseId: courses[i % 3]?.id, minutes: pattern[i], date })
  }
  for (let i = 1; i < 20; i += 2) sessions.push({ ...base(), courseId: courses[i % 3]?.id, minutes: 45, date: addDays(ws, -i) })
  return sessions
}

export const seedBooks = (): Book[] => [
  { ...base(), title: 'Tudo é rio', author: 'Carla Madeira', coverColor: '#961415', pages: 210, currentPage: 132, status: 'lendo', favorite: true, startedAt: d(-12), quotes: ['O perdão é uma coisa que se aprende devagar.'], comments: 'Me pegou desde o primeiro capítulo.' },
  { ...base(), title: 'A biblioteca da meia-noite', author: 'Matt Haig', coverColor: '#520215', pages: 308, currentPage: 308, status: 'lido', favorite: true, startedAt: d(-60), finishedAt: d(-35), rating: 5, quotes: ['Você não precisa entender a vida. Só precisa vivê-la.'] },
  { ...base(), title: 'Pequenas coisas como estas', author: 'Claire Keegan', coverColor: '#7A7A4A', pages: 112, currentPage: 112, status: 'lido', favorite: false, startedAt: d(-90), finishedAt: d(-80), rating: 4, quotes: [] },
  { ...base(), title: 'Torto arado', author: 'Itamar Vieira Junior', coverColor: '#CB757C', pages: 264, currentPage: 88, status: 'pausado', favorite: false, startedAt: d(-120), quotes: [] },
  { ...base(), title: 'O avesso da pele', author: 'Jeferson Tenório', coverColor: '#3a010f', pages: 192, currentPage: 0, status: 'quero', favorite: false, quotes: [] },
  { ...base(), title: 'Mulheres que correm com os lobos', author: 'Clarissa Pinkola Estés', coverColor: '#b8565e', pages: 576, currentPage: 0, status: 'quero', favorite: true, quotes: [] },
  { ...base(), title: 'Hábitos atômicos', author: 'James Clear', coverColor: '#5f5f37', pages: 320, currentPage: 320, status: 'lido', favorite: false, startedAt: d(-200), finishedAt: d(-170), rating: 3, quotes: [] },
]

export const seedGoals = (): Goal[] => {
  const s = (title: string, done = false) => ({ id: uid(), title, done })
  return [
    { ...base(), name: 'Treinar 3x por semana', category: 'Saúde & bem-estar', description: 'Sem pressa, só constância.', deadline: d(60), manualProgress: 0, steps: [s('Montar ficha com o professor', true), s('Comprar tênis novo', true), s('4 semanas seguidas'), s('8 semanas seguidas')], status: 'andamento' },
    { ...base(), name: 'Juntar R$ 10 mil de reserva', category: 'Vida financeira', deadline: d(300), manualProgress: 25, steps: [], status: 'andamento' },
    { ...base(), name: 'Conhecer 12 lugares novos', category: 'Experiências', description: 'Um por mês, no mínimo.', deadline: d(70), manualProgress: 0, steps: Array.from({ length: 12 }, (_, i) => s(`Lugar ${i + 1}`, i < 7)), status: 'andamento' },
    { ...base(), name: 'Terminar o curso de UX Writing', category: 'Estudos', deadline: d(30), manualProgress: 0, steps: [s('Módulos 1 a 3', true), s('Módulos 4 e 5'), s('Projeto final')], status: 'andamento' },
    { ...base(), name: 'Encontrar as amigas todo mês', category: 'Vida social', manualProgress: 0, steps: [s('Criar grupo do rolê mensal', true), s('Marcar outubro', true), s('Marcar novembro')], status: 'andamento' },
    { ...base(), name: 'Escrever um diário', category: 'Pessoal', manualProgress: 10, steps: [], status: 'comecando' },
  ]
}

export const seedHabits = (): Habit[] => {
  const mk = (name: string, emoji: string, color: string, weeklyTarget: number, chance: number): Habit => {
    const log: string[] = []
    // histórico determinístico dos últimos 45 dias
    for (let i = 1; i <= 45; i++) {
      const v = Math.abs(Math.sin(i * (name.length + 3))) // pseudo-aleatório estável
      if (v < chance) log.push(d(-i))
    }
    return { ...base(), name, emoji, color, weeklyTarget, log }
  }
  const water = mk('Beber água', '💧', '#CB757C', 7, 1.1)
  const skincare = mk('Skincare', '🧴', '#EFAFB3', 7, 0.8)
  return [
    { ...water, log: [d(0), ...water.log] },
    { ...skincare, log: [d(0), ...skincare.log] },
    mk('Academia', '🏋️', '#961415', 3, 0.45),
    mk('Estudar', '📚', '#520215', 5, 0.7),
    mk('Ler', '📖', '#7A7A4A', 5, 0.65),
    mk('Sair de casa', '🌷', '#CB757C', 3, 0.4),
    mk('Organizar quarto', '🧺', '#b8565e', 2, 0.3),
    mk('Dormir cedo', '🌙', '#3a010f', 5, 0.5),
  ]
}

export const seedPriorities = (): WeeklyPriority[] => {
  const ws = startOfWeek(t())
  return [
    { ...base(), weekStart: ws, title: 'Fechar o módulo 4 do curso', done: false },
    { ...base(), weekStart: ws, title: 'Ir em um lugar novo', done: false },
    { ...base(), weekStart: ws, title: 'Gastar menos com delivery', done: true },
  ]
}

export const seedNotes = (): Note[] => [
  { ...base(), title: 'Ideias de presente pra mãe', content: 'Planta pendente, livro da Conceição Evaristo, aula de cerâmica juntas.', tags: ['presentes', 'família'], favorite: true, color: 'rosa', updatedAt: new Date().toISOString() },
  { ...base(), title: 'Filmes para ver', content: '• Retratos fantasmas\n• Aftersun\n• A vida invisível', tags: ['cinema'], favorite: false, color: 'creme', updatedAt: new Date().toISOString() },
  { ...base(), title: 'Lembrete gentil', content: 'Você não precisa fazer tudo hoje. Só o próximo passo.', tags: ['eu'], favorite: true, color: 'vinho', updatedAt: new Date().toISOString() },
  { ...base(), title: 'Receita de bolo de laranja', content: '3 ovos, 1 xícara de óleo, 2 laranjas com casca, 2 xícaras de açúcar, 2 de farinha, 1 colher de fermento.', tags: ['receitas', 'casa'], favorite: false, color: 'oliva', updatedAt: new Date().toISOString() },
]
