import { useState } from 'react'
import { ArrowDownRight, Pencil, Plus } from 'lucide-react'
import { vaultSettingsStore } from '@/store/db'
import { useIncome, useVault } from '@/hooks/useData'
import { openForm } from '@/hooks/useQuickAdd'
import { money } from '@/utils/format'
import { Ring, Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/cn'

const r0 = (n: number) => money(Math.round(n)).replace(',00', '')
const monthShort = (d: Date) => d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('. de ', '/').replace('.', '')
const dateBR = (s?: string) => (s ? new Date(`${s}T12:00:00`).toLocaleDateString('pt-BR') : '—')

/** Veredito do cofre: no ritmo ou fora do ritmo, comparando a parcela necessária com a média real. */
export function VaultHero() {
  const v = useVault()
  const [editDate, setEditDate] = useState(false)
  const done = v.remaining <= 0
  const status = done ? { label: 'Meta batida', cls: 'bg-salvia text-ink' } : v.onTrack === null ? { label: 'Defina a data', cls: 'bg-lavanda text-ink' } : v.onTrack ? { label: 'No ritmo', cls: 'bg-salvia text-ink' } : { label: 'Fora do ritmo', cls: 'bg-[#F6D6DC] text-cereja' }
  return (
    <section className="rounded-[2rem] border-2 border-ink bg-ink p-6 text-ink-fg sm:p-8">
      <div className="grid items-center gap-6 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        <Ring value={v.progress} size={170} stroke={14} color="#C3AEEC" track="rgba(246,241,231,0.12)">
          <div className="text-center"><p className="font-serif text-4xl font-bold">{Math.round(v.progress)}%</p><p className="text-xs text-ink-fg/70">da meta</p></div>
        </Ring>
        <div className="min-w-0">
          <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold', status.cls)}>
            <span className={cn('h-2 w-2 rounded-full', v.onTrack === false && !done ? 'bg-cereja' : 'bg-ink')} />{status.label}
          </span>
          <p className="mt-3 font-serif text-2xl leading-snug sm:text-3xl">
            {done ? <>Meta batida! Hora de procurar a casa nova 🔑</> : v.neededPerMonth !== null ? (
              <>Faltam <span className="text-lavanda">{r0(v.remaining)}</span> para a meta.<br />
                Precisa guardar <span className="text-lavanda">{money(v.neededPerMonth)}/mês</span> por {v.monthsLeft} {v.monthsLeft === 1 ? 'mês' : 'meses'} — hoje sua média é {r0(v.monthlyAvg)}.</>
            ) : <>Faltam <span className="text-lavanda">{r0(v.remaining)}</span>. Escolha a data meta para saber quanto guardar por mês.</>}
          </p>
          <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-fg/75">
            <span>No cofre <b className="text-ink-fg">{money(v.saved)}</b> de {r0(v.target)}</span>
            <span>Neste mês <b className="text-ink-fg">{money(v.thisMonth)}</b></span>
            <span>No ritmo atual: {done ? 'já!' : v.forecast ? monthShort(v.forecast) : '—'}</span>
          </p>
        </div>
        <div className="flex flex-row flex-wrap items-center gap-2 lg:flex-col lg:items-end">
          <button onClick={() => openForm('deposit', { type: 'deposito' })} className="inline-flex h-11 items-center gap-1.5 rounded-full bg-quente px-5 font-semibold text-ink hover:bg-lavanda"><Plus size={16} strokeWidth={2.6} /> Guardar</button>
          <button onClick={() => openForm('deposit', { type: 'retirada' })} className="inline-flex h-11 items-center gap-1.5 rounded-full border-2 border-ink-fg/50 px-5 font-semibold hover:bg-ink-fg/10"><ArrowDownRight size={16} /> Retirar</button>
          <div className="text-sm text-ink-fg/70">
            {editDate ? (
              <input autoFocus type="date" aria-label="Data meta" value={v.settings.targetDate ?? ''} onBlur={() => setEditDate(false)}
                onChange={(e) => vaultSettingsStore.set((p) => ({ ...p, targetDate: e.target.value || undefined }))}
                className="h-8 rounded-xl border-2 border-ink-fg/40 bg-transparent px-2 text-ink-fg focus:outline-none [color-scheme:dark]" />
            ) : (
              <button onClick={() => setEditDate(true)} className="inline-flex items-center gap-1 hover:text-ink-fg" aria-label="Editar data meta">Meta: <b className="text-ink-fg">{dateBR(v.settings.targetDate)}</b> <Pencil size={12} /></button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/** Três números: quanto guardar por mês (% da renda = salário + VA), quanto já foi neste mês e quanto sobra depois de sair. */
export function VaultKpis() {
  const v = useVault()
  const inc = useIncome()
  const month = new Date().toLocaleDateString('pt-BR', { month: 'long' })
  const need = v.neededPerMonth ?? 0
  const pctSalary = inc.total ? Math.round((need / inc.total) * 100) : 0
  const pctParcel = need ? Math.min(100, (Math.max(0, v.thisMonth) / need) * 100) : 0
  const after = inc.total - v.livingTotal - (v.settings.groceries ?? inc.voucher)
  const card = 'flex flex-col rounded-3xl border-2 border-ink bg-quente p-6 shadow-pixel'
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className={card}>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-tinta/60">Precisa guardar por mês</p>
        <p className="mt-1 font-serif text-4xl font-bold">{v.neededPerMonth !== null ? r0(need) : '—'}</p>
        <p className="text-sm text-tinta/65">{v.neededPerMonth !== null ? `${pctSalary}% da sua renda (salário + VA = ${r0(inc.total)})` : 'defina a data meta no topo'}</p>
        <div className="mt-auto pt-4"><Progress value={Math.min(100, pctSalary)} height={8} color={pctSalary > 40 ? '#C0466A' : '#376139'} /></div>
      </div>
      <div className={card}>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-tinta/60">Guardado em {month}</p>
        <p className="mt-1 font-serif text-4xl font-bold">{money(v.thisMonth)}</p>
        <p className="text-sm text-tinta/65">{need ? `${Math.round(pctParcel)}% da parcela do mês · ${pctParcel >= 100 ? 'parcela batida ✓' : `faltam ${r0(need - Math.max(0, v.thisMonth))}`}` : 'quanto você guardou neste mês'}</p>
        <div className="mt-auto pt-4"><Progress value={pctParcel} height={8} color="#0C0A0E" /></div>
      </div>
      <div className={card}>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-tinta/60">Sobra depois de sair</p>
        <p className={cn('mt-1 font-serif text-4xl font-bold', after < 0 ? 'text-cereja' : 'text-oliva-600')}>{r0(after)}/mês</p>
        <p className="text-sm text-tinta/65">salário + VA − custos da casa nova</p>
        <div className="mt-auto pt-4"><Progress value={inc.total ? Math.max(0, (after / inc.total) * 100) : 0} height={8} color="#376139" /></div>
      </div>
    </div>
  )
}
