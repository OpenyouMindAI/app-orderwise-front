import { createPinia } from 'pinia'
import { boot } from 'quasar/wrappers'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export default boot(async ({ app }) => {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)
})
