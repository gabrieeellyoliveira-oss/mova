import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import type { Experience } from '@/types'
import { db } from '@/store/db'
import { today } from '@/utils/date'
import { fileToDataUrl } from '@/utils/image'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, FormGrid, Input, Textarea } from '@/components/ui/Form'
import { Segmented } from '@/components/ui/Chip'
import { DeleteButton, StarRating } from '@/components/ui/Misc'
import { toast } from '@/hooks/useToast'

export function ExperienceForm({ initial, onClose }: { initial?: Partial<Experience>; onClose: () => void }) {
  const [f, setF] = useState({
    title: '', date: today(), photos: [] as string[], rating: 0, spent: '', with: '', comment: '', wouldReturn: true,
    ...initial,
    ...(initial?.spent !== undefined ? { spent: String(initial.spent) } : {}),
  })
  const file = useRef<HTMLInputElement>(null)
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }))
  const valid = f.title.trim()

  const save = () => {
    if (!valid) return
    const data = { placeId: f.placeId, title: f.title.trim(), date: f.date, photos: f.photos, rating: f.rating, spent: Number(String(f.spent).replace(',', '.')) || 0, with: f.with, comment: f.comment, wouldReturn: f.wouldReturn }
    if (f.id) db.experiences.update(f.id, data)
    else {
      db.experiences.add(data)
      toast('Guardado em “Coisas que vivi” 💌', { kind: 'heart' })
    }
    onClose()
  }

  return (
    <Modal
      open onClose={onClose}
      title={f.id ? 'Editar memória' : 'Como foi?'}
      subtitle="Uma pequena memória da sua vida."
      footer={
        <>
          {f.id && <div className="mr-auto"><DeleteButton onConfirm={() => { db.experiences.remove(f.id!); onClose() }} /></div>}
          <Button variant="ghost" onClick={onClose}>Agora não</Button>
          <Button onClick={save} disabled={!valid}>Guardar memória</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="O que você viveu?"><Input value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Café novo no Meireles" /></Field>
        <FormGrid>
          <Field label="Quando"><Input type="date" value={f.date} onChange={(e) => set('date', e.target.value)} /></Field>
          <Field label="Quanto gastei (R$)"><Input inputMode="decimal" value={f.spent} onChange={(e) => set('spent', e.target.value)} placeholder="0" /></Field>
          <Field label="Com quem fui"><Input value={f.with} onChange={(e) => set('with', e.target.value)} placeholder="Sozinha, Lu, mãe…" /></Field>
          <Field label="Nota"><div className="flex h-11 items-center"><StarRating value={f.rating} onChange={(v) => set('rating', v)} size={24} /></div></Field>
        </FormGrid>
        <Field label="Iria novamente?">
          <Segmented value={f.wouldReturn ? 'sim' : 'nao'} onChange={(v) => set('wouldReturn', v === 'sim')} options={[{ value: 'sim', label: 'Com certeza' }, { value: 'nao', label: 'Uma vez basta' }]} />
        </Field>
        <Field label="Comentário"><Textarea value={f.comment} onChange={(e) => set('comment', e.target.value)} placeholder="O que fez esse dia especial?" /></Field>
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-vinho/70">Fotos</span>
          <div className="flex flex-wrap gap-2">
            {f.photos.map((p, i) => (
              <div key={i} className="relative h-20 w-20 overflow-hidden rounded-2xl">
                <img src={p} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => set('photos', f.photos.filter((_, j) => j !== i))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-quente/90 text-vinho" aria-label="Remover foto"><X size={12} /></button>
              </div>
            ))}
            <button type="button" onClick={() => file.current?.click()} className="grid h-20 w-20 place-items-center rounded-2xl border-2 border-dashed border-vinho/20 text-vinho/50 hover:border-queimado hover:text-cereja" aria-label="Adicionar foto">
              <ImagePlus size={20} />
            </button>
            <input ref={file} type="file" accept="image/*" multiple hidden onChange={async (e) => {
              const files = [...(e.target.files ?? [])].slice(0, 6)
              const urls = await Promise.all(files.map((x) => fileToDataUrl(x, 640, 0.75)))
              set('photos', [...f.photos, ...urls])
              e.target.value = ''
            }} />
          </div>
        </div>
      </div>
    </Modal>
  )
}
