import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useGlobalSearch, type SearchResult } from '@/hooks/useSearch'
import { openForm } from '@/hooks/useQuickAdd'
import { cn } from '@/lib/cn'

export function GlobalSearch({ className, autoFocus, onDone }: { className?: string; autoFocus?: boolean; onDone?: () => void }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const results = useGlobalSearch(q)
  const nav = useNavigate()
  const box = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        input.current?.focus()
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const choose = (r: SearchResult) => {
    nav(r.path)
    if (r.form) openForm(r.form.kind, r.form.initial)
    setQ('')
    setOpen(false)
    onDone?.()
  }

  const groups = results.reduce<Record<string, SearchResult[]>>((acc, r) => ((acc[r.group] ??= []).push(r), acc), {})

  return (
    <div ref={box} className={cn('relative', className)}>
      <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-vinho/45" />
      <input
        ref={input}
        autoFocus={autoFocus}
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) choose(results[0]); if (e.key === 'Escape') { setOpen(false); onDone?.() } }}
        placeholder="Buscar tarefas, livros, custos…"
        className="h-11 w-full rounded-lg border-2 border-px-line/40 bg-px-panel pl-11 pr-10 text-sm text-tinta shadow-pixel-sm placeholder:text-vinho/40 focus:border-queimado focus:outline-none focus:ring-2 focus:ring-rosa/50"
        aria-label="Busca global"
      />
      {q && (
        <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-vinho/50" aria-label="Limpar busca">
          <X size={16} />
        </button>
      )}
      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[60vh] overflow-y-auto rounded-px border-2 border-px-line bg-quente p-2 shadow-pixel animate-rise">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-vinho/60">Nada por aqui com “{q}”.</p>
          ) : (
            Object.entries(groups).map(([g, list]) => (
              <div key={g} className="mb-1">
                <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-queimado">{g}</p>
                {list.map((r) => (
                  <button key={r.id} onClick={() => choose(r)} className="flex w-full flex-col rounded-2xl px-3 py-2 text-left hover:bg-rosa-50">
                    <span className="text-sm font-semibold text-vinho">{r.title}</span>
                    {r.subtitle && <span className="text-xs text-vinho/55">{r.subtitle}</span>}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
