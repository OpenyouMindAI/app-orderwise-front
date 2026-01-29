import axios from 'axios'

export const axiosCreate = axios.create({ baseURL: import.meta.env.VITE_APP_API_URL })

export const api = {
  ...axiosCreate,

  get: async (url, params) => {
    try {
      return await axiosCreate.get(url, params)
    } catch (error) {
      throw error?.response?.data || error
    }
  },
  post: async (url, data, config = {}) => {
    try {
      return await axiosCreate.post(url, data, config)
    } catch (error) {
      throw error?.response?.data || error
    }
  },
  put: async (url, data) => {
    try {
      return await axiosCreate.put(url, data)
    } catch (error) {
      throw error?.response?.data || error
    }
  },
  delete: async (url) => {
    try {
      return await axiosCreate.delete(url)
    } catch (error) {
      throw error?.response?.data || error
    }
  }
}
