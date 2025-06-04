import { register } from 'register-service-worker'
import { Dialog, Notify } from 'quasar'

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready (/* registration */) {
    // console.log('Service worker is active.')
  },

  registered (/* registration */) {
    // console.log('Service worker has been registered.')
  },

  cached (/* registration */) {
    console.log('Content has been cached for offline use.')
  },
  updatefound (/* registration */) {
    Notify.create({
      type: 'primary',
      icon: 'info',
      progress: true,
      message:
        'Se está actualizando la aplicación, por favor espere unos minutos',
      position: 'bottom',
      multiline: true,
      timeout: 2000
    })
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  },
  updated (/* registration */) {
    Dialog.create({
      title: 'Actualización disponible',
      persistent: true,
      message:
        'Una nueva versión de la aplicación está disponible. Para continuar utilizando todas las funcionalidades, por favor actualice la página.',
      ok: {
        label: 'Actualizar',
        color: 'primary'
      }
    }).onOk(() => {
      window.location.reload()
    })
  },
  offline () {
    Notify.create({
      type: 'secondary',
      icon: 'warning',
      position: 'bottom',
      multiline: true,
      title: 'Conexión a Internet no disponible',
      message:
        'Actualmente no se ha detectado conexión a Internet, por lo que la aplicación no está disponible en este momento. Por favor, verifica tu conexión y vuelve a intentarlo.'
    })
  },

  error (err) {
    console.error('Error during service worker registration:', err)
  }
})
