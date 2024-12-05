import { boot } from 'quasar/wrappers'
import { authentication } from 'src/stores/module-authentication'
import { api } from './axios'

const validModule = ($store, to, next) => {
  const user = $store.userSession
  console.log(user)
  const modules = user?.roles[0]?.modules
  console.log(user)
  if (user.is_root) return next()

  if (user?.organization_session_id) {
    const moduleFind = modules?.find((module) => module.route === to.name)
    if (!moduleFind) return next(`/${modules[0].name}`)
  }
}

const modeleExcept = ['Profile', 'ChangeOrganization']

export default boot(({ router, store }) => {
  router.beforeEach(async (to, from, next) => {
    const $store = authentication()
    try {
      const requiresAuth = to.matched.some(
        (record) => record.meta.requiresAuth
      )
      const validation = await $store.initStore()
      if (requiresAuth) {
        if (validation) return next('/login')
        api.defaults.headers.common.authorization = `${$store.token_type} ${$store.access_token}`
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
    api.interceptors.response.use(null, async (error) => {
      if (error.response.status === 401) {
        await $store.logout()
        router.push('/login')
      } else if (error.response.status === 403) {
        console.error('Acceso denegado: ', error.response)
      }
      return Promise.reject(error)
    })
  })
})
