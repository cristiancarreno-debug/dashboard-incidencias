import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { EquipoPage } from '@/features/equipo/EquipoPage'

const basename = import.meta.env.BASE_URL || '/'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <DashboardPage />,
    },
    {
      path: '/equipo',
      element: <EquipoPage />,
    },
  ],
  { basename }
)

export function AppRouter() {
  return <RouterProvider router={router} />
}
