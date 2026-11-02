import { moneyInput, parseMoney } from '@/utils/format'
import { useState } from 'react'
import type { VaultCost } from '@/types'
import { db } from '@/store/db'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Form'
import { DeleteButton } from '@/components/ui/Misc'

export function CostForm({ initial, onClose }: { initial?: VaultCost; onClose: () => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [amount, setAmount] = useState(initial ? moneyInput(initial.amount) : '')
  const value = parseMoney(amount)
  const valid = name.trim() && value > 0

  const save = () => {
    if (!valid) return
    if (initial) db.vaultCosts.update(initial.id, { name: name.trim(), amount: value })
    else {
      const order = Math.max(-1, ...db.vaultCosts.store.get().map((c) => c.order)) + 1
      db.vaultCosts.add({ name: name.trim(), amount: value, order })
    }
    onClose()
  }

  return (
    <Modal
      open onClose={onClose} size="sm"
      title={initial ? 'Editar custo' : 'Novo custo da mudança'}
      subtitle="A soma dos custos vira a meta do cofre."
      footer={
        <>
          {initial && <div className="mr-auto"><DeleteButton onConfirm={() => { db.vaultCosts.remove(initial.id); onClose() }} /></div>}
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={!valid}>Salvar</Button>
        </>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); save() }} className="space-y-4">
        <Field label="O que é?"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Geladeira" /></Field>
        <Field label="Quanto deve custar (R$)"><Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" /></Field>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}
