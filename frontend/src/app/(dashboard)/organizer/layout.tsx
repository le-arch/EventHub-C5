/**
 * Organizer Layout Component
 * 
 * Sub-layout for organizer pages that adds organizer-specific elements
 * and ensures only organizer users can access these routes.
 * 
 * @module OrganizerLayout
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/src/store/authStore'
import { toast } from 'sonner'

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isLoading } = useAuthStore()

  // Redirect non-organizer users (admins go to admin panel)
  useEffect(() => {
    if (!isLoading && user && user.role === 'admin') {
      router.push('/admin/users')
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

  return <>{children}</>
}