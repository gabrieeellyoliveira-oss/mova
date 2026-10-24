import { WelcomeBanner } from '@/components/widgets/WelcomeBanner'
import { Shortcuts } from '@/components/widgets/Shortcuts'
import { CalendarWidget } from '@/components/widgets/CalendarWidget'
import { TasksWidget } from '@/components/widgets/TasksWidget'
import { FinanceWidget } from '@/components/widgets/FinanceWidget'
import { VaultWidget } from '@/components/widgets/VaultWidget'
import { StudyWeekWidget } from '@/components/widgets/StudyWeekWidget'
import { ReadingWidget } from '@/components/widgets/ReadingWidget'
import { GoalsWidget } from '@/components/widgets/GoalsWidget'
import { CostsWidget } from '@/components/widgets/CostsWidget'

export default function Home() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-5">
        <WelcomeBanner />
        <Shortcuts />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 min-[1360px]:grid-cols-3">
          <FinanceWidget />
          <VaultWidget />
          <StudyWeekWidget />
          <ReadingWidget />
          <GoalsWidget />
          <CostsWidget />
        </div>
      </div>
      <aside className="grid content-start gap-5 md:grid-cols-2 xl:grid-cols-1">
        <CalendarWidget />
        <TasksWidget />
      </aside>
    </div>
  )
}
