import { ContinueCard, Greeting, MainGoalBanner, MyDayCard, Pillars, WeekChart } from '@/components/home/HomeCards'
import { LinkedInWidget } from '@/components/widgets/LinkedInWidget'

/** Dashboard: "Oi, Gabi!", continue de onde parou, pilares, meu dia, evolução e meta principal. */
export default function Home() {
  return (
    <div className="min-w-0 space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <Greeting />
          <ContinueCard />
          <Pillars />
        </div>
        <div className="min-w-0 space-y-6">
          <MyDayCard />
          <WeekChart />
        </div>
      </div>
      <MainGoalBanner />
      <div className="grid gap-6 lg:grid-cols-3">
        <LinkedInWidget />
      </div>
    </div>
  )
}
