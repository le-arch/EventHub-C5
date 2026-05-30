/**
 * Validation Constants
 * 
 * Defines validation rules, regex patterns, and helper functions
 * for form validation throughout the application.
 * 
 * @module ValidationConstants
 */

// Regex Patterns
export const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s]+$/
export const EMAIL_REGEX = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/
export const PHONE_REGEX = /^237[6-9][0-9]{9}$/
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])?[A-Za-z\d@$!%*?&]{8,}$/
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/

// Validation Rules Configuration
export const VALIDATION_RULES = {
  // Name
  name: {
    minLength: 3,
    maxLength: 100,
    pattern: NAME_REGEX,
    required: true,
  },
  // Email
  email: {
    pattern: EMAIL_REGEX,
    required: true,
  },
  // Phone (Cameroon format)
  phone: {
    pattern: PHONE_REGEX,
    required: true,
    length: 12,
  },
  // Password
  password: {
    minLength: 8,
    pattern: PASSWORD_REGEX,
    required: true,
  },
  // Event Title
  eventTitle: {
    minLength: 3,
    maxLength: 100,
    required: true,
  },
  // Event Description
  eventDescription: {
    maxLength: 5000,
    required: false,
  },
  // Venue Name
  venueName: {
    minLength: 3,
    maxLength: 200,
    required: true,
  },
  // City
  city: {
    required: true,
  },
  // Ticket Name
  ticketName: {
    minLength: 1,
    maxLength: 100,
    required: true,
  },
  // Ticket Price
  ticketPrice: {
    min: 0,
    max: 10000000, // 10 million XAF max
    required: true,
  },
  // Ticket Quantity
  ticketQuantity: {
    min: 1,
    max: 100000, // 100k tickets max
    required: true,
  },
} as const

// Validation Helper Functions

/**
 * Validate a name (letters and spaces only)
 */
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Name is required' }
  }
  if (name.length < VALIDATION_RULES.name.minLength) {
    return { isValid: false, error: `Name must be at least ${VALIDATION_RULES.name.minLength} characters` }
  }
  if (name.length > VALIDATION_RULES.name.maxLength) {
    return { isValid: false, error: `Name cannot exceed ${VALIDATION_RULES.name.maxLength} characters` }
  }
  if (!VALIDATION_RULES.name.pattern.test(name)) {
    return { isValid: false, error: 'Name can only contain letters and spaces' }
  }
  return { isValid: true }
}

/**
 * Validate an email address
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' }
  }
  if (!VALIDATION_RULES.email.pattern.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }
  return { isValid: true }
}

/**
 * Validate a Cameroon phone number
 */
export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  const cleanPhone = phone.replace(/\D/g, '')
  if (!cleanPhone || cleanPhone === '') {
    return { isValid: false, error: 'Phone number is required' }
  }
  if (cleanPhone.length !== 12) {
    return { isValid: false, error: 'Phone number must be 12 digits (including 237)' }
  }
  if (!VALIDATION_RULES.phone.pattern.test(cleanPhone)) {
    return { isValid: false, error: 'Please enter a valid Cameroon phone number' }
  }
  return { isValid: true }
}

/**
 * Validate a password
 */
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Password is required' }
  }
  if (password.length < VALIDATION_RULES.password.minLength) {
    return { isValid: false, error: `Password must be at least ${VALIDATION_RULES.password.minLength} characters` }
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' }
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' }
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' }
  }
  return { isValid: true }
}

/**
 * Validate event title
 */
export const validateEventTitle = (title: string): { isValid: boolean; error?: string } => {
  if (!title || title.trim() === '') {
    return { isValid: false, error: 'Event title is required' }
  }
  if (title.length < VALIDATION_RULES.eventTitle.minLength) {
    return { isValid: false, error: `Title must be at least ${VALIDATION_RULES.eventTitle.minLength} characters` }
  }
  if (title.length > VALIDATION_RULES.eventTitle.maxLength) {
    return { isValid: false, error: `Title cannot exceed ${VALIDATION_RULES.eventTitle.maxLength} characters` }
  }
  return { isValid: true }
}

/**
 * Validate event description
 */
export const validateDescription = (description: string): { isValid: boolean; error?: string } => {
  if (description && description.length > VALIDATION_RULES.eventDescription.maxLength) {
    return { isValid: false, error: `Description cannot exceed ${VALIDATION_RULES.eventDescription.maxLength} characters` }
  }
  return { isValid: true }
}

/**
 * Validate ticket price
 */
export const validateTicketPrice = (price: number): { isValid: boolean; error?: string } => {
  if (isNaN(price)) {
    return { isValid: false, error: 'Price is required' }
  }
  if (price < VALIDATION_RULES.ticketPrice.min) {
    return { isValid: false, error: 'Price cannot be negative' }
  }
  if (price > VALIDATION_RULES.ticketPrice.max) {
    return { isValid: false, error: `Price cannot exceed ${VALIDATION_RULES.ticketPrice.max.toLocaleString()} XAF` }
  }
  return { isValid: true }
}

/**
 * Validate ticket quantity
 */
export const validateTicketQuantity = (quantity: number): { isValid: boolean; error?: string } => {
  if (isNaN(quantity)) {
    return { isValid: false, error: 'Quantity is required' }
  }
  if (quantity < VALIDATION_RULES.ticketQuantity.min) {
    return { isValid: false, error: `Minimum quantity is ${VALIDATION_RULES.ticketQuantity.min}` }
  }
  if (quantity > VALIDATION_RULES.ticketQuantity.max) {
    return { isValid: false, error: `Maximum quantity is ${VALIDATION_RULES.ticketQuantity.max.toLocaleString()}` }
  }
  return { isValid: true }
}