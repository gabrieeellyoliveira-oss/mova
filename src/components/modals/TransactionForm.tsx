import { moneyInput, parseMoney } from '@/utils/format'
import { useState } from 'react'
import type { FinanceCategory, PaymentMethod, Transaction, TransactionType } from '@/types'
import { db } from '@/store/db'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '@/data/constants'
import { today } from '@/utils/date'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, FormGrid, Input, Select, Textarea, Toggle } from '@/components/ui/Form'
import { Segmented } from '@/components/ui/Chip'
import { DeleteButton } from '@/components/ui/Misc'
import { toast } from '@/hooks/useToast'

type Draft = Omit<Transaction, 'id' | 'createdAt' | 'amount'> & { id?: string; amount: string }

export function TransactionForm({ initial, onClose }: { initial?: Partial<Transaction>; onClose: () => void }) {
  const [f, setF] = useState<Draft>({
    type: 'despesa', description: '', category: 'Alimentação', date: today(), method: 'Pix', recurring: false, note: '',
    ...initial,
    amount: initial?.amount ? moneyInput(initial.amount) : '',
  })
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setF((p) => ({ ...p, [k]: v }))
  const cats = f.type === 'despesa' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
  const amount = parseMoney(f.amount)
  const valid = f.description.trim() && amount > 0

  const save = () => {
    if (!valid) return
    const { id, ...rest } = f
    const data = { ...rest, amount }
    if (id) db.transactions.update(id, data)
    else db.transactions.add(data)
    toast(f.type === 'despesa' ? 'Gasto anotado' : 'Entrada registrada 💸')
    onClose()
  }

  return (
    <Modal
      open onClose={onClose}
      title={f.id ? 'Editar movimentação' : f.type === 'despesa' ? 'Novo gasto' : 'Nova receita'}
      subtitle="Saber pra onde o dinheiro vai é carinho com você mesma."
      footer={
        <>
          {f.id && <div className="mr-auto"><DeleteButton onConfirm={() => { db.transactions.remove(f.id!); onClose() }} /></div>}
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={!valid}>Salvar</Button>
        </>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); save() }} className="space-y-4">
        <Segmented<TransactionType>
          value={f.type}
          onChange={(v) => setF((p) => ({ ...p, type: v, category: v === 'despesa' ? 'Alimentação' : 'Salário' }))}
          options={[{ value: 'despesa', label: 'Despesa' }, { value: 'receita', label: 'Receita' }]}
        />
        <FormGrid>
          <Field label="Descrição"><Input value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="Café da tarde" /></Field>
          <Field label="Valor (R$)"><Input inputMode="decimal" value={f.amount} onChange={(e) => set('amount', e.target.value)} placeholder="0,00" /></Field>
          <Field label="Categoria">
            <Select value={f.category} onChange={(e) => set('category', e.target.value as FinanceCategory)}>
              {cats.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Data"><Input type="date" value={f.date} onChange={(e) => set('date', e.target.value)} /></Field>
          <Field label="Forma de pagamento">
            <Select value={f.method} onChange={(e) => set('method', e.target.value as PaymentMethod)}>
              {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
            </Select>
          </Field>
          <div className="flex items-end pb-2"><Toggle checked={f.recurring} onChange={(v) => set('recurring', v)} label="Se repete todo mês" /></div>
        </FormGrid>
        <Field label="Observação"><Textarea value={f.note ?? ''} onChange={(e) => set('note', e.target.value)} /></Field>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}
