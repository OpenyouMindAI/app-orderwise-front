import { boot } from 'quasar/wrappers'
import { authentication } from 'src/stores/module-authentication'
import { api } from './axios'
import { notifySession, notifyError, notifyValidationErrors } from 'src/const/mixins'

/**
 * Centralized configuration for exclude URLs and debounce times
 * @type {Object} Configuration object
 */
const CONFIG = {
  EXCLUDED_URLS: [
    'session/company',
    'register',
    'login',
    'change-password',
    'otp/verify',
    'otp/send',
    'otp/resend',
    'otp/status',
    'countries',
    'business-types'
  ],
  ROUTES_WITHOUT_MODULE_CHECK: ['Profile', 'ChangeCompany', 'VerifySession'],
  DEBOUNCE_TIME: 2000
}

/**
 * Validates if the session token is valid
 * @params {Object} store - Authentication store
 * @return {Boolean} true if the token is valid
 */
const hasValidToken = (store) => {
  if (!store.access_token || store.access_token === 'null') {
    return false
  }

  if (!store.userSession) {
    return false
  }

  // Si tiene token y sesión de usuario, está autenticado.
  // La validación de si tiene empresa o no se maneja en el flujo de cada página/layout,
  // no debemos expulsarlo al login solo por no tener empresa aún (ej. durante el onboarding).
  return true
}

/**
 * Gets the default redirect route for an authenticated user
 * @params {Object} user - User session object
 * @return {String} Route name
 */
const getDefaultRoute = (user) => {
  if (user?.is_root) {
    return 'Billing'
  }

  const firstModule = user?.roles?.[0]?.modules?.[0]
  if (firstModule?.link) {
    return firstModule.link
  }

  return 'Tutorial'
}

/**
 * Validates if the user has access to the requested module
 * @params {Object} store - Authentication store
 * @params {Object} to - Destination route
 * @return {Object|null} Redirect object or null if access is granted
 */
const validateModuleAccess = (store, to) => {
  const user = store.userSession

  // Super usuarios tienen acceso total
  if (user?.is_root || user?.is_super_admin) {
    return null
  }

  // Rutas exceptuadas de validación de módulos
  if (CONFIG.ROUTES_WITHOUT_MODULE_CHECK.includes(to.name)) {
    return null
  }

  const modules = user?.roles?.[0]?.modules

  // Sin módulos asignados, permitir acceso
  if (!modules || modules.length === 0) {
    return null
  }

  // Validar acceso al módulo específico
  if (user?.company_session_id) {
    const hasModuleAccess = modules.some(module => module.link === to.name)

    if (!hasModuleAccess && modules[0]?.link) {
      return { name: modules[0].link }
    }
  }

  return null
}

/**
 * Handles session expiration by logging out and redirecting to login
 * @params {Object} store - Authentication store
 * @params {Object} router - Vue router instance
 * @return {Promise<void>}
 */
const handleSessionExpiration = async (store, router) => {
  notifySession('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')

  try {
    await store.forceLogout()
  } catch (error) {
    console.error('Error durante logout:', error)
  }

  router.push('/login')
}

export default boot(async ({ router, store }) => {
  let pendingSessionExpiration = null

  // API Response Interceptor
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const $store = authentication()
      const status = error.response?.status

      // Validate if the URL is excluded from 401 handling
      const isExcludedUrl = CONFIG.EXCLUDED_URLS.some(url =>
        error.config?.url?.includes(url)
      )

      if (status === 401 && !isExcludedUrl) {
        // Prevent multiple simultaneous logouts using debounce
        if (!pendingSessionExpiration) {
          pendingSessionExpiration = handleSessionExpiration($store, router)

          setTimeout(() => {
            pendingSessionExpiration = null
          }, CONFIG.DEBOUNCE_TIME)
        }

        await pendingSessionExpiration
      } else if (status === 403) {
        notifyError('No tienes permisos para acceder a este recurso')
      } else if (status === 422) {
        notifyValidationErrors(error, 'Error de validación')
      }

      // Centralized error normalization (moved from services.js)
      // This ensures components receive a consistent error format
      const normalizedError = error?.response?.data || error
      return Promise.reject(normalizedError)
    }
  )

  // Guard de navegación
  router.beforeEach(async (to, from, next) => {
    const $store = authentication()

    try {
      const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

      // Inicializar store y validar autenticación
      const storeInitFailed = await $store.initStore()
      const isAuthenticated = !storeInitFailed && hasValidToken($store)

      // Redirigir usuarios autenticados que intentan acceder a login
      if (isAuthenticated && to.name === 'Login') {
        return next({ name: getDefaultRoute($store.userSession) })
      }

      // Validar rutas protegidas
      if (requiresAuth) {
        if (!isAuthenticated) {
          if (storeInitFailed || !hasValidToken($store)) {
            await $store.forceLogout()
          }
          return next('/login')
        }

        const isPremiumMode = process.env.PREMIUM_MODE === 'true' || process.env.PREMIUM_MODE === true

        const user = $store.userSession
        const isSuperUser = user?.is_root
        const excludedPremiumRoutes = [
          'SubscriptionPlan',
          'Login',
          'ChangeCompany',
          'VerifySession',
          'Profile',
          'SubscriptionSuccess',
          'SubscriptionFailure',
          'SubscriptionPending'
        ]

        if (isPremiumMode && !isSuperUser) {
          // Ensure subscription info is loaded
          if (!$store.currentSubscription) {
            await $store.loadSubscriptionInfo()
          }

          const hasPremium = $store.hasPremiumPlan
          const isExcludedRoute = excludedPremiumRoutes.includes(to.name)

          if (!hasPremium) {
            $store.mustSelectPlan = true

            if (!isExcludedRoute) {
              notifyError('Debes tener un plan Pro o Pro Team para usar el sistema')
              return next({ name: 'Profile' })
            }
          } else {
            $store.mustSelectPlan = false
          }
        } else {
          $store.mustSelectPlan = false
        }

        const redirectRoute = validateModuleAccess($store, to)
        if (redirectRoute) {
          return next(redirectRoute)
        }
      }

      next()
    } catch (error) {
      console.error('Error en navegación:', error)
      next('/login')
    }
  })
})
