import { moneyInput, parseMoney } from '@/utils/format'
import { useState } from 'react'
import type { VaultEntry, VaultEntryCategory, VaultEntryType } from '@/types'
import { VAULT_CATEGORIES, entryCategory } from '@/components/vault/EntryList'
import { cn } from '@/lib/cn'
import { db } from '@/store/db'
import { today } from '@/utils/date'
import { saveVaultEntry } from '@/components/vault/vaultActions'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, FormGrid, Input } from '@/components/ui/Form'
import { Segmented } from '@/components/ui/Chip'
import { DeleteButton } from '@/components/ui/Misc'

export function VaultEntryForm({ initial, onClose }: { initial?: Partial<VaultEntry>; onClose: () => void }) {
  const [type, setType] = useState<VaultEntryType>(initial?.type ?? 'deposito')
  const [amount, setAmount] = useState(initial?.amount ? moneyInput(initial.amount) : '')
  const [date, setDate] = useState(initial?.date ?? today())
  const [category, setCategory] = useState<VaultEntryCategory>(initial?.id ? entryCategory(initial) : 'salario')
  const [note, setNote] = useState(initial?.note ?? '')
  const value = parseMoney(amount)
  const valid = value > 0 && !!date

  const save = () => {
    if (!valid) return
    saveVaultEntry({ type, amount: value, date, note: note.trim() || undefined, category: type === 'deposito' ? category : undefined }, initial?.id)
    onClose()
  }

  return (
    <Modal
      open onClose={onClose} size="sm"
      title={initial?.id ? 'Editar movimentação' : type === 'deposito' ? 'Guardar no cofre' : 'Retirar do cofre'}
      subtitle="Cofre da mudança: sair de casa"
      footer={
        <>
          {initial?.id && <div className="mr-auto"><DeleteButton onConfirm={() => { db.vaultEntries.remove(initial.id!); onClose() }} /></div>}
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={!valid}>Salvar</Button>
        </>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); save() }} className="space-y-4">
        <Segmented<VaultEntryType> value={type} onChange={setType} options={[{ value: 'deposito', label: 'Guardar' }, { value: 'retirada', label: 'Retirar' }]} />
        {type === 'deposito' && (
          <div role="group" aria-label="Categoria" className="flex flex-wrap gap-2">
            {VAULT_CATEGORIES.map((c) => (
              <button key={c.value} type="button" aria-pressed={category === c.value} onClick={() => setCategory(c.value)}
                className={cn('rounded-full border-2 border-ink px-4 py-1.5 text-sm font-semibold transition', category === c.value ? c.cls : 'bg-quente opacity-60 hover:opacity-100')}>{c.label}</button>
            ))}
          </div>
        )}
        <FormGrid>
          <Field label="Valor (R$)"><Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" /></Field>
          <Field label="Data"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        </FormGrid>
        <Field label="Observação (opcional)"><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={type === 'deposito' ? 'Parte do salário' : 'Por que precisei retirar?'} /></Field>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}
