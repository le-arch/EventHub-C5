/**
 * Messages Constants
 * 
 * Centralized storage of all user-facing messages to ensure consistency
 * and easy internationalization later.
 * 
 * @module MessagesConstants
 */

// Success Messages
export const SUCCESS_MESSAGES = {
  // Auth
  LOGIN_SUCCESS: 'Welcome back! Redirecting to dashboard...',
  REGISTER_SUCCESS: 'Account created successfully! Please verify your email.',
  EMAIL_VERIFIED: 'Email verified successfully! You can now log in.',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email.',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully! Please log in.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  
  // Events
  EVENT_CREATED: 'Event created successfully!',
  EVENT_UPDATED: 'Event updated successfully!',
  EVENT_PUBLISHED: 'Event published successfully!',
  EVENT_UNPUBLISHED: 'Event unpublished successfully!',
  EVENT_DELETED: 'Event deleted successfully!',
  EVENT_DUPLICATED: 'Event duplicated successfully!',
  
  // Tickets
  TICKET_TYPE_ADDED: 'Ticket type added successfully!',
  TICKET_TYPE_UPDATED: 'Ticket type updated successfully!',
  TICKET_TYPE_DELETED: 'Ticket type deleted successfully!',
  
  // Orders/Check-in
  ORDER_CREATED: 'Order created successfully! Proceed to payment.',
  PAYMENT_SUCCESS: 'Payment successful! Your ticket is ready.',
  CHECKIN_SUCCESS: 'Attendee checked in successfully!',
  
  // Profile
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  
  // General
  COPY_SUCCESS: 'Copied to clipboard!',
  EXPORT_SUCCESS: 'Data exported successfully!',
  SAVE_SUCCESS: 'Changes saved successfully!',
} as const

// Error Messages
export const ERROR_MESSAGES = {
  // Auth
  LOGIN_FAILED: 'Invalid email/phone or password. Please try again.',
  REGISTER_FAILED: 'Registration failed. Please check your information.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  PHONE_ALREADY_EXISTS: 'An account with this phone number already exists.',
  INVALID_OTP: 'Invalid verification code. Please try again.',
  OTP_EXPIRED: 'Verification code has expired. Please request a new one.',
  PASSWORD_RESET_FAILED: 'Failed to reset password. Please try again.',
  ACCOUNT_NOT_FOUND: 'No account found with this email address.',
  ACCOUNT_SUSPENDED: 'Your account has been suspended. Please contact support.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  
  // Events
  EVENT_NOT_FOUND: 'Event not found.',
  EVENT_CREATE_FAILED: 'Failed to create event. Please try again.',
  EVENT_UPDATE_FAILED: 'Failed to update event. Please try again.',
  EVENT_DELETE_FAILED: 'Failed to delete event. Please try again.',
  EVENT_HAS_SALES: 'Cannot delete event with existing ticket sales.',
  EVENT_PUBLISH_FAILED: 'Failed to publish event. Please add at least one ticket type.',
  
  // Tickets
  TICKET_TYPE_NOT_FOUND: 'Ticket type not found.',
  INSUFFICIENT_TICKETS: 'Not enough tickets available.',
  TICKET_SOLD_OUT: 'This ticket type is sold out.',
  SALES_NOT_STARTED: 'Ticket sales for this event have not started yet.',
  SALES_ENDED: 'Ticket sales for this event have ended.',
  
  // Orders/Payment
  ORDER_NOT_FOUND: 'Order not found.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  PAYMENT_CANCELLED: 'Payment was cancelled.',
  INVALID_PHONE: 'Please enter a valid Cameroon phone number.',
  PAYMENT_METHOD_NOT_SUPPORTED: 'This payment method is not supported.',
  
  // Check-in
  TICKET_ALREADY_USED: 'This ticket has already been used for check-in.',
  INVALID_QR_CODE: 'Invalid QR code. Please check and try again.',
  EVENT_NOT_ACTIVE: 'This event is not active for check-in.',
  
  // Validation
  VALIDATION_ERROR: 'Please check the form for errors.',
  FIELD_REQUIRED: 'This field is required.',
  
  // General
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  EXPORT_FAILED: 'Failed to export data. Please try again.',
  UPLOAD_FAILED: 'Failed to upload image. Please try again.',
} as const

