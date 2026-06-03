/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * CheckinScanner Component
 * 
 * QR code scanner for checking in attendees at the event.
 * Uses @yudiel/react-qr-scanner library for webcam access.
 * Features auto-detection, success/error feedback, and manual entry fallback.
 * 
 * @module CheckinScanner
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { QrScanner } from '@yudiel/react-qr-scanner'
import { Camera, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'

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

  /**
   * Request camera permission and update state
   * Using useCallback to memoize the function
   */
  const checkCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setCameraPermission(true)
    } catch (error) {
      setCameraPermission(false)
    }
  }, [])

  // Initialize camera permission check on mount
  useEffect(() => {
    checkCameraPermission()
  }, [checkCameraPermission])

  /**
   * Handle QR code scan result
   */
  const handleScan = useCallback(async (result: string) => {
    if (!result || isProcessing) return
    
    // Prevent duplicate scans
    if (lastScanned === result) return
    setLastScanned(result)
    
    // Simulate API call - replace with actual API call
    try {
      // const response = await api.post('/checkin', { qr_hash: result })
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
  }, [isProcessing, lastScanned, onCheckinSuccess, onCheckinError])

  /**
   * Handle scan error
   */
  const handleError = useCallback((error: any) => {
    console.error('QR Scanner error:', error)
    if (error?.name === 'NotAllowedError' || error?.message?.includes('permission')) {
      setCameraPermission(false)
    }
  }, [])

  /**
   * Handle manual ticket entry
   */
  const handleManualCheckin = useCallback(async () => {
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
  }, [manualTicketId, onCheckinSuccess, onCheckinError])

  /**
   * Retry camera permission
   */
  const retryCameraPermission = useCallback(() => {
    checkCameraPermission()
  }, [checkCameraPermission])

  return (
    <div className="space-y-4">
      {/* Camera Permission Error */}
      {cameraPermission === false && (
        <Card className="p-6 text-center bg-amber-50 border-amber-200">
          <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-3" />
          <h3 className="font-semibold text-amber-800 mb-2">📷 Camera Access Required</h3>
          <p className="text-sm text-amber-700 mb-4">
            Please allow camera access to scan QR codes. You can also use manual entry.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setShowManualEntry(true)}>
              📝 Manual Entry
            </Button>
            <Button onClick={retryCameraPermission}>
              <Camera className="h-4 w-4 mr-2" />
              Try Again 🔄
            </Button>
          </div>
        </Card>
      )}

      {/* QR Scanner View */}
      {cameraPermission === true && (
        <div className="relative">
          <div className="aspect-square max-w-md mx-auto bg-black rounded-lg overflow-hidden">
            <QrScanner
              onDecode={handleScan}
              onError={handleError}
              constraints={{
                facingMode: "environment",
              }}
              className="w-full h-full"
            />
          </div>
          
          {/* Scanner Overlay Guide */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-primary rounded-lg shadow-lg">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
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
          📝 Manual Ticket Entry
        </Button>
        {cameraPermission === false && (
          <Button onClick={retryCameraPermission}>
            <Camera className="h-4 w-4 mr-2" />
            Try Again 🔄
          </Button>
        )}
      </div>

      {/* Manual Entry Dialog */}
      <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>📝 Manual Ticket Entry</DialogTitle>
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
              Cancel ❌
            </Button>
            <Button onClick={handleManualCheckin} disabled={!manualTicketId || isProcessing}>
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Checking in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Check In ✅
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}