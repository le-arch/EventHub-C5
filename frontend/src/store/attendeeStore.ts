/**
 * Attendee Store
 * 
 * Zustand store for managing attendee data state.
 * Handles fetching, filtering, searching, and check-in operations.
 * 
 * @module AttendeeStore
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import api from '@/src/lib/api'
import { toast } from 'sonner'

// Types
interface Attendee {
  id: string
  name: string
  phone: string
  ticketType: string
  quantity: number
  unitPrice: number
  totalPaid: number
  checkedIn: boolean
  checkedInAt: string | null
  purchasedAt: string
}

interface AttendeeFilters {
  ticketType: string
  checkInStatus: 'all' | 'checked_in' | 'not_checked'
  dateFrom: string
  dateTo: string
}

interface AttendeeState {
  // State
  attendees: Attendee[]
  filteredAttendees: Attendee[]
  isLoading: boolean
  error: string | null
  searchTerm: string
  filters: AttendeeFilters
  page: number
  pageSize: number
  totalCount: number
  ticketTypes: string[]
  
  // Computed
  summary: {
    totalAttendees: number
    checkedInCount: number
    notCheckedInCount: number
    checkInPercentage: number
    totalRevenue: number
  }
  
  // Actions
  setSearchTerm: (term: string) => void
  setFilters: (filters: Partial<AttendeeFilters>) => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  fetchAttendees: (eventId: string) => Promise<void>
  checkInAttendee: (attendeeId: string) => Promise<boolean>
  exportAttendees: (eventId: string) => Promise<void>
  reset: () => void
}

// Initial state
const initialState = {
  attendees: [],
  filteredAttendees: [],
  isLoading: false,
  error: null,
  searchTerm: '',
  filters: {
    ticketType: 'all',
    checkInStatus: 'all',
    dateFrom: '',
    dateTo: '',
  },
  page: 1,
  pageSize: 20,
  totalCount: 0,
  ticketTypes: [],
  summary: {
    totalAttendees: 0,
    checkedInCount: 0,
    notCheckedInCount: 0,
    checkInPercentage: 0,
    totalRevenue: 0,
  },
}

export const useAttendeeStore = create<AttendeeState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setSearchTerm: (term: string) => {
        set({ searchTerm: term, page: 1 })
        // Re-fetch with new search term would happen in component
      },

      setFilters: (filters: Partial<AttendeeFilters>) => {
        set({ filters: { ...get().filters, ...filters }, page: 1 })
      },

      setPage: (page: number) => {
        set({ page })
      },

      setPageSize: (size: number) => {
        set({ pageSize: size, page: 1 })
      },

      fetchAttendees: async (eventId: string) => {
        const { page, pageSize, searchTerm, filters } = get()
        
        set({ isLoading: true, error: null })
        
        try {
          const response = await api.get(`/events/${eventId}/attendees`, {
            params: {
              page,
              limit: pageSize,
              search: searchTerm || undefined,
              ticketType: filters.ticketType !== 'all' ? filters.ticketType : undefined,
              checkedIn: filters.checkInStatus !== 'all' 
                ? filters.checkInStatus === 'checked_in' 
                : undefined,
              dateFrom: filters.dateFrom || undefined,
              dateTo: filters.dateTo || undefined,
            },
          })
          
          const attendees = response.data.attendees
          const totalCount = response.data.total
          
          // Calculate summary
          const totalAttendees = attendees.length
          const checkedInCount = attendees.filter((a: Attendee) => a.checkedIn).length
          const totalRevenue = attendees.reduce((sum: number, a: Attendee) => sum + a.totalPaid, 0)
          
          // Extract unique ticket types
          const ticketTypes = [...new Set(attendees.map((a: Attendee) => a.ticketType))]
          
          set({
            attendees,
            filteredAttendees: attendees,
            totalCount,
            ticketTypes,
            summary: {
              totalAttendees,
              checkedInCount,
              notCheckedInCount: totalAttendees - checkedInCount,
              checkInPercentage: totalAttendees > 0 ? (checkedInCount / totalAttendees) * 100 : 0,
              totalRevenue,
            },
            isLoading: false,
          })
        } catch (error: any) {
          const message = error.response?.data?.error || 'Failed to load attendees'
          set({ error: message, isLoading: false })
          toast.error(message)
        }
      },

      checkInAttendee: async (attendeeId: string) => {
        try {
          const response = await api.post(`/attendees/${attendeeId}/checkin`)
          
          // Update local state
          set((state) => ({
            attendees: state.attendees.map((a) =>
              a.id === attendeeId
                ? { ...a, checkedIn: true, checkedInAt: new Date().toISOString() }
                : a
            ),
            filteredAttendees: state.filteredAttendees.map((a) =>
              a.id === attendeeId
                ? { ...a, checkedIn: true, checkedInAt: new Date().toISOString() }
                : a
            ),
            summary: {
              ...state.summary,
              checkedInCount: state.summary.checkedInCount + 1,
              notCheckedInCount: state.summary.notCheckedInCount - 1,
              checkInPercentage: state.summary.totalAttendees > 0
                ? ((state.summary.checkedInCount + 1) / state.summary.totalAttendees) * 100
                : 0,
            },
          }))
          
          toast.success('Attendee checked in successfully')
          return true
        } catch (error: any) {
          const message = error.response?.data?.error || 'Failed to check in attendee'
          toast.error(message)
          return false
        }
      },

      exportAttendees: async (eventId: string) => {
        try {
          const response = await api.get(`/events/${eventId}/attendees/export`, {
            responseType: 'blob',
          })
          
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', `attendees_${eventId}.csv`)
          document.body.appendChild(link)
          link.click()
          link.remove()
          window.URL.revokeObjectURL(url)
          
          toast.success('Attendees exported successfully')
        } catch (error) {
          toast.error('Failed to export attendees')
        }
      },

      reset: () => {
        set(initialState)
      },
    }),
    { name: 'AttendeeStore' }
  )
)