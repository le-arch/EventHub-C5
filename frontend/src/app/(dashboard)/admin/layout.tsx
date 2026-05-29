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
import { useAuthStore } from '@/src/store/authStore'
import { Shield, AlertTriangle } from 'lucide-react'
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
      toast.error('Access denied. Admin privileges required.')
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

  // Don't render if not admin
  if (!user || user.role !== 'admin') return null

  return (
    <div>
      {/* Admin Banner */}
      <div className="bg-amber-50 border-b border-amber-200 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 text-sm text-amber-800">
          <Shield className="h-4 w-4" />
          <span>Admin Mode - You have full access to all platform data</span>
        </div>
      </div>

      {children}
    </div>
  )
}