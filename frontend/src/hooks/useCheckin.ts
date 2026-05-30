/**
 * useCheckin Hook
 * 
 * Manages check-in scanning logic including QR validation,
 * manual ticket entry, and check-in history.
 * 
 * @module useCheckin
 */

'use client'

import { useState, useCallback } from 'react'
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

interface UseCheckinOptions {
  eventId: string
  onSuccess?: (result: CheckinResult) => void
  onError?: (error: string) => void
}

export function useCheckin({ eventId, onSuccess, onError }: UseCheckinOptions) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastResult, setLastResult] = useState<CheckinResult | null>(null)
  const [recentCheckins, setRecentCheckins] = useState<CheckinResult[]>([])

  // Process QR code scan
  const processQRCode = useCallback(
    async (qrData: string) => {
      if (isProcessing) return

      setIsProcessing(true)
      setLastResult(null)

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

        setLastResult(result)
        setRecentCheckins((prev) => [result, ...prev.slice(0, 9)])
        onSuccess?.(result)
        toast.success(`${result.attendeeName} checked in successfully!`)

        return result
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Invalid or already used ticket'
        const result: CheckinResult = {
          success: false,
          error: errorMessage,
        }
        setLastResult(result)
        onError?.(errorMessage)
        toast.error(errorMessage)
        return result
      } finally {
        setIsProcessing(false)
      }
    },
    [eventId, isProcessing, onSuccess, onError]
  )

  // Manual check-in by ticket ID
  const manualCheckin = useCallback(
    async (ticketId: string) => {
      if (isProcessing || !ticketId.trim()) return

      setIsProcessing(true)

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

        setLastResult(result)
        setRecentCheckins((prev) => [result, ...prev.slice(0, 9)])
        onSuccess?.(result)
        toast.success(`${result.attendeeName} checked in manually!`)

        return result
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Invalid ticket ID'
        const result: CheckinResult = {
          success: false,
          error: errorMessage,
        }
        setLastResult(result)
        onError?.(errorMessage)
        toast.error(errorMessage)
        return result
      } finally {
        setIsProcessing(false)
      }
    },
    [eventId, isProcessing, onSuccess, onError]
  )

  // Fetch check-in history
  const fetchCheckinHistory = useCallback(async () => {
    try {
      const response = await api.get(`/events/${eventId}/checkins`)
      setRecentCheckins(response.data.checkins)
      return response.data.checkins
    } catch (error) {
      toast.error('Failed to load check-in history')
      return []
    }
  }, [eventId])

  // Reset last result (for clearing success/error messages)
  const resetLastResult = useCallback(() => {
    setLastResult(null)
  }, [])

  return {
    isProcessing,
    lastResult,
    recentCheckins,
    processQRCode,
    manualCheckin,
    fetchCheckinHistory,
    resetLastResult,
  }
}