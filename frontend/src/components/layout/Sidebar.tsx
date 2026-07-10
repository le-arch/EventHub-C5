/**
 * Sidebar Component
 * 
 * Desktop sidebar navigation for authenticated users.
 * Includes logo, navigation items, user profile section, and collapse functionality.
 * 
 * @module Sidebar
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Calendar,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  Ticket,
  QrCode,
  Shield,
  CreditCard,
  FileText,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuthStore } from '@/store/authStore'
import { useEventStore } from '@/store/eventStore'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  adminOnly?: boolean
  organizerOnly?: boolean
}

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const currentEvent = useEventStore((s) => s.currentEvent)

  const isAdmin = user?.role === 'admin'
  const eventId = currentEvent?.id

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/organizer/events', icon: Home, organizerOnly: true },
    { label: 'Events', href: '/organizer/events', icon: Calendar, organizerOnly: true },
    { label: 'Attendees', href: eventId ? `/organizer/attendees/${eventId}` : '/organizer/events', icon: Users, organizerOnly: true },
    { label: 'Check-in', href: eventId ? `/organizer/checkin/${eventId}` : '/organizer/events', icon: QrCode, organizerOnly: true },
    { label: 'Analytics', href: eventId ? `/organizer/analytics/${eventId}` : '/organizer/events', icon: BarChart3, organizerOnly: true },
    { label: 'Settings', href: '/organizer/settings', icon: Settings, organizerOnly: true },
    // Admin items
    { label: 'Users', href: '/admin/users', icon: Shield, adminOnly: true },
    { label: 'All Events', href: '/admin/events', icon: Calendar, adminOnly: true },
    { label: 'Transactions', href: '/admin/transactions', icon: CreditCard, adminOnly: true },
    { label: 'System Logs', href: '/admin/logs', icon: FileText, adminOnly: true },
  ]
  
  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (isAdmin && item.adminOnly) return true
    if (!isAdmin && item.organizerOnly) return true
    return false
  })

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo Section */}
        <div className={cn(
          "flex items-center h-16 border-b px-4",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <Link href={isAdmin ? "/admin/users" : "/organizer/events"} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EH</span>
              </div>
              <span className="font-bold text-xl">EventHub</span>
            </Link>
          )}
          {isCollapsed && (
            <Link href={isAdmin ? "/admin/users" : "/organizer/events"}>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EH</span>
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex h-8 w-8"
            onClick={onToggle}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-1 px-2">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              const Icon = item.icon

              const NavButton = () => (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isCollapsed && "justify-center",
                    isActive
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-muted/30"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isCollapsed && "h-5 w-5")} />
                  {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              )

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <NavButton />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return <NavButton key={item.href} />
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className={cn(
          "border-t p-4",
          isCollapsed && "flex justify-center"
        )}>
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(user?.fullName || 'User')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <LogOut className="h-5 w-5 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}