import { CalendarPlus, CalendarCheck, AlertTriangle } from 'lucide-react'
import type { MoveGuarantee } from '@/types'
import { db, vaultSettingsStore } from '@/store/db'
import { useIncome, useTasks, useVault } from '@/hooks/useData'
import { toast } from '@/hooks/useToast'
import { money } from '@/utils/format'
import { addDays, formatShort, today } from '@/utils/date'
import { Checkbox } from '@/components/ui/Checkbox'
import { cn } from '@/lib/cn'

const r0 = (n: number) => money(Math.round(n)).replace(',00', '')

export const GUARANTEES: { value: MoveGuarantee; label: string; text: string }[] = [
  { value: 'proprietario', label: 'Direto com o dono', text: 'Sem imobiliária, a exigência de renda costuma ser negociável. Procure "direto com o proprietário" na OLX.' },
  { value: 'caucao', label: 'Caução maior', text: 'Oferecer 2 ou 3 aluguéis de caução compensa a renda menor. Ajuste a caução nos Custos da mudança.' },
  { value: 'seguro', label: 'Seguro-fiança', text: 'Paga-se uma taxa (perde o valor no fim) e a seguradora analisa a renda e o CPF.' },
  { value: 'fiador', label: 'Fiador', text: 'Alguém com imóvel quitado em Fortaleza assina junto. Precisa dos documentos dele também.' },
]

const DOCS: { id: string; label: string; only?: MoveGuarantee }[] = [
  { id: 'doc-rg', label: 'RG e CPF' },
  { id: 'doc-holerite', label: '3 últimos holerites (contracheques)' },
  { id: 'doc-ctps', label: 'Carteira de trabalho ou contrato de trabalho' },
  { id: 'doc-residencia', label: 'Comprovante de residência atual' },
  { id: 'doc-extrato', label: 'Extrato bancário dos últimos 3 meses' },
  { id: 'doc-fiador', label: 'Documentos e matrícula do imóvel do fiador', only: 'fiador' },
  { id: 'doc-seguro', label: 'Cotar o seguro-fiança em 2 ou 3 seguradoras', only: 'seguro' },
]

/** Etapas da mudança, em dias antes da data meta. */
const STEPS: { id: string; label: string; before: number }[] = [
  { id: 'etapa-anuncios', label: 'Separar anúncios dentro do orçamento', before: 75 },
  { id: 'etapa-visitas', label: 'Visitar os imóveis favoritos', before: 50 },
  { id: 'etapa-escolher', label: 'Escolher o imóvel e negociar', before: 35 },
  { id: 'etapa-docs', label: 'Reunir documentos e fechar a garantia', before: 30 },
  { id: 'etapa-contrato', label: 'Assinar o contrato e pagar a caução', before: 20 },
  { id: 'etapa-luz', label: 'Pedir ligação de luz (Enel) e água (Cagece)', before: 14 },
  { id: 'etapa-internet', label: 'Contratar e agendar a internet', before: 14 },
  { id: 'etapa-compras', label: 'Comprar geladeira, fogão e o básico', before: 10 },
  { id: 'etapa-carreto', label: 'Agendar o carreto', before: 7 },
  { id: 'etapa-mudanca', label: 'Dia da mudança 🔑', before: 0 },
]

const setItem = (id: string, patch: { done?: boolean; taskId?: string }) =>
  vaultSettingsStore.set((p) => ({ ...p, checklist: { ...(p.checklist ?? {}), [id]: { ...(p.checklist?.[id] ?? {}), ...patch } } }))

/** Aluguel: renda exigida (3x a moradia) × salário, e a garantia escolhida. */
export function GuaranteeCard() {
  const v = useVault()
  const inc = useIncome()
  const required = v.rent * 3
  const short = inc.total < required
  const chosen = v.settings.guarantee
  return (
    <div>
      <div className={cn('flex gap-3 rounded-2xl border-2 border-ink px-4 py-3 text-sm', short ? 'bg-[#F6D6DC]' : 'bg-salvia/60')}>
        {short && <AlertTriangle size={18} className="mt-0.5 shrink-0 text-cereja" />}
        <p>
          Imobiliárias costumam pedir renda de <b>3x o aluguel</b>: para {r0(v.rent)}, são <b>{r0(required)}</b>.{' '}
          {short ? <>Sua renda (salário + VA = {r0(inc.total)}) fica {r0(required - inc.total)} abaixo, então vale escolher uma garantia que compense.</> : <>Sua renda (salário + VA = {r0(inc.total)}) passa nessa regra ✓</>}
        </p>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.15em] text-tinta/60">Qual garantia vou usar?</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {GUARANTEES.map((g) => (
          <button key={g.value} aria-pressed={chosen === g.value}
            onClick={() => vaultSettingsStore.set((p) => ({ ...p, guarantee: chosen === g.value ? undefined : g.value }))}
            className={cn('rounded-2xl border-2 border-ink px-4 py-3 text-left transition', chosen === g.value ? 'bg-lavanda' : 'bg-quente hover:bg-lavanda-100')}>
            <span className="block text-sm font-semibold">{g.label}</span>
            <span className="mt-0.5 block text-xs text-tinta/65">{g.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/** Documentos para alugar (mudam um pouco conforme a garantia). */
export function DocsChecklist() {
  const v = useVault()
  const items = DOCS.filter((d) => !d.only || d.only === v.settings.guarantee)
  const done = items.filter((d) => v.settings.checklist?.[d.id]?.done).length
  return (
    <div>
      <p className="mb-2 text-sm text-tinta/65">{done} de {items.length} prontos</p>
      <ul className="divide-y divide-ink/10">
        {items.map((d) => {
          const on = !!v.settings.checklist?.[d.id]?.done
          return (
            <li key={d.id} className="flex items-center gap-3 py-2.5">
              <Checkbox checked={on} onChange={(x) => setItem(d.id, { done: x })} label={d.label} color="#376139" />
              <span className={cn('text-sm', on && 'text-tinta/50 line-through')}>{d.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Linha do tempo até a data meta, com envio das etapas para a Agenda (tarefas da área Sair de casa). */
export function MoveTimeline() {
  const v = useVault()
  const tasks = useTasks()
  const target = v.settings.targetDate
  if (!target) return <p className="text-sm text-tinta/65">Defina a data meta no Planejamento financeiro para montar a linha do tempo.</p>
  const t = today()
  const steps = STEPS.map((s) => {
    const raw = addDays(target, -s.before)
    const date = raw < t && s.before > 0 ? t : raw
    const item = v.settings.checklist?.[s.id] ?? {}
    const task = item.taskId ? tasks.find((x) => x.id === item.taskId) : undefined
    return { ...s, date, late: raw < t, done: !!item.done || !!task?.done, task }
  })
  const send = (list: typeof steps) => {
    let n = 0
    list.filter((s) => !s.task && !s.done).forEach((s) => {
      const order = Math.max(-1, ...db.tasks.store.get().map((x) => x.order)) + 1
      const created = db.tasks.add({ title: s.label, date: s.date, area: 'sair', priority: s.before <= 20 ? 'alta' : 'media', done: false, order })
      setItem(s.id, { taskId: created.id })
      n++
    })
    toast(n ? `${n} ${n === 1 ? 'etapa foi' : 'etapas foram'} para a Agenda 🗓️` : 'Tudo já está na Agenda')
  }
  const toggle = (s: (typeof steps)[number], x: boolean) => {
    setItem(s.id, { done: x })
    if (s.task) db.tasks.update(s.task.id, { done: x, completedAt: x ? new Date().toISOString() : undefined })
  }
  const pending = steps.filter((s) => !s.task && !s.done).length
  return (
    <div>
      <ol className="relative space-y-1 border-l-2 border-ink/20 pl-5">
        {steps.map((s) => (
          <li key={s.id} className="relative flex items-center gap-3 py-1.5">
            <span className={cn('absolute -left-[27px] h-3 w-3 rounded-full border-2 border-ink', s.done ? 'bg-oliva-600' : s.date === t ? 'bg-lavanda' : 'bg-quente')} />
            <Checkbox checked={s.done} onChange={(x) => toggle(s, x)} label={s.label} color="#376139" />
            <span className="w-14 shrink-0 text-xs font-semibold tabular-nums text-tinta/60">{formatShort(s.date)}</span>
            <span className={cn('min-w-0 flex-1 text-sm', s.done && 'text-tinta/50 line-through')}>{s.label}{s.late && !s.done && s.before > 0 && <span className="ml-1.5 text-[11px] font-semibold text-cereja">atrasada</span>}</span>
            {s.task ? <CalendarCheck size={15} className="shrink-0 text-oliva-600" aria-label="Na Agenda" />
              : !s.done && <button onClick={() => send([s])} className="shrink-0 text-tinta/45 hover:text-ink" aria-label={`Mandar "${s.label}" para a Agenda`}><CalendarPlus size={15} /></button>}
          </li>
        ))}
      </ol>
      {pending > 0 && (
        <button onClick={() => send(steps)} className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full border-2 border-ink bg-lavanda px-4 text-sm font-semibold hover:brightness-105">
          <CalendarPlus size={15} /> Mandar {pending === steps.length ? 'tudo' : `as ${pending} que faltam`} para a Agenda
        </button>
      )}
    </div>
  )
}
