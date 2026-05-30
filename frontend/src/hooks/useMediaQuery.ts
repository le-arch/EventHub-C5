/**
 * useMediaQuery Hook
 * 
 * Detects if a CSS media query matches the current viewport.
 * Useful for responsive design decisions in JavaScript.
 * 
 * @module useMediaQuery
 */

'use client'

import { useSyncExternalStore } from 'react'

export function useMediaQuery(query: string): boolean {
  const getSnapshot = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false
    }

    return window.matchMedia(query).matches
  }

  const subscribe = (notify: () => void) => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return () => {}
    }

    const media = window.matchMedia(query)
    const listener = () => notify()

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

// Predefined media query hooks
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 639px)')
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 640px) and (max-width: 1023px)')
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}

export function useIsWide(): boolean {
  return useMediaQuery('(min-width: 1280px)')
}

export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)')
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

export function useIsTouchDevice(): boolean {
  return useMediaQuery('(hover: none) and (pointer: coarse)')
}