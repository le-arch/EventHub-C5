/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * useDebounce Hook
 * 
 * Delays updating a value until after a specified delay has passed.
 * Useful for search inputs, form validation, and API calls.
 * 
 * @module useDebounce
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook with callback for immediate execution
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      const id = setTimeout(() => {
        callback(...args)
      }, delay)

      setTimeoutId(id)
    },
    [callback, delay, timeoutId]
  )
}

// Hook for debounced API calls with loading state
export function useDebouncedQuery<T>(
  queryFn: () => Promise<T>,
  delay: number = 500
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const debouncedQuery = useDebouncedCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await queryFn()
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, delay)

  return {
    data,
    isLoading,
    error,
    execute: debouncedQuery,
  }
}