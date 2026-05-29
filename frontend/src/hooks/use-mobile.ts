/**
 * useMobile Hook
 * 
 * Detects if the current device is mobile based on screen width.
 * Uses a responsive breakpoint (default: 768px).
 * 
 * @module useMobile
 */

'use client'

import { useState, useEffect } from 'react'

interface UseMobileOptions {
  breakpoint?: number // Width in pixels (default: 768)
}

export function useMobile(options: UseMobileOptions = {}): boolean {
  const { breakpoint = 768 } = options
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    // Check if window is defined (client-side only)
    if (typeof window === 'undefined') return

    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Initial check
    checkMobile()

    // Add resize listener
    window.addEventListener('resize', checkMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [breakpoint])

  return isMobile
}

// Additional hook for tablet detection
export function useTablet(): boolean {
  const [isTablet, setIsTablet] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkTablet = () => {
      const width = window.innerWidth
      setIsTablet(width >= 768 && width < 1024)
    }

    checkTablet()
    window.addEventListener('resize', checkTablet)
    return () => window.removeEventListener('resize', checkTablet)
  }, [])

  return isTablet
}

// Hook for desktop detection
export function useDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }

    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  return isDesktop
}