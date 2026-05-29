/**
 * useAnalytics Hook
 * 
 * Fetches and manages analytics data for an event.
 * Provides sales data, ticket breakdown, check-in statistics, and daily trends.
 * 
 * @module useAnalytics
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/src/lib/api'
import { toast } from 'sonner'

// Types
interface DailySalesData {
  date: string
  tickets: number
  revenue: number
}

interface TicketBreakdown {
  name: string
  sold: number
  revenue: number
  percentage: number
}

interface RecentCheckin {
  id: string
  attendeeName: string
  ticketType: string
  checkedInAt: string
}

interface EventAnalytics {
  totalTickets: number
  totalRevenue: number
  checkinCount: number
  checkinPercentage: number
  dailySales: DailySalesData[]
  ticketBreakdown: TicketBreakdown[]
  recentCheckins: RecentCheckin[]
}

interface UseAnalyticsOptions {
  eventId: string
  autoFetch?: boolean
}

export function useAnalytics({ eventId, autoFetch = true }: UseAnalyticsOptions) {
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    if (!eventId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.get(`/events/${eventId}/analytics`)
      setAnalytics(response.data)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to load analytics'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [eventId])

  const refresh = useCallback(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  useEffect(() => {
    if (autoFetch && eventId) {
      fetchAnalytics()
    }
  }, [autoFetch, eventId, fetchAnalytics])

  return {
    analytics,
    isLoading,
    error,
    refresh,
  }
}

// Hook for sales chart data only
export function useSalesData(eventId: string) {
  const { analytics, isLoading, error } = useAnalytics({ eventId })
  
  return {
    salesData: analytics?.dailySales || [],
    totalTickets: analytics?.totalTickets || 0,
    totalRevenue: analytics?.totalRevenue || 0,
    isLoading,
    error,
  }
}

// Hook for check-in statistics only
export function useCheckinStats(eventId: string) {
  const { analytics, isLoading, error } = useAnalytics({ eventId })
  
  return {
    checkedIn: analytics?.checkinCount || 0,
    total: analytics?.totalTickets || 0,
    percentage: analytics?.checkinPercentage || 0,
    recentCheckins: analytics?.recentCheckins || [],
    isLoading,
    error,
  }
}