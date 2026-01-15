import { boot } from 'quasar/wrappers'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { authentication } from 'src/stores/module-authentication'

let echo = null
let echoPay = null

// Lazy initialization for echoPay (only when needed for MercadoPago)
function getEchoPay () {
  if (!echoPay) {
    const $store = authentication()
    echoPay = new Echo({
      broadcaster: 'pusher',
      key: import.meta.env.VITE_APP_PUSHER_QPAY_KEY,
      cluster: import.meta.env.VITE_APP_PUSHER_QPAY_CLUSTER,
      forceTLS: false,
      authEndpoint: import.meta.env.VITE_APP_API_QPAY_URL + 'broadcasting/auth',
      auth: {
        headers: {
          Authorization: `${$store.token_type} ${$store.access_token}`
        }
      }
    })
  }
  return echoPay
}

export default boot(async ({ app }) => {
  const $store = authentication()
  app.config.globalProperties.$Pusher = Pusher

  echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_APP_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_APP_PUSHER_APP_CLUSTER,
    forceTLS: false,
    encrypted: false,
    disableStats: true,
    enabledTransports: ['ws'],
    authEndpoint: import.meta.env.VITE_APP_API_URL + 'broadcasting/auth',
    auth: {
      headers: {
        Authorization: `${$store.token_type} ${$store.access_token}`
      }
    }
  })

  Object.defineProperty(app.config.globalProperties, '$echoPay', {
    get: () => getEchoPay()
  })

  app.config.globalProperties.$echo = echo
})

export { echo, echoPay }
