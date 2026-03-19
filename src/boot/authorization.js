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
  PREMIUM_MODULES: [
    'SalesInventoryReport',
    'ProductKardex',
    'TransferProduct',
    'Promotions',
    'BranchOffice',
    'Integrations',
    'Company',
    'Cashbox',
    'Seller',
    'Client',
    'DeliveryPerson'
  ],
  ROOT_ONLY_ROUTES: ['AdminDashboard', 'DashboardManager'],
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

  // Validación proactiva del tiempo de expiración
  if (store.setTimeOut && store.setTimeOut > 0) {
    const now = Date.now()
    if (now >= store.setTimeOut) {
      return false
    }
  }

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

  // Solo el Root tiene acceso total absoluto para evitar bloqueos del sistema
  if (user?.is_root) {
    return null
  }

  // Rutas exceptuadas de validación de módulos
  if (CONFIG.ROUTES_WITHOUT_MODULE_CHECK.includes(to.name)) {
    return null
  }

  // Obtener todos los módulos de todos los roles del usuario
  const modules = user?.roles?.reduce((acc, role) => {
    return acc.concat(role.modules || [])
  }, []) || []

  // 1. Validar rutas exclusivas de Root
  if (CONFIG.ROOT_ONLY_ROUTES.includes(to.name) && !user?.is_root) {
    return '/'
  }

  // 2. Validar restricciones de Plan (Módulos Premium) - Bloqueo absoluto por plan
  const isDemo = store.isDemo || store.isClientDemo
  const isFree = store.currentPlan?.slug === 'free' || store.subscriptionPlan === 'Free'

  if ((isDemo || isFree) && CONFIG.PREMIUM_MODULES.includes(to.name)) {
    return '/'
  }

  // 3. Validar acceso por Módulos (RBAC)
  if (user?.company_session_id) {
    const userModules = modules.map(m => m.link)
    const hasModuleAccess = userModules.includes(to.name)

    // Si la ruta es un módulo premium o una de las rutas conocidas como "Módulos Principales",
    // entonces validamos estrictamente que la tenga.
    const isMainModule = CONFIG.PREMIUM_MODULES.includes(to.name) ||
                        ['Product', 'Category', 'User', 'Role', 'Invoice', 'Cashbox', 'BranchOffice'].includes(to.name)

    if (isMainModule && !hasModuleAccess) {
      return '/'
    }
  }

  return null
}

// La lógica de redirección ahora se maneja directamente en el interceptor de la API
// para garantizar que cualquier error 401 dispare el cierre de sesión inmediato.

export default boot(async ({ router, store }) => {
  let pendingSessionExpiration = null

  // Interceptor de respuestas API
  /**
   * Handles API response errors globally, including session expiration (401),
   * permission issues (403), and validation errors (422).
   * @params {Error} error The interceptor error object
   * @return {Promise} Rejected promise with normalized error data
   */
  api.interceptors.response.use(null, async (error) => {
    const $store = authentication()
    const status = error.response?.status || error.status

    // Validar si la URL está excluida del manejo de 401
    const isExcludedUrl = CONFIG.EXCLUDED_URLS.some(url =>
      error.config?.url?.includes?.(url) || (typeof error.url === 'string' && error.url.includes(url))
    )

    if (status === 401 && !isExcludedUrl) {
      if (!pendingSessionExpiration) {
        pendingSessionExpiration = (async () => {
          notifySession('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
          await $store.forceLogout()

          // Intentar navegación suave, si falla, forzar recarga al login
          try {
            await router.push('/login')
          } catch (e) {
            window.location.href = '#/login'
          }
        })()

        await pendingSessionExpiration
      }
    } else if (status === 403) {
      notifyError('No tienes permisos para acceder a este recurso')
    } else if (status === 422) {
      notifyValidationErrors(error, 'Error de validación')
    }

    // Centralized error normalization (moved from services.js)
    // This ensures components receive a consistent error format
    const normalizedError = error?.response?.data || error
    return Promise.reject(normalizedError)
  })

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
