/**
 * Types Index
 * 
 * Central export point for all TypeScript type definitions.
 * 
 * @module TypesIndex
 */

// API Types
export type {
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  LoginRequest,
  RegisterRequest,
  VerifyOTPRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  LoginResponse,
  RefreshTokenResponse,
  UploadResponse,
  ApiError,
  MobileMoneyWebhookPayload,
  EventQueryParams,
  AttendeeQueryParams,
  OrderQueryParams,
} from './api'

// Attendee Types
export type {
  Attendee,
  AttendeeDetails,
  AttendeeListResponse,
  AttendeeSummary,
  TicketBreakdown,
  CheckinRequest,
  CheckinResponse,
  CheckinHistory,
  ExportFormat,
  AttendeeFilters,
} from './attendee'

// Event Types
export type {
  EventStatus,
  Event,
  TicketStats,
  TicketType,
  CreateEventData,
  UpdateEventData,
  EventListResponse,
  EventAnalytics,
  DailySalesData,
  TicketBreakdownData,
  RecentCheckinData,
  EventStatusConfig,
  EventFilters,
} from './event'

// Order Types
export type {
  PaymentStatus,
  PaymentMethod,
  Order,
  OrderDetails,
  OrderItem,
  CreateOrderRequest,
  OrderListResponse,
  OrderSummary,
} from './order'

// Payment Types
export type {
  PaymentProvider,
  PaymentRequest,
  PaymentResponse,
  PaymentWebhookPayload,
  PaymentStatusResponse,
  PaymentMethodConfig,
} from './payment'

// User Types
export type {
  UserRole,
  User,
  OrganizerProfile,
  AdminProfile,
  RegisterData,
  UpdateProfileData,
  UserListResponse,
  UserFilters,
  AuthState,
} from './user'