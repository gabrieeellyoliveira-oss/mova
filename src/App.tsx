import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import Home from '@/pages/Home'
import Planning from '@/pages/Planning'
import Finance from '@/pages/Finance'
import GoOut from '@/pages/GoOut'
import Studies from '@/pages/Studies'
import Reading from '@/pages/Reading'
import Goals from '@/pages/Goals'
import Routine from '@/pages/Routine'
import Notes from '@/pages/Notes'
import Profile from '@/pages/Profile'

// HashRouter: funciona em qualquer hospedagem estática, sem configurar rewrites.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="planejamento" element={<Planning />} />
          <Route path="financas" element={<Finance />} />
          <Route path="sair-de-casa" element={<GoOut />} />
          <Route path="estudos" element={<Studies />} />
          <Route path="leitura" element={<Reading />} />
          <Route path="metas" element={<Goals />} />
          <Route path="rotina" element={<Routine />} />
          <Route path="notas" element={<Notes />} />
          <Route path="perfil" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
