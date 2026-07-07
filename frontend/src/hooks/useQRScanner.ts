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
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode'
import { toast } from 'sonner'

interface UseQRScannerOptions {
  onScanSuccess?: (decodedText: string) => void
  onScanError?: (error: string) => void
  fps?: number
  qrbox?: number
  aspectRatio?: number
  disableFlip?: boolean
  verbose?: boolean
}

export function useQRScanner({
  onScanSuccess,
  onScanError,
  fps = 10,
  qrbox = 250,
  aspectRatio = 1.0,
  disableFlip = false,
  verbose = false,
}: UseQRScannerOptions = {}) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasCamera, setHasCamera] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerId = 'qr-scanner-container'

  // Check for camera availability on mount
  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const hasVideoInput = devices.some(device => device.kind === 'videoinput')
        setHasCamera(hasVideoInput)
        
        if (!hasVideoInput) {
          setError('❌ No camera found on this device')
          if (verbose) console.error('No camera devices found')
        } else {
          if (verbose) console.log('Camera found:', devices.filter(d => d.kind === 'videoinput').length, 'device(s)')
        }
      } catch (err: any) {
        setHasCamera(false)
        setError('❌ Unable to access camera. Please check permissions.')
        if (verbose) console.error('Camera check error:', err)
      }
    }
    
    checkCamera()
  }, [verbose])

  // Start scanning
  const startScanning = useCallback(async () => {
    if (!hasCamera) {
      setError('📷 Camera not available')
      toast.error('Camera not available. Please check your camera settings.')
      return
    }

    if (isScanning) {
      if (verbose) console.log('Scanner already running')
      return
    }

    // Clean up any existing scanner instance
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (err) {
        // Ignore cleanup errors
      }
      scannerRef.current = null
    }

    try {
      scannerRef.current = new Html5Qrcode(scannerId)

      const config = {
        fps,
        qrbox: { width: qrbox, height: qrbox },
        aspectRatio,
        disableFlip,
      }

      if (verbose) console.log('Starting QR scanner with config:', config)

      await scannerRef.current.start(
        { facingMode: 'environment' }, // Use back camera
        config,
        (decodedText) => {
          if (verbose) console.log('QR Code detected:', decodedText)
          onScanSuccess?.(decodedText)
        },
        (errorMessage) => {
          // Ignore expected transient errors (no QR in frame, zero-dimension frames)
          const ignored = ['No MultiFormat Readers', 'NotFoundException', 'IndexSizeError', 'source width is 0']
          if (ignored.some(msg => errorMessage.includes(msg))) return
          if (verbose) console.warn('Scan error:', errorMessage)
          onScanError?.(errorMessage)
        }
      )

      setIsScanning(true)
      setError(null)
      if (verbose) console.log('QR scanner started successfully')
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to start scanner'
      setError(`❌ ${errorMsg}`)
      onScanError?.(errorMsg)
      if (verbose) console.error('Start scanner error:', err)
    }
  }, [hasCamera, isScanning, fps, qrbox, aspectRatio, disableFlip, verbose, onScanSuccess, onScanError])

  // Stop scanning
  const stopScanning = useCallback(async () => {
    try {
      if (scannerRef.current && (scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING || scannerRef.current.getState() === Html5QrcodeScannerState.PAUSED)) {
        await scannerRef.current.stop()
        scannerRef.current.clear()
        if (verbose) console.log('QR scanner stopped')
      }
    } catch {
      // Scanner was already stopped or never started — ignore
    } finally {
      setIsScanning(false)
    }
  }, [verbose])

  // Request camera permission
  const requestCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setHasCamera(true)
      setCameraPermission(true)
      setError(null)
      toast.success('✅ Camera access granted!')
      return true
    } catch (err: any) {
      setHasCamera(false)
      setCameraPermission(false)
      const errorMsg = err.name === 'NotAllowedError' 
        ? 'Camera permission denied. Please allow camera access in your browser settings.'
        : 'Failed to access camera. Please check your camera settings.'
      setError(`❌ ${errorMsg}`)
      toast.error(errorMsg)
      return false
    }
  }, [])

  // Reset scanner state
  const resetScanner = useCallback(() => {
    stopScanning()
    setError(null)
    setIsScanning(false)
  }, [stopScanning])

  // Check current scanner status
  const getScannerStatus = useCallback(() => {
    return {
      isScanning,
      hasCamera,
      error,
      cameraPermission,
    }
  }, [isScanning, hasCamera, error, cameraPermission])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [stopScanning])

  return {
    isScanning,
    hasCamera,
    cameraPermission,
    error,
    startScanning,
    stopScanning,
    requestCameraPermission,
    resetScanner,
    getScannerStatus,
    scannerId,
  }
}

// Hook for manual QR code input (fallback)
export function useManualQRInput() {
  const [manualCode, setManualCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitManualCode = useCallback(async (onSuccess: (code: string) => void) => {
    if (!manualCode.trim()) {
      const errorMsg = '❌ Please enter a ticket code'
      setError(errorMsg)
      toast.error(errorMsg)
      return false
    }

    setIsSubmitting(true)
    setError(null)
    
    try {
      onSuccess(manualCode.trim())
      setManualCode('')
      toast.success('✅ Ticket code submitted successfully')
      return true
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to process ticket code'
      setError(errorMsg)
      toast.error(errorMsg)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [manualCode])

  const clearManualCode = useCallback(() => {
    setManualCode('')
    setError(null)
  }, [])

  return {
    manualCode,
    setManualCode,
    isSubmitting,
    error,
    submitManualCode,
    clearManualCode,
  }
}