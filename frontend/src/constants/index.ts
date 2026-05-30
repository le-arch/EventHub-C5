/**
 * Constants Index
 * 
 * Central export point for all constants used throughout the application.
 * 
 * @module ConstantsIndex
 */

// Cities
export {
  CAMEROON_CITIES,
  CITY_REGIONS,
  CITIES_BY_REGION,
  CITY_COORDINATES,
} from './cities'
export type { CameroonCity } from './cities'

// Event Status
export {
  EVENT_STATUS,
  EVENT_STATUS_CONFIG,
  STATUS_TRANSITIONS,
  canTransition,
  getAvailableStatuses,
} from './eventStatus'
export type { EventStatus } from './eventStatus'

// Messages
export {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  INFO_MESSAGES,
  WARNING_MESSAGES,
  CONFIRMATION_MESSAGES,
  VALIDATION_MESSAGES,
  PAYMENT_MESSAGES,
  AUTH_MESSAGES,
  EVENT_MESSAGES,
  ATTENDEE_MESSAGES,
  TICKET_MESSAGES,
  getSuccessMessage,
  getErrorMessage,
  getInfoMessage,
  getWarningMessage,
  getConfirmationMessage,
} from './messages'

// Payment Methods
export {
  PAYMENT_METHODS,
  PAYMENT_METHOD_CONFIG,
  isValidPaymentMethod,
  getPaymentMethodLabel,
  getPaymentMethodColor,
} from './paymentMethods'
export type { PaymentMethod } from './paymentMethods'

// Routes
export {
  ROUTES,
  PUBLIC_ROUTES,
  PROTECTED_ROUTES,
  ORGANIZER_ROUTES,
  ADMIN_ROUTES,
  isPublicRoute,
  isProtectedRoute,
  isOrganizerRoute,
  isAdminRoute,
  getRouteTitle,
} from './routes'

// Validation
export {
  VALIDATION_RULES,
  NAME_REGEX,
  EMAIL_REGEX,
  PHONE_REGEX,
  PASSWORD_REGEX,
  SLUG_REGEX,
  URL_REGEX,
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateEventTitle,
  validateDescription,
  validateTicketPrice,
  validateTicketQuantity,
} from './validation'