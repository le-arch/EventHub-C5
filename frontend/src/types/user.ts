/**
 * User Types
 * 
 * Type definitions for users, authentication, and profiles.
 * 
 * @module UserTypes
 */

// User Role Enum
export type UserRole = 'organizer' | 'admin'

// Core User Interface
export interface User {
  id: string
  email: string
  phone: string
  fullName: string
  role: UserRole
  isEmailVerified: boolean
  avatarUrl?: string
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

// Organizer Profile (extends User)
export interface OrganizerProfile extends User {
  role: 'organizer'
  organizationName?: string
  organizationWebsite?: string
  bio?: string
  totalEvents: number
  totalAttendees: number
  totalRevenue: number
  socialLinks?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
}

// Admin Profile (extends User)
export interface AdminProfile extends User {
  role: 'admin'
  permissions: AdminPermission[]
  lastActionAt?: string
  actionCount?: number
}

// Admin Permissions
export type AdminPermission = 
  | 'manage_users'
  | 'manage_events'
  | 'manage_transactions'
  | 'view_logs'
  | 'manage_settings'
  | 'manage_system'

// Registration Data
export interface RegisterData {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

// Update Profile Data
export interface UpdateProfileData {
  fullName?: string
  email?: string
  phone?: string
  avatarUrl?: string
  organizationName?: string
  organizationWebsite?: string
  bio?: string
  socialLinks?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
}

// User List Response
export interface UserListResponse {
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// User Filters
export interface UserFilters {
  role?: UserRole
  isEmailVerified?: boolean
  isActive?: boolean
  search?: string
  dateFrom?: string
  dateTo?: string
}

// Auth State (for store)
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Session Info
export interface SessionInfo {
  userId: string
  accessToken: string
  refreshToken: string
  expiresAt: string
  deviceInfo?: string
  ipAddress?: string
}