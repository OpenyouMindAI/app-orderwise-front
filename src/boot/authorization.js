import { boot } from 'quasar/wrappers'
import { authentication } from 'src/stores/module-authentication'
import { api } from './axios'
import { notifySession, notifyError, notifyValidationErrors } from 'src/const/mixins'

// Configuración centralizada
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
 * Valida si el token de sesión es válido
 * @param {Object} store - Store de autenticación
 * @returns {Boolean} true si el token es válido
 */
const hasValidToken = (store) => {
  if (!store.access_token || store.access_token === 'null') {
    return false
  }

  if (!store.userSession) {
    return false
  }

  const user = store.userSession
  const needsCompanySession = !user.is_root && !user.is_super_admin

  return !needsCompanySession || Boolean(user.company_session_id)
}

/**
 * Obtiene la ruta de redirección por defecto para un usuario autenticado
 * @param {Object} user - Usuario de la sesión
 * @returns {String} Nombre de la ruta
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
 * Valida si el usuario tiene acceso al módulo solicitado
 * @param {Object} store - Store de autenticación
 * @param {Object} to - Ruta destino
 * @returns {Object|null} Objeto de redirección o null si tiene acceso
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
 * Maneja el cierre de sesión por expiración
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

  // Interceptor de respuestas API
  api.interceptors.response.use(null, async (error) => {
    const $store = authentication()
    const status = error.response?.status

    // Validar si la URL está excluida del manejo de 401
    const isExcludedUrl = CONFIG.EXCLUDED_URLS.some(url =>
      error.config?.url?.includes(url)
    )

    if (status === 401 && !isExcludedUrl) {
      // Prevenir múltiples logouts simultáneos usando debounce
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

    return Promise.reject(error?.response)
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
            notifySession('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
            await $store.forceLogout()
          }
          return next('/login')
        }

        // Validar acceso a módulos
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
