/**
 * Event Status Constants
 * 
 * Defines all possible event statuses with their configurations,
 * display names, colors, and available actions.
 * 
 * @module EventStatusConstants
 */

export const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const

export type EventStatus = typeof EVENT_STATUS[keyof typeof EVENT_STATUS]

// Status configuration for UI display
export const EVENT_STATUS_CONFIG: Record<EventStatus, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
  description: string
  allowedActions: string[]
}> = {
  [EVENT_STATUS.DRAFT]: {
    label: 'Draft',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    icon: '📝',
    description: 'Event is not visible to the public. Only you can see it.',
    allowedActions: ['edit', 'delete', 'publish'],
  },
  [EVENT_STATUS.PUBLISHED]: {
    label: 'Published',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    icon: '✅',
    description: 'Event is live and visible to the public. Tickets can be purchased.',
    allowedActions: ['edit', 'unpublish', 'cancel', 'view'],
  },
  [EVENT_STATUS.CANCELLED]: {
    label: 'Cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    icon: '❌',
    description: 'Event has been cancelled. No further ticket sales allowed.',
    allowedActions: ['delete', 'view'],
  },
  [EVENT_STATUS.COMPLETED]: {
    label: 'Completed',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    icon: '🏁',
    description: 'Event has passed. Check-in is closed.',
    allowedActions: ['view', 'analytics'],
  },
}

// Status transition rules
export const STATUS_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  [EVENT_STATUS.DRAFT]: [EVENT_STATUS.PUBLISHED, EVENT_STATUS.CANCELLED],
  [EVENT_STATUS.PUBLISHED]: [EVENT_STATUS.CANCELLED, EVENT_STATUS.COMPLETED],
  [EVENT_STATUS.CANCELLED]: [EVENT_STATUS.DRAFT],
  [EVENT_STATUS.COMPLETED]: [],
}

// Check if status transition is allowed
export const canTransition = (from: EventStatus, to: EventStatus): boolean => {
  return STATUS_TRANSITIONS[from]?.includes(to) || false
}

// Get available statuses for dropdown
export const getAvailableStatuses = (currentStatus: EventStatus): EventStatus[] => {
  return [currentStatus, ...STATUS_TRANSITIONS[currentStatus]]
}