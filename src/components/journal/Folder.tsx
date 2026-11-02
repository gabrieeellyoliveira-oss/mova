import { useState } from 'react'
import type { JournalFolder } from '@/types'
import { db } from '@/store/db'
import { toast } from '@/hooks/useToast'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Form'
import { DeleteButton } from '@/components/ui/Misc'
import { PhotoInput } from '@/components/ui/PhotoInput'
import { cn } from '@/lib/cn'

/** Cores das pastas (a primeira é o laranja xadrez da referência). */
export const FOLDER_COLORS = ['#D9864A', '#C3AEEC', '#A8CA96', '#702335', '#ECC980', '#0C0A0E']

/** Xadrez suave por cima da cor, como na pasta da referência. */
const plaid = (c: string) => ({
  backgroundColor: c,
  backgroundImage: [
    'repeating-linear-gradient(0deg, rgba(255,255,255,.22) 0 6px, transparent 6px 22px, rgba(0,0,0,.10) 22px 26px, transparent 26px 40px)',
    'repeating-linear-gradient(90deg, rgba(255,255,255,.22) 0 6px, transparent 6px 22px, rgba(0,0,0,.10) 22px 26px, transparent 26px 40px)',
  ].join(','),
})

/** Pasta no formato da referência: aba em cima à esquerda e corpo com capa (foto) ou xadrez. */
export function FolderShape({ color, cover, className }: { color: string; cover?: string; className?: string }) {
  return (
    <div className={cn('relative w-full pt-[9%]', className)} aria-hidden>
      <div className="absolute left-0 top-0 h-[22%] w-[42%] rounded-t-2xl border-2 border-b-0 border-ink" style={{ backgroundColor: color, filter: 'brightness(1.08)' }} />
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl rounded-tl-none border-2 border-ink shadow-pixel" style={plaid(color)}>
        {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
      </div>
    </div>
  )
}

export function FolderForm({ initial, onClose }: { initial?: JournalFolder; onClose: () => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState(initial?.color ?? FOLDER_COLORS[0])
  const [cover, setCover] = useState<string | undefined>(initial?.cover)
  const save = () => {
    if (!name.trim()) return
    const data = { name: name.trim(), color, cover }
    if (initial) db.journalFolders.update(initial.id, data)
    else db.journalFolders.add(data)
    toast(initial ? 'Pasta atualizada' : 'Pasta criada 📁')
    onClose()
  }
  const remove = () => {
    if (!initial) return
    db.journal.store.set((list) => list.map((e) => (e.folderId === initial.id ? { ...e, folderId: undefined } : e)))
    db.journalFolders.remove(initial.id)
    onClose()
  }
  return (
    <Modal
      open onClose={onClose} title={initial ? 'Editar pasta' : 'Nova pasta'} subtitle="Ex.: Diário pessoal, Raivas do trabalho, Viagens…"
      footer={<>
        {initial && <span className="mr-auto"><DeleteButton label="Apagar pasta" onConfirm={remove} /></span>}
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={save} disabled={!name.trim()}>Salvar</Button>
      </>}
    >
      <div className="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
        <FolderShape color={color} cover={cover} />
        <div className="space-y-4">
          <Field label="Nome da pasta"><Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Diário pessoal" /></Field>
          <Field label="Cor" group>
            <div className="flex flex-wrap gap-2">
              {FOLDER_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} aria-label={`Cor ${c}`} aria-pressed={color === c}
                  className={cn('h-9 w-9 rounded-full border-2 border-ink transition', color === c && 'ring-4 ring-lavanda/70')} style={{ backgroundColor: c }} />
              ))}
            </div>
          </Field>
          <Field label="Capa (opcional)" group><PhotoInput value={cover} onChange={setCover} /></Field>
          {initial && <p className="text-xs text-tinta/55">Ao apagar a pasta, as páginas dela continuam no diário, só ficam sem pasta.</p>}
        </div>
      </div>
    </Modal>
  )
}
