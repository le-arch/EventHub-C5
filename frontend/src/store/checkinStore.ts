/**
 * Check-in Store
 * 
 * Zustand store for managing check-in scanning state.
 * Handles QR code processing, manual entry, and recent check-ins.
 * 
 * @module CheckinStore
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import api from '@/lib/api'
import { toast } from 'sonner'

// Types
interface CheckinResult {
  success: boolean
  attendeeName?: string
  ticketType?: string
  checkedInAt?: string
  error?: string
}

interface CheckinState {
  // State
  isProcessing: boolean
  lastResult: CheckinResult | null
  recentCheckins: CheckinResult[]
  stats: {
    checkedIn: number
    total: number
    percentage: number
  }
  
  // Actions
  processQRCode: (eventId: string, qrData: string) => Promise<CheckinResult>
  manualCheckin: (eventId: string, ticketId: string) => Promise<CheckinResult>
  fetchCheckinStats: (eventId: string) => Promise<void>
  fetchRecentCheckins: (eventId: string) => Promise<void>
  resetLastResult: () => void
  clearStats: () => void
}

// Initial state
const initialState = {
  isProcessing: false,
  lastResult: null,
  recentCheckins: [],
  stats: {
    checkedIn: 0,
    total: 0,
    percentage: 0,
  },
}

export const useCheckinStore = create<CheckinState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      processQRCode: async (eventId: string, qrData: string) => {
        if (get().isProcessing) {
          return { success: false, error: 'Already processing' }
        }
        
        set({ isProcessing: true, lastResult: null })
        
        try {
          const response = await api.post('/checkin', {
            event_id: eventId,
            qr_hash: qrData,
          })
          
          const result: CheckinResult = {
            success: true,
            attendeeName: response.data.attendee_name,
            ticketType: response.data.ticket_type,
            checkedInAt: response.data.checked_in_at,
          }
          
          // Update recent checkins
          set((state) => ({
            lastResult: result,
            recentCheckins: [result, ...state.recentCheckins.slice(0, 9)],
            stats: {
              ...state.stats,
              checkedIn: state.stats.checkedIn + 1,
              percentage: state.stats.total > 0
                ? ((state.stats.checkedIn + 1) / state.stats.total) * 100
                : 0,
            },
            isProcessing: false,
          }))
          
          return result
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Invalid or already used ticket'
          const result: CheckinResult = {
            success: false,
            error: errorMessage,
          }
          
          set({ lastResult: result, isProcessing: false })
          return result
        }
      },

      manualCheckin: async (eventId: string, ticketId: string) => {
        if (get().isProcessing || !ticketId.trim()) {
          return { success: false, error: 'Invalid ticket ID' }
        }
        
        set({ isProcessing: true, lastResult: null })
        
        try {
          const response = await api.post('/checkin/manual', {
            event_id: eventId,
            ticket_id: ticketId,
          })
          
          const result: CheckinResult = {
            success: true,
            attendeeName: response.data.attendee_name,
            ticketType: response.data.ticket_type,
            checkedInAt: response.data.checked_in_at,
          }
          
          set((state) => ({
            lastResult: result,
            recentCheckins: [result, ...state.recentCheckins.slice(0, 9)],
            stats: {
              ...state.stats,
              checkedIn: state.stats.checkedIn + 1,
              percentage: state.stats.total > 0
                ? ((state.stats.checkedIn + 1) / state.stats.total) * 100
                : 0,
            },
            isProcessing: false,
          }))
          
          return result
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Invalid ticket ID'
          const result: CheckinResult = {
            success: false,
            error: errorMessage,
          }
          
          set({ lastResult: result, isProcessing: false })
          return result
        }
      },

      fetchCheckinStats: async (eventId: string) => {
        try {
          const response = await api.get(`/events/${eventId}/checkin-stats`)
          set({
            stats: {
              checkedIn: response.data.checked_in,
              total: response.data.total,
              percentage: response.data.percentage,
            },
          })
        } catch (error) {
          console.error('Failed to fetch check-in stats:', error)
        }
      },

      fetchRecentCheckins: async (eventId: string) => {
        try {
          const response = await api.get(`/events/${eventId}/recent-checkins`)
          set({ recentCheckins: response.data.checkins })
        } catch (error) {
          console.error('Failed to fetch recent check-ins:', error)
        }
      },

      resetLastResult: () => {
        set({ lastResult: null })
      },

      clearStats: () => {
        set({ stats: initialState.stats })
      },
    }),
    { name: 'CheckinStore' }
  )
)