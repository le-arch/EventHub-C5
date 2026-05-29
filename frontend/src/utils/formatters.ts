/**
 * Formatters
 * 
 * Utility functions for formatting dates, currency, phone numbers, and other values.
 * 
 * @module Formatters
 */

import {
  CURRENCY_CODE,
  CURRENCY_SYMBOL,
  CURRENCY_LOCALE,
  CURRENCY_MIN_FRACTION,
  CURRENCY_MAX_FRACTION,
  DATE_FORMAT_DISPLAY,
  TIME_FORMAT_DISPLAY,
  DATETIME_FORMAT_DISPLAY,
  PHONE_DISPLAY_PATTERN,
  PHONE_DISPLAY_REPLACEMENT,
} from './constants'

/**
 * Format a number as currency (XAF)
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "5,000 FCFA")
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency: CURRENCY_CODE,
    minimumFractionDigits: CURRENCY_MIN_FRACTION,
    maximumFractionDigits: CURRENCY_MAX_FRACTION,
  })
    .format(amount)
    .replace(CURRENCY_CODE, CURRENCY_SYMBOL)
    .trim()
}

/**
 * Format a date string to display format
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string (e.g., "Apr 29, 2024")
 */
export const formatDate = (date: string | Date | number): string => {
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid date'
  return new Intl.DateTimeFormat(CURRENCY_LOCALE, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * Format a time string to display format
 * @param time - Time string (e.g., "18:00:00") or Date object
 * @returns Formatted time string (e.g., "6:00 PM")
 */
export const formatTime = (time: string | Date): string => {
  const date = typeof time === 'string' 
    ? new Date(`2000-01-01T${time}`)
    : time
  
  if (isNaN(date.getTime())) return 'Invalid time'
  
  return new Intl.DateTimeFormat(CURRENCY_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

/**
 * Format a date and time together
 * @param date - Date string or Date object
 * @returns Formatted date and time string (e.g., "Apr 29, 2024 at 6:00 PM")
 */
export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid date'
  
  return new Intl.DateTimeFormat(CURRENCY_LOCALE, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d)
}

/**
 * Format a phone number for display
 * @param phone - Raw phone number (e.g., "237612345678")
 * @returns Formatted phone number (e.g., "237 61 23 45 67")
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.replace(PHONE_DISPLAY_PATTERN, PHONE_DISPLAY_REPLACEMENT)
}

/**
 * Format a number with thousand separators
 * @param num - Number to format
 * @returns Formatted number string (e.g., "1,234,567")
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat(CURRENCY_LOCALE).format(num)
}

/**
 * Format a percentage
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string (e.g., "42.5%")
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

/**
 * Truncate text to a maximum length
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Capitalize the first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export const capitalize = (str: string): string => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Convert a string to title case
 * @param str - String to convert
 * @returns Title cased string
 */
export const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format event duration
 * @param startDate - Start date
 * @param endDate - End date (optional)
 * @returns Formatted duration string
 */
export const formatEventDuration = (startDate: string, endDate?: string | null): string => {
  const start = new Date(startDate)
  if (!endDate || endDate === startDate) {
    return formatDate(start)
  }
  const end = new Date(endDate)
  return `${formatDate(start)} - ${formatDate(end)}`
}

/**
 * Format file size
 * @param bytes - File size in bytes
 * @returns Formatted file size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get relative time (e.g., "2 hours ago")
 * @param date - Date to compare
 * @returns Relative time string
 */
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`
  if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`
  return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`
}