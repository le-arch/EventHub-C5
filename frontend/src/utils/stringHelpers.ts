/**
 * String Helpers
 * 
 * Utility functions for string manipulation and formatting.
 * 
 * @module StringHelpers
 */

/**
 * Generate a random string of specified length
 * @param length - Length of the random string
 * @returns Random alphanumeric string
 */
export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generate a random OTP (numeric)
 * @param length - Length of the OTP (default: 6)
 * @returns Random numeric OTP string
 */
export const generateOTP = (length: number = 6): string => {
  const chars = '0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Slugify a string for URLs
 * @param text - Text to slugify
 * @returns URL-friendly slug
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')       // Remove non-word characters
    .replace(/\-\-+/g, '-')         // Replace multiple hyphens with single
    .replace(/^-+/, '')             // Remove leading hyphens
    .replace(/-+$/, '')             // Remove trailing hyphens
}

/**
 * Convert a slug back to readable text
 * @param slug - Slug to unslugify
 * @returns Readable text
 */
export const unslugify = (slug: string): string => {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Extract initials from a name
 * @param name - Full name
 * @param maxInitials - Maximum number of initials (default: 2)
 * @returns Initials (e.g., "JD" for "John Doe")
 */
export const getInitials = (name: string, maxInitials: number = 2): string => {
  if (!name) return '?'
  
  const words = name.trim().split(/\s+/)
  let initials = ''
  
  for (let i = 0; i < Math.min(words.length, maxInitials); i++) {
    if (words[i].length > 0) {
      initials += words[i][0].toUpperCase()
    }
  }
  
  return initials || '?'
}

/**
 * Truncate a string to a maximum length
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated string
 */
export const truncate = (str: string, maxLength: number, suffix: string = '...'): string => {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - suffix.length).trim() + suffix
}

/**
 * Check if a string is empty or only whitespace
 * @param str - String to check
 * @returns True if string is empty or whitespace only
 */
export const isEmpty = (str: string | null | undefined): boolean => {
  return !str || str.trim().length === 0
}

/**
 * Capitalize each word in a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return ''
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Convert camelCase to readable text
 * @param str - CamelCase string
 * @returns Readable text
 */
export const camelToText = (str: string): string => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim()
}

/**
 * Convert snake_case to readable text
 * @param str - Snake case string
 * @returns Readable text
 */
export const snakeToText = (str: string): string => {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Mask sensitive data (e.g., phone numbers, emails)
 * @param str - String to mask
 * @param visibleStart - Number of visible characters at start (default: 3)
 * @param visibleEnd - Number of visible characters at end (default: 2)
 * @returns Masked string
 */
export const maskString = (str: string, visibleStart: number = 3, visibleEnd: number = 2): string => {
  if (!str || str.length <= visibleStart + visibleEnd) {
    return '*'.repeat(Math.min(str.length, 8))
  }
  
  const start = str.slice(0, visibleStart)
  const end = str.slice(-visibleEnd)
  const middleLength = str.length - visibleStart - visibleEnd
  const masked = '*'.repeat(Math.min(middleLength, 8))
  
  return `${start}${masked}${end}`
}

/**
 * Escape HTML special characters
 * @param str - String to escape
 * @returns HTML-escaped string
 */
export const escapeHtml = (str: string): string => {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return str.replace(/[&<>"']/g, (char) => htmlEscapeMap[char])
}

/**
 * Count words in a string
 * @param str - String to count words in
 * @returns Number of words
 */
export const wordCount = (str: string): number => {
  if (!str) return 0
  return str.trim().split(/\s+/).length
}

/**
 * Extract domain from email
 * @param email - Email address
 * @returns Domain name
 */
export const extractEmailDomain = (email: string): string => {
  const parts = email.split('@')
  return parts.length > 1 ? parts[1] : ''
}

/**
 * Generate a color from a string (for avatars)
 * @param str - String to generate color from
 * @returns HSL color string
 */
export const stringToColor = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)
  return `hsl(${hue}, 70%, 60%)`
}