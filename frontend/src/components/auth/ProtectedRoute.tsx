/**
 * ProtectedRoute Component
 * 
 * Wrapper component that protects routes requiring authentication.
 * Redirects unauthenticated users to login page.
 * Shows loading state while checking auth status.
 * 
 * @module ProtectedRoute
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  redirectTo = '/login',
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Small delay to ensure auth state is hydrated
    const timer = setTimeout(() => {
      setIsChecking(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isChecking && !isLoading && !isAuthenticated) {
      // Store the attempted URL for redirect after login
      sessionStorage.setItem('redirectAfterLogin', pathname)
      router.push(redirectTo)
    }
  }, [isChecking, isLoading, isAuthenticated, router, redirectTo, pathname])

  // Show loading state while checking authentication
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-500">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show fallback or nothing while redirecting
  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}