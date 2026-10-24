import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MONTHS, WEEKDAYS_MINI, fromISODate, monthMatrix, today } from '@/utils/date'
import { cn } from '@/lib/cn'
import type { ISODate } from '@/types'

/** Calendário mensal compacto. `dots` mapeia dia -> cores para marcar compromissos. */
export function MiniCalendar({
  selected, onSelect, dots = {},
}: { selected: ISODate; onSelect: (d: ISODate) => void; dots?: Record<ISODate, string[]> }) {
  const sel = fromISODate(selected)
  const [view, setView] = useState({ y: sel.getFullYear(), m: sel.getMonth() })
  const weeks = monthMatrix(view.y, view.m)
  const t = today()
  const shift = (n: number) => setView(({ y, m }) => { const d = new Date(y, m + n, 1); return { y: d.getFullYear(), m: d.getMonth() } })

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-heading text-lg capitalize text-vinho">{MONTHS[view.m]} <span className="text-vinho">{view.y}</span></p>
        <div className="flex gap-1">
          <button onClick={() => shift(-1)} className="grid h-8 w-8 place-items-center rounded-full text-vinho hover:bg-vinho/5" aria-label="Mês anterior"><ChevronLeft size={17} /></button>
          <button onClick={() => shift(1)} className="grid h-8 w-8 place-items-center rounded-full text-vinho hover:bg-vinho/5" aria-label="Próximo mês"><ChevronRight size={17} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS_MINI.map((w, i) => <span key={i} className="pb-1 text-[11px] font-bold text-vinho/40">{w}</span>)}
        {weeks.flat().map((d, i) =>
          d ? (
            <button
              key={d}
              onClick={() => onSelect(d)}
              className={cn(
                'relative mx-auto grid h-9 w-9 place-items-center rounded-full text-[13px] font-semibold transition',
                d === selected ? 'bg-cereja text-quente shadow-soft' : d === t ? 'bg-rosa-100 text-cereja' : 'text-tinta/80 hover:bg-rosa-50',
              )}
            >
              {fromISODate(d).getDate()}
              {dots[d] && d !== selected && (
                <span className="absolute bottom-1 flex gap-0.5">
                  {dots[d].slice(0, 3).map((c, j) => <span key={j} className="h-1 w-1 rounded-full" style={{ backgroundColor: c }} />)}
                </span>
              )}
            </button>
          ) : (
            <span key={`e${i}`} />
          ),
        )}
      </div>
      {(view.y !== fromISODate(t).getFullYear() || view.m !== fromISODate(t).getMonth() || selected !== t) && (
        <button onClick={() => { onSelect(t); setView({ y: fromISODate(t).getFullYear(), m: fromISODate(t).getMonth() }) }} className="mt-2 text-xs font-semibold text-cereja hover:underline">
          voltar para hoje
        </button>
      )}
    </div>
  )
}
