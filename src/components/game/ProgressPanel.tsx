import { useMemo } from 'react'
import gabi from '@/assets/game/gabi-caminhando.webp'
import { goalProgress, useBooks, useExperiences, useFinancialGoals, useGoals, useSettings, useStudyWeek } from '@/hooks/useData'
import { monthKey, today } from '@/utils/date'
import { useWork } from '@/hooks/useWork'
import { ratio } from '@/utils/format'
import { Card, CardHeader } from '@/components/ui/Card'
import { PixelIcon, type SpriteName } from './PixelIcon'


/** "Meu progresso": a personagem caminhando + barras por área (todas a partir dos dados reais). */
export function ProgressPanel() {
  const work = useWork(monthKey(today()))
  const study = useStudyWeek()
  const fgoals = useFinancialGoals()
  const goals = useGoals()
  const exps = useExperiences()
  const books = useBooks()
  const { yearlyBooksGoal } = useSettings()

  const rows = useMemo(() => {
    const social = goals.filter((g) => g.category === 'Vida social')
    const year = String(new Date().getFullYear())
    const month = monthKey(today())
    const list: { label: string; sprite: SpriteName; value: number; hint: string }[] = [
      { label: 'Estudos', sprite: 'laptop', value: study.progress, hint: 'horas da semana x meta' },
      { label: 'Finanças', sprite: 'coins', value: fgoals.length ? fgoals.reduce((a, g) => a + ratio(g.current, g.target), 0) / fgoals.length : 0, hint: 'média das metas financeiras' },
      { label: 'Trabalho', sprite: 'briefcase', value: work.progress, hint: 'meta do mês no trabalho' },
      { label: 'Vida social', sprite: 'cherry', value: social.length ? social.reduce((a, g) => a + goalProgress(g), 0) / social.length : ratio(exps.filter((e) => monthKey(e.date) === month).length, 4), hint: social.length ? 'metas de vida social' : 'rolês do mês' },
      { label: 'Leitura', sprite: 'book', value: ratio(books.filter((b) => b.status === 'lido' && b.finishedAt?.startsWith(year)).length, yearlyBooksGoal), hint: 'meta de livros do ano' },
    ]
    return list
  }, [work.progress, study.progress, fgoals, goals, exps, books, yearlyBooksGoal])

  const avg = rows.reduce((a, r) => a + r.value, 0) / rows.length
  const message = avg >= 70 ? 'Que fase! Continua assim ♥' : avg >= 40 ? 'Você está indo bem! ♥' : 'Um passinho de cada vez ♥'

  return (
    <Card className="overflow-hidden">
      <CardHeader icon={<PixelIcon name="cherry" />} title="Meu progresso" />
      <div className="mb-3 flex items-end gap-3">
        <div className="relative h-[124px] w-[84px] shrink-0">
          <img src={gabi} alt="Gabi caminhando" className="pixelated absolute bottom-1 left-0 h-[120px] w-auto animate-bob" />
          <div className="absolute bottom-0 left-1 h-2 w-16 rounded-[50%] bg-vinho/15" />
        </div>
        <div className="relative mb-12 rounded-md border-2 border-px-line bg-px-panel px-2.5 py-1.5 font-pixel text-[13px] font-semibold text-vinho shadow-pixel-sm">
          <span aria-hidden className="absolute -left-[7px] bottom-2 h-2.5 w-2.5 rotate-45 border-b-2 border-l-2 border-px-line bg-px-panel" />
          {message}
        </div>
      </div>
      <div>
        <ul className="space-y-2.5">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center gap-2.5" title={r.hint}>
              <PixelIcon name={r.sprite} size={18} />
              <span className="w-20 shrink-0 text-[13px] font-semibold text-tinta">{r.label}</span>
              <div className="relative h-3.5 flex-1 overflow-hidden rounded-sm border-2 border-px-line bg-[#f3dede]">
                <div className="h-full bg-queimado shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] transition-[width] duration-700" style={{ width: `${Math.min(100, r.value)}%` }} />
                <span className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 9px, rgba(43,9,16,.2) 9px 11px)' }} />
              </div>
              <span className="w-9 shrink-0 text-right font-pixel text-xs font-semibold tabular-nums text-vinho">{Math.round(Math.min(100, r.value))}%</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
