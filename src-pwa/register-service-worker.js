import { register } from 'register-service-worker'
import { Dialog, Notify } from 'quasar'

register(process.env.SERVICE_WORKER_FILE, {
  ready () {
    console.log('[PWA] El service worker está activo.')
  },

  registered () {
    console.log('[PWA] Service worker registrado correctamente.')
  },

  cached () {
    console.log('[PWA] Contenido cacheado para uso offline.')
  },

  updatefound () {
    console.log('[PWA] Se encontró una actualización, descargando nueva versión...')
    // No hacemos nada aún; esperamos a que esté listo en "updated"
  },

  updated (registration) {
    console.log('[PWA] Hay una nueva versión disponible.')

    Dialog.create({
      title: 'Actualización disponible',
      persistent: true,
      message: 'Una nueva versión de la app está lista. ¿Querés actualizar ahora?',
      ok: { label: 'Actualizar', color: 'primary' },
      cancel: { label: 'Más tarde' }
    }).onOk(() => {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })

        registration.waiting.addEventListener('statechange', (e) => {
          if (e.target.state === 'activated') {
            window.location.reload()
          }
        })
      } else {
        window.location.reload()
      }
    })
  },

  offline () {
    Notify.create({
      type: 'warning',
      icon: 'wifi_off',
      position: 'bottom',
      multiline: true,
      message: 'Sin conexión. Estás usando la versión offline de la app.'
    })
  },

  error (err) {
    console.error('[PWA] Error al registrar el service worker:', err)
  }
})
