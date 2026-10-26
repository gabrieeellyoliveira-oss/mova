import { CharacterScene } from '@/components/game/CharacterScene'
import { ProgressPanel } from '@/components/game/ProgressPanel'
import { AreaMenu } from '@/components/widgets/AreaMenu'
import { MissionsWidget } from '@/components/widgets/MissionsWidget'
import { GoalsWidget } from '@/components/widgets/GoalsWidget'
import { DayTimelineWidget } from '@/components/widgets/DayTimelineWidget'
import { FinanceWidget } from '@/components/widgets/FinanceWidget'
import { VaultWidget } from '@/components/widgets/VaultWidget'
import { ReadingWidget } from '@/components/widgets/ReadingWidget'
import { PlacesWidget } from '@/components/widgets/PlacesWidget'
import { AchievementsWidget } from '@/components/widgets/AchievementsWidget'
import { StudyWeekWidget } from '@/components/widgets/StudyWeekWidget'
import { CostsWidget } from '@/components/widgets/CostsWidget'

/** Início: o quarto da Gabi como cena de jogo + menus de área e painéis do dia. */
export default function Home() {
  return (
    <div className="space-y-5">
      <CharacterScene />
      <AreaMenu />
      <div className="grid gap-5 lg:grid-cols-2 min-[1360px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.95fr)]">
        <MissionsWidget />
        <ProgressPanel />
        <DayTimelineWidget />
        <GoalsWidget />
        <FinanceWidget />
        <ReadingWidget />
        <PlacesWidget />
        <VaultWidget />
        <AchievementsWidget />
        <StudyWeekWidget />
        <CostsWidget />
      </div>
    </div>
  )
}
