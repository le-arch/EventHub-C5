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
 * - Purple/Blue theme
 * 
 * @module CheckinPage
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Smartphone,
  RefreshCw,
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
  const [lastResult, setLastResult] = useState<CheckinResult | null>(null)
  const [recentCheckins, setRecentCheckins] = useState<RecentCheckin[]>([])
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualTicketId, setManualTicketId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [stats, setStats] = useState({ checkedIn: 0, total: 0, percentage: 0 })

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
      try {
        const response = await api.post('/checkin', { qr_hash: result })
        
        setLastResult({
          success: true,
          attendeeName: response.data.attendee_name,
          ticketType: response.data.ticket_type,
          checkedInAt: response.data.checked_in_at,
        })
        
        setRecentCheckins(prev => [
          {
            attendeeName: response.data.attendee_name,
            ticketType: response.data.ticket_type,
            checkedInAt: response.data.checked_in_at,
          },
          ...prev.slice(0, 9),
        ])
        
        setStats(prev => ({
          ...prev,
          checkedIn: prev.checkedIn + 1,
          percentage: Math.round(((prev.checkedIn + 1) / prev.total) * 100),
        }))
        
        toast.success(`✅ ${response.data.attendee_name} checked in successfully!`)
        
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
    },
    onScanError: (error) => {
      console.error('Scan error:', error)
    },
    fps: 10,
    qrbox: 250,
  })

  // Fetch event details and stats
  useEffect(() => {
    fetchEventAndStats()
    const interval = setInterval(fetchEventAndStats, 30000)
    return () => clearInterval(interval)
  }, [params.eventId])

  // Start scanning when component mounts and camera is available
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
      
      const historyRes = await api.get(`/checkin/event/${params.eventId}/history?limit=10`)
      setRecentCheckins(historyRes.data.checkins)
    } catch (error) {
      toast.error('❌ Failed to load event data')
    } finally {
      setLoading(false)
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
      
      toast.success(`✅ ${response.data.attendee_name} checked in manually!`)
      setShowManualEntry(false)
      setManualTicketId('')
      fetchEventAndStats()
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
        <Skeleton className="h-24 w-full" />
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

      {/* Header with Purple/Blue Gradient */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 p-5 rounded-xl shadow-lg text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <QrCode className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Check-in Scanner 📷</h1>
            <p className="text-white/80 text-sm mt-0.5 flex items-center gap-2 flex-wrap">
              <Calendar className="h-3 w-3" />
              {formatDate(event.startDate)} at {formatTime(event.startTime)}
              <span className="mx-1">•</span>
              <MapPin className="h-3 w-3" />
              {event.venueName}, {event.city}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchEventAndStats()}
          className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white backdrop-blur-sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh 🔄
        </Button>
      </div>

      {/* Stats Bar with Gradients */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-4 text-center">
            <CheckCircle className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-700">{stats.checkedIn}</p>
            <p className="text-xs text-emerald-600">Checked In ✅</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-4 text-center">
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            <p className="text-xs text-blue-600">Total Tickets 🎟️</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-4 text-center">
            <div className="mx-auto mb-2">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-700 font-bold">{stats.percentage}%</span>
              </div>
            </div>
            <p className="text-xs text-purple-600">Check-in Rate 📊</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Check-in Progress</span>
          <span className="font-medium text-purple-700">{stats.percentage}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* QR Scanner - Main Area */}
        <div className="lg:col-span-2">
          <Card className="border-l-4 border-l-blue-500 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                <Camera className="h-5 w-5 text-blue-500" />
                Scan QR Code
              </CardTitle>
              <CardDescription>
                Position the attendee&apos;s QR code within the frame 📱
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scannerError ? (
                <div className="text-center py-12 bg-red-50 rounded-xl border border-red-200">
                  <Camera className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-700 font-medium">Camera Error 📷</p>
                  <p className="text-sm text-red-600 mt-2">{scannerError}</p>
                  <Button
                    variant="outline"
                    onClick={requestCameraPermission}
                    className="mt-4 border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Request Camera Permission
                  </Button>
                </div>
              ) : hasCamera === false ? (
                <div className="text-center py-12 bg-amber-50 rounded-xl border border-amber-200">
                  <Camera className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                  <p className="text-amber-700 font-medium">Camera not available 📷</p>
                  <p className="text-sm text-amber-600 mt-2">
                    Please allow camera access to scan QR codes.
                  </p>
                  <Button
                    variant="outline"
                    onClick={requestCameraPermission}
                    className="mt-4 border-amber-300 text-amber-700 hover:bg-amber-50"
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
                    <div className="w-64 h-64 border-2 border-blue-500 rounded-lg shadow-lg">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                    </div>
                  </div>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 w-64 h-0.5 bg-blue-500 animate-pulse" 
                       style={{ transform: 'translate(-50%, -50%)' }} />
                </div>
              )}

              {/* Scan Result Feedback */}
              {lastResult && (
                <div className={`mt-4 p-4 rounded-xl animate-slide-up ${
                  lastResult.success
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-3">
                    {lastResult.success ? (
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                    <div className="flex-1">
                      {lastResult.success ? (
                        <>
                          <p className="font-semibold text-emerald-800">
                            ✅ {lastResult.attendeeName} checked in!
                          </p>
                          <p className="text-sm text-emerald-600">
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
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
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
          <Card className="border-l-4 border-l-purple-500 shadow-md h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
                <Clock className="h-5 w-5 text-purple-500" />
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
                      className="flex justify-between items-center p-3 bg-purple-50/50 rounded-xl hover:bg-purple-100 transition-colors border border-purple-100"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-800">{checkin.attendeeName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <span>🎟️</span> {checkin.ticketType}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
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
            <DialogTitle className="flex items-center gap-2 text-purple-700">
              <Smartphone className="h-5 w-5 text-purple-500" />
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
                className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                You can find the ticket ID on the attendee&apos;s QR code or email
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowManualEntry(false)}>
              Cancel
            </Button>
            <Button onClick={handleManualCheckin} disabled={isProcessing} className="bg-purple-600 hover:bg-purple-700">
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