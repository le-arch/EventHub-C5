/**
 * Global Constants
 * 
 * Application-wide constants used across the frontend.
 * 
 * @module Constants
 */

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  NOTIFICATION_PREFERENCES: 'notification_preferences',
  VERIFY_EMAIL: 'verify_email',
  REDIRECT_AFTER_LOGIN: 'redirectAfterLogin',
} as const

// Query Keys for React Query (if used)
export const QUERY_KEYS = {
  USER: 'user',
  EVENTS: 'events',
  EVENT: (id: string) => ['event', id],
  ATTENDEES: (eventId: string) => ['attendees', eventId],
  TICKET_TYPES: (eventId: string) => ['ticket-types', eventId],
  ANALYTICS: (eventId: string) => ['analytics', eventId],
  CHECKINS: (eventId: string) => ['checkins', eventId],
  TRANSACTIONS: 'transactions',
  USERS: 'users',
  LOGS: 'logs',
} as const

// Date Formats
export const DATE_FORMATS = {
  DISPLAY_DATE: 'PPP',           // 'Apr 29, 2024'
  DISPLAY_TIME: 'p',             // '6:00 PM'
  DISPLAY_DATE_TIME: 'PPp',      // 'Apr 29, 2024 at 6:00 PM'
  API_DATE: 'yyyy-MM-dd',        // '2024-04-29'
  API_TIME: 'HH:mm:ss',          // '18:00:00'
  API_DATE_TIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", // ISO format
} as const

// Currency Settings
export const CURRENCY = {
  CODE: 'XAF',
  SYMBOL: 'FCFA',
  LOCALE: 'fr-CM',
  DECIMAL_DIGITS: 0,
} as const

// Image Settings
export const IMAGE_CONFIG = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ACCEPTED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  COVER_ASPECT_RATIO: 16 / 9,
  THUMBNAIL_WIDTH: 400,
  THUMBNAIL_HEIGHT: 225,
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const

// Debounce Delays
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  FORM_VALIDATION: 500,
  API_CALL: 500,
  WINDOW_RESIZE: 200,
} as const

// Animation Durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const

// Toast Durations
export const TOAST_DURATIONS = {
  SHORT: 2000,
  NORMAL: 4000,
  LONG: 6000,
} as const

// Phone Number Format
export const PHONE_FORMAT = {
  COUNTRY_CODE: '237',
  PATTERN: /^237[6-9][0-9]{9}$/,
  DISPLAY_PATTERN: /(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})/,
  DISPLAY_REPLACEMENT: '$1 $2 $3 $4 $5',
} as const

// Password Requirements
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRES_UPPERCASE: true,
  REQUIRES_LOWERCASE: true,
  REQUIRES_NUMBER: true,
  REQUIRES_SPECIAL: false,
} as const

// Event Status Colors (for charts/UI)
export const EVENT_STATUS_COLORS = {
  draft: '#9CA3AF',
  published: '#10B981',
  cancelled: '#EF4444',
  completed: '#3B82F6',
} as const

// Ticket Type Chart Colors
export const CHART_COLORS = [
  '#2563EB', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
] as const