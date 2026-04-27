import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardPage />,
  },
])

/** React Router con ruta principal del dashboard. */
export function AppRouter() {
  return <RouterProvider router={router} />
}
