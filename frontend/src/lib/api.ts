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

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085/api/v1',
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
        
        const response = await axios.post<RefreshTokenResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
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
  
  upload: <T>(url: string, file: File, fieldName: string = 'file') => {
    const formData = new FormData()
    formData.append(fieldName, file)
    return api.post<T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export default api















// Checklist layout matching what our Go backend validator expects
export interface CreateEventPayload {
  title: string;
  description: string;
  venue: string;
  city: string;
  ticket_price: number;
}

// This function takes the form data and sends it to our Go server link
export async function createEventApi(payload: CreateEventPayload) {
  // Step A: Point to our backend URL path
  const url = "http://localhost:8085/events";

  // Step B: Shoot the request out into the network
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload), // Converts our JavaScript data into a JSON text string
  });

  // Step C: If the backend returns a 400 Bad Request error, read the error text
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create event");
  }

  // Step D: Return the success message from our backend handler
  return await response.json();
}