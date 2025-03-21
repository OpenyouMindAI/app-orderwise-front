import { boot } from 'quasar/wrappers'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { authentication } from 'src/stores/module-authentication'

const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_APP_API_URL,
  cluster: import.meta.env.VITE_APP_PUSHER_APP_CLUSTER,
  forceTLS: true
})

const echoPay = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_APP_PUSHER_QPAY_KEY,
  cluster: import.meta.env.VITE_APP_PUSHER_QPAY_CLUSTER,
  forceTLS: true
})

export default boot(async ({ app }) => {
  const $store = authentication()
  app.config.globalProperties.$Pusher = Pusher

  app.config.globalProperties.$echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_APP_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_APP_PUSHER_APP_CLUSTER,
    forceTLS: true,
    authEndpoint: import.meta.env.VITE_APP_API_URL + 'broadcasting/auth',
    auth: {
      headers: {
        Authorization: `${$store.token_type} ${$store.access_token}`
      }
    }
  })

  app.config.globalProperties.$echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_APP_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_APP_PUSHER_APP_CLUSTER,
    forceTLS: true,
    authEndpoint: import.meta.env.VITE_APP_API_QPAY_URL + 'broadcasting/auth',
    auth: {
      headers: {
        Authorization: `${$store.token_type} ${$store.access_token}`
      }
    }
  })

  app.config.globalProperties.$echoPay = echoPay

  app.config.globalProperties.$echo = echo
})

export { echo, echoPay }
