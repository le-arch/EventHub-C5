/**
 * API Client
 * 
 * Configured Axios instance for making HTTP requests to the backend.
 * Includes request/response interceptors for authentication,
 * token refresh, and error handling.
 * 
 * @module API
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'

// Types
interface RefreshTokenResponse {
  access_token: string
  refresh_token: string
}

// Custom request config with retry flag
interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// Helpers: convert object keys between camelCase and snake_case
const isPlainObject = (val: any) => val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof FormData)

const toSnake = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(toSnake)
  if (!isPlainObject(obj)) return obj
  const out: Record<string, any> = {}
  for (const key of Object.keys(obj)) {
    const val = obj[key]
    const newKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
    out[newKey] = isPlainObject(val) || Array.isArray(val) ? toSnake(val) : val
  }
  return out
}

const toCamel = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(toCamel)
  if (!isPlainObject(obj)) return obj
  const out: Record<string, any> = {}
  for (const key of Object.keys(obj)) {
    const val = obj[key]
    const newKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    out[newKey] = isPlainObject(val) || Array.isArray(val) ? toCamel(val) : val
  }
  return out
}

// Base URL for backend API
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085/api/v1'

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds
})

/**
 * Request Interceptor
 * Adds authentication token to headers if available
 */
api.interceptors.request.use(
  (config: CustomRequestConfig) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Convert params and JSON body to snake_case before sending
    try {
      const contentType = config.headers?.['Content-Type'] || config.headers?.['content-type']
      if (config.params) {
        config.params = toSnake(config.params)
      }
      if (config.data && contentType && contentType.includes('application/json')) {
        // Leave FormData alone
        if (!(config.data instanceof FormData)) {
          config.data = toSnake(config.data)
        }
      }
    } catch (e) {
      // ignore conversion errors
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * Response Interceptor
 * Handles token refresh on 401 errors
 */
api.interceptors.response.use(
  (response) => {
    // Convert response data keys to camelCase for frontend convenience
    try {
      if (response && response.data) {
        response.data = toCamel(response.data)
      }
    } catch (e) {}
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomRequestConfig
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = typeof window !== 'undefined' 
          ? localStorage.getItem('refresh_token') 
          : null
        
        if (!refreshToken) {
          throw new Error('No refresh token')
        }
        
        const response = await axios.post<RefreshTokenResponse>(
          `${BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        )
        
        const { access_token, refresh_token } = response.data
        
        // Store new tokens
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`
        }
        
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        
        return Promise.reject(refreshError)
      }
    }
    
    // Handle other errors with user-friendly messages
    if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action')
    } else if (error.response?.status === 404) {
      toast.error('Resource not found')
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.')
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.')
    }
    
    return Promise.reject(error)
  }
)

// Helper methods for common HTTP operations
export const apiClient = {
  get: <T>(url: string, params?: object) => 
    api.get<T>(url, { params }),
  
  post: <T>(url: string, data?: object) => 
    api.post<T>(url, data),
  
  put: <T>(url: string, data?: object) => 
    api.put<T>(url, data),
  
  patch: <T>(url: string, data?: object) => 
    api.patch<T>(url, data),
  
  delete: <T>(url: string) => 
    api.delete<T>(url),
  
  upload: <T>(url: string, file: File, fieldName: string = 'image') => {
    const formData = new FormData()
    formData.append(fieldName, file)
    return api.post<T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export default api









