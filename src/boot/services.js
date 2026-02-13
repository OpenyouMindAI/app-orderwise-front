import axios from 'axios'

/**
 * Main API instance with optimized base configuration
 * @type {import('axios').AxiosInstance} Main API instance
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL
})

/**
 * Export for backward compatibility
 * @type {import('axios').AxiosInstance} API instance copy
 */
export const axiosCreate = api
