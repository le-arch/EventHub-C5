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
 * - Breadcrumb navigation
 * 
 * @module CheckinPage
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import QrScanner from 'react-qr-scanner'
import { 
  CheckCircle, 
  XCircle, 
  Camera, 
  AlertCircle, 
  ArrowLeft, 
  Users, 
  Calendar,
  MapPin,
  Clock,
  QrCode,
  Smartphone
} from 'lucide-react'
import Image from 'next/image'

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

// Utilities
import api from '@/lib/api'
import { toast } from 'sonner'
import { formatDate, formatTime } from '@/lib/utils'

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
      toast.error('❌ Failed to load event data')
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
      
      toast.success(`✅ ${result.data.attendee_name} checked in successfully!`)
      
      // Clear result after 3 seconds
      setTimeout(() => setLastResult(null), 3000)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '❌ Invalid or already used ticket'
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
      toast.error('❌ Please enter a ticket ID')
      return
    }
    
    setIsProcessing(true)
    try {
      const response = await api.post('/checkin', { ticket_id: manualTicketId })
      const result = response.data
      
      toast.success(`✅ ${result.data.attendee_name} checked in manually!`)
      setShowManualEntry(false)
      setManualTicketId('')
      fetchEventAndStats()
    } catch (error: any) {
      toast.error(`❌ ${error.response?.data?.error || 'Invalid ticket ID'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Handle scan error
   */
  const handleError = (error: any) => {
    console.error('QR Scanner error:', error)
    toast.error('📷 Camera access failed. Please check permissions.')
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
            onClick={() => router.push('/organizer/events')}
            className="-ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Events
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <QrCode className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Check-in Scanner 📷</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
              <Calendar className="h-3 w-3" />
              {formatDate(event.startDate)} at {formatTime(event.startTime)}
              <span className="mx-1">•</span>
              <MapPin className="h-3 w-3" />
              {event.venueName}, {event.city}
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
            <p className="text-xs text-gray-500">Checked In ✅</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Users className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Tickets 🎟️</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="mx-auto mb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">{stats.percentage}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">Check-in Rate 📊</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Check-in Progress</span>
          <span className="font-medium">{stats.percentage}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

      {/* main Contenet Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* QR Scanner - Main Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Scan QR Code
              </CardTitle>
              <CardDescription>
                Position the attendee's QR code within the frame 📱
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
                    <div className="w-64 h-64 border-2 border-primary rounded-lg shadow-lg">
                      {/* Corner brackets for scanning guide */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                    </div>
                  </div>
                  {/* Scanning line animation */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 w-64 h-0.5 bg-primary animate-pulse" />
                </div>
              ) : (
                <div className="text-center py-12">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Camera is disabled 📷</p>
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
                <div className={`mt-4 p-4 rounded-lg animate-slide-up ${
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
                            ✅ {lastResult.attendeeName} checked in!
                          </p>
                          <p className="text-sm text-green-600">
                            🎟️ {lastResult.ticketType} • {lastResult.checkedInAt && formatTime(lastResult.checkedInAt)}
                          </p>
                        </>
                      ) : (
                        <p className="font-semibold text-red-800">
                          ❌ {lastResult.error}
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
                  <Smartphone className="h-4 w-4 mr-2" />
                  Manual Ticket Entry 📝
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Check-ins Sidebar */}
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
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No check-ins yet 📭</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Scan QR codes to see them here
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {recentCheckins.map((checkin, index) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{checkin.attendeeName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
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

      {/* Manual Entry Dialog */}
      <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Manual Ticket Entry 📝
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
              <p className="text-xs text-gray-400 mt-1">
                You can find the ticket ID on the attendee's QR code or email
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