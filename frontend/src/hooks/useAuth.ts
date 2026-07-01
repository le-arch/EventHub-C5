/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * useAuth Hook
 * 
 * Provides authentication state and actions throughout the application.
 * Wraps the Zustand auth store for easier consumption.
 * 
 * @module useAuth
 */

'use client'

import { useAuthStore } from '@/store/authStore'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import api from '@/lib/api';

interface LoginCredentials {
  identifier: string
  password: string
}

interface RegisterData {
  fullName: string
  email: string
  phone: string
  password: string
}

export function useAuth() {
  const router = useRouter()
  const {
    user,
    isAuthenticated,
    isLoading,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    verifyOTP: storeVerifyOTP,
  } = useAuthStore()

  // Login with email/phone and password
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        await storeLogin(credentials.identifier, credentials.password)
        toast.success('Welcome back!')
        router.push('/organizer/events')
        return { success: true }
      } catch (error: any) {
        const message = error.response?.data?.error || 'Login failed. Please try again.'
        toast.error(message)
        return { success: false, error: message }
      }
    },
    [storeLogin, router]
  )

  // Register a new organizer account
  const register = useCallback(
    async (data: RegisterData) => {
      try {
        await storeRegister(data)
        toast.success('Account created! Please verify your email.')
        router.push('/verify-otp')
        return { success: true }
      } catch (error: any) {
        const message = error.response?.data?.error || 'Registration failed. Please try again.'
        toast.error(message)
        return { success: false, error: message }
      }
    },
    [storeRegister, router]
  )

  // Verify email with OTP
  const verifyOTP = useCallback(
    async (email: string, otp: string) => {
      try {
        await storeVerifyOTP(email, otp)
        toast.success('Email verified successfully! You can now log in.')
        router.push('/login')
        return { success: true }
      } catch (error: any) {
        const message = error.response?.data?.error || 'Invalid verification code.'
        toast.error(message)
        return { success: false, error: message }
      }
    },
    [storeVerifyOTP, router]
  )

  // Logout user
  const logout = useCallback(async () => {
    await storeLogout()
    toast.success('Logged out successfully')
    router.push('/login')
  }, [storeLogout, router])

  // Request password reset
  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      toast.success('Password reset link sent to your email')
      return { success: true }
    } catch (error: any) {
      // Don't reveal if email exists for security
      toast.success('If an account exists, you will receive a reset link')
      return { success: true }
    }
  }, [])

  // Reset password with email, OTP, and new password
  const resetPassword = useCallback(async (email: string, otp: string, newPassword: string) => {
    try {
      await api.post('/auth/reset-password', { email, otp, password_hash: newPassword })
      toast.success('Password reset successfully! Please log in.')
      router.push('/login')
      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to reset password.'
      toast.error(message)
      return { success: false, error: message }
    }
  }, [router])

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    verifyOTP,
    requestPasswordReset,
    resetPassword,
  }
}