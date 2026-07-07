/**
 * Check-in Scanner Page
 * 
 * QR code scanner for checking in attendees at the event.
 * Uses html5-qrcode for compatibility with React 19.
 * Features:
 * - Webcam-based QR scanning
 * - Real-time validation
 * - Success/error feedback
 * - Manual ticket ID entry as fallback
 * - Check-in history display
 * - Breadcrumb navigation
 * 
 * @module CheckinPage
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  CheckCircle, 
  XCircle, 
  Camera, 
  ArrowLeft, 
  Users, 
  Calendar,
  MapPin,
  Clock,
  QrCode,
  Smartphone
} from 'lucide-react'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { useQRScanner } from '@/hooks/useQRScanner'

// Utilities
import api from '@/lib/api'
import { toast } from 'sonner'
import { formatDate, formatTime } from '@/lib/utils'

interface Event {
  id: string
  title: string
  startDate: string
  startTime: string
  venue: string
  city: string
}

interface CheckinResult {
  id: string // Used to safely check frame contexts
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
  const eventId = params.eventId as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastResult, setLastResult] = useState<CheckinResult | null>(null)
  const [recentCheckins, setRecentCheckins] = useState<RecentCheckin[]>([])
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualTicketId, setManualTicketId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [stats, setStats] = useState({ checkedIn: 0, total: 0, percentage: 0 })

  // Keep a ref of the current flash timeout ID to overwrite overlapping frames
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // QR Scanner hook
  const {
    isScanning,
    hasCamera,
    error: scannerError,
    startScanning,
    stopScanning,
    requestCameraPermission,
    scannerId,
  } = useQRScanner({
    onScanSuccess: async (result) => {
      if (isProcessing) return
      
      setIsProcessing(true)
      const executionId = crypto.randomUUID()

      try {
        const response = await api.post('/checkin', { qr_hash: result, event_id: eventId })
        const payload = response.data

        const nextResult: CheckinResult = {
          id: executionId,
          success: true,
          attendeeName: payload.attendeeName || payload.attendee_name,
          ticketType: payload.ticketType || payload.ticket_type,
          checkedInAt: payload.checkedInAt || payload.checked_in_at,
        }

        setLastResult(nextResult)
        
        setRecentCheckins(prev => [
          {
            attendeeName: payload.attendeeName || payload.attendee_name,
            ticketType: payload.ticketType || payload.ticket_type,
            checkedInAt: payload.checkedInAt || payload.checked_in_at,
          },
          ...prev.slice(0, 9),
        ])
        
        setStats(prev => {
          const nextChecked = prev.checkedIn + 1
          return {
            ...prev,
            checkedIn: nextChecked,
            percentage: prev.total > 0 ? Math.round((nextChecked / prev.total) * 100) : 0,
          }
        })
        
        toast.success(`✅ ${payload.attendeeName || payload.attendee_name} checked in successfully!`)
        
        if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
        feedbackTimeoutRef.current = setTimeout(() => {
          setLastResult(current => current?.id === executionId ? null : current)
        }, 3000)

      } catch (error: any) {
        const errorMessage = error.response?.data?.error || '❌ Invalid or already used ticket'
        
        const fallbackResult: CheckinResult = {
          id: executionId,
          success: false,
          error: errorMessage,
        }

        setLastResult(fallbackResult)
        toast.error(errorMessage)

        if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
        feedbackTimeoutRef.current = setTimeout(() => {
          setLastResult(current => current?.id === executionId ? null : current)
        }, 3000)
      } finally {
        setIsProcessing(false)
      }
    },
    onScanError: (error) => {
      console.error('Scan error:', error)
    },
    fps: 10,
    qrbox: 250,
  })

  // Fetch baseline parameters on load and synchronize polling intervals safely
  useEffect(() => {
    fetchEventAndStats()
    
    const interval = setInterval(() => {
      fetchEventAndStats()
    }, 30000)

    return () => {
      clearInterval(interval)
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
    }
  }, [eventId])

  // Mount/Unmount controller for underlying hardware webcam engine
  useEffect(() => {
    if (hasCamera && !isScanning) {
      startScanning()
    }
    return () => {
      stopScanning()
    }
  }, [hasCamera, isScanning, startScanning, stopScanning])

  const fetchEventAndStats = async () => {
    try {
      const [eventRes, statsRes, historyRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/events/${eventId}/analytics`),
        api.get(`/events/${eventId}/recent-checkins`)
      ])
      
      setEvent(eventRes.data)
      const checkins = historyRes.data?.checkins ?? historyRes.data
      setRecentCheckins(Array.isArray(checkins) ? checkins : [])
      
      setStats({
        checkedIn: statsRes.data.checkinCount ?? 0,
        total: statsRes.data.totalTickets ?? 0,
        percentage: statsRes.data.checkinPercentage ?? 0,
      })
    } catch (error) {
      console.error('Failed to update tracking statistics parameters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManualCheckin = async () => {
    if (!manualTicketId.trim()) {
      toast.error('❌ Please enter a valid ticket ID')
      return
    }
    
    setIsProcessing(true)
    try {
      const response = await api.post('/checkin', { 
        qr_hash: manualTicketId.trim(),
        event_id: eventId,
      })
      
      toast.success(`✅ ${response.data.attendeeName || response.data.attendee_name} checked in manually!`)
      setShowManualEntry(false)
      setManualTicketId('')
      
      // Update UI records directly after validation
      await fetchEventAndStats()
    } catch (error: any) {
      toast.error(`❌ ${error.response?.data?.error || 'Invalid ticket ID'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Dashboard', href: '/organizer/events' },
          { label: 'Events', href: '/organizer/events' },
          { label: event.title, href: `/organizer/events/${event.id}` },
          { label: 'Check-in Scanner', href: '#', isActive: true },
        ]}
        showHome
      />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/organizer/events/${eventId}`)}
            className="-ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Event
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <QrCode className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Check-in Scanner 📷</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
              <Calendar className="h-3 w-3" />
              {formatDate(event.startDate)} at {formatTime(event.startTime)}
              <span className="mx-1">•</span>
              <MapPin className="h-3 w-3" />
              {event.venue}, {event.city}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p>
            <p className="text-xs text-muted-foreground">Checked In </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Users className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Tickets </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="mx-auto mb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">{stats.percentage}%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Check-in Rate </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Check-in Progress</span>
          <span className="font-medium">{stats.percentage}% complete</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* QR Scanner Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Scan QR Code
              </CardTitle>
              <CardDescription>
                Position the attendee&apos;s QR code within the frame 📱
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scannerError ? (
                <div className="text-center py-12">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Camera Error 📷</p>
                  <p className="text-sm text-red-500 mt-2">{scannerError}</p>
                  <Button
                    variant="outline"
                    onClick={requestCameraPermission}
                    className="mt-4"
                  >
                    Request Camera Permission
                  </Button>
                </div>
              ) : hasCamera === false ? (
                <div className="text-center py-12">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Camera not available 📷</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please allow camera access to scan QR codes.
                  </p>
                  <Button
                    variant="outline"
                    onClick={requestCameraPermission}
                    className="mt-4"
                  >
                    Enable Camera
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <div 
                    id={scannerId} 
                    className="aspect-square max-w-md mx-auto bg-black rounded-lg overflow-hidden"
                  />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-primary rounded-lg shadow-lg">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                    </div>
                  </div>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 w-64 h-0.5 bg-primary animate-pulse" 
                       style={{ transform: 'translate(-50%, -50%)' }} />
                </div>
              )}

              {/* Validation Flash Notification Frame */}
              {lastResult && (
                <div className={`mt-4 p-4 rounded-lg transition-all ${
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
                    <div className="flex-1">
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
                  <Smartphone className="h-4 w-4 mr-2 text-muted-foreground" />
                  Manual Ticket Entry 
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Frame history logs */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Check-ins
              </CardTitle>
              <CardDescription>
                Last 10 attendees checked in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentCheckins.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm">No check-ins yet </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Scan QR codes to see them here
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {recentCheckins.map((checkin, index) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-center p-3 bg-muted/50 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{checkin.attendeeName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <span>🎟️</span> {checkin.ticketType}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
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

      {/* Manual Entry Dialog Box */}
      <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Manual Ticket Entry 
            </DialogTitle>
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
                onKeyDown={(e) => e.key === 'Enter' && handleManualCheckin()}
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can find the ticket ID on the attendee&apos;s QR code or email
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowManualEntry(false)}>
              Cancel
            </Button>
            <Button onClick={handleManualCheckin} disabled={isProcessing}>
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Check In
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}