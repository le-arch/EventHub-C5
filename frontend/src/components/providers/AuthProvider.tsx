/**
 * AuthProvider Component
 * 
 * Provides authentication state to the entire application.
 * Handles token refresh on page load and sets up axios interceptors.
 * 
 * @module AuthProvider
 */

'use client'

import { useEffect, ReactNode } from 'react'
import { useAuthStore } from '@/src/store/authStore'
import api from '@/src/lib/api'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore()

  /**
   * Initialize auth state from localStorage and set up token refresh
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token')
      const storedUser = localStorage.getItem('user')
      
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser))
          // Set up axios default header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        } catch (error) {
          console.error('Failed to parse stored user:', error)
          logout()
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [setUser, setLoading, logout])

  /**
   * Set up axios interceptor for token refresh
   */
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        
        // If unauthorized and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          
          try {
            const refreshToken = localStorage.getItem('refresh_token')
            if (!refreshToken) {
              throw new Error('No refresh token')
            }
            
            const response = await api.post('/auth/refresh', {
              refresh_token: refreshToken,
            })
            
            const { access_token, refresh_token } = response.data
            localStorage.setItem('access_token', access_token)
            localStorage.setItem('refresh_token', refresh_token)
            
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
            originalRequest.headers['Authorization'] = `Bearer ${access_token}`
            
            return api(originalRequest)
          } catch (refreshError) {
            // Refresh failed - clear auth state and redirect to login
            logout()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }
        
        return Promise.reject(error)
      }
    )

    return () => {
      api.interceptors.response.eject(interceptor)
    }
  }, [logout])

  return <>{children}</>
}