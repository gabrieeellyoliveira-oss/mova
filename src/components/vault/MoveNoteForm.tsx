import { useRef, useState } from 'react'
import { ExternalLink, ImagePlus, Plus, X } from 'lucide-react'
import type { MoveNote, MoveNoteKind, MoveNoteStatus } from '@/types'
import { db } from '@/store/db'
import { fileToDataUrl } from '@/utils/image'
import { moneyInput, parseMoney } from '@/utils/format'
import { toast } from '@/hooks/useToast'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Form'
import { DeleteButton } from '@/components/ui/Misc'
import { cn } from '@/lib/cn'

export const NOTE_KINDS: { value: MoveNoteKind; label: string; emoji: string; cls: string }[] = [
  { value: 'casa', label: 'Casa', emoji: '🏠', cls: 'bg-lavanda' },
  { value: 'movel', label: 'Móvel', emoji: '🛋️', cls: 'bg-salvia' },
  { value: 'ideia', label: 'Ideia', emoji: '💡', cls: 'bg-px-gold-soft' },
  { value: 'outro', label: 'Outro', emoji: '📌', cls: 'bg-lavanda-100' },
]
export const NOTE_STATUS: { value: MoveNoteStatus; label: string }[] = [
  { value: 'pesquisando', label: 'Pesquisando' },
  { value: 'favorito', label: '♥ Favorito' },
  { value: 'comprado', label: '✓ Comprado' },
  { value: 'descartado', label: 'Descartado' },
]
/** "https://www.magazineluiza.com.br/x" → "magazineluiza.com.br" */
export const domainOf = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return u } }
const normUrl = (u: string) => (/^https?:\/\//i.test(u) ? u : `https://${u}`)

/** Uma anotação da pesquisa: casa, móvel, ideia — com links, preço, fotos e texto. */
export function MoveNoteForm({ initial, kind, onClose }: { initial?: MoveNote; kind?: MoveNoteKind; onClose: () => void }) {
  const [f, setF] = useState({
    kind: initial?.kind ?? kind ?? 'movel', title: initial?.title ?? '', text: initial?.text ?? '', links: initial?.links ?? [],
    price: initial?.price ? moneyInput(initial.price) : '', status: initial?.status ?? 'pesquisando', photos: initial?.photos ?? [],
  })
  const [link, setLink] = useState('')
  const file = useRef<HTMLInputElement>(null)
  const valid = !!f.title.trim()
  const addLink = () => { const l = link.trim(); if (l) { setF((p) => ({ ...p, links: [...p.links, normUrl(l)] })); setLink('') } }

  const save = () => {
    if (!valid) return
    const links = link.trim() ? [...f.links, normUrl(link.trim())] : f.links
    const price = parseMoney(f.price)
    const data = { kind: f.kind as MoveNoteKind, title: f.title.trim(), text: f.text.trim(), links, price: price > 0 ? price : undefined, status: f.status as MoveNoteStatus, photos: f.photos }
    let id = initial?.id
    if (initial) db.moveNotes.update(initial.id, data)
    else id = db.moveNotes.add(data).id
    let saved = true
    try { saved = (localStorage.getItem('mova:v1:moveNotes') ?? '').includes(`"${id}"`) } catch { /* ignore */ }
    if (!saved && !initial && id) { db.moveNotes.remove(id); toast('Sem espaço para tantas fotos', { text: 'Tente com menos fotos.', kind: 'info' }); return }
    toast(initial ? 'Anotação atualizada' : 'Anotação salva ✨')
    onClose()
  }

  return (
    <Modal open onClose={onClose} size="lg" title={initial ? 'Anotação' : 'Nova anotação'} subtitle="Pesquisa da mudança"
      footer={<>
        {initial && <span className="mr-auto"><DeleteButton onConfirm={() => { db.moveNotes.remove(initial.id); onClose() }} /></span>}
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={save} disabled={!valid}>Salvar</Button>
      </>}>
      <div className="space-y-4">
        <div role="group" aria-label="Tipo" className="flex flex-wrap gap-2">
          {NOTE_KINDS.map((k) => (
            <button key={k.value} type="button" aria-pressed={f.kind === k.value} onClick={() => setF({ ...f, kind: k.value })}
              className={cn('rounded-full border-2 border-ink px-4 py-1.5 text-sm font-semibold transition', f.kind === k.value ? k.cls : 'bg-quente opacity-60 hover:opacity-100')}>{k.emoji} {k.label}</button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
          <Field label="Título"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder={f.kind === 'casa' ? 'Apê 2 quartos na Aldeota' : f.kind === 'movel' ? 'Guarda-roupa 3 portas' : 'O que é?'} /></Field>
          <Field label={f.kind === 'casa' ? 'Aluguel (R$)' : 'Preço (R$)'}><Input inputMode="decimal" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} placeholder="opcional" /></Field>
        </div>
        <Field label="Situação" group>
          <div className="flex flex-wrap gap-2">
            {NOTE_STATUS.map((s) => (
              <button key={s.value} type="button" aria-pressed={f.status === s.value} onClick={() => setF({ ...f, status: s.value })}
                className={cn('rounded-full border-2 border-ink px-3 py-1 text-xs font-semibold transition', f.status === s.value ? 'bg-ink text-ink-fg' : 'bg-quente hover:bg-lavanda-100')}>{s.label}</button>
            ))}
          </div>
        </Field>
        <Field label="Links" group>
          <ul className="space-y-2">
            {f.links.map((l, i) => (
              <li key={i} className="flex items-center gap-2 rounded-2xl border-2 border-ink bg-quente px-3 py-2 text-sm">
                <a href={l} target="_blank" rel="noreferrer" className="flex min-w-0 flex-1 items-center gap-1.5 font-semibold hover:underline"><ExternalLink size={14} className="shrink-0" /><span className="truncate">{domainOf(l)}</span></a>
                <button type="button" onClick={() => setF({ ...f, links: f.links.filter((_, j) => j !== i) })} aria-label={`Remover link ${domainOf(l)}`} className="text-tinta/50 hover:text-cereja"><X size={15} /></button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex gap-2">
            <Input value={link} onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink() } }} placeholder="Cole o link (loja, anúncio, Pinterest…)" aria-label="Novo link" />
            <button type="button" onClick={addLink} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-ink bg-lavanda" aria-label="Adicionar link"><Plus size={16} /></button>
          </div>
        </Field>
        <Field label="Anotações"><Textarea value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} className="min-h-[140px]" placeholder={f.kind === 'casa' ? 'Bairro, tamanho, o que inclui, contato do dono…' : 'Medidas, cor, onde vende mais barato…'} /></Field>
        <Field label="Fotos" group>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {f.photos.map((p, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-2xl border-2 border-ink bg-creme-100">
                <img src={p} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                <button type="button" onClick={() => setF({ ...f, photos: f.photos.filter((_, j) => j !== i) })} className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full border-2 border-ink bg-quente" aria-label="Remover foto"><X size={14} /></button>
              </div>
            ))}
            <button type="button" onClick={() => file.current?.click()} className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-ink/30 text-tinta/60 transition hover:border-ink hover:text-ink">
              <span className="flex flex-col items-center gap-1 text-xs font-semibold"><ImagePlus size={22} /> Adicionar</span>
            </button>
          </div>
          <input ref={file} type="file" accept="image/*" multiple hidden onChange={async (e) => {
            const files = [...(e.target.files ?? [])]; e.target.value = ''
            const urls = await Promise.all(files.map((x) => fileToDataUrl(x)))
            setF((p) => ({ ...p, photos: [...p.photos, ...urls] }))
          }} />
        </Field>
      </div>
    </Modal>
  )
}
