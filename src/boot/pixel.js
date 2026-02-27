import { boot } from 'quasar/wrappers'
import { authentication } from 'src/stores/module-authentication'
import { watch } from 'vue'

export default boot(({ app, router, store }) => {
  const authStore = authentication(store)

  /**
   * Get Pixel ID with priority for session data
   * @returns {string|null}
   */
  const getPixelId = () => authStore.userSession?.company_session?.business_type?.pixel || import.meta.env.VITE_FACEBOOK_PIXEL_ID

  // 1. Define Helper Functions
  // Map standard/custom events to fbq architecture
  const trackEvent = (event, data = {}) => {
    if (typeof window === 'undefined' || !window.fbq) return

    const standardEvents = [
      'AddPaymentInfo', 'AddToCart', 'AddToWishlist', 'CompleteRegistration',
      'Contact', 'CustomizeProduct', 'Donate', 'FindLocation',
      'InitiateCheckout', 'Lead', 'PageView', 'Purchase', 'Schedule',
      'Search', 'StartTrial', 'SubmitApplication', 'Subscribe', 'ViewContent'
    ]

    if (standardEvents.includes(event)) {
      window.fbq('track', event, data)
    } else {
      window.fbq('trackCustom', event, data)
    }
  }

  // 2. Inject Script Function
  const injectScript = () => {
    if (typeof window !== 'undefined' && !window.fbq) {
      (function (f, b, e, v, n, t, s) {
        if (f.fbq) return
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
        if (s && s.parentNode) {
          s.parentNode.insertBefore(t, s)
        } else {
          b.head.appendChild(t)
        }
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
    }
  }

  // 3. Initialize Pixel Function
  const initializeFbq = (pixelId, user) => {
    if (!pixelId) return
    injectScript()

    const userData = {}
    if (user) {
      if (user.email) userData.em = user.email
      if (user.id) userData.external_id = user.id
      if (user.name) userData.fn = user.name
      if (user.last_name) userData.ln = user.last_name

      const rawPhone = user.phone_number || user.phone
      if (rawPhone) {
        userData.ph = rawPhone.toString().replace(/^\+/, '')
      }
    }

    if (window.fbq) {
      window.fbq('init', pixelId, userData)

      if (!window.__pixel_initialized) {
        window.fbq('track', 'PageView')
        window.__pixel_initialized = true
      }
    }
  }

  // 4. Initial Attempt
  initializeFbq(getPixelId(), authStore.userSession)

  // 5. Provide Compatibility Wrapper for Components
  const pixelInterface = {
    event: (eventName, params) => trackEvent(eventName, params),
    track: (eventName, params) => trackEvent(eventName, params)
  }

  app.config.globalProperties.$fbq = pixelInterface
  app.provide('VueFbq', pixelInterface)

  // 6. Watch for session or pixel changes
  watch(
    () => [
      authStore.userSession?.email,
      authStore.userSession?.id,
      authStore.userSession?.phone_number,
      authStore.userSession?.phone,
      authStore.userSession?.name,
      authStore.userSession?.last_name,
      getPixelId()
    ],
    ([newEmail, newId, newPhone, newPhoneAlt, newName, newLastName, newPixelId], [oldEmail, oldId, oldPhone, oldPhoneAlt, oldName, oldLastName, oldPixelId]) => {
      if (newPixelId || oldPixelId) {
        const activePixelId = newPixelId || getPixelId()
        if (!activePixelId) return

        if (window.fbq && (newEmail !== oldEmail || newId !== oldId || newPhone !== oldPhone || newPhoneAlt !== oldPhoneAlt || newName !== oldName || newLastName !== oldLastName || newPixelId !== oldPixelId)) {
          const newUserData = {}
          if (newEmail) newUserData.em = newEmail
          if (newId) newUserData.external_id = newId
          if (newName) newUserData.fn = newName
          if (newLastName) newUserData.ln = newLastName

          const rawPhone = newPhone || newPhoneAlt
          if (rawPhone) {
            newUserData.ph = rawPhone.toString().replace(/^\+/, '')
          }

          window.fbq('init', activePixelId, newUserData)
        } else if (!window.fbq && activePixelId) {
          initializeFbq(activePixelId, authStore.userSession)
        }
      }
    }
  )

  // 7. Manual Route Tracking for SPA
  router.afterEach(() => {
    if (window.fbq) {
      window.fbq('track', 'PageView')
    }
  })
})
