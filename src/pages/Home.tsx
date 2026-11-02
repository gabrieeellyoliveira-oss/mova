import { DateWeather, FinanceCard, HeroCard, InProgress, MyDayCard, StatTiles, WeekChart } from '@/components/home/HomeCards'
import { LinkedInWidget } from '@/components/widgets/LinkedInWidget'

/** Visão geral (projeto "Login Look Dashboard"): capa, números, meu dia, evolução, finanças e em andamento. */
export default function Home() {
  return (
    <div className="min-w-0 space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <HeroCard />
        <div className="flex flex-col gap-4">
          <DateWeather />
          <StatTiles />
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-3">
        <MyDayCard />
        <WeekChart />
        <FinanceCard />
      </section>
      <InProgress />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <LinkedInWidget />
      </div>
    </div>
  )
}
