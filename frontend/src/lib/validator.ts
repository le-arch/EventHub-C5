/**
 * Validators
 * 
 * Reusable validation functions for form inputs.
 * Includes validation for names, emails, phone numbers, passwords, etc.
 * 
 * @module Validators
 */

// Regex Patterns
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s]+$/
const EMAIL_REGEX = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/
const PHONE_REGEX = /^237[6-9][0-9]{9}$/
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/

// Validation Result Type
interface ValidationResult {
  isValid: boolean
  error?: string
}

// Name Validation
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
  if (!NAME_REGEX.test(name)) {
    return { isValid: false, error: 'Name can only contain letters and spaces' }
  }
  return { isValid: true }
}

// Email Validation
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' }
  }
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }
  return { isValid: true }
}

// Phone Number Validation (Cameroon format)
export const validatePhone = (phone: string): ValidationResult => {
  const cleanPhone = phone.replace(/\D/g, '')
  
  if (!cleanPhone || cleanPhone === '') {
    return { isValid: false, error: 'Phone number is required' }
  }
  if (cleanPhone.length !== 12) {
    return { isValid: false, error: 'Phone number must be 12 digits (including 237)' }
  }
  if (!PHONE_REGEX.test(cleanPhone)) {
    return { isValid: false, error: 'Please enter a valid Cameroon phone number' }
  }
  return { isValid: true }
}

// Password Validation
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' }
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' }
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

// Confirm Password Validation
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' }
  }
  return { isValid: true }
}

// Event Title Validation
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

// Event Description Validation
export const validateEventDescription = (description: string): ValidationResult => {
  if (description && description.length > 5000) {
    return { isValid: false, error: 'Description cannot exceed 5000 characters' }
  }
  return { isValid: true }
}

// Venue Name Validation
export const validateVenueName = (venueName: string): ValidationResult => {
  if (!venueName || venueName.trim() === '') {
    return { isValid: false, error: 'Venue name is required' }
  }
  if (venueName.length < 3) {
    return { isValid: false, error: 'Venue name must be at least 3 characters' }
  }
  return { isValid: true }
}

// City Validation
export const validateCity = (city: string): ValidationResult => {
  if (!city || city.trim() === '') {
    return { isValid: false, error: 'City is required' }
  }
  return { isValid: true }
}

// Date Validation
export const validateDate = (date: Date | null): ValidationResult => {
  if (!date) {
    return { isValid: false, error: 'Date is required' }
  }
  if (date < new Date()) {
    return { isValid: false, error: 'Event date cannot be in the past' }
  }
  return { isValid: true }
}

// Ticket Name Validation
export const validateTicketName = (name: string): ValidationResult => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Ticket name is required' }
  }
  if (name.length > 100) {
    return { isValid: false, error: 'Ticket name cannot exceed 100 characters' }
  }
  return { isValid: true }
}

// Ticket Price Validation
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

// Ticket Quantity Validation
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

// URL Validation
export const validateUrl = (url: string): ValidationResult => {
  if (url && !URL_REGEX.test(url)) {
    return { isValid: false, error: 'Please enter a valid URL' }
  }
  return { isValid: true }
}

// Slug Validation
export const validateSlug = (slug: string): ValidationResult => {
  if (slug && !SLUG_REGEX.test(slug)) {
    return { isValid: false, error: 'Slug can only contain lowercase letters, numbers, and hyphens' }
  }
  return { isValid: true }
}

// Combined form validation for event creation
export const validateEventForm = (data: {
  title: string
  venueName: string
  city: string
  startDate: Date | null
  startTime: string
  ticketTypes: Array<{ name: string; price: number; quantityAvailable: number }>
}): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  const titleValidation = validateEventTitle(data.title)
  if (!titleValidation.isValid) errors.title = titleValidation.error!
  
  const venueValidation = validateVenueName(data.venueName)
  if (!venueValidation.isValid) errors.venueName = venueValidation.error!
  
  const cityValidation = validateCity(data.city)
  if (!cityValidation.isValid) errors.city = cityValidation.error!
  
  const dateValidation = validateDate(data.startDate)
  if (!dateValidation.isValid) errors.startDate = dateValidation.error!
  
  if (!data.startTime) errors.startTime = 'Start time is required'
  
  if (!data.ticketTypes || data.ticketTypes.length === 0) {
    errors.ticketTypes = 'At least one ticket type is required'
  } else {
    data.ticketTypes.forEach((ticket, index) => {
      const nameValidation = validateTicketName(ticket.name)
      if (!nameValidation.isValid) {
        errors[`ticketTypes.${index}.name`] = nameValidation.error!
      }
      
      const priceValidation = validateTicketPrice(ticket.price)
      if (!priceValidation.isValid) {
        errors[`ticketTypes.${index}.price`] = priceValidation.error!
      }
      
      const quantityValidation = validateTicketQuantity(ticket.quantityAvailable)
      if (!quantityValidation.isValid) {
        errors[`ticketTypes.${index}.quantityAvailable`] = quantityValidation.error!
      }
    })
  }
  
  return errors
}

// Combined form validation for registration
export const validateRegistrationForm = (data: {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  const nameValidation = validateName(data.fullName)
  if (!nameValidation.isValid) errors.fullName = nameValidation.error!
  
  const emailValidation = validateEmail(data.email)
  if (!emailValidation.isValid) errors.email = emailValidation.error!
  
  const phoneValidation = validatePhone(data.phone)
  if (!phoneValidation.isValid) errors.phone = phoneValidation.error!
  
  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.isValid) errors.password = passwordValidation.error!
  
  const confirmValidation = validateConfirmPassword(data.password, data.confirmPassword)
  if (!confirmValidation.isValid) errors.confirmPassword = confirmValidation.error!
  
  return errors
}