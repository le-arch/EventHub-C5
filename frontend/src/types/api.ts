/**
 * API Types
 * 
 * Type definitions for API requests and responses.
 * Includes pagination, API response wrapper, and common request/response types.
 * 
 * @module APITypes
 */

// Generic API Response Wrapper
export interface ApiResponse<T = any> {
  status: 'success' | 'error'
  data?: T
  error?: string
  message?: string
  code?: number
}

// Pagination Types
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Request Types
export interface LoginRequest {
  identifier: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  phone: string
  password: string
}

export interface VerifyOTPRequest {
  email: string
  otp: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

// Response Types
export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface RefreshTokenResponse {
  access_token: string
  refresh_token: string
}

export interface UploadResponse {
  url: string
  filename: string
  size: number
  mimeType: string
}

// Error Types
export interface ApiError {
  status: number
  message: string
  errors?: Record<string, string[]>
}

// Webhook Types
export interface MobileMoneyWebhookPayload {
  transactionId: string
  status: 'success' | 'failed' | 'pending'
  amount: number
  currency: string
  phoneNumber: string
  reference: string
  timestamp: string
}

// Query Parameter Types
export interface EventQueryParams extends PaginationParams {
  status?: EventStatus
  organizerId?: string
  city?: string
  startDate?: string
  endDate?: string
}

export interface AttendeeQueryParams extends PaginationParams {
  eventId: string
  ticketType?: string
  checkedIn?: boolean
  dateFrom?: string
  dateTo?: string
}

export interface OrderQueryParams extends PaginationParams {
  eventId?: string
  attendeeId?: string
  paymentStatus?: PaymentStatus
  paymentMethod?: PaymentMethod
}