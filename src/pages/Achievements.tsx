import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { CustomAchievement } from '@/types'
import { useGame } from '@/game/useGame'
import { db } from '@/store/db'
import { useCollection } from '@/store/collections'
import { CustomAchievementForm } from '@/components/game/CustomAchievementForm'
import { XP_VALUES, PAGES_PER_READING } from '@/game/config'
import { StatCard } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Achievement } from '@/components/game/Achievement'
import { XPBar } from '@/components/game/XPBar'
import { WidgetHeader } from '@/components/widgets/WidgetHeader'

/** Conquistas: nível, de onde vem o XP e as medalhas (bloqueadas e desbloqueadas). */
export default function Achievements() {
  const g = useGame()
  const customs = useCollection(db.customAchievements)
  const [editing, setEditing] = useState<CustomAchievement | 'new' | null>(null)
  const unlocked = g.achievements.filter((a) => a.unlocked)
  const mine = g.achievements.filter((a) => a.customId).sort((a, b) => Number(b.unlocked) - Number(a.unlocked))
  const game = g.achievements.filter((a) => !a.customId)
  const gameSorted = [...game.filter((a) => a.unlocked), ...game.filter((a) => !a.unlocked).sort((a, b) => b.current / b.target - a.current / a.target)]

  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))]">
        <Card tone="vinho" className="flex flex-col justify-center gap-2">
          <XPBar variant="sidebar" />
          <p className="text-xs text-rosa-50/70">Faltam {g.needed - g.into} XP para o nível {g.level + 1}.</p>
        </Card>
        <StatCard tone="rosa" label="XP total" value={g.total} />
        <StatCard label="Desbloqueadas" value={`${unlocked.length}/${g.achievements.length}`} />
      </div>

      <Card>
        <WidgetHeader title="Minhas conquistas" sprite="heart" action={<button onClick={() => setEditing('new')} className="inline-flex items-center gap-1 font-medium text-rosa-50/80 hover:text-rosa"><Plus size={14} /> Nova</button>} />
        <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
          {mine.map((a) => <Achievement key={a.id} {...a} onClick={() => setEditing(customs.find((c) => c.id === a.customId) ?? null)} />)}
          <button onClick={() => setEditing('new')} className="group flex flex-col items-center gap-2 text-center">
            <span className="grid h-20 w-20 place-items-center border-2 border-dashed border-px-line/40 bg-white/40 text-vinho/50 transition group-hover:-translate-y-0.5 group-hover:border-px-line group-hover:text-vinho" style={{ clipPath: 'polygon(25% 0, 75% 0, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0 75%, 0 25%)' }}>
              <Plus size={28} />
            </span>
            <span className="font-pixel text-sm font-semibold text-vinho/70">Nova conquista</span>
          </button>
        </div>
        {!mine.length && <p className="mt-4 text-sm text-vinho/60">Crie medalhas para o que importa pra você — algo que já conquistou ou uma meta pra desbloquear.</p>}
      </Card>

      <Card>
        <WidgetHeader title="Medalhas do jogo" sprite="trophy" />
        <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
          {gameSorted.map((a) => <Achievement key={a.id} {...a} />)}
        </div>
      </Card>
      {editing && <CustomAchievementForm initial={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}

      <Card>
        <WidgetHeader title="De onde vem seu XP" sprite="star" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="text-left font-pixel text-[12px] uppercase tracking-wide text-vinho/60">
                <th className="py-2 pr-3 font-semibold">Ação</th>
                <th className="py-2 pr-3 text-right font-semibold">Vale</th>
                <th className="py-2 pr-3 text-right font-semibold">Vezes</th>
                <th className="py-2 text-right font-semibold">XP</th>
              </tr>
            </thead>
            <tbody>
              {g.breakdown.map((b) => (
                <tr key={b.key} className="border-t-2 border-dashed border-vinho/10">
                  <td className="py-2 pr-3 font-medium text-tinta">{b.label}{b.key === 'leitura' && <span className="text-xs text-vinho/50"> (a cada {PAGES_PER_READING} páginas)</span>}</td>
                  <td className="py-2 pr-3 text-right tabular-nums text-vinho/70">+{b.each}</td>
                  <td className="py-2 pr-3 text-right tabular-nums text-vinho/70">{b.count}</td>
                  <td className="py-2 text-right font-pixel font-semibold tabular-nums text-vinho">{b.xp}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-px-line">
                <td className="py-2 font-bold text-vinho" colSpan={3}>Total</td>
                <td className="py-2 text-right font-pixel text-base font-semibold tabular-nums text-vinho">{g.total}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="mt-3 text-xs text-vinho/55">Desmarcou algo? O XP acompanha: tudo é recalculado a partir dos seus dados. Meta concluída vale +{XP_VALUES.meta} XP.</p>
      </Card>
    </div>
  )
}
