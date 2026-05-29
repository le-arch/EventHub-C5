/**
 * CheckinScanner Component
 * 
 * QR code scanner for checking in attendees at the event.
 * Uses react-qr-scanner library for webcam access.
 * Features auto-detection, success/error feedback, and manual entry fallback.
 * 
 * @module CheckinScanner
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import QrScanner from '@yudiel/react-qr-scanner'
import { Camera, X, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Card } from '@/src/components/ui/card'

// Types
interface CheckinResult {
  success: boolean
  attendeeName?: string
  ticketType?: string
  message: string
}

interface CheckinScannerProps {
  eventId: string
  onCheckinSuccess: (result: CheckinResult) => void
  onCheckinError?: (error: string) => void
  isProcessing?: boolean
}

export function CheckinScanner({ 
  eventId, 
  onCheckinSuccess, 
  onCheckinError, 
  isProcessing = false 
}: CheckinScannerProps) {
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualTicketId, setManualTicketId] = useState('')
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const scannerRef = useRef<any>(null)

  /**
   * Request camera permission on mount
   */
  useEffect(() => {
    checkCameraPermission()
  }, [])

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setCameraPermission(true)
    } catch (error) {
      setCameraPermission(false)
    }
  }

  /**
   * Handle QR code scan
   */
  const handleScan = async (data: { text: string } | null) => {
    if (!data || !data.text || isProcessing) return
    
    // Prevent duplicate scans
    if (lastScanned === data.text) return
    setLastScanned(data.text)
    
    // Simulate API call - replace with actual API call
    try {
      // const response = await api.post('/checkin', { qr_hash: data.text })
      // onCheckinSuccess(response.data)
      
      // Mock success for demonstration
      onCheckinSuccess({
        success: true,
        attendeeName: "John Doe",
        ticketType: "VIP",
        message: "John Doe checked in successfully"
      })
    } catch (error: any) {
      onCheckinError?.(error.response?.data?.error || "Invalid or already used ticket")
    }
    
    // Reset last scanned after 2 seconds
    setTimeout(() => setLastScanned(null), 2000)
  }

  /**
   * Handle scan error
   */
  const handleError = (error: any) => {
    console.error('QR Scanner error:', error)
    if (error.name === 'NotAllowedError') {
      setCameraPermission(false)
    }
  }

  /**
   * Handle manual ticket entry
   */
  const handleManualCheckin = async () => {
    if (!manualTicketId) return
    
    try {
      // const response = await api.post('/checkin', { ticket_id: manualTicketId })
      // onCheckinSuccess(response.data)
      
      onCheckinSuccess({
        success: true,
        attendeeName: "Jane Smith",
        ticketType: "Regular",
        message: "Jane Smith checked in successfully"
      })
      setShowManualEntry(false)
      setManualTicketId('')
    } catch (error: any) {
      onCheckinError?.(error.response?.data?.error || "Invalid ticket ID")
    }
  }

  return (
    <div className="space-y-4">
      {/* Camera Permission Error */}
      {cameraPermission === false && (
        <Card className="p-6 text-center bg-amber-50 border-amber-200">
          <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-3" />
          <h3 className="font-semibold text-amber-800 mb-2">Camera Access Required</h3>
          <p className="text-sm text-amber-700 mb-4">
            Please allow camera access to scan QR codes. You can also use manual entry.
          </p>
          <Button variant="outline" onClick={() => setShowManualEntry(true)}>
            Use Manual Entry
          </Button>
        </Card>
      )}

      {/* QR Scanner View */}
      {cameraPermission === true && (
        <div className="relative">
          <div className="aspect-square max-w-md mx-auto bg-black rounded-lg overflow-hidden">
            <QrScanner
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: '100%', height: '100%' }}
              facingMode="environment"
            />
          </div>
          
          {/* Scanner Overlay Guide */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-primary rounded-lg shadow-lg">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary" />
            </div>
          </div>
          
          {/* Scanning Line Animation */}
          <div className="absolute left-1/2 -translate-x-1/2 w-64 h-0.5 bg-primary animate-pulse" 
               style={{ top: '50%', transform: 'translate(-50%, -50%)' }} />
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={() => setShowManualEntry(true)}>
          Manual Ticket Entry
        </Button>
        {cameraPermission === false && (
          <Button onClick={checkCameraPermission}>
            <Camera className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>

      {/* Manual Entry Dialog */}
      <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manual Ticket Entry</DialogTitle>
            <DialogDescription>
              Enter the ticket ID or QR code value manually
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="ticketId">Ticket ID / QR Code</Label>
              <Input
                id="ticketId"
                placeholder="Enter ticket code..."
                value={manualTicketId}
                onChange={(e) => setManualTicketId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualCheckin()}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowManualEntry(false)}>
              Cancel
            </Button>
            <Button onClick={handleManualCheckin} disabled={!manualTicketId || isProcessing}>
              {isProcessing ? 'Checking in...' : 'Check In'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}