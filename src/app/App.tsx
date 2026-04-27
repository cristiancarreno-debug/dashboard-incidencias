import { Providers } from './providers'
import { AppRouter } from './router'

/** Root de la aplicación con providers envolviendo el router. */
export function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  )
}