// Info Messages
export const INFO_MESSAGES = {
  LOADING: 'Loading...',
  NO_DATA: 'No data available',
  NO_EVENTS: 'You haven\'t created any events yet. Click "Create Event" to get started.',
  NO_ATTENDEES: 'No attendees have purchased tickets yet.',
  NO_TICKETS: 'No ticket types added yet. Click "Add Ticket" to get started.',
  NO_SEARCH_RESULTS: 'No results found. Try adjusting your search.',
  SELECT_ITEM: 'Please select an item to continue.',
  REQUIRED_FIELDS: 'Fields marked with * are required.',
  DRAG_DROP: 'Drag and drop your image here, or click to browse.',
  QR_SCAN_INSTRUCTION: 'Position the QR code within the frame to scan.',
  CAMERA_PERMISSION: 'Please allow camera access to scan QR codes.',
} as const

// Warning Messages
export const WARNING_MESSAGES = {
  DELETE_EVENT: 'Are you sure you want to delete this event? This action cannot be undone.',
  DELETE_TICKET_TYPE: 'Are you sure you want to delete this ticket type?',
  CANCEL_EVENT: 'Are you sure you want to cancel this event? This will prevent further ticket sales.',
  UNPUBLISH_EVENT: 'Are you sure you want to unpublish this event? It will no longer be visible to the public.',
  REFUND_TICKET: 'Are you sure you want to refund this ticket? This action cannot be undone.',
  SUSPEND_USER: 'Are you sure you want to suspend this user? They will not be able to access their account.',
  UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?',
} as const

// Confirmation Messages
export const CONFIRMATION_MESSAGES = {
  DELETE_EVENT: {
    title: 'Delete Event',
    description: 'This will permanently delete the event and all associated ticket sales. This action cannot be undone.',
    confirmText: 'Delete Event',
    cancelText: 'Cancel',
  },
  DELETE_TICKET_TYPE: {
    title: 'Delete Ticket Type',
    description: 'This will remove this ticket type from the event. Any existing tickets will remain valid.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
  },
  CANCEL_EVENT: {
    title: 'Cancel Event',
    description: 'This will mark the event as cancelled and prevent further ticket sales. Existing ticket holders will be notified.',
    confirmText: 'Cancel Event',
    cancelText: 'Go Back',
  },
  REFUND_TICKET: {
    title: 'Refund Ticket',
    description: 'This will refund the ticket amount to the attendee. The ticket will become invalid.',
    confirmText: 'Refund',
    cancelText: 'Cancel',
  },
  LOGOUT: {
    title: 'Logout',
    description: 'Are you sure you want to log out?',
    confirmText: 'Logout',
    cancelText: 'Stay Logged In',
  },
} as const

// Validation Messages
export const VALIDATION_MESSAGES = {
  // Name
  NAME_REQUIRED: 'Full name is required.',
  NAME_MIN: 'Name must be at least 3 characters.',
  NAME_MAX: 'Name must not exceed 100 characters.',
  NAME_INVALID_CHARS: 'Name can only contain letters and spaces.',
  
  // Email
  EMAIL_REQUIRED: 'Email address is required.',
  EMAIL_INVALID: 'Please enter a valid email address.',
  
  // Phone
  PHONE_REQUIRED: 'Phone number is required.',
  PHONE_INVALID: 'Please enter a valid Cameroon phone number (e.g., 237612345678).',
  
  // Password
  PASSWORD_REQUIRED: 'Password is required.',
  PASSWORD_MIN: 'Password must be at least 8 characters.',
  PASSWORD_UPPERCASE: 'Password must contain at least one uppercase letter.',
  PASSWORD_LOWERCASE: 'Password must contain at least one lowercase letter.',
  PASSWORD_NUMBER: 'Password must contain at least one number.',
  PASSWORD_SPECIAL: 'Password must contain at least one special character.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  
  // Event
  EVENT_TITLE_REQUIRED: 'Event title is required.',
  EVENT_TITLE_MIN: 'Event title must be at least 3 characters.',
  VENUE_REQUIRED: 'Venue name is required.',
  CITY_REQUIRED: 'City is required.',
  DATE_REQUIRED: 'Event date is required.',
  TIME_REQUIRED: 'Event time is required.',
  
  // Ticket
  TICKET_NAME_REQUIRED: 'Ticket name is required.',
  TICKET_PRICE_INVALID: 'Price must be 0 or greater.',
  TICKET_QUANTITY_INVALID: 'Quantity must be at least 1.',
  
  // General
  FIELD_REQUIRED: 'This field is required.',
  TOO_SHORT: (min: number) => `Must be at least ${min} characters.`,
  TOO_LONG: (max: number) => `Must not exceed ${max} characters.`,
} as const

// Payment Specific Messages
export const PAYMENT_MESSAGES = {
  MTN_MOMO: {
    title: 'Pay with MTN Momo',
    description: 'You will receive a payment request on your MTN phone.',
    buttonText: 'Pay with MTN Momo',
  },
  ORANGE_MONEY: {
    title: 'Pay with Orange Money',
    description: 'You will receive a payment request on your Orange phone.',
    buttonText: 'Pay with Orange Money',
  },
  PROCESSING: 'Processing payment... Please check your phone.',
  SUCCESS: 'Payment successful! Your ticket is being generated.',
  FAILED: 'Payment failed. Please try again or contact support.',
  CANCELLED: 'Payment was cancelled.',
  INVALID_PHONE: 'Please enter a valid phone number for the selected payment method.',
} as const

// Auth Specific Messages
export const AUTH_MESSAGES = {
  LOGIN: {
    title: 'Welcome Back',
    description: 'Log in to manage your events and track ticket sales.',
    buttonText: 'Login',
    footerText: "Don't have an account?",
    footerLinkText: 'Sign up',
  },
  REGISTER: {
    title: 'Create Account',
    description: 'Join EventHub to start managing your events.',
    buttonText: 'Create Account',
    footerText: 'Already have an account?',
    footerLinkText: 'Log in',
  },
  FORGOT_PASSWORD: {
    title: 'Forgot Password?',
    description: 'Enter your email to receive a password reset link.',
    buttonText: 'Send Reset Link',
    footerText: 'Remember your password?',
    footerLinkText: 'Back to Login',
  },
  VERIFY_OTP: {
    title: 'Verify Your Email',
    description: 'Enter the 6-digit code sent to your email.',
    buttonText: 'Verify Email',
    resendText: 'Didn\'t receive code?',
    resendLinkText: 'Resend',
  },
  RESET_PASSWORD: {
    title: 'Create New Password',
    description: 'Enter your new password below.',
    buttonText: 'Reset Password',
  },
} as const

// Event Specific Messages
export const EVENT_MESSAGES = {
  CREATE: {
    title: 'Create New Event',
    description: 'Fill in the details below to create your event.',
    buttonText: 'Create Event',
  },
  EDIT: {
    title: 'Edit Event',
    description: 'Update your event details below.',
    buttonText: 'Save Changes',
  },
  TICKETS: {
    title: 'Ticket Types',
    description: 'Add different ticket categories for your event.',
    addButtonText: 'Add Ticket Type',
  },
  SHARE: {
    title: 'Share Your Event',
    description: 'Share this link with your audience to start selling tickets.',
    copyButtonText: 'Copy Link',
    whatsappButtonText: 'Share via WhatsApp',
  },
} as const

// Attendee Specific Messages
export const ATTENDEE_MESSAGES = {
  LIST: {
    title: 'Attendee List',
    description: 'View and manage all attendees who purchased tickets.',
    searchPlaceholder: 'Search by name or phone...',
    exportButtonText: 'Export',
  },
  CHECKIN: {
    title: 'Check-in Scanner',
    description: 'Scan QR codes to check in attendees.',
    manualEntryText: 'Manual Ticket Entry',
    successMessage: 'checked in successfully!',
    errorMessage: 'Invalid or already used ticket.',
  },
} as const

// Ticket Specific Messages
export const TICKET_MESSAGES = {
  PURCHASE: {
    title: 'Purchase Tickets',
    description: 'Select your ticket type and quantity.',
    proceedButtonText: 'Proceed to Payment',
    totalText: 'Total',
  },
  DOWNLOAD: {
    title: 'Your Ticket is Ready!',
    description: 'Download your QR code below. Show it at the event entrance.',
    downloadButtonText: 'Download QR Code',
    backButtonText: 'Back to Home',
  },
} as const

// Helper functions to get messages
export const getSuccessMessage = (key: keyof typeof SUCCESS_MESSAGES): string => {
  return SUCCESS_MESSAGES[key]
}

export const getErrorMessage = (key: keyof typeof ERROR_MESSAGES): string => {
  return ERROR_MESSAGES[key]
}

export const getInfoMessage = (key: keyof typeof INFO_MESSAGES): string => {
  return INFO_MESSAGES[key]
}

export const getWarningMessage = (key: keyof typeof WARNING_MESSAGES): string => {
  return WARNING_MESSAGES[key]
}

export const getConfirmationMessage = (key: keyof typeof CONFIRMATION_MESSAGES) => {
  return CONFIRMATION_MESSAGES[key]
}