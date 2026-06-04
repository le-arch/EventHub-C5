/**
 * Admin Layout Component
 * 
 * Sub-layout for admin pages that adds an admin-specific header
 * and ensures only admin users can access these routes.
 * 
 * @module AdminLayout
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, AlertTriangle, Lock } from 'lucide-react'

// shadcn/ui components
import { Button } from '@/components/ui/button'

// State management and guards
import { useAuthStore } from '@/store/authStore'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { toast } from 'sonner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isLoading } = useAuthStore()

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && user && user.role !== 'admin') {
      toast.error('🔒 Access denied. Admin privileges required.')
      router.push('/organizer/events')
    }
  }, [user, isLoading, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render if not admin (will redirect via useEffect)
  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <RoleGuard allowedRoles="admin" redirectTo="/organizer/events">
      <div>
        {/* Admin Banner */}
        <div className="bg-amber-50 border-b border-amber-200 mb-6">
          <div className="flex items-center justify-between gap-2 px-4 py-2 text-sm text-amber-800 flex-wrap">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>🛡️ Admin Mode - You have full access to all platform data</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-3 w-3 text-amber-600" />
              <span className="text-xs text-amber-600">Restricted Access</span>
            </div>
          </div>
        </div>

        {/* Admin Content */}
        {children}
      </div>
    </RoleGuard>
  )
}