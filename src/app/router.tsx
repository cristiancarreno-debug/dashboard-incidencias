import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'

/**
 * Detecta el basename desde el tag <base> del HTML o usa '/'.
 * En GitHub Pages será '/dashboard-incidencias/', en local '/'.
 */
const basename = import.meta.env.BASE_URL || '/'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <DashboardPage />,
    },
  ],
  { basename }
)

/** React Router con ruta principal del dashboard. */
export function AppRouter() {
  return <RouterProvider router={router} />
}
