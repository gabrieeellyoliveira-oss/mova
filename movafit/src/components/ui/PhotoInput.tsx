import { useRef, useState } from 'react'
import { ImagePlus, Link2, X } from 'lucide-react'
import { fileToDataUrl } from '@/utils/image'
import { Input } from './Form'
import { Button } from './Button'

/** Escolhe foto do dispositivo (reduzida) ou por link. */
export function PhotoInput({ value, onChange, aspect = 'aspect-[4/3]' }: { value?: string; onChange: (v?: string) => void; aspect?: string }) {
  const ref = useRef<HTMLInputElement>(null)
  const [showUrl, setShowUrl] = useState(false)
  return (
    <div className="space-y-2">
      {value ? (
        <div className={`relative overflow-hidden rounded-2xl ${aspect} bg-creme-200`}>
          <img src={value} alt="" className="h-full w-full object-cover" />
          <button type="button" onClick={() => onChange(undefined)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-quente/90 text-ink shadow" aria-label="Remover foto">
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button variant="soft" size="sm" onClick={() => ref.current?.click()}>
            <ImagePlus size={15} /> Escolher foto
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowUrl((s) => !s)}>
            <Link2 size={15} /> Colar link
          </Button>
        </div>
      )}
      {showUrl && !value && <Input placeholder="https://…" onBlur={(e) => e.target.value && onChange(e.target.value)} />}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0]
          if (f) onChange(await fileToDataUrl(f))
          e.target.value = ''
        }}
      />
    </div>
  )
}
