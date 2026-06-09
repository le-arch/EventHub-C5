/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * useEvents Hook
 * 
 * Manages event data including fetching, creating, updating, and deleting events.
 * Provides pagination, search, and filtering capabilities.
 * 
 * @module useEvents
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// Types
interface Event {
  id: string
  title: string
  description: string | null
  venueName: string
  venueAddress: string | null
  city: string
  startDate: string
  endDate: string | null
  startTime: string
  endTime: string | null
  coverImageUrl: string | null
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  ticketStats: {
    totalSold: number
    totalRevenue: number
    totalAttendees: number
  }
  createdAt: string
  updatedAt: string
}

interface TicketType {
  id: string
  name: string
  price: number
  quantityAvailable: number
  quantitySold: number
}

interface CreateEventData {
  title: string
  description?: string
  venueName: string
  venueAddress?: string
  city: string
  startDate: string
  startTime: string
  endDate?: string
  endTime?: string
  coverImage?: File
  ticketTypes: Omit<TicketType, 'id' | 'quantitySold'>[]
}

interface UseEventsOptions {
  autoFetch?: boolean
  pageSize?: number
}

export function useEvents({ autoFetch = true, pageSize = 10 }: UseEventsOptions = {}) {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Fetch all events
  const fetchEvents = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.get('/events', {
        params: {
          page,
          limit: pageSize,
          search: searchTerm || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        },
      })
      
      setEvents(response.data.events)
      setTotalCount(response.data.total)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to load events'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, searchTerm, statusFilter])

  // Get single event by ID
  const getEvent = useCallback(async (eventId: string) => {
    setIsLoading(true)
    try {
      const response = await api.get(`/events/${eventId}`)
      return response.data.event
    } catch (err: any) {
      toast.error('Failed to load event details')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get ticket types for an event
  const getTicketTypes = useCallback(async (eventId: string) => {
    try {
      const response = await api.get(`/events/${eventId}/tickets`)
      return response.data.ticket_types
    } catch (err) {
      toast.error('Failed to load ticket types')
      return []
    }
  }, [])

  // Create new event
  const createEvent = useCallback(async (data: CreateEventData) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      
      // Append event data
      formData.append('title', data.title)
      if (data.description) formData.append('description', data.description)
      formData.append('venueName', data.venueName)
      if (data.venueAddress) formData.append('venueAddress', data.venueAddress)
      formData.append('city', data.city)
      formData.append('startDate', data.startDate)
      formData.append('startTime', data.startTime)
      if (data.endDate) formData.append('endDate', data.endDate)
      if (data.endTime) formData.append('endTime', data.endTime)
      if (data.coverImage) formData.append('coverImage', data.coverImage)
      formData.append('ticketTypes', JSON.stringify(data.ticketTypes))

      const response = await api.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      
      toast.success('Event created successfully!')
      router.push(`/organizer/events/${response.data.event.id}`)
      return response.data.event
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to create event'
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // Update existing event
  const updateEvent = useCallback(async (eventId: string, data: Partial<CreateEventData>) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'ticketTypes') {
            formData.append(key, JSON.stringify(value))
          } else if (key === 'coverImage' && value instanceof File) {
            formData.append(key, value)
          } else if (typeof value === 'string') {
            formData.append(key, value)
          }
        }
      })

      const response = await api.put(`/events/${eventId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      
      toast.success('Event updated successfully!')
      return response.data.event
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to update event'
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Delete event
  const deleteEvent = useCallback(async (eventId: string) => {
    setIsLoading(true)
    try {
      await api.delete(`/events/${eventId}`)
      toast.success('Event deleted successfully')
      setEvents((prev) => prev.filter((e) => e.id !== eventId))
      return true
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to delete event'
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Publish event
  const publishEvent = useCallback(async (eventId: string) => {
    setIsLoading(true)
    try {
      await api.post(`/events/${eventId}/publish`)
      toast.success('Event published successfully!')
      await fetchEvents()
      return true
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to publish event'
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [fetchEvents])

  // Unpublish event
  const unpublishEvent = useCallback(async (eventId: string) => {
    setIsLoading(true)
    try {
      await api.post(`/events/${eventId}/unpublish`)
      toast.success('Event unpublished')
      await fetchEvents()
      return true
    } catch (err: any) {
      toast.error('Failed to unpublish event')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [fetchEvents])

  // Duplicate event
  const duplicateEvent = useCallback(async (eventId: string) => {
    setIsLoading(true)
    try {
      const response = await api.post(`/events/${eventId}/duplicate`)
      toast.success('Event duplicated successfully!')
      await fetchEvents()
      return response.data.event
    } catch (err: any) {
      toast.error('Failed to duplicate event')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [fetchEvents])

  // Auto-fetch on mount and dependency changes
  useEffect(() => {
    if (!autoFetch) return

    const timer = setTimeout(() => {
      fetchEvents()
    }, 0)

    return () => clearTimeout(timer)
  }, [autoFetch, fetchEvents])

  return {
    events,
    isLoading,
    error,
    page,
    setPage,
    totalCount,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    fetchEvents,
    getEvent,
    getTicketTypes,
    createEvent,
    updateEvent,
    deleteEvent,
    publishEvent,
    unpublishEvent,
    duplicateEvent,
  }
}