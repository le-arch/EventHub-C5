/**
 * Check-in Scanner Page
 * 
 * QR code scanner for checking in attendees at the event.
 * Features:
 * - Webcam-based QR scanning
 * - Real-time validation
 * - Success/error feedback
 * - Manual ticket ID entry as fallback
 * - Check-in history display
 * 
 * @module CheckinPage
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import QrScanner from '@yudiel/react-qr-scanner'
import { CheckCircle, XCircle, Camera, AlertCircle, ArrowLeft, Users, Calendar } from 'lucide-react'

// shadcn/ui components
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Skeleton } from '@/src/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'

// Utilities
import api from '@/src/lib/api'
import { toast } from 'sonner'
import { formatDate, formatTime } from '@/src/lib/utils'

interface Event {
  id: string
  title: string
  startDate: string
  startTime: string
  venueName: string
  city: string
}

interface CheckinResult {
  success: boolean
  attendeeName?: string
  ticketType?: string
  checkedInAt?: string
  error?: string
}

interface RecentCheckin {
  attendeeName: string
  ticketType: string
  checkedInAt: string
}

export default function CheckinPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [isScanning, setIsScanning] = useState(true)
  const [lastResult, setLastResult] = useState<CheckinResult | null>(null)
  const [recentCheckins, setRecentCheckins] = useState<RecentCheckin[]>([])
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualTicketId, setManualTicketId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [stats, setStats] = useState({ checkedIn: 0, total: 0, percentage: 0 })

  // Fetch event details and stats
  useEffect(() => {
    fetchEventAndStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchEventAndStats, 30000)
    return () => clearInterval(interval)
  }, [params.eventId])

  const fetchEventAndStats = async () => {
    try {
      const [eventRes, statsRes] = await Promise.all([
        api.get(`/events/${params.eventId}`),
        api.get(`/events/${params.eventId}/analytics`),
      ])
      
      setEvent(eventRes.data.event)
      setStats({
        checkedIn: statsRes.data.summary.checkedInCount,
        total: statsRes.data.summary.totalAttendees,
        percentage: statsRes.data.summary.checkInPercentage,
      })
      
      // Fetch recent check-ins
      const historyRes = await api.get(`/checkin/event/${params.eventId}/history?limit=10`)
      setRecentCheckins(historyRes.data.checkins)
    } catch (error) {
      toast.error('Failed to load event data')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle QR code scan
   */
  const handleScan = async (data: { text: string } | null) => {
    if (!data || !data.text || isProcessing) return
    
    setIsProcessing(true)
    try {
      const response = await api.post('/checkin', { qr_hash: data.text })
      const result = response.data
      
      setLastResult({
        success: true,
        attendeeName: result.data.attendee_name,
        ticketType: result.data.ticket_type,
        checkedInAt: result.data.checked_in_at,
      })
      
      // Add to recent checkins
      setRecentCheckins(prev => [
        {
          attendeeName: result.data.attendee_name,
          ticketType: result.data.ticket_type,
          checkedInAt: result.data.checked_in_at,
        },
        ...prev.slice(0, 9),
      ])
      
      // Update stats
      setStats(prev => ({
        ...prev,
        checkedIn: prev.checkedIn + 1,
        percentage: Math.round(((prev.checkedIn + 1) / prev.total) * 100),
      }))
      
      toast.success(`${result.data.attendee_name} checked in!`)
      
      // Clear result after 3 seconds
      setTimeout(() => setLastResult(null), 3000)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Invalid or already used ticket'
      setLastResult({
        success: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      setTimeout(() => setLastResult(null), 3000)
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Handle manual ticket ID entry
   */
  const handleManualCheckin = async () => {
    if (!manualTicketId) {
      toast.error('Please enter a ticket ID')
      return
    }
    
    setIsProcessing(true)
    try {
      const response = await api.post('/checkin', { ticket_id: manualTicketId })
      const result = response.data
      
      toast.success(`${result.data.attendee_name} checked in manually!`)
      setShowManualEntry(false)
      setManualTicketId('')
      fetchEventAndStats()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Invalid ticket ID')
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Handle scan error
   */
  const handleError = (error: any) => {
    console.error('QR Scanner error:', error)
    toast.error('Camera access failed. Please check permissions.')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/organizer/events')}
          className="mb-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Events
        </Button>
        <h1 className="text-2xl font-bold">Check-in Scanner</h1>
        <p className="text-gray-500">
          {event.title} • {formatDate(event.startDate)} at {formatTime(event.startTime)}
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p>
            <p className="text-xs text-gray-500">Checked In</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{stats.percentage}%</p>
            <p className="text-xs text-gray-500">Check-in Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${stats.percentage}%` }}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* QR Scanner - Main Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scan QR Code</CardTitle>
              <CardDescription>
                Position the attendee's QR code within the frame
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isScanning ? (
                <div className="relative">
                  <div className="aspect-square max-w-md mx-auto bg-black rounded-lg overflow-hidden">
                    <QrScanner
                      delay={300}
                      onError={handleError}
                      onScan={handleScan}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-2 border-primary rounded-lg shadow-lg" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Camera is disabled</p>
                  <Button
                    variant="outline"
                    onClick={() => setIsScanning(true)}
                    className="mt-4"
                  >
                    Enable Camera
                  </Button>
                </div>
              )}

              {/* Scan Result Feedback */}
              {lastResult && (
                <div className={`mt-4 p-4 rounded-lg ${
                  lastResult.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-3">
                    {lastResult.success ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                    <div>
                      {lastResult.success ? (
                        <>
                          <p className="font-semibold text-green-800">
                            {lastResult.attendeeName} checked in!
                          </p>
                          <p className="text-sm text-green-600">
                            {lastResult.ticketType} • {lastResult.checkedInAt && formatTime(lastResult.checkedInAt)}
                          </p>
                        </>
                      ) : (
                        <p className="font-semibold text-red-800">
                          {lastResult.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowManualEntry(true)}
                  className="mt-2"
                >
                  Manual Ticket Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Check-ins Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Check-ins</CardTitle>
              <CardDescription>
                Last 10 attendees checked in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentCheckins.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No check-ins yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCheckins.map((checkin, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{checkin.attendeeName}</p>
                        <p className="text-xs text-gray-500">{checkin.ticketType}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {formatTime(checkin.checkedInAt)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Manual Entry Dialog */}
      <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Ticket Entry</DialogTitle>
            <DialogDescription>
              Enter the ticket ID or QR code value manually
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ticketId">Ticket ID / QR Code</Label>
              <Input
                id="ticketId"
                placeholder="Enter ticket code..."
                value={manualTicketId}
                onChange={(e) => setManualTicketId(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualEntry(false)}>
              Cancel
            </Button>
            <Button onClick={handleManualCheckin} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Check In'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}