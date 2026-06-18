/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Dashboard Layout Component
 * * This layout wraps all authenticated pages (organizer dashboard and admin panel).
 * It provides a responsive layout with:
 * - Desktop: Fixed glassmorphism sidebar navigation
 * - Mobile: Frosted header + role-aware bottom tab bar
 * - Shared header with user menu
 * * @module DashboardLayout
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Calendar,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  FileText,
  ChevronDown,
} from 'lucide-react'
import Image from 'next/image'

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
  // { href: '/organizer/settings', label: 'Settings', icon: Settings },
]

// Navigation items for admin role
const adminNavItems = [
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/transactions', label: 'Transactions', icon: CreditCard },
  { href: '/admin/logs', label: 'Logs', icon: FileText },
  // { href: '/admin/settings', label: 'Settings', icon: Settings },
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Don't render if no user (will redirect)
  if (!user) return null

  return (
    <ProtectedRoute redirectTo="/login">
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-slate-50 to-blue-50/50 text-slate-900 antialiased selection:bg-indigo-500/10">
        
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-950/30 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Desktop sidebar */}
        <aside
          className={`
            fixed top-0 left-0 z-50 h-full w-64 
            bg-white/60 backdrop-blur-xl border-r border-slate-200/50
            flex flex-col justify-between transition-transform duration-300 ease-out shadow-[4px_0_24px_rgba(0,0,0,0.02)]
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          `}
        >
          <div>
            {/* Logo Section */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200/40">
              <Link href={isAdmin ? '/admin/users' : '/organizer/events'} className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
                <Image 
                  src="/images/logo.svg" 
                  alt="EventHub Icon" 
                  width={32} 
                  height={32}
                  className="w-8 h-8 drop-shadow-sm"
                />
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  EventHub
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Menu */}
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname?.startsWith(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }
                    `}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* User Profile Footer Section */}
          <div className="p-4 border-t border-slate-200/40 bg-slate-50/40 backdrop-blur-sm">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/80 border border-transparent hover:border-slate-200/60 transition-all text-left group">
                  <Avatar className="h-9 w-9 border border-indigo-100 shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-xs font-semibold">
                      {getInitials(user?.fullName || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5 capitalize bg-slate-200/50 inline-block px-1.5 py-0.5 rounded-md font-medium">
                      {user?.role}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-56 rounded-xl p-1.5 shadow-xl border-slate-200/60 bg-white/95 backdrop-blur-md">
                <DropdownMenuLabel className="text-xs text-slate-400 px-2 py-1.5">👤 My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100" />
                
                {/* Dynamically matching current layout authorization route pathways */}
                <DropdownMenuItem 
                  onClick={() => router.push(isAdmin ? '/admin/settings' : '/organizer/settings')}
                  className="rounded-lg py-2 cursor-pointer focus:bg-slate-50"
                >
                  <Settings className="h-4 w-4 mr-2 text-slate-500" />
                  <span>Settings ⚙️</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg py-2 cursor-pointer" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout 🚪</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Main content wrapper */}
        <div className="lg:ml-64 flex flex-col min-h-screen">
          
          {/* Mobile Header */}
          <header className="lg:hidden bg-white/70 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-30 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
            <div className="flex items-center justify-between p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
                className="hover:bg-slate-100 rounded-xl"
              >
                <Menu className="h-5 w-5 text-slate-600" />
              </Button>
              
              <div className="flex items-center gap-2">
                <Image 
                  src="/images/logo.svg" 
                  alt="EventHub Icon" 
                  width={28} 
                  height={28}
                  className="w-7 h-7"
                />
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  EventHub
                </span>
              </div>
              <div className="w-10" />
            </div>
          </header>

          {/* Mobile Bottom Tab Bar */}
          {/*<nav className="lg:hidden bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200/60 flex justify-around py-1.5 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] px-2">
            {navItems.map((item) => {
              const isActive = pathname?.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[64px]
                    ${isActive 
                      ? 'text-indigo-600 font-medium scale-105' 
                      : 'text-slate-400 hover:text-slate-600'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                  <span className="text-[10px] tracking-wide">{item.label}</span>
                </Link>
              )
            })}
          </nav>*/}

          {/* Page Content Window context view wrapper */}
          <main className={`flex-1 p-4 md:p-8 pb-24 lg:pb-8 max-w-[1600px] w-full mx-auto transition-all duration-300`}>
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}