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
  token: string
}

// Custom request config with retry flag
interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085/api/v1',
  headers: {
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
  (response) => response,
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
        
        const response = await axios.post<{ token: string }>(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        )
        
        const { token } = response.data
        
        // Store new tokens
        localStorage.setItem('access_token', token)
        
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`
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
  
  upload: <T>(url: string, file: File, fieldName: string = 'file') => {
    const formData = new FormData()
    formData.append(fieldName, file)
    return api.post<T>(url, formData)
  },
}

export default api