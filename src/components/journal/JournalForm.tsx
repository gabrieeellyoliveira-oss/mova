import { useRef, useState } from 'react'
import { Heart, ImagePlus, X } from 'lucide-react'
import type { JournalEntry } from '@/types'
import { db } from '@/store/db'
import { today } from '@/utils/date'
import { fileToDataUrl } from '@/utils/image'
import { toast } from '@/hooks/useToast'
import { useJournalFolders } from '@/hooks/useData'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Form'
import { DeleteButton } from '@/components/ui/Misc'
import { cn } from '@/lib/cn'

export const MOODS = ['😊', '🥰', '😌', '🤩', '😴', '😢', '😤', '🤒']

/** Editor de uma página do diário: data, humor, título, texto e fotos. */
export function JournalForm({ initial, folderId, onClose }: { initial?: JournalEntry; folderId?: string; onClose: () => void }) {
  const folders = useJournalFolders()
  const [f, setF] = useState({
    folderId: initial ? initial.folderId ?? '' : folderId ?? '',
    date: initial?.date ?? today(), title: initial?.title ?? '', mood: initial?.mood ?? '', text: initial?.text ?? '',
    photos: initial?.photos ?? [], favorite: !!initial?.favorite,
  })
  const file = useRef<HTMLInputElement>(null)
  const valid = !!f.date && !!(f.text.trim() || f.title.trim() || f.photos.length)

  const save = () => {
    if (!valid) return
    const data = { date: f.date, title: f.title.trim() || undefined, mood: f.mood || undefined, text: f.text.trim(), photos: f.photos, favorite: f.favorite || undefined, folderId: f.folderId || undefined }
    let id = initial?.id
    if (initial) db.journal.update(initial.id, data)
    else id = db.journal.add(data).id
    // fotos ocupam espaço: se o navegador não conseguiu salvar, avisa
    let saved = true
    try { saved = (localStorage.getItem('mova:v1:journal') ?? '').includes(`"${id}"`) } catch { /* ignore */ }
    if (!saved && !initial && id) {
      db.journal.remove(id)
      toast('Sem espaço para tantas fotos', { text: 'Tente com menos fotos ou apague fotos antigas.', kind: 'info' })
      return
    }
    toast(initial ? 'Página atualizada' : 'Página salva no diário ✨')
    onClose()
  }

  return (
    <Modal
      open onClose={onClose} size="lg" title={initial ? 'Página do diário' : 'Nova página'}
      footer={<>
        {initial && <span className="mr-auto"><DeleteButton onConfirm={() => { db.journal.remove(initial.id); onClose() }} /></span>}
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={save} disabled={!valid}>Salvar</Button>
      </>}
    >
      <div className="space-y-4">
        <div className={cn('grid gap-4', folders.length ? 'sm:grid-cols-[160px_minmax(0,1fr)_200px]' : 'sm:grid-cols-[180px_minmax(0,1fr)]')}>
          <Field label="Data"><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          <Field label="Título (opcional)"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Um dia para lembrar" /></Field>
          {folders.length > 0 && (
            <Field label="Pasta">
              <Select value={f.folderId} onChange={(e) => setF({ ...f, folderId: e.target.value })}>
                <option value="">Sem pasta</option>
                {folders.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </Select>
            </Field>
          )}
        </div>
        <Field label="Como foi o dia?" group>
          <div className="flex flex-wrap items-center gap-2">
            {MOODS.map((m) => (
              <button key={m} type="button" onClick={() => setF({ ...f, mood: f.mood === m ? '' : m })} aria-pressed={f.mood === m} aria-label={`Humor ${m}`}
                className={cn('grid h-10 w-10 place-items-center rounded-full border-2 text-xl transition', f.mood === m ? 'border-ink bg-lavanda' : 'border-ink/15 hover:border-ink')}>{m}</button>
            ))}
            <button type="button" onClick={() => setF({ ...f, favorite: !f.favorite })} aria-pressed={f.favorite}
              className={cn('ml-auto inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1.5 text-xs font-semibold transition', f.favorite ? 'bg-cereja text-ink-fg' : 'bg-quente text-ink hover:bg-lavanda-100')}>
              <Heart size={14} className={f.favorite ? 'fill-current' : ''} /> {f.favorite ? 'Favorita' : 'Favoritar'}
            </button>
          </div>
        </Field>
        <Field label="Querido diário…"><Textarea value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} className="min-h-[200px] text-[15px] leading-relaxed" placeholder="Escreva sobre o seu dia, o que sentiu, o que quer lembrar…" /></Field>
        <Field label="Fotos" group>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {f.photos.map((p, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-2xl border-2 border-ink bg-creme-100">
                <img src={p} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                <button type="button" onClick={() => setF({ ...f, photos: f.photos.filter((_, j) => j !== i) })} className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full border-2 border-ink bg-quente text-ink" aria-label="Remover foto"><X size={14} /></button>
              </div>
            ))}
            <button type="button" onClick={() => file.current?.click()} className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-ink/30 text-tinta/60 transition hover:border-ink hover:text-ink">
              <span className="flex flex-col items-center gap-1 text-xs font-semibold"><ImagePlus size={22} /> Adicionar</span>
            </button>
          </div>
          <input ref={file} type="file" accept="image/*" multiple hidden onChange={async (e) => {
            const files = [...(e.target.files ?? [])]
            e.target.value = ''
            const urls = await Promise.all(files.map((x) => fileToDataUrl(x)))
            setF((p) => ({ ...p, photos: [...p.photos, ...urls] }))
          }} />
        </Field>
      </div>
    </Modal>
  )
}
