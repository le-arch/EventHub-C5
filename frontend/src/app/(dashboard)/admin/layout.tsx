'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'

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

  useEffect(() => {
    if (!isLoading && user && user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.')
      router.push('/organizer/events')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <RoleGuard allowedRoles="admin" redirectTo="/organizer/events">
      <div>
        {/* Glass gradient admin banner */}
        <div className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600/90 via-indigo-600/90 to-blue-600/90 dark:from-purple-800/80 dark:via-indigo-800/80 dark:to-blue-800/80 border border-purple-500/20 shadow-lg">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          <div className="flex items-center justify-between gap-2 px-5 py-3 text-sm text-white flex-wrap relative z-10">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Admin Mode - You have full access to all platform data</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-3 w-3 text-white/70" />
              <span className="text-xs text-white/70">Restricted Access</span>
            </div>
          </div>
        </div>

        {children}
      </div>
    </RoleGuard>
  )
}
