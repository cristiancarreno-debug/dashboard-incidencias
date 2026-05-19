import { createHashRouter, RouterProvider } from 'react-router-dom'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { EquipoPage } from '@/features/equipo/EquipoPage'

const router = createHashRouter([
  { path: '/', element: <DashboardPage /> },
  { path: '/equipo', element: <EquipoPage /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
