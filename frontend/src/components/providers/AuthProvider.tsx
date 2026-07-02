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
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

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

  return <>{children}</>
}