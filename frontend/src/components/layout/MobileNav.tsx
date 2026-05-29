/**
 * MobileNav Component
 * 
 * Bottom tab navigation for mobile devices.
 * Provides quick access to main sections of the app.
 * 
 * @module MobileNav
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Users, BarChart3, Settings, Home, Ticket, QrCode } from 'lucide-react'
import { cn } from '@/src/lib/utils'

interface MobileNavItem {
  label: string
  href: string
  icon: React.ElementType
  requiresAuth?: boolean
}

const organizerNavItems: MobileNavItem[] = [
  { label: 'Events', href: '/organizer/events', icon: Calendar, requiresAuth: true },
  { label: 'Attendees', href: '/organizer/attendees', icon: Users, requiresAuth: true },
  { label: 'Scanner', href: '/organizer/checkin', icon: QrCode, requiresAuth: true },
  { label: 'Analytics', href: '/organizer/analytics', icon: BarChart3, requiresAuth: true },
  { label: 'Settings', href: '/organizer/settings', icon: Settings, requiresAuth: true },
]

const adminNavItems: MobileNavItem[] = [
  { label: 'Users', href: '/admin/users', icon: Users, requiresAuth: true },
  { label: 'Events', href: '/admin/events', icon: Calendar, requiresAuth: true },
  { label: 'Transactions', href: '/admin/transactions', icon: Ticket, requiresAuth: true },
  { label: 'Settings', href: '/admin/settings', icon: Settings, requiresAuth: true },
]

const publicNavItems: MobileNavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Features', href: '/#features', icon: Calendar },
  { label: 'Login', href: '/login', icon: Users },
]

interface MobileNavProps {
  userRole?: 'organizer' | 'admin' | null
  isAuthenticated?: boolean
}

export function MobileNav({ userRole, isAuthenticated = false }: MobileNavProps) {
  const pathname = usePathname()

  // Select nav items based on user role
  let navItems: MobileNavItem[] = []
  if (isAuthenticated && userRole === 'admin') {
    navItems = adminNavItems
  } else if (isAuthenticated && userRole === 'organizer') {
    navItems = organizerNavItems
  } else {
    navItems = publicNavItems
  }

  // Don't show on public pages if not needed
  if (!isAuthenticated && pathname === '/') {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t safe-bottom z-50 md:hidden">
      <div className="flex justify-around items-center px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors",
                isActive ? "text-primary" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}