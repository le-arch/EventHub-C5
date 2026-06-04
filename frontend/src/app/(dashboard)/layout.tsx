/**
 * Dashboard Layout Component
 * 
 * This layout wraps all authenticated pages (organizer dashboard and admin panel).
 * It provides a responsive layout with:
 * - Desktop: Fixed sidebar navigation
 * - Mobile: Hamburger menu + bottom tab bar
 * - Shared header with user menu
 * 
 * @module DashboardLayout
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Home,
  Calendar,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  CreditCard,
  FileText,
  ChevronDown,
} from 'lucide-react'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// State management
import { useAuthStore } from '@/store/authStore'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { toast } from 'sonner'

// Navigation items for organizer role
const organizerNavItems = [
  { href: '/organizer/events', label: 'Events', icon: Calendar },
  { href: '/organizer/attendees', label: 'Attendees', icon: Users },
  { href: '/organizer/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/organizer/settings', label: 'Settings', icon: Settings },
]

// Navigation items for admin role
const adminNavItems = [
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/transactions', label: 'Transactions', icon: CreditCard },
  { href: '/admin/logs', label: 'Logs', icon: FileText },
]

/**
 * Get user initials for avatar
 */
const getInitials = (name: string): string => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isLoading } = useAuthStore()

  // Determine which nav items to show based on user role
  const isAdmin = user?.role === 'admin'
  const navItems = isAdmin ? adminNavItems : organizerNavItems

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await logout()
      toast.success('🔓 Logged out successfully')
      router.push('/login')
    } catch (error) {
      toast.error('❌ Failed to logout')
    }
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render if no user (will redirect)
  if (!user) return null

  return (
    <ProtectedRoute redirectTo="/login">
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Desktop sidebar */}
        <aside
          className={`
            fixed top-0 left-0 z-50 h-full w-64 bg-white border-r transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          `}
        >
          {/* Logo Section */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link href={isAdmin ? '/admin/users' : '/organizer/events'} className="text-xl font-bold text-primary">
             <Image 
              src="/images/logo.svg" 
              alt="EventHub Icon" 
              width={32} 
              height={32}
              className="w-8 h-8"
            />
            <span className="text-2xl font-bold text-primary hidden sm:inline">
              EventHub
            </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname?.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                    ${isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-white">
                      {getInitials(user?.fullName || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">{user?.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>👤 My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/organizer/settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  ⚙️ Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  🚪 Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:ml-64">
          {/* Mobile Header */}
          <header className="lg:hidden bg-white border-b sticky top-0 z-30">
            <div className="flex items-center justify-between p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Image 
              src="/images/logo.svg" 
              alt="EventHub Icon" 
              width={32} 
              height={32}
              className="w-8 h-8"
            />
            <span className="text-2xl font-bold text-primary hidden sm:inline">
              EventHub
            </span>
              <div className="w-10" /> {/* Spacer for alignment */}
            </div>
          </header>

          {/* Mobile Bottom Tab Bar (for organizer only) */}
          {!isAdmin && (
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 z-40">
              {organizerNavItems.map((item) => {
                const isActive = pathname?.startsWith(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors
                      ${isActive ? 'text-primary' : 'text-gray-500'}
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Page Content with bottom padding for mobile tab bar */}
          <main className={`p-4 md:p-6 ${!isAdmin ? 'pb-20 lg:pb-6' : ''}`}>
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}