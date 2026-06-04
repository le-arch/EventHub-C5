/**
 * Store Index
 * 
 * Central export point for all Zustand stores.
 * 
 * @module StoreIndex
 */

// Export all stores
export { useAttendeeStore } from './attendeeStore'
export { useAuthStore } from './authStore'
export { useCheckinStore } from './checkinStore'
export { useEventStore } from './eventStore'
export { useUIStore, useConfirmationModal, usePaymentModal } from './uiStore'

// Export types for convenience
export type { Attendee } from './attendeeStore'
export type { User } from './authStore'
export type { CheckinResult } from './checkinStore'
export type { Event, TicketType, CreateEventData } from './eventStore'
export type { ModalState } from './uiStore'

// Re-export constants from lib
export { STORAGE_KEYS, HTTP_STATUS } from '@/lib/constant'