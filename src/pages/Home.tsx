import { CharacterScene } from '@/components/game/CharacterScene'
import { ProgressPanel } from '@/components/game/ProgressPanel'
import { AreaMenu } from '@/components/widgets/AreaMenu'
import { MissionsWidget } from '@/components/widgets/MissionsWidget'
import { GoalsWidget } from '@/components/widgets/GoalsWidget'
import { FinanceWidget } from '@/components/widgets/FinanceWidget'
import { VaultWidget } from '@/components/widgets/VaultWidget'
import { ReadingWidget } from '@/components/widgets/ReadingWidget'
import { AchievementsWidget } from '@/components/widgets/AchievementsWidget'
import { StudyWeekWidget } from '@/components/widgets/StudyWeekWidget'
import { CostsWidget } from '@/components/widgets/CostsWidget'
import { LinkedInWidget } from '@/components/widgets/LinkedInWidget'

/** Início: o quarto da Gabi como cena de jogo + menus de área e painéis do dia. */
export default function Home() {
  return (
    <div className="space-y-5">
      <CharacterScene />
      <AreaMenu />
      <div className="grid gap-5 lg:grid-cols-2 min-[1360px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.95fr)]">
        <MissionsWidget />
        <ProgressPanel />
        <GoalsWidget />
        <FinanceWidget />
        <ReadingWidget />
        <VaultWidget />
        <AchievementsWidget />
        <StudyWeekWidget />
        <CostsWidget />
        <LinkedInWidget />
      </div>
    </div>
  )
}
