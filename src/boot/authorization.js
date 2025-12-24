import { boot } from 'quasar/wrappers'
import { authentication } from 'src/stores/module-authentication'
import { api, apiArca, apiQPay } from './axios'
import { notify } from 'src/const/mixins'

/**
 * Validate if session token is expired or inactive
 * @param {Object} $store - Authentication store
 * @returns {Boolean} true if token is invalid/expired, false if valid
 */
const isTokenExpired = ($store) => {
  // Check if token exists
  if (!$store.access_token || $store.access_token === 'null') {
    return true
  }

  // Check if user session exists and is active
  if (!$store.userSession) {
    return true
  }

  // Check if user session has company_session (excepto para super admin recién registrado)
  if (!$store.userSession.company_session_id && !$store.userSession.is_root && !$store.userSession.is_super_admin) {
    return true
  }

  // Check if expires_In is set and token is expired
  if ($store.expires_In) {
    const tokenExpirationTime = $store.setTimeOut || 0
    const currentTime = Date.now()
    if (tokenExpirationTime > 0 && currentTime > tokenExpirationTime) {
      return true
    }
  }

  return false
}

const validModule = ($store, to, next) => {
  const user = $store.userSession

  // Si es root, permitir acceso
  if (user?.is_root || user?.is_super_admin) return next()

  // Si no tiene roles o módulos, permitir acceso (usuario recién registrado)
  if (!user?.roles || user.roles.length === 0) return next()

  const modules = user.roles[0]?.modules

  // Si no tiene módulos definidos, permitir acceso
  if (!modules || modules.length === 0) return next()

  if (user?.company_session_id) {
    const moduleFind = modules.find((module) => module.link === to.name)
    if (!moduleFind && modules[0]?.link) {
      return next({ name: modules[0].link })
    }
  }

  return next()
}

const modeleExcept = ['Profile', 'ChangeCompany', 'VerifySession']

// Flag to prevent multiple 401 handling
let isHandling401 = false

export default boot(async ({ router, store }) => {
  // Register interceptor ONCE, outside of beforeEach
  api.interceptors.response.use(null, async (error) => {
    const $store = authentication()

    // Prevent multiple 401 handling
    if (error.response?.status === 401 && !isHandling401) {
      isHandling401 = true
      console.warn('⚠️ Error 401: No autorizado - Token inválido o expirado')
      notify('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'warning', 'warning')

      // Use forceLogout to avoid backend call (token already invalid)
      await $store.forceLogout()
      router.push('/login')

      // Reset flag after delay
      setTimeout(() => {
        isHandling401 = false
      }, 2000)
    } else if (error.response?.status === 403) {
      console.error('Acceso denegado: ', error.response)
      notify('No tienes permisos para acceder a este recurso', 'negative', 'warning')
    }
    return Promise.reject(error)
  })

  router.beforeEach(async (to, from, next) => {
    const $store = authentication()
    try {
      const requiresAuth = to.matched.some(
        (record) => record.meta.requiresAuth
      )
      const validation = await $store.initStore()

      // Validate token expiration and session status
      if (requiresAuth && !validation) {
        const tokenExpired = isTokenExpired($store)
        if (tokenExpired) {
          console.warn('⚠️ Token de sesión vencido o inactivo')
          notify('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'warning', 'warning')
          await $store.forceLogout()
          return next('/login')
        }
      }

      api.defaults.headers.common.authorization = `${$store?.token_type} ${$store?.access_token}`
      apiQPay.defaults.headers.common['X-Company-Token'] = $store?.userSession?.company_session?.company_config?.other?.qpay_id
      apiArca.defaults.headers.common['X-Company-External-Id'] = $store?.userSession?.company_session?.document_number
      if (requiresAuth) {
        if (validation) return next('/login')
        if ($store?.userSession?.is_root) return next()
        if (modeleExcept.includes(to.name)) return next()
        validModule($store, to, next)
      }
      if (!validation && to.name === 'Login') validModule($store, to, next)
      next()
    } catch (error) {
      console.error(error)
      next('/login')
    }
  })
})
