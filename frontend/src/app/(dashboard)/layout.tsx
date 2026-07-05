/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Dashboard Layout Component
 * 
 * This layout wraps all authenticated pages (organizer dashboard and admin panel).
 * It provides a responsive layout with:
 * - Desktop: Fixed glassmorphic sidebar navigation
 * - Mobile: Hamburger menu + bottom tab bar
 * - Shared header with user menu
 * 
 * @module DashboardLayout
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  FileText,
  ChevronDown,
  User,
  BarChart3,
  Pin,
  PinOff,
  ShieldAlert,
  AlertCircle,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// State management
import { useAuthStore } from '@/store/authStore'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { toast } from 'sonner'

// Navigation items for organizer role
const organizerNavItems = [
  { href: '/organizer/events', label: 'Events', icon: Calendar },
  { href: '/organizer/settings', label: 'Settings', icon: Settings },
]

// Navigation items for admin role
const adminNavItems = [
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/transactions', label: 'Transactions', icon: CreditCard },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
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
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [sidebarPinned, setSidebarPinned] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const isDesktopExpanded = sidebarPinned || sidebarHovered || userMenuOpen
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isLoading, refreshCurrentUser } = useAuthStore()

  // Refresh user data on mount to get latest verification status
  useEffect(() => {
    refreshCurrentUser()
  }, [refreshCurrentUser])

  // Determine which nav items to show based on user role
  const isAdmin = user?.role === 'admin'
  const navItems = isAdmin ? adminNavItems : organizerNavItems

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // // Redirect to login if not authenticated
  // useEffect(() => {
  //   if (!isLoading && !user) {
  //     router.push('/login')
  //   }
  // }, [user, isLoading, router])

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500 border-t-blue-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-purple-500/30 opacity-40"></div>
        </div>
      </div>
    )
  }

  // Don't render if no user (will redirect)
  // if (!user) return null

  return (
    <ProtectedRoute redirectTo="/login">
      {/* Dynamic Background Mesh Grid */}
      <div className="min-h-screen bg-background text-foreground ...">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-transparent pointer-events-none blur-3xl z-0" />
        
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Desktop & Mobile Glass Sidebar Panel */}
        <TooltipProvider delayDuration={200}>
        <aside
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
          className={`
            fixed top-0 left-0 z-50 h-full
            max-lg:w-64
            bg-slate-900/90 backdrop-blur-xl border-r border-slate-800/60 lg:border-slate-800/40
            shadow-[4px_0_24px_-4px_rgba(0,0,0,0.3)] flex flex-col justify-between
            transition-all duration-300 ease-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
            ${isDesktopExpanded ? 'lg:w-64' : 'lg:w-16'}
          `}
        >
          <div>
            {/* Logo Section */}
            <div className="flex items-center justify-between p-4 lg:p-3 border-b border-slate-800/50 min-h-[64px]">
              <Link 
                href={isAdmin ? '/admin/users' : '/organizer/events'} 
                className="flex items-center gap-3 group transition-transform active:scale-95 overflow-hidden"
              >
                <div className="relative shrink-0 p-1.5 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-md shadow-purple-500/10">
                  <Image 
                    src="/images/logo.svg" 
                    alt="EventHub Icon" 
                    width={28} 
                    height={28}
                    className="w-7 h-7 filter brightness-0 invert"
                  />
                </div>
                <span className={`
                  text-xl font-bold bg-gradient-to-r from-purple-300 via-indigo-200 to-blue-300 bg-clip-text text-transparent tracking-tight whitespace-nowrap
                  transition-opacity duration-200
                  ${isDesktopExpanded ? 'lg:opacity-100' : 'lg:opacity-0 lg:w-0'}
                `}>
                  EventHub
                </span>
              </Link>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSidebarPinned(!sidebarPinned)}
                  className={`
                    max-lg:hidden p-1.5 rounded-lg transition-all border
                    ${sidebarPinned
                      ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50 border-transparent hover:border-slate-700/40'
                    }
                    ${isDesktopExpanded ? '' : 'hidden'}
                  `}
                  aria-label={sidebarPinned ? 'Unpin sidebar' : 'Pin sidebar'}
                >
                  {sidebarPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent hover:border-slate-700/40 transition-all"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Navigation Menu Links */}
            <nav className="p-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname?.startsWith(item.href)
                const Icon = item.icon
                const linkContent = (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98] overflow-hidden
                      ${isActive
                        ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/15 border border-purple-500/20 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                      }
                      ${!isDesktopExpanded ? 'lg:justify-center lg:px-0' : ''}
                    `}
                  >
                    <Icon className={`shrink-0 h-5 w-5 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'}`} />
                    <span className={`whitespace-nowrap transition-opacity duration-200 ${!isDesktopExpanded ? 'lg:hidden' : ''}`}>{item.label}</span>
                  </Link>
                )

                if (!isDesktopExpanded) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        {linkContent}
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 text-slate-100 border-slate-700">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  )
                }

                return linkContent
              })}
            </nav>
          </div>

          {/* Connected Identity Context Block */}
          <div className="p-3 border-t border-slate-800/50 bg-slate-950/20">
            {isDesktopExpanded ? (
              <DropdownMenu onOpenChange={setUserMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 transition-all text-left group active:scale-[0.98]">
                    <Avatar className="h-9 w-9 shrink-0 border border-purple-500/20 shadow-inner">
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xs font-bold font-mono">
                        {getInitials(user?.fullName || 'User')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-purple-300 transition-colors">{user?.fullName}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-500 group-hover:text-slate-400 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="w-56 bg-slate-900/95 backdrop-blur-xl border-slate-800 text-slate-200 shadow-xl rounded-xl p-1">
                  <DropdownMenuLabel className="text-xs font-semibold tracking-wider text-slate-500 px-2.5 py-2 uppercase flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-purple-400" />
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <DropdownMenuItem 
                    onClick={() => router.push('/organizer/settings')}
                    className="rounded-lg px-2.5 py-2 cursor-pointer focus:bg-slate-800 focus:text-slate-100 flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Settings Panel</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <DropdownMenuItem 
                    className="text-rose-400 rounded-lg px-2.5 py-2 cursor-pointer focus:bg-rose-950/30 focus:text-rose-300 flex items-center gap-2 font-medium" 
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Secure Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="flex justify-center w-full p-2 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 transition-all active:scale-[0.98]"
                  >
                    <Avatar className="h-9 w-9 border border-purple-500/20 shadow-inner">
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xs font-bold font-mono">
                        {getInitials(user?.fullName || 'User')}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-slate-800 text-slate-100 border-slate-700">
                  {user?.fullName || 'User'}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </aside>
        </TooltipProvider>

        {/* Global Frame Workspace Wrapper */}
        <div className={`relative z-10 transition-all duration-300 ease-out ${isDesktopExpanded ? 'lg:ml-64' : 'lg:ml-16'}`}>
          {/* Translucent Mobile Utility Header */}
          <header className="lg:hidden bg-slate-900/95 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-30">
            <div className="flex items-center justify-between p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-slate-800/40 rounded-xl"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-2">
                <div className="p-1 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                  <Image 
                    src="/images/logo.svg" 
                    alt="EventHub Icon" 
                    width={22} 
                    height={22}
                    className="filter brightness-0 invert"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent tracking-tight">
                  EventHub
                </span>
              </div>
              <div className="w-10" />
            </div>
          </header>

          {/* Mobile bottom navigation */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 flex justify-around py-2 z-40 px-2 shadow-[0_-8px_24px_rgba(0,0,0,0.4)]">
            {(isAdmin ? adminNavItems : organizerNavItems).map((item) => {
              const isActive = pathname?.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[64px] active:scale-95
                    ${isActive 
                      ? 'text-purple-400 bg-purple-500/10 font-medium' 
                      : 'text-slate-400 hover:text-slate-200'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] tracking-wide font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Layout Content Slot Injection Area */}
          <main className={`p-4 md:p-8 lg:p-10 animate-fade-in pb-24 lg:pb-10`}>
            {user?.role === 'organizer' && !user?.isOrganizerVerified && (
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    Account Pending Verification
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                    Your organizer account has not been verified by an admin yet. You will not be able to create events until your account is approved. We will notify you once your account has been reviewed.
                  </p>
                </div>
                <AlertCircle className="h-5 w-5 text-amber-500 animate-pulse shrink-0" />
              </div>
            )}
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}