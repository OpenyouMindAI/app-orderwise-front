import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const baseApi = axios.create({ baseURL: import.meta.env.VITE_APP_API_URL })

const apiQPay = axios.create({ baseURL: import.meta.env.VITE_APP_API_QPAY_URL })

const api = {
  get: async (url, params) => {
    try {
      const { data } = await baseApi.get(url, params)
      return { data: data.response, subscription: data.subscription }
    } catch (error) {
      throw error?.response?.data || error.message
    }
  },
  post: async (url, params) => {
    try {
      const { data } = await baseApi.post(url, params)
      return { data: data.response, subscription: data.subscription }
    } catch (error) {
      throw error?.response?.data || error.message
    }
  },
  put: async (url, params) => {
    try {
      const { data } = await baseApi.put(url, params)
      return { data: data.response, subscription: data.subscription }
    } catch (error) {
      throw error?.response?.data || error.message
    }
  },
  delete: async (url, params) => {
    try {
      const { data } = await baseApi.delete(url, params)
      return { data: data.response, subscription: data.subscription }
    } catch (error) {
      throw error?.response?.data || error.message
    }
  }
}

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api

  app.config.globalProperties.$apiQPay = apiQPay
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { api, apiQPay, baseApi }
