import { HashRouter, Routes, Route } from 'react-router-dom'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { EquipoPage } from '@/features/equipo/EquipoPage'

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/equipo" element={<EquipoPage />} />
      </Routes>
    </HashRouter>
  )
}
