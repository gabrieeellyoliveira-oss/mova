import { useSession } from '@/lib/auth'
import { BootScreen } from '@/components/auth/BootScreen'
import { AppShell } from '@/components/layout/AppShell'
import { WorkoutForm } from '@/components/workouts/WorkoutForm'
import { useRoute } from '@/hooks/useRoute'
import Login from '@/pages/Login'
import Today from '@/pages/Today'
import History from '@/pages/History'
import Programs from '@/pages/Programs'
import Evolution from '@/pages/Evolution'

export default function App() {
  const session = useSession()
  const route = useRoute()
  if (session === undefined) return <BootScreen />
  if (!session) return <Login />
  return (
    <AppShell>
      {route === 'historico' ? <History /> : route === 'programas' ? <Programs /> : route === 'evolucao' ? <Evolution /> : <Today />}
      <WorkoutForm />
    </AppShell>
  )
}
