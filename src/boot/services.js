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
api.interceptors.response.use(
  (response) => {
    // Return successful response as is
    return response
  },
  (error) => {
    // Centralized error normalization
    const normalizedError = error?.response?.data || error

    // Preservar el status para que el interceptor de seguridad pueda actuar
    if (error.response?.status && typeof normalizedError === 'object' && normalizedError !== null) {
      normalizedError.status = error.response.status
    }

    return Promise.reject(normalizedError)
  }
)

// Export for backward compatibility if needed in old parts of the system
export const axiosCreate = api
