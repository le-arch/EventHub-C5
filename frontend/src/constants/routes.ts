/**
 * Routes Constants
 * 
 * Centralized route definitions for the entire application.
 * Used for navigation, redirects, and route protection.
 * 
 * @module RoutesConstants
 */

export const ROUTES = {
  // Public Routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_OTP: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PUBLIC_EVENT: (id: string) => `/e/${id}`,
  TICKET: (id: string) => `/ticket/${id}`,
  
  // Organizer Routes
  ORGANIZER_DASHBOARD: '/organizer/events',
  ORGANIZER_EVENTS: '/organizer/events',
  ORGANIZER_EVENT_DETAIL: (id: string) => `/organizer/events/${id}`,
  ORGANIZER_CREATE_EVENT: '/organizer/create',
  ORGANIZER_ATTENDEES: (eventId: string) => `/organizer/attendees/${eventId}`,
  ORGANIZER_CHECKIN: (eventId: string) => `/organizer/checkin/${eventId}`,
  ORGANIZER_ANALYTICS: (eventId: string) => `/organizer/analytics/${eventId}`,
  ORGANIZER_SETTINGS: '/organizer/settings',
  
  // Admin Routes
  ADMIN_DASHBOARD: '/admin/users',
  ADMIN_USERS: '/admin/users',
  ADMIN_EVENTS: '/admin/events',
  ADMIN_TRANSACTIONS: '/admin/transactions',
  ADMIN_LOGS: '/admin/logs',
  ADMIN_SETTINGS: '/admin/settings',
} as const

// Public routes (accessible without authentication)
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.VERIFY_OTP,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
]

// Protected routes (require authentication)
export const PROTECTED_ROUTES = [
  ROUTES.ORGANIZER_DASHBOARD,
  ROUTES.ORGANIZER_EVENTS,
  ROUTES.ORGANIZER_CREATE_EVENT,
  ROUTES.ORGANIZER_SETTINGS,
  ROUTES.ADMIN_DASHBOARD,
  ROUTES.ADMIN_USERS,
  ROUTES.ADMIN_EVENTS,
  ROUTES.ADMIN_TRANSACTIONS,
  ROUTES.ADMIN_LOGS,
]

// Organizer specific routes
export const ORGANIZER_ROUTES = [
  ROUTES.ORGANIZER_DASHBOARD,
  ROUTES.ORGANIZER_EVENTS,
  ROUTES.ORGANIZER_CREATE_EVENT,
  ROUTES.ORGANIZER_SETTINGS,
]

// Admin specific routes
export const ADMIN_ROUTES = [
  ROUTES.ADMIN_DASHBOARD,
  ROUTES.ADMIN_USERS,
  ROUTES.ADMIN_EVENTS,
  ROUTES.ADMIN_TRANSACTIONS,
  ROUTES.ADMIN_LOGS,
]

// Check if a route is public
export const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some(route => 
    route === pathname || 
    (route.includes('/e/') && pathname.startsWith('/e/')) ||
    (route.includes('/ticket/') && pathname.startsWith('/ticket/'))
  )
}

// Check if a route is protected
export const isProtectedRoute = (pathname: string): boolean => {
  return !isPublicRoute(pathname)
}

// Check if a route is for organizers only
export const isOrganizerRoute = (pathname: string): boolean => {
  return ORGANIZER_ROUTES.some(route => 
    pathname.startsWith('/organizer/')
  )
}

// Check if a route is for admin only
export const isAdminRoute = (pathname: string): boolean => {
  return ADMIN_ROUTES.some(route => 
    pathname.startsWith('/admin/')
  )
}

// Get route title for breadcrumbs
export const getRouteTitle = (pathname: string): string => {
  const titles: Record<string, string> = {
    '/': 'Home',
    '/login': 'Login',
    '/register': 'Sign Up',
    '/verify-otp': 'Verify Email',
    '/forgot-password': 'Forgot Password',
    '/organizer/events': 'My Events',
    '/organizer/create': 'Create Event',
    '/organizer/settings': 'Settings',
    '/admin/users': 'Users',
    '/admin/events': 'All Events',
    '/admin/transactions': 'Transactions',
    '/admin/logs': 'System Logs',
  }
  
  // Check dynamic routes
  if (pathname.startsWith('/organizer/events/') && pathname !== '/organizer/events') {
    return 'Edit Event'
  }
  if (pathname.startsWith('/organizer/attendees/')) {
    return 'Attendees'
  }
  if (pathname.startsWith('/organizer/checkin/')) {
    return 'Check-in Scanner'
  }
  if (pathname.startsWith('/organizer/analytics/')) {
    return 'Analytics'
  }
  if (pathname.startsWith('/e/')) {
    return 'Event Details'
  }
  if (pathname.startsWith('/ticket/')) {
    return 'Your Ticket'
  }
  
  return titles[pathname] || 'EventHub'
}