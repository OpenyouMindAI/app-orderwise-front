import { boot } from 'quasar/wrappers'
import { authentication } from 'src/stores/module-authentication'
import { watch } from 'vue'

export default boot(({ app, router, store }) => {
  const pixelId = import.meta.env.VITE_FACEBOOK_PIXEL_ID

  if (pixelId) {
    const authStore = authentication(store)

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

    // 2. Inject Script (Only if not present)
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
        s.parentNode.insertBefore(t, s)
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
    }

    // 3. Initialize (Only Once)
    const user = authStore.userSession
    const userData = {}

    if (user) {
      if (user.email) userData.em = user.email
      if (user.id) userData.external_id = user.id
      if (user.name) userData.fn = user.name
      if (user.last_name) userData.ln = user.last_name

      const rawPhone = user.phone_number || user.phone
      if (rawPhone) {
        // Remove leading '+' if present
        userData.ph = rawPhone.toString().replace(/^\+/, '')
      }
    }

    // We used to call init here, but we'll do it strictly once via a check or just call it.
    // Facebook warns if init is called multiple times with same ID, but Advanced Matching UPDATES require init.
    // To solve "4 times" issue, we ensure this boot file runs once using a global flag.
    if (window.fbq && !window.__pixel_initialized) {
      window.fbq('init', pixelId, userData)
      // Track initial PageView
      window.fbq('track', 'PageView')

      // Mark as initialized to prevent re-execution on hot reloads or re-mounts
      window.__pixel_initialized = true
    }

    // 4. Provide Compatibility Wrapper for Components
    // Components utilize `fbq.event(...)` and `fbq.track(...)` (from our previous refactor to .event)
    // We create an object that mimics the library interface
    const pixelInterface = {
      event: (eventName, params) => trackEvent(eventName, params),
      track: (eventName, params) => trackEvent(eventName, params) // Backward compatibility
    }

    // Provide globally
    app.config.globalProperties.$fbq = pixelInterface
    app.provide('VueFbq', pixelInterface) // Might not be needed if we don't use inject('VueFbq') KEY

    // 5. Watch for login changes to update pixel data (Strict comparison)
    watch(
      () => [
        authStore.userSession?.email,
        authStore.userSession?.id,
        authStore.userSession?.phone_number,
        authStore.userSession?.phone,
        authStore.userSession?.name,
        authStore.userSession?.last_name
      ],
      ([newEmail, newId, newPhone, newPhoneAlt, newName, newLastName], [oldEmail, oldId, oldPhone, oldPhoneAlt, oldName, oldLastName]) => {
        if (window.fbq && (newEmail !== oldEmail || newId !== oldId || newPhone !== oldPhone || newPhoneAlt !== oldPhoneAlt || newName !== oldName || newLastName !== oldLastName)) {
          const newUserData = {}
          if (newEmail) newUserData.em = newEmail
          if (newId) newUserData.external_id = newId
          if (newName) newUserData.fn = newName
          if (newLastName) newUserData.ln = newLastName

          const rawPhone = newPhone || newPhoneAlt
          if (rawPhone) {
            newUserData.ph = rawPhone.toString().replace(/^\+/, '')
          }

          // Update user data for Advanced Matching
          window.fbq('init', pixelId, newUserData)
        }
      }
    )

    // 6. Manual Route Tracking for SPA
    router.afterEach(() => {
      if (window.fbq) {
        window.fbq('track', 'PageView')
      }
    })
  }
})
