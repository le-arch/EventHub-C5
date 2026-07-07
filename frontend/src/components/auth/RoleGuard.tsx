/**
 * RoleGuard Component
 * 
 * Wrapper component that protects routes based on user role.
 * Redirects or shows fallback for unauthorized users.
 * 
 * @module RoleGuard
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type UserRole = 'organizer' | 'admin'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole | UserRole[]
  redirectTo?: string
  fallback?: React.ReactNode
  showAccessDenied?: boolean
}

export function RoleGuard({
  children,
  allowedRoles,
  redirectTo = '/',
  fallback,
  showAccessDenied = true,
}: RoleGuardProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  const hasRequiredRole = user && roles.includes(user.role as UserRole)

  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasRequiredRole && !fallback) {
      router.push(redirectTo)
    }
  }, [isLoading, isAuthenticated, hasRequiredRole, router, redirectTo, fallback])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  // User not authenticated - will be handled by ProtectedRoute
  if (!isAuthenticated) {
    return null
  }

  // User has required role - render children
  if (hasRequiredRole) {
    return <>{children}</>
  }

  // User doesn't have required role - show access denied or fallback
  if (fallback) {
    return <>{fallback}</>
  }

  if (showAccessDenied) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
        <Card className="glass max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This area requires {roles.length === 1 
                ? `${roles[0]} privileges` 
                : `one of these roles: ${roles.join(', ')}`}
            </p>
            <Button onClick={() => router.push('/')}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}