/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Event Store
 * 
 * Zustand store for managing event data state.
 * Handles fetching, creating, updating, and deleting events.
 * 
 * @module EventStore
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import api from '@/lib/api'
import { toast } from 'sonner'

// Types

export interface CapacityRange {
  lower: number;
  upper: number;
}

export interface TicketType {
  id: string
  name: string
  price: number
  quantityAvailable: number
  quantitySold: number
}

export interface Event {
  id: string
  title: string
  description: string | null
  venue: string
  city: string
  startDate: string
  endDate: string | null
  startTime: string
  endTime: string | null
  coverImageUrl: string | null
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  capacityRange?: CapacityRange
  ticketStats: {
    totalSold: number
    totalRevenue: number
    totalAttendees: number
  }
  createdAt: string
  updatedAt: string
}

export interface CreateEventData {
  title: string
  description?: string
  venue?: string
  city: string
  startDate: string
  startTime: string
  endDate?: string
  endTime?: string
  coverImage?: File
  ticketTypes: Omit<TicketType, 'id' | 'quantitySold'>[]
  capacityRange?: CapacityRange
}

interface EventState {
  // State
  events: Event[]
  currentEvent: Event | null
  ticketTypes: TicketType[]
  isLoading: boolean
  error: string | null
  page: number
  pageSize: number
  totalCount: number
  searchTerm: string
  statusFilter: string
  
  // Actions
  setSearchTerm: (term: string) => void
  setStatusFilter: (filter: string) => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  fetchEvents: () => Promise<void>
  fetchEvent: (eventId: string) => Promise<Event | null>
  fetchTicketTypes: (eventId: string) => Promise<TicketType[]>
  createEvent: (data: CreateEventData) => Promise<Event | null>
  updateEvent: (eventId: string, data: Partial<CreateEventData>) => Promise<Event | null>
  deleteEvent: (eventId: string) => Promise<boolean>
  publishEvent: (eventId: string) => Promise<boolean>
  unpublishEvent: (eventId: string) => Promise<boolean>
  duplicateEvent: (eventId: string) => Promise<Event | null>
  reset: () => void
}

// Initial state
const initialState = {
  events: [],
  currentEvent: null,
  ticketTypes: [],
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 10,
  totalCount: 0,
  searchTerm: '',
  statusFilter: 'all',
}

export const useEventStore = create<EventState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setSearchTerm: (term: string) => {
        set({ searchTerm: term, page: 1 })
      },

      setStatusFilter: (filter: string) => {
        set({ statusFilter: filter, page: 1 })
      },

      setPage: (page: number) => {
        set({ page })
      },

      setPageSize: (size: number) => {
        set({ pageSize: size, page: 1 })
      },

      fetchEvents: async () => {
        const { page, pageSize, searchTerm, statusFilter } = get()
        
        set({ isLoading: true, error: null })
        
        try {
          const response = await api.get('/Organization/events', {
            params: {
              page,
              limit: pageSize,
              search: searchTerm || undefined,
              status: statusFilter !== 'all' ? statusFilter : undefined,
            },
          })
          
          const events = Array.isArray(response.data) ? response.data : []
          set({
            events,
            totalCount: events.length,
            isLoading: false,
          })
        } catch (error: any) {
          const message = error.response?.data?.error || 'Failed to load events'
          set({ error: message, isLoading: false })
          toast.error(message)
        }
      },

      fetchEvent: async (eventId: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await api.get(`/Organization/${eventId}`)
          set({ currentEvent: response.data, isLoading: false })
          return response.data
        } catch (error: any) {
          const message = error.response?.data?.error || 'Failed to load event'
          set({ error: message, isLoading: false })
          toast.error(message)
          return null
        }
      },

      fetchTicketTypes: async (eventId: string) => {
        try {
          const response = await api.get(`/events/${eventId}/ticket-types`)
          const types = Array.isArray(response.data) ? response.data : []
          set({ ticketTypes: types })
          return types
        } catch (error) {
          toast.error('Failed to load ticket types')
          return []
        }
      },

     createEvent: async (data: CreateEventData) => {
        set({ isLoading: true, error: null })
        try {
          const formData = new FormData()
          const toSnakeKey = (k: string) => k.replace(/([A-Z])/g, '_$1').toLowerCase()

          formData.append(toSnakeKey('title'), data.title)
          if (data.description) formData.append(toSnakeKey('description'), data.description)
          if (data.venue) formData.append(toSnakeKey('venue'), data.venue)
         // if (data.venueAddress) formData.append(toSnakeKey('venueAddress'), data.venueAddress)
          formData.append(toSnakeKey('city'), data.city)
          formData.append(toSnakeKey('startDate'), data.startDate)
          formData.append(toSnakeKey('startTime'), data.startTime)
          if (data.endDate) formData.append(toSnakeKey('endDate'), data.endDate)
          if (data.endTime) formData.append(toSnakeKey('endTime'), data.endTime)
          if (data.coverImage) formData.append(toSnakeKey('coverImage'), data.coverImage)
          formData.append(toSnakeKey('ticketTypes'), JSON.stringify(data.ticketTypes))

          // NEW: append capacity range as JSON string
          if (data.capacityRange) {
            formData.append(toSnakeKey('capacityRange'), JSON.stringify(data.capacityRange))
          }
          
          const response = await api.post('/events', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          
          set({ isLoading: false })
          toast.success('Event created successfully!')
          return response.data.event
        } catch (error: any) {
          const message = error.response?.data?.error || 'Failed to create event'
          set({ error: message, isLoading: false })
          toast.error(message)
          return null
        }
      },

      updateEvent: async (eventId: string, data: Record<string, unknown>) => {
        set({ isLoading: true, error: null })
        
        try {
          const payload: Record<string, unknown> = {}
          if (data.title !== undefined) payload.title = data.title
          if (data.description !== undefined) payload.description = data.description
          if (data.venue !== undefined) payload.venue = data.venue
          if (data.city !== undefined) payload.city = data.city
          if (data.startDate !== undefined) payload.start_date = data.startDate
          if (data.startTime !== undefined) payload.start_time = data.startTime
          if (data.endTime !== undefined) payload.end_time = data.endTime
          if (data.status !== undefined) payload.status = data.status
          if (data.capacityRange !== undefined) payload.capacity_range = data.capacityRange

          const response = await api.patch(`/events/${eventId}`, payload)
          
          set({ isLoading: false })
          toast.success('Event updated successfully!')
          return response.data
        } catch (error: any) {
          const message = error.response?.data?.error || 'Failed to update event'
          set({ error: message, isLoading: false })
          toast.error(message)
          return null
        }
      },

      deleteEvent: async (eventId: string) => {
        set({ isLoading: true, error: null })
        
        try {
          await api.delete(`/events/${eventId}`)
          set({ isLoading: false })
          toast.success('Event deleted successfully')
          return true
        } catch (error: any) {
          const message = error.response?.data?.error || 'Failed to delete event'
          set({ error: message, isLoading: false })
          toast.error(message)
          return false
        }
      },

      publishEvent: async (eventId: string) => {
        set({ isLoading: true })
        
        try {
          await api.patch(`/events/${eventId}/publish`)
          set({ isLoading: false })
          toast.success('Event published successfully!')
          return true
        } catch (error: any) {
          const message = error.response?.data?.error || 'Failed to publish event'
          set({ isLoading: false })
          toast.error(message)
          return false
        }
      },

      unpublishEvent: async (eventId: string) => {
        set({ isLoading: true })
        
        try {
          await api.patch(`/events/${eventId}/unpublish`)
          set({ isLoading: false })
          toast.success('Event unpublished')
          return true
        } catch (error) {
          toast.error('Failed to unpublish event')
          set({ isLoading: false })
          return false
        }
      },

      duplicateEvent: async (eventId: string) => {
        set({ isLoading: true })
        
        try {
          const response = await api.post(`/events/${eventId}/duplicate`)
          set({ isLoading: false })
          toast.success('Event duplicated successfully!')
          return response.data.event
        } catch (error) {
          toast.error('Failed to duplicate event')
          set({ isLoading: false })
          return null
        }
      },

      reset: () => {
        set(initialState)
      },
    }),
    { name: 'EventStore' }
  )
)