/* eslint-disable @typescript-eslint/no-explicit-any */

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
  LayoutDashboard,
  TrendingUp,
} from 'lucide-react'

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
import { ThemeToggle } from '@/components/ui/theme-toggle'

import { useAuthStore } from '@/store/authStore'
import { useEventStore } from '@/store/eventStore'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { toast } from 'sonner'

const adminNavItems = [
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/transactions', label: 'Transactions', icon: CreditCard },
  { href: '/admin/logs', label: 'Logs', icon: FileText },
]

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isLoading } = useAuthStore()
  const currentEvent = useEventStore((s) => s.currentEvent)

  const isAdmin = user?.role === 'admin'
  const eventId = currentEvent?.id

  const organizerNavItems = [
    { href: '/organizer/events', label: 'Events', icon: Calendar },
    { href: eventId ? `/organizer/attendees/${eventId}` : '/organizer/events', label: 'Attendees', icon: Users },
    { href: eventId ? `/organizer/analytics/${eventId}` : '/organizer/events', label: 'Analytics', icon: TrendingUp },
  ]

  const navItems = isAdmin ? adminNavItems : organizerNavItems

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute redirectTo="/login">
      <div className="min-h-screen bg-background">
        {/* Sticky horizontal glass nav bar */}
        <header className="sticky top-0 z-50 glass border-b border-border/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left: Logo + Desktop Nav */}
              <div className="flex items-center gap-8">
                {/* Logo */}
                <Link
                  href={isAdmin ? '/admin/users' : '/organizer/events'}
                  className="flex items-center gap-2 group shrink-0"
                >
                  <div className="relative p-1.5 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg shadow-md shadow-purple-500/20">
                    <LayoutDashboard className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold gradient-text tracking-tight hidden sm:inline">
                    EventHub
                  </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                  {navItems.map((item) => {
                    const isActive = pathname?.startsWith(item.href)
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                          ${isActive
                            ? 'bg-primary/10 text-primary shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                          }
                        `}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>
              </div>

              {/* Right: Theme Toggle + User Menu */}
              <div className="flex items-center gap-2">
                <ThemeToggle />

                {/* Desktop User Dropdown */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent/50 transition-all text-left group">
                        <Avatar className="h-8 w-8 border border-primary/20">
                          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xs font-bold">
                            {getInitials(user?.fullName || 'User')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden lg:block flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate max-w-[120px]">{user?.fullName}</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white w-56">
                      <DropdownMenuLabel className="text-xs font-semibold tracking-wider text-muted-foreground px-2.5 py-2 uppercase flex items-center gap-2 bg-white">
                        <User className="h-3.5 w-3.5 text-primary" />
                        My Account
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => router.push(isAdmin ? '/admin/settings' : '/organizer/settings')}
                  className="rounded-lg px-2.5 py-2 cursor-pointer flex items-center gap-2"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Settings Panel</span>
                </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive rounded-lg px-2.5 py-2 cursor-pointer focus:bg-destructive/10 flex items-center gap-2 font-medium"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Secure Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Hamburger */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(true)}
                  className="md:hidden text-muted-foreground"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile slide-out drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="fixed top-0 right-0 h-full w-72 glass shadow-2xl border-l border-border/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <span className="text-lg font-bold gradient-text">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-muted-foreground"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname?.startsWith(item.href)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                        ${isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        }
                      `}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-9 w-9 border border-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xs font-bold">
                      {getInitials(user?.fullName || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main content area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
