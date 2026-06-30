/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls to the backend.
 * Manages request/response data transformation between frontend and backend formats.
 * 
 * @module AuthService
 */

import api from '@/lib/api'

// Types 

export interface RegisterPayload {
  full_name: string
  email: string
  phone: string
  password_hash: string  
  role?: 'organizer' | 'admin'
}

export interface VerifyEmailPayload {
  email: string
  otp: string
}

export interface LoginPayload {
  email: string
  password_hash: string  
}

export interface RefreshTokenPayload {
  refresh_token: string
}

export interface AuthResponse {
  token: string
  refresh_token: string
  user: UserData
}

export interface UserData {
  id: string
  full_name: string
  email: string
  phone: string
  role: 'organizer' | 'admin'
  is_email_verified: boolean
  created_at?: string
}

export interface ResendOTPPayload {
  email: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  email: string
  otp: string
  password: string  // Changed from password_hash to match backend
}

// User types for admin functions
export interface UserListResponse {
  users: UserData[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UpdateUserPayload {
  full_name?: string
  email?: string
  phone?: string
  role?: 'organizer' | 'admin'
  is_active?: boolean
  is_email_verified?: boolean
}

// Auth Service 

export const authService = {
  /**
   * Register a new user
   * @param fullName - User's full name
   * @param email - User's email
   * @param phone - User's phone number
   * @param password - User's password
   * @param role - User role (default: 'organizer')
   */
  register: async (
    fullName: string,
    email: string,
    phone: string,
    password: string,
    role: 'organizer' | 'admin' = 'organizer'
  ): Promise<void> => {
    const payload: RegisterPayload = {
      full_name: fullName,
      email,
      phone,
      password_hash: password,
      role,
    }

    await api.post('/auth/register', payload)
  },

  /**
   * Verify email with OTP code
   * @param email - User's email
   * @param otp - 6-digit OTP code
   */
  verifyEmail: async (email: string, otp: string): Promise<AuthResponse> => {
    const payload: VerifyEmailPayload = {
      email,
      otp,
    }

    const response = await api.post<AuthResponse>('/auth/verify-otp', payload)
    return response.data
  },

  /**
   * Login with email or phone and password
   * @param identifier - User's email or phone number
   * @param password - User's password
   */
  login: async (identifier: string, password: string): Promise<AuthResponse> => {
    const payload: LoginPayload = {
      email: identifier,
      password_hash: password,
    }

    const response = await api.post<{ message: string; user: AuthResponse }>('/auth/login', payload)
    return response.data.user
  },

  /**
   * Refresh access token using refresh token
   * @param refreshToken - Refresh token from localStorage
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const payload: RefreshTokenPayload = {
      refresh_token: refreshToken,
    }

    const response = await api.post<AuthResponse>('/auth/refresh', payload)
    return response.data
  },

  /**
   * Logout user (optional - mostly handled on frontend)
   */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  /**
   * Resend OTP code to email
   * @param email - User's email
   */
  resendOTP: async (email: string): Promise<void> => {
    const payload: ResendOTPPayload = {
      email,
    }

    await api.post('/auth/resend-otp', payload)
  },

  /**
   * Request password reset
   * @param email - User's email
   */
  forgotPassword: async (email: string): Promise<void> => {
    const payload: ForgotPasswordPayload = {
      email,
    }

    await api.post('/auth/forgot-password', payload)
  },

  /**
   * Reset password with OTP
   * @param email - User's email
   * @param otp - 6-digit OTP code
   * @param newPassword - New password
   */
  resetPassword: async (
    email: string,
    otp: string,
    newPassword: string
  ): Promise<void> => {
    const payload: ResetPasswordPayload = {
      email,
      otp,
      password: newPassword,
    }

    await api.post('/auth/reset-password', payload)
  },

  //  Admin User Management 

  /**
   * Get all users (admin only)
   * @param page - Page number
   * @param limit - Items per page
   * @param search - Search term (optional)
   * @param status - Filter by status (optional)
   */
  getUsers: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ): Promise<UserListResponse> => {
    const params: Record<string, string | number> = { page, limit }
    if (search) params.search = search
    if (status) params.status = status

    const response = await api.get<UserListResponse>('/admin/users', { params })
    return response.data
  },

  /**
   * Get a single user by ID (admin only)
   * @param userId - User ID
   */
  getUserById: async (userId: string): Promise<UserData> => {
    const response = await api.get<UserData>(`/admin/users/${userId}`)
    return response.data
  },

  /**
   * Update a user (admin only)
   * @param userId - User ID
   * @param data - Update data
   */
  updateUser: async (userId: string, data: UpdateUserPayload): Promise<UserData> => {
    const response = await api.put<UserData>(`/admin/users/${userId}`, data)
    return response.data
  },

  /**
   * Verify a user's email (admin only)
   * @param userId - User ID
   */
  verifyUser: async (userId: string): Promise<void> => {
    await api.put(`/admin/users/${userId}/verify`)
  },

  /**
   * Suspend a user (admin only)
   * @param userId - User ID
   */
  suspendUser: async (userId: string): Promise<void> => {
    await api.put(`/admin/users/${userId}/suspend`)
  },

  /**
   * Unsuspend a user (admin only)
   * @param userId - User ID
   */
  unsuspendUser: async (userId: string): Promise<void> => {
    await api.put(`/admin/users/${userId}/unsuspend`)
  },

  /**
   * Delete a user (admin only)
   * @param userId - User ID
   */
  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/admin/users/${userId}`)
  },

  /**
   * Batch verify users (admin only)
   * @param userIds - Array of user IDs
   */
  batchVerifyUsers: async (userIds: string[]): Promise<void> => {
    await api.post('/admin/users/batch-verify', { user_ids: userIds })
  },

  /**
   * Batch suspend users (admin only)
   * @param userIds - Array of user IDs
   */
  batchSuspendUsers: async (userIds: string[]): Promise<void> => {
    await api.post('/admin/users/batch-suspend', { user_ids: userIds })
  },
}