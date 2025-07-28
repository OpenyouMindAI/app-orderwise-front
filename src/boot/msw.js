import { boot } from 'quasar/wrappers'
import { startMocking } from '../mocks/browser'

export default boot(async ({ app }) => {
  // Inicializar MSW solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    await startMocking()
  }
})
