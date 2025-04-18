import { boot } from 'quasar/wrappers'
import { authentication } from 'src/stores/module-authentication'
import { api, apiArca, apiQPay } from './axios'
import { notify } from 'src/const/mixins'

const validModule = ($store, to, next) => {
  const user = $store.userSession
  const modules = user?.roles[0]?.modules
  if (user.is_root) return next()

  if (user?.company_session_id) {
    const moduleFind = modules?.find((module) => module.link === to.name)
    if (!moduleFind) return next({ name: modules[0].link })
  }
}

const modeleExcept = ['Profile', 'ChangeCompany']

export default boot(({ router, store }) => {
  router.beforeEach(async (to, from, next) => {
    const $store = authentication()
    try {
      const requiresAuth = to.matched.some(
        (record) => record.meta.requiresAuth
      )
      const validation = await $store.initStore()
      api.defaults.headers.common.authorization = `${$store?.token_type} ${$store?.access_token}`
      apiQPay.defaults.headers.common['X-Company-Token'] = 'c5c4bb6f-e7cc-4287-99d4-0a82ddec4da7'
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
    api.interceptors.response.use(null, async (error) => {
      if (error.response.status === 401) {
        // await $store.logout()
        // router.push('/login')
        notify(error?.response?.data?.message || error.message, 'negative', 'warning')
      } else if (error.response.status === 403) {
        console.error('Acceso denegado: ', error.response)
      }
      return Promise.reject(error)
    })
  })
})
