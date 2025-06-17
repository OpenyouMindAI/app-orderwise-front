import { StatusBar } from '@capacitor/status-bar'
import { boot } from 'quasar/wrappers'
import { Capacitor } from '@capacitor/core'

export default boot(async () => {
  if (Capacitor.isNativePlatform()) {
    await StatusBar.hide()
    document.addEventListener('click', async () => {
      try {
        await StatusBar.hide()
        console.log('📴 Status bar oculto por interacción')
      } catch (err) {
        console.warn('⚠️ No se pudo ocultar status bar:', err)
      }
    })
  }
})
