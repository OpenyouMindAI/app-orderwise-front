import axios from 'axios'

/**
 * Main API instance with optimized base configuration
 * @type {import('axios').AxiosInstance}
 */
export const api = axios.create({ 
  baseURL: import.meta.env.VITE_APP_API_URL 
})

/**
 * Global Response Interceptor
 * 
 * Optimized centralizar error handling:
 * 1. Reduces JS execution overhead by removing manual async/await wrappers
 * 2. Provides consistent error data format (error?.response?.data || error)
 * 3. Keeps native Axios functionality (interceptors, cancellations, etc.)
 */
api.interceptors.response.use(
  (response) => {
    // Return successful response as is
    return response
  },
  (error) => {
    // Centralized error normalization
    // This replaces manual try/catch in every single call
    const normalizedError = error?.response?.data || error
    return Promise.reject(normalizedError)
  }
)

// Export for backward compatibility if needed in old parts of the system
export const axiosCreate = api
