/**
 * Auth Store
 * 
 * Zustand store for managing authentication state.
 * Handles login, registration, logout, token management, and user data.
 * 
 * @module AuthStore
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/src/lib/api'
import { STORAGE_KEYS } from '@/src/lib/constant'

// Types
interface User {
  id: string
  email: string
  phone: string
  fullName: string
  role: 'organizer' | 'admin'
  isEmailVerified: boolean
  createdAt: string
}

interface RegisterData {
  fullName: string
  email: string
  phone: string
  password: string
}

interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (identifier: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  verifyOTP: (email: string, otp: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  clearError: () => void
}

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user })
        if (user) {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
        } else {
          localStorage.removeItem(STORAGE_KEYS.USER)
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      clearError: () => {
        set({ error: null })
      },

      login: async (identifier: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await api.post('/auth/login', { identifier, password })
          const { access_token, refresh_token, user } = response.data
          
          // Store tokens
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token)
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token)
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          const message = error.response?.data?.error || 'Login failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null })
        
        try {
          await api.post('/auth/register', data)
          set({ isLoading: false })
        } catch (error: any) {
          const message = error.response?.data?.error || 'Registration failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      verifyOTP: async (email: string, otp: string) => {
        set({ isLoading: true, error: null })
        
        try {
          await api.post('/auth/verify-otp', { email, otp })
          set({ isLoading: false })
        } catch (error: any) {
          const message = error.response?.data?.error || 'Verification failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        
        try {
          // Call logout endpoint (optional)
          await api.post('/auth/logout')
        } catch (error) {
          // Ignore errors on logout
        } finally {
          // Clear storage
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
          localStorage.removeItem(STORAGE_KEYS.USER)
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      refreshToken: async () => {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
        
        if (!refreshToken) {
          return false
        }
        
        try {
          const response = await api.post('/auth/refresh', { refresh_token: refreshToken })
          const { access_token, refresh_token } = response.data
          
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token)
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token)
          
          return true
        } catch (error) {
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)