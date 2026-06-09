/**
 * OTPInput Component
 * 
 * A 6-digit OTP (One-Time Password) input component with auto-focus,
 * paste support, and keyboard navigation.
 * Used for email verification and password reset flows.
 * 
 * @module OTPInput
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface OTPInputProps {
  length?: number
  value: string[]
  onChange: (otp: string[]) => void
  onComplete?: (otp: string) => void
  isDisabled?: boolean
  isLoading?: boolean
  autoFocus?: boolean
  className?: string
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  isDisabled = false,
  isLoading = false,
  autoFocus = true,
  className,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length)
  }, [length])

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && !isDisabled && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus, isDisabled])

  /**
   * Handle input change for a single digit
   */
  const handleChange = useCallback(
    (index: number, inputValue: string) => {
      // Only allow single digit
      const digit = inputValue.slice(-1)
      if (!/^\d*$/.test(digit)) return

      const newOtp = [...value]
      newOtp[index] = digit
      onChange(newOtp)

      // Auto-focus next input if current is filled
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }

      // Trigger onComplete when all digits are filled
      if (newOtp.every(v => v !== '') && onComplete) {
        onComplete(newOtp.join(''))
      }
    },
    [value, onChange, length, onComplete]
  )

  /**
   * Handle key down events (Backspace, Arrow keys)
   */
  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (!value[index] && index > 0) {
          // Move to previous input when current is empty
          inputRefs.current[index - 1]?.focus()
          const newOtp = [...value]
          newOtp[index - 1] = ''
          onChange(newOtp)
        } else if (value[index]) {
          // Clear current digit
          const newOtp = [...value]
          newOtp[index] = ''
          onChange(newOtp)
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus()
      } else if (e.key === 'ArrowRight' && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    },
    [value, onChange, length]
  )

  /**
   * Handle paste event for multiple digits
   */
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pastedData = e.clipboardData.getData('text').trim()
      const digits = pastedData.slice(0, length).split('').filter(char => /^\d$/.test(char))
      
      if (digits.length > 0) {
        const newOtp = [...value]
        for (let i = 0; i < Math.min(digits.length, length); i++) {
          newOtp[i] = digits[i]
        }
        onChange(newOtp)
        
        // Focus the next empty input or last input
        const nextEmptyIndex = newOtp.findIndex(v => v === '')
        const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex
        inputRefs.current[focusIndex]?.focus()
        
        if (newOtp.every(v => v !== '') && onComplete) {
          onComplete(newOtp.join(''))
        }
      }
    },
    [value, onChange, length, onComplete]
  )

  return (
    <div className={cn("flex justify-center gap-2 sm:gap-3", className)}>
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={isDisabled || isLoading}
          className={cn(
            "w-12 h-12 text-center text-xl font-semibold",
            isLoading && "opacity-50"
          )}
          aria-label={`Digit ${index + 1} of ${length}`}
        />
      ))}
    </div>
  )
}