/**
 * Utility Constants
 * 
 * Shared constants used across utility functions.
 * 
 * @module UtilsConstants
 */

// Phone Number Format
export const PHONE_PATTERN = /^237[6-9][0-9]{9}$/
export const PHONE_DISPLAY_PATTERN = /(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})/
export const PHONE_DISPLAY_REPLACEMENT = '$1 $2 $3 $4 $5'

// Email Pattern
export const EMAIL_PATTERN = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/

// Password Requirements
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/

// Name Pattern (allows letters, spaces, and accented characters)
export const NAME_PATTERN = /^[a-zA-ZÀ-ÿ\s]+$/

// URL Pattern
export const URL_PATTERN = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/

// Slug Pattern
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// Currency Settings
export const CURRENCY_CODE = 'XAF'
export const CURRENCY_SYMBOL = 'FCFA'
export const CURRENCY_LOCALE = 'fr-CM'
export const CURRENCY_MIN_FRACTION = 0
export const CURRENCY_MAX_FRACTION = 0

// Date Formats
export const DATE_FORMAT_DISPLAY = 'PPP'
export const DATE_FORMAT_API = 'yyyy-MM-dd'
export const TIME_FORMAT_DISPLAY = 'p'
export const TIME_FORMAT_API = 'HH:mm:ss'
export const DATETIME_FORMAT_DISPLAY = 'PPp'
export const DATETIME_FORMAT_API = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"

// File Upload Limits
export const MAX_FILE_SIZE_MB = 5
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

// Image Dimensions
export const COVER_IMAGE_ASPECT_RATIO = 16 / 9
export const THUMBNAIL_WIDTH = 400
export const THUMBNAIL_HEIGHT = 225
export const QR_CODE_SIZE = 256

// Pagination Defaults
export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// Debounce Delays (ms)
export const DEBOUNCE_SEARCH = 300
export const DEBOUNCE_FORM = 500
export const DEBOUNCE_API = 500
export const DEBOUNCE_WINDOW_RESIZE = 200

// Animation Durations (ms)
export const ANIMATION_FAST = 150
export const ANIMATION_NORMAL = 300
export const ANIMATION_SLOW = 500

// Toast Durations (ms)
export const TOAST_SHORT = 2000
export const TOAST_NORMAL = 4000
export const TOAST_LONG = 6000

// OTP Settings
export const OTP_LENGTH = 6
export const OTP_EXPIRY_MINUTES = 10

// QR Code Settings
export const QR_CODE_LEVEL = 'H' // High error correction
export const QR_CODE_MARGIN = 4

// Event Status Colors
export const EVENT_STATUS_COLORS = {
  draft: '#9CA3AF',
  published: '#10B981',
  cancelled: '#EF4444',
  completed: '#3B82F6',
} as const

// Payment Method Colors
export const PAYMENT_METHOD_COLORS = {
  mtn_momo: '#FFCC00',
  orange_money: '#FF6600',
} as const