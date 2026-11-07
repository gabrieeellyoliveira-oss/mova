import { vaultTarget } from '@/hooks/useData'
import type { VaultEntry } from '@/types'
import { db, vaultSettingsStore } from '@/store/db'
import { vaultNet } from '@/hooks/useData'
import { celebrate, toast } from '@/hooks/useToast'
import { money } from '@/utils/format'

const currentSaved = () => db.vaultEntries.store.get().reduce((a, e) => a + vaultNet(e), 0)
const currentTarget = () => vaultTarget(db.vaultCosts.store.get(), vaultSettingsStore.get())

/** Salva um depósito/retirada e comemora ao cruzar 25%, 50%, 75% ou 100% da meta. */
export function saveVaultEntry(data: Omit<VaultEntry, 'id' | 'createdAt'>, id?: string) {
  const target = currentTarget()
  const before = currentSaved()
  if (id) db.vaultEntries.update(id, data)
  else db.vaultEntries.add(data)
  const after = currentSaved()
  const step = (v: number) => (target > 0 ? Math.floor((v / target) * 4) : 0)
  if (!id && after >= target && before < target) {
    toast('Meta do cofre batida! 🔑', { text: 'Sua casa nova está te esperando.', kind: 'sparkle', duration: 4500 })
  } else if (!id && step(after) > step(before)) {
    celebrate.goal()
  } else if (!id) {
    toast(data.type === 'deposito' ? `${money(data.amount)} no cofre 🪙` : `${money(data.amount)} retirados do cofre`, { kind: data.type === 'deposito' ? 'heart' : 'info' })
  }
}
