/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * useQRScanner Hook
 * 
 * Manages QR code scanning using the device camera.
 * Provides camera permissions, scanning state, and error handling.
 * 
 * @module useQRScanner
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { toast } from 'sonner';

interface UseQRScannerOptions {
  onScanSuccess?: (decodedText: string) => void
  onScanError?: (error: string) => void
  fps?: number
  qrbox?: number
  aspectRatio?: number
}

export function useQRScanner({
  onScanSuccess,
  onScanError,
  fps = 10,
  qrbox = 250,
  aspectRatio = 1.0,
}: UseQRScannerOptions = {}) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasCamera, setHasCamera] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerId = 'qr-scanner-container'

  // Check for camera availability
  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const hasVideoInput = devices.some(device => device.kind === 'videoinput')
        setHasCamera(hasVideoInput)
        if (!hasVideoInput) {
          setError('No camera found on this device')
        }
      } catch (err) {
        setHasCamera(false)
        setError('Unable to access camera. Please check permissions.')
      }
    }
    checkCamera()
  }, [])

  // Start scanning
  const startScanning = useCallback(async () => {
    if (!hasCamera) {
      setError('Camera not available')
      return
    }

    if (isScanning) return

    try {
      scannerRef.current = new Html5Qrcode(scannerId)
      
      await scannerRef.current.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps,
          qrbox: { width: qrbox, height: qrbox },
          aspectRatio,
        },
        (decodedText) => {
          onScanSuccess?.(decodedText)
        },
        (errorMessage) => {
          // Ignore scanning errors (usually just no QR in frame)
          if (!errorMessage.includes('No MultiFormat Readers')) {
            onScanError?.(errorMessage)
          }
        }
      )
      
      setIsScanning(true)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to start scanner')
      onScanError?.(err.message)
    }
  }, [hasCamera, isScanning, fps, qrbox, aspectRatio, onScanSuccess, onScanError])

  // Stop scanning
  const stopScanning = useCallback(async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
        setIsScanning(false)
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
    }
  }, [isScanning])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [isScanning])

  // Request camera permission
  const requestCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setHasCamera(true)
      setError(null)
      return true
    } catch (err) {
      setHasCamera(false)
      setError('Camera permission denied. Please allow camera access.')
      return false
    }
  }, [])

  return {
    isScanning,
    hasCamera,
    error,
    startScanning,
    stopScanning,
    requestCameraPermission,
    scannerId,
  }
}

// Hook for manual QR code input (fallback)
export function useManualQRInput() {
  const [manualCode, setManualCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitManualCode = useCallback(async (onSuccess: (code: string) => void) => {
    if (!manualCode.trim()) {
      toast.error('Please enter a ticket code')
      return false
    }

    setIsSubmitting(true)
    try {
      onSuccess(manualCode.trim())
      setManualCode('')
      return true
    } catch (error) {
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [manualCode])

  return {
    manualCode,
    setManualCode,
    isSubmitting,
    submitManualCode,
  }
}