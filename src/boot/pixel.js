import { boot } from 'quasar/wrappers'
import { VueFbq } from 'vue3-facebook-pixel'

export default boot(({ app, router }) => {
  const pixelId = import.meta.env.VITE_FACEBOOK_PIXEL_ID

  if (pixelId) {
    // 1. Load Facebook Pixel Script (required by vue3-facebook-pixel)
    if (typeof window !== 'undefined' && !window.fbq) {
      (function (f, b, e, v, n, t, s) {
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
        }
        if (!f._fbq) f._fbq = n
        n.push = n
        n.loaded = !0
        n.version = '2.0'
        n.queue = []
        t = b.createElement(e)
        t.async = !0
        t.src = v
        s = b.getElementsByTagName(e)[0]
        s.parentNode.insertBefore(t, s)
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
    }

    // 2. Initialize Vue Facebook Pixel (handles init and tracking)
    const options = {
      pixelId,
      debug: import.meta.env.DEV,
      router
    }

    app.use(VueFbq, options)
  }
})
