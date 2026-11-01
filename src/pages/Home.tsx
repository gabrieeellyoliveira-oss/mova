import { DateWeather, FinanceCard, HeroCard, InProgress, MyDayCard, StatTiles, WeekChart } from '@/components/home/HomeCards'
import { LinkedInWidget } from '@/components/widgets/LinkedInWidget'

/** Visão geral: saudação, números do dia, meu dia, evolução, finanças, o que está em andamento e o LinkedIn. */
export default function Home() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <HeroCard />
        <div className="flex flex-col gap-4">
          <DateWeather />
          <StatTiles />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <MyDayCard />
        <WeekChart />
        <FinanceCard />
      </div>
      <InProgress />
      <div className="grid gap-6 lg:grid-cols-3">
        <LinkedInWidget />
      </div>
    </div>
  )
}
