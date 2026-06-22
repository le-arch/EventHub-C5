/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { authService, UserData } from '@/services/auth.service'
import { STORAGE_KEYS } from '@/lib/constant'

// Types
export interface User {
  id: string
  email: string
  phone: string
  fullName: string
  role: 'organizer' | 'admin'
  isEmailVerified: boolean
  createdAt?: string
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
  users: User[] | null           // Added for admin user list
  usersTotal: number              // Added for pagination
  usersLoading: boolean           // Added for loading state
  
  // Actions
  login: (identifier: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  verifyOTP: (email: string, otp: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  clearError: () => void
  
  // Admin User Management Actions
  getUsers: (page?: number, limit?: number, search?: string, status?: string) => Promise<User[]>
  getUserById: (userId: string) => Promise<User | null>
  updateUser: (userId: string, data: Partial<User>) => Promise<User | null>
  verifyUser: (userId: string) => Promise<boolean>
  suspendUser: (userId: string) => Promise<boolean>
  unsuspendUser: (userId: string) => Promise<boolean>
  deleteUser: (userId: string) => Promise<boolean>
  batchVerifyUsers: (userIds: string[]) => Promise<boolean>
  batchSuspendUsers: (userIds: string[]) => Promise<boolean>
}

/**
 * Transform backend UserData to frontend User format
 */
const transformUserData = (data: UserData): User => ({
  id: data.id,
  email: data.email,
  phone: data.phone,
  fullName: data.full_name,
  role: data.role,
  isEmailVerified: data.is_email_verified,
  createdAt: data.created_at,
})

/**
 * Transform frontend User to backend format for updates
 */
const transformUserToBackend = (user: Partial<User>): Record<string, any> => {
  const result: Record<string, any> = {}
  if (user.fullName !== undefined) result.full_name = user.fullName
  if (user.email !== undefined) result.email = user.email
  if (user.phone !== undefined) result.phone = user.phone
  if (user.role !== undefined) result.role = user.role
  if (user.isEmailVerified !== undefined) result.is_email_verified = user.isEmailVerified
  return result
}

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  users: null,
  usersTotal: 0,
  usersLoading: false,
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

      /**
       * Login with email or phone and password
       * Supports both email and phone identifiers
       */
      login: async (identifier: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authService.login(identifier, password)
          const { access_token, refresh_token, user: backendUser } = response
          
          // Transform backend user data to frontend format
          const user = transformUserData(backendUser)
          
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

      /**
       * Register a new user
       */
      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null })
        
        try {
          await authService.register(
            data.fullName,
            data.email,
            data.phone,
            data.password
          )
          set({ isLoading: false })
        } catch (error: any) {
          const message = error.response?.data?.error || 'Registration failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      /**
       * Verify email with OTP code
       */
      verifyOTP: async (email: string, otp: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authService.verifyEmail(email, otp)
          const { access_token, refresh_token, user: backendUser } = response
          
          // Transform backend user data to frontend format
          const user = transformUserData(backendUser)
          
          // Store tokens and user
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token)
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token)
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          const message = error.response?.data?.error || 'Verification failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      /**
       * Logout user
       */
      logout: async () => {
        set({ isLoading: true })
        
        try {
          await authService.logout()
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

      /**
       * Refresh access token
       */
      refreshToken: async () => {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
        
        if (!refreshToken) {
          return false
        }
        
        try {
          const response = await authService.refreshToken(refreshToken)
          const { access_token, refresh_token: newRefreshToken, user: backendUser } = response
          
          // Update user data
          const user = transformUserData(backendUser)
          
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token)
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken)
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
          
          set({ user, isAuthenticated: true })
          
          return true
        } catch (error) {
          return false
        }
      },

      // Admin User Management 

      /**
       * Get all users (admin only)
       */
      getUsers: async (page = 1, limit = 10, search?: string, status?: string) => {
        set({ usersLoading: true })
        
        try {
          const response = await authService.getUsers(page, limit, search, status)
          const users = response.users.map(transformUserData)
          
          set({
            users,
            usersTotal: response.total,
            usersLoading: false,
          })
          
          return users
        } catch (error: any) {
          set({ usersLoading: false })
          throw error
        }
      },

      /**
       * Get a single user by ID
       */
      getUserById: async (userId: string) => {
        try {
          const userData = await authService.getUserById(userId)
          return transformUserData(userData)
        } catch (error) {
          return null
        }
      },

      /**
       * Update a user
       */
      updateUser: async (userId: string, data: Partial<User>) => {
        try {
          const backendData = transformUserToBackend(data)
          const updatedUser = await authService.updateUser(userId, backendData)
          const transformedUser = transformUserData(updatedUser)
          
          // Update users list if it exists
          const { users } = get()
          if (users) {
            const updatedUsers = users.map(u => u.id === userId ? transformedUser : u)
            set({ users: updatedUsers })
          }
          
          // Update current user if it's the same
          const { user } = get()
          if (user && user.id === userId) {
            set({ user: transformedUser })
          }
          
          return transformedUser
        } catch (error) {
          return null
        }
      },

      /**
       * Verify a user (admin only)
       */
      verifyUser: async (userId: string) => {
        try {
          await authService.verifyUser(userId)
          
          // Update users list
          const { users } = get()
          if (users) {
            const updatedUsers = users.map(u => 
              u.id === userId ? { ...u, isEmailVerified: true } : u
            )
            set({ users: updatedUsers })
          }
          
          return true
        } catch (error) {
          return false
        }
      },

      /**
       * Suspend a user (admin only)
       */
      suspendUser: async (userId: string) => {
        try {
          await authService.suspendUser(userId)
          return true
        } catch (error) {
          return false
        }
      },

      /**
       * Unsuspend a user (admin only)
       */
      unsuspendUser: async (userId: string) => {
        try {
          await authService.unsuspendUser(userId)
          return true
        } catch (error) {
          return false
        }
      },

      /**
       * Delete a user (admin only)
       */
      deleteUser: async (userId: string) => {
        try {
          await authService.deleteUser(userId)
          
          // Remove from users list
          const { users } = get()
          if (users) {
            const updatedUsers = users.filter(u => u.id !== userId)
            set({ users: updatedUsers })
          }
          
          return true
        } catch (error) {
          return false
        }
      },

      /**
       * Batch verify users (admin only)
       */
      batchVerifyUsers: async (userIds: string[]) => {
        try {
          await authService.batchVerifyUsers(userIds)
          
          // Update users list
          const { users } = get()
          if (users) {
            const updatedUsers = users.map(u => 
              userIds.includes(u.id) ? { ...u, isEmailVerified: true } : u
            )
            set({ users: updatedUsers })
          }
          
          return true
        } catch (error) {
          return false
        }
      },

      /**
       * Batch suspend users (admin only)
       */
      batchSuspendUsers: async (userIds: string[]) => {
        try {
          await authService.batchSuspendUsers(userIds)
          return true
        } catch (error) {
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)