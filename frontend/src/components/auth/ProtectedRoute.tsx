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
  const { isAuthenticated, isLoading } = useAuthStore()
  
  // Local state to track when we are ready to check auth (after rehydration)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Give the persist middleware time to rehydrate the store (usually < 100ms)
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 200)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Only check authentication after we're ready and not loading
    if (isReady && !isLoading && !isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', pathname)
      router.push(redirectTo)
    }
  }, [isReady, isLoading, isAuthenticated, router, redirectTo, pathname])

  // Show loading spinner while waiting for hydration or auth loading
  if (!isReady || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, show fallback or nothing (redirect will happen)
  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}