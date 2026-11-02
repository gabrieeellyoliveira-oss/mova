import { FinanceCard, HeroCard, InProgress } from '@/components/home/HomeCards'
import { LinkedInWidget } from '@/components/widgets/LinkedInWidget'
import { PinnedAssignments } from '@/components/college/PinnedAssignments'

/** Visão geral: capa com data e clima, finanças e LinkedIn lado a lado, e o que está em andamento. */
export default function Home() {
  return (
    <div className="min-w-0 space-y-6">
      <HeroCard />
      <section className="grid gap-6 lg:grid-cols-2">
        <FinanceCard />
        <LinkedInWidget />
      </section>
      <PinnedAssignments />
      <InProgress />
    </div>
  )
}
