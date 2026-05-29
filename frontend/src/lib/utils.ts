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

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-CM', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatTime(time: string): string {
  // body...
  return new Intl.DateTimeFormat('en-CM', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(`2026-01-01T${time}`))
}

export function generateUUID(): string {
  return crypto.randomUUID()
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
}