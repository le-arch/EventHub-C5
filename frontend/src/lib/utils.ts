import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CM', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format a date string to a readable date.
 * Returns "Invalid date" if the input is not a valid date.
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—' // or 'Invalid date'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—' // Invalid date
  return new Intl.DateTimeFormat('en-CM', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * Format a time string (HH:mm:ss) to a readable time (e.g., "6:00 PM").
 * Returns "—" if the time is invalid.
 */
export function formatTime(time: string | null | undefined): string {
  if (!time) return '—'
  // Try to construct a date with a dummy date
  const d = new Date(`2000-01-01T${time}`)
  if (isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-CM', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d)
}

export function generateUUID(): string {
  return crypto.randomUUID()
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}