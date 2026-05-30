/**
 * Validators
 * 
 * Utility functions for validating user input.
 * 
 * @module UtilsValidators
 */

import {
  NAME_PATTERN,
  EMAIL_PATTERN,
  PHONE_PATTERN,
  PASSWORD_PATTERN,
  PASSWORD_MIN_LENGTH,
  URL_PATTERN,
  SLUG_PATTERN,
} from './constants'

// Validation Result Interface
export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validate a full name
 * @param name - Name to validate
 * @returns Validation result
 */
export const validateName = (name: string): ValidationResult => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Full name is required' }
  }
  if (name.length < 3) {
    return { isValid: false, error: 'Name must be at least 3 characters' }
  }
  if (name.length > 100) {
    return { isValid: false, error: 'Name cannot exceed 100 characters' }
  }
  if (!NAME_PATTERN.test(name)) {
    return { isValid: false, error: 'Name can only contain letters and spaces' }
  }
  return { isValid: true }
}

/**
 * Validate an email address
 * @param email - Email to validate
 * @returns Validation result
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' }
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }
  return { isValid: true }
}

/**
 * Validate a Cameroon phone number
 * @param phone - Phone number to validate
 * @returns Validation result
 */
export const validatePhone = (phone: string): ValidationResult => {
  const cleanPhone = phone.replace(/\D/g, '')
  
  if (!cleanPhone || cleanPhone === '') {
    return { isValid: false, error: 'Phone number is required' }
  }
  if (cleanPhone.length !== 12) {
    return { isValid: false, error: 'Phone number must be 12 digits (including 237)' }
  }
  if (!PHONE_PATTERN.test(cleanPhone)) {
    return { isValid: false, error: 'Please enter a valid Cameroon phone number' }
  }
  return { isValid: true }
}

/**
 * Validate a password
 * @param password - Password to validate
 * @returns Validation result
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' }
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { isValid: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` }
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
 * Validate password confirmation
 * @param password - Original password
 * @param confirmPassword - Confirmation password
 * @returns Validation result
 */
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' }
  }
  return { isValid: true }
}

/**
 * Validate a URL
 * @param url - URL to validate
 * @returns Validation result
 */
export const validateUrl = (url: string): ValidationResult => {
  if (url && !URL_PATTERN.test(url)) {
    return { isValid: false, error: 'Please enter a valid URL' }
  }
  return { isValid: true }
}

/**
 * Validate a slug
 * @param slug - Slug to validate
 * @returns Validation result
 */
export const validateSlug = (slug: string): ValidationResult => {
  if (slug && !SLUG_PATTERN.test(slug)) {
    return { isValid: false, error: 'Slug can only contain lowercase letters, numbers, and hyphens' }
  }
  return { isValid: true }
}

/**
 * Validate an event title
 * @param title - Event title to validate
 * @returns Validation result
 */
export const validateEventTitle = (title: string): ValidationResult => {
  if (!title || title.trim() === '') {
    return { isValid: false, error: 'Event title is required' }
  }
  if (title.length < 3) {
    return { isValid: false, error: 'Title must be at least 3 characters' }
  }
  if (title.length > 100) {
    return { isValid: false, error: 'Title cannot exceed 100 characters' }
  }
  return { isValid: true }
}

/**
 * Validate event description
 * @param description - Description to validate
 * @returns Validation result
 */
export const validateEventDescription = (description: string): ValidationResult => {
  if (description && description.length > 5000) {
    return { isValid: false, error: 'Description cannot exceed 5000 characters' }
  }
  return { isValid: true }
}

/**
 * Validate venue name
 * @param venueName - Venue name to validate
 * @returns Validation result
 */
export const validateVenueName = (venueName: string): ValidationResult => {
  if (!venueName || venueName.trim() === '') {
    return { isValid: false, error: 'Venue name is required' }
  }
  if (venueName.length < 3) {
    return { isValid: false, error: 'Venue name must be at least 3 characters' }
  }
  return { isValid: true }
}

/**
 * Validate city selection
 * @param city - City to validate
 * @returns Validation result
 */
export const validateCity = (city: string): ValidationResult => {
  if (!city || city.trim() === '') {
    return { isValid: false, error: 'City is required' }
  }
  return { isValid: true }
}

/**
 * Validate event date
 * @param date - Date to validate
 * @returns Validation result
 */
export const validateEventDate = (date: Date | null): ValidationResult => {
  if (!date) {
    return { isValid: false, error: 'Event date is required' }
  }
  if (date < new Date()) {
    return { isValid: false, error: 'Event date cannot be in the past' }
  }
  return { isValid: true }
}

/**
 * Validate ticket name
 * @param name - Ticket name to validate
 * @returns Validation result
 */
export const validateTicketName = (name: string): ValidationResult => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Ticket name is required' }
  }
  if (name.length > 100) {
    return { isValid: false, error: 'Ticket name cannot exceed 100 characters' }
  }
  return { isValid: true }
}

/**
 * Validate ticket price
 * @param price - Price to validate
 * @returns Validation result
 */
export const validateTicketPrice = (price: number): ValidationResult => {
  if (isNaN(price)) {
    return { isValid: false, error: 'Price is required' }
  }
  if (price < 0) {
    return { isValid: false, error: 'Price cannot be negative' }
  }
  if (price > 10000000) {
    return { isValid: false, error: 'Price cannot exceed 10,000,000 XAF' }
  }
  return { isValid: true }
}

/**
 * Validate ticket quantity
 * @param quantity - Quantity to validate
 * @returns Validation result
 */
export const validateTicketQuantity = (quantity: number): ValidationResult => {
  if (isNaN(quantity)) {
    return { isValid: false, error: 'Quantity is required' }
  }
  if (quantity < 1) {
    return { isValid: false, error: 'Quantity must be at least 1' }
  }
  if (quantity > 100000) {
    return { isValid: false, error: 'Quantity cannot exceed 100,000' }
  }
  return { isValid: true }
}

/**
 * Validate file type
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns Validation result
 */
export const validateFileType = (file: File, allowedTypes: string[]): ValidationResult => {
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: `File type not allowed. Allowed: ${allowedTypes.join(', ')}` }
  }
  return { isValid: true }
}

/**
 * Validate file size
 * @param file - File to validate
 * @param maxSizeBytes - Maximum size in bytes
 * @returns Validation result
 */
export const validateFileSize = (file: File, maxSizeBytes: number): ValidationResult => {
  if (file.size > maxSizeBytes) {
    const maxMB = maxSizeBytes / (1024 * 1024)
    return { isValid: false, error: `File size exceeds ${maxMB}MB limit` }
  }
  return { isValid: true }
}

/**
 * Validate image dimensions (client-side)
 * @param file - Image file to validate
 * @param expectedAspectRatio - Expected aspect ratio (width/height)
 * @returns Promise with validation result
 */
export const validateImageAspectRatio = async (
  file: File,
  expectedAspectRatio: number
): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const ratio = img.width / img.height
      const tolerance = 0.1
      const isValid = Math.abs(ratio - expectedAspectRatio) <= tolerance
      if (!isValid) {
        resolve({
          isValid: false,
          error: `Image aspect ratio should be approximately ${expectedAspectRatio}:1`,
        })
      } else {
        resolve({ isValid: true })
      }
    }
    img.onerror = () => {
      resolve({ isValid: false, error: 'Failed to load image' })
    }
    img.src = URL.createObjectURL(file)
  })
}