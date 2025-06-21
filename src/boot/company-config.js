import { boot } from 'quasar/wrappers'
import { api } from 'src/boot/axios'
import { authentication } from 'src/stores/module-authentication'

let companyConfig = null

export default boot(async ({ app }) => {
  try {
    const $store = authentication()
    api.defaults.headers.common.authorization = `${$store?.token_type} ${$store?.access_token}`
    const { data } = await api.get('company-configs')
    app.config.globalProperties.$companyConfig = data.data
    companyConfig = data.data
  } catch (error) {
    console.log(error)
  }
})

export { companyConfig }
