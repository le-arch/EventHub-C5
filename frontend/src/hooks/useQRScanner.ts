/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * useQRScanner Hook
 * * Manages QR code scanning using the device camera.
 * Provides camera permissions, scanning state, and error handling.
 * * @module useQRScanner
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode'
import { toast } from 'sonner'

interface UseQRScannerOptions {
  onScanSuccess?: (decodedText: string) => void
  onScanError?: (error: string) => void
  fps?: number
  qrbox?: number // numeric size (e.g., 250)
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
    if (typeof window === 'undefined' || !navigator?.mediaDevices) {
      setHasCamera(false)
      setError('❌ Media devices not supported in this browser context')
      return
    }

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
        setError('❌ Unable to access camera details. Please check permissions.')
        if (verbose) console.error('Camera check error:', err)
      }
    }
    
    checkCamera()
  }, [verbose])

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

    // Wait for DOM container to be ready (fix for canvas size 0)
    let container = document.getElementById(scannerId)
    if (!container || container.offsetWidth === 0) {
      if (verbose) console.log('Waiting for container to have dimensions...')
      await new Promise(resolve => setTimeout(resolve, 300))
      container = document.getElementById(scannerId)
      if (!container || container.offsetWidth === 0) {
        setError('❌ Scanner container element not ready in DOM')
        return
      }
    }

    // Clean up existing scanner instance safely
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState()
        if (state === Html5QrcodeScannerState.SCANNING) {
          await scannerRef.current.stop()
        }
        scannerRef.current.clear()
      } catch (err) {
        if (verbose) console.warn('Clean up warning during startup:', err)
      }
      scannerRef.current = null
    }

    try {
      scannerRef.current = new Html5Qrcode(scannerId)
      
      const config = {
        fps,
        qrbox: qrbox,
        aspectRatio,
        disableFlip,
      }
      
      if (verbose) console.log('Starting QR scanner with config:', config)
      
      // Attempt starting with primary 'environment' (back) camera
      try {
        await scannerRef.current.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (verbose) console.log('QR Code detected:', decodedText)
            onScanSuccess?.(decodedText)
          },
          (errorMessage) => {
            if (!errorMessage.includes('No MultiFormat Readers') && !errorMessage.includes('NotFoundException')) {
              if (verbose) console.warn('Scan error:', errorMessage)
              onScanError?.(errorMessage)
            }
          }
        )
      } catch (firstErr) {
        // Fallback strategy: try 'user' facing mode if environment camera configuration fails
        if (verbose) console.warn('Environment camera failed, attempting user camera fallback...', firstErr)
        await scannerRef.current.start(
          { facingMode: 'user' },
          config,
          (decodedText) => {
            if (verbose) console.log('QR Code detected (fallback):', decodedText)
            onScanSuccess?.(decodedText)
          },
          (errorMessage) => {
            if (!errorMessage.includes('No MultiFormat Readers') && !errorMessage.includes('NotFoundException')) {
              onScanError?.(errorMessage)
            }
          }
        )
      }
      
      setIsScanning(true)
      setError(null)
      if (verbose) console.log('QR scanner started successfully')
    } catch (err: any) {
      const errorMsg = err?.message || err || 'Failed to start scanner'
      setError(`❌ ${errorMsg}`)
      onScanError?.(errorMsg)
      if (verbose) console.error('Start scanner initialization threw:', err)
    }
  }, [hasCamera, isScanning, fps, qrbox, aspectRatio, disableFlip, verbose, onScanSuccess, onScanError, scannerId])

  // Stop scanning – safely only if scanner is actually running
  const stopScanning = useCallback(async () => {
    if (!scannerRef.current) {
      if (verbose) console.log('No scanner instance, skipping stop')
      return
    }
    try {
      const state = scannerRef.current.getState()
      if (state === Html5QrcodeScannerState.SCANNING) {
        await scannerRef.current.stop()
        scannerRef.current.clear()
        setIsScanning(false)
        if (verbose) console.log('QR scanner stopped')
      } else if (verbose) {
        console.log(`Scanner not scanning (state: ${state}), skipping stop`)
      }
    } catch (err) {
      console.error('Error stopping scanner:', err)
    }
  }, [verbose])

  // Request camera permission explicitly
  const requestCameraPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator?.mediaDevices) {
      toast.error('Media devices not supported.')
      return false
    }
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
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState()
          if (state === Html5QrcodeScannerState.SCANNING) {
            scannerRef.current.stop().catch(console.error)
          }
          scannerRef.current.clear()
        } catch (err) {
          // ignore cleanup errors on sudden unmounts
        }
      }
    }
  }, [])

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