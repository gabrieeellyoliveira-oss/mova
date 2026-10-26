import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import Home from '@/pages/Home'
import Agenda from '@/pages/Agenda'
import Work from '@/pages/Work'
import Finance from '@/pages/Finance'
import Vault from '@/pages/Vault'
import Studies from '@/pages/Studies'
import Reading from '@/pages/Reading'
import Goals from '@/pages/Goals'
import Notes from '@/pages/Notes'
import Profile from '@/pages/Profile'
import Login from '@/pages/Login'
import MyDay from '@/pages/MyDay'
import Achievements from '@/pages/Achievements'
import { useSession } from '@/lib/auth'
import { BootScreen } from '@/components/auth/BootScreen'

// HashRouter: funciona em qualquer hospedagem estática, sem configurar rewrites.
export default function App() {
  const session = useSession()
  if (session === undefined) return <BootScreen />
  if (!session) return <Login />
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="meu-dia" element={<MyDay />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="planejamento" element={<Navigate to="/agenda" replace />} />
          <Route path="trabalho" element={<Work />} />
          <Route path="financas" element={<Finance />} />
          <Route path="sair-de-casa" element={<Vault />} />
          <Route path="estudos" element={<Studies />} />
          <Route path="leitura" element={<Reading />} />
          <Route path="metas" element={<Goals />} />
          <Route path="conquistas" element={<Achievements />} />
          <Route path="notas" element={<Notes />} />
          <Route path="perfil" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
