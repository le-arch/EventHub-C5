/**
 * useAttendees Hook
 * 
 * Manages attendee data including fetching, searching, filtering, and check-in.
 * Provides pagination and export functionality.
 * 
 * @module useAttendees
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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

interface UseAttendeesOptions {
  eventId: string
  initialPageSize?: number
  autoFetch?: boolean
}

export function useAttendees({ eventId, initialPageSize = 20, autoFetch = true }: UseAttendeesOptions) {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [filteredAttendees, setFilteredAttendees] = useState<Attendee[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    ticketType: 'all',
    checkInStatus: 'all' as 'all' | 'checked_in' | 'not_checked',
    dateFrom: '',
    dateTo: '',
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [totalCount, setTotalCount] = useState(0)

  // Fetch attendees
  const fetchAttendees = useCallback(async () => {
    if (!eventId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.get(`/events/${eventId}/attendees`, {
        params: {
          page,
          limit: pageSize,
          search: searchTerm,
          ticketType: filters.ticketType !== 'all' ? filters.ticketType : undefined,
          checkedIn: filters.checkInStatus !== 'all' ? filters.checkInStatus === 'checked_in' : undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
        },
      })
      
      setAttendees(response.data.attendees)
      setFilteredAttendees(response.data.attendees)
      setTotalCount(response.data.total)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to load attendees'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [eventId, page, pageSize, searchTerm, filters])

  // Apply local filters and search
  const applyLocalFilters = useCallback(() => {
    let filtered = [...attendees]

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(term) ||
          a.phone.includes(term)
      )
    }

    // Apply ticket type filter
    if (filters.ticketType !== 'all') {
      filtered = filtered.filter((a) => a.ticketType === filters.ticketType)
    }

    // Apply check-in status filter
    if (filters.checkInStatus !== 'all') {
      filtered = filtered.filter((a) =>
        filters.checkInStatus === 'checked_in' ? a.checkedIn : !a.checkedIn
      )
    }

    setFilteredAttendees(filtered)
  }, [attendees, searchTerm, filters])

  // Check-in an attendee
  const checkInAttendee = useCallback(async (attendeeId: string) => {
    try {
      const response = await api.post(`/attendees/${attendeeId}/checkin`)
      toast.success('Attendee checked in successfully')
      
      // Update local state
      setAttendees((prev) =>
        prev.map((a) =>
          a.id === attendeeId
            ? { ...a, checkedIn: true, checkedInAt: new Date().toISOString() }
            : a
        )
      )
      
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to check in attendee'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  // Export attendees to CSV
  const exportAttendees = useCallback(async () => {
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
    } catch (err) {
      toast.error('Failed to export attendees')
    }
  }, [eventId])

  // Get unique ticket types for filter
  const ticketTypes = useMemo(() => {
    const types = new Set(attendees.map((a) => a.ticketType))
    return Array.from(types)
  }, [attendees])

  // Get summary statistics
  const summary = useMemo(() => {
    const totalAttendees = attendees.length
    const checkedInCount = attendees.filter((a) => a.checkedIn).length
    const totalRevenue = attendees.reduce((sum, a) => sum + a.totalPaid, 0)
    
    return {
      totalAttendees,
      checkedInCount,
      notCheckedInCount: totalAttendees - checkedInCount,
      checkInPercentage: totalAttendees > 0 ? (checkedInCount / totalAttendees) * 100 : 0,
      totalRevenue,
    }
  }, [attendees])

  // Auto-fetch on dependency changes
  useEffect(() => {
    if (autoFetch && eventId) {
      fetchAttendees()
    }
  }, [autoFetch, eventId, fetchAttendees])

  // Apply local filters when dependencies change
  useEffect(() => {
    applyLocalFilters()
  }, [attendees, searchTerm, filters, applyLocalFilters])

  return {
    attendees: filteredAttendees,
    allAttendees: attendees,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
    ticketTypes,
    summary,
    checkInAttendee,
    exportAttendees,
    refresh: fetchAttendees,
  }
}