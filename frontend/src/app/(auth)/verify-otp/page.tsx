/**
 * Email Verification (OTP) Page Component
 * 
 * After registration, users enter the 6-digit OTP sent to their email.
 * Features auto-focus between inputs, resend functionality with cooldown,
 * and automatic redirect on successful verification.
 * 
 * @module VerifyOTPPage
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// shadcn/ui components
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'

// State management and utilities
import { useAuthStore } from '@/src/store/authStore'
import { toast } from 'sonner'
import api from '@/src/lib/api'

export default function VerifyOTPPage() {
  const router = useRouter()
  const { verifyOTP, isLoading } = useAuthStore()
  
  // State for 6-digit OTP inputs
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0) // Seconds until resend available
  const [isResending, setIsResending] = useState(false)
  
  // Refs for auto-focusing inputs
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  // Load email from localStorage on component mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('verify_email')
    if (!storedEmail) {
      // No email found, redirect to registration
      toast.error('Please register first')
      router.push('/register')
      return
    }
    setEmail(storedEmail)
    
    // Auto-focus first input
    inputRefs[0].current?.focus()
  }, [router])

  // Handle countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  /**
   * Handles OTP input change
   * Automatically moves focus to next input when a digit is entered
   */
  const handleOtpChange = (index: number, value: string) => {
    // Only allow single digit (0-9)
    if (value && !/^\d*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value.slice(0, 1) // Take only first character
    setOtp(newOtp)
    
    // Auto-focus next input if current is filled
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus()
    }
    
    // Auto-submit when all digits are entered
    if (index === 5 && value && newOtp.every(digit => digit !== '')) {
      handleVerify()
    }
  }

  /**
   * Handles backspace/delete key
   * Moves focus to previous input when current is empty and backspace is pressed
   */
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  /**
   * Handles OTP verification submission
   */
  const handleVerify = async () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit code')
      return
    }

    try {
      await verifyOTP(email, otpString)
      localStorage.removeItem('verify_email') // Clear stored email
      toast.success('Email verified! You can now log in.')
      router.push('/login')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Invalid verification code. Please try again.'
      toast.error(errorMessage)
      // Clear OTP inputs on error for retry
      setOtp(['', '', '', '', '', ''])
      inputRefs[0].current?.focus()
    }
  }

  /**
   * Handles resend OTP request
   * Includes 60-second cooldown to prevent spam
   */
  const handleResend = async () => {
    if (resendCooldown > 0) return
    
    setIsResending(true)
    try {
      await api.post('/auth/resend-otp', { email })
      toast.success('New verification code sent to your email')
      setResendCooldown(60) // 60 second cooldown
      setOtp(['', '', '', '', '', '']) // Clear inputs
      inputRefs[0].current?.focus()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resend code')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
          <span className="text-2xl">📧</span>
        </div>
        <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
        <CardDescription>
          We sent a 6-digit verification code to
          <br />
          <span className="font-medium text-gray-900">{email}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* 6-Digit OTP Input Fields */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-semibold"
                disabled={isLoading}
                aria-label={`Digit ${index + 1} of 6`}
              />
            ))}
          </div>

          {/* Verification Button */}
          <Button 
            onClick={handleVerify} 
            className="w-full" 
            disabled={isLoading || otp.some(digit => digit === '')}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Verifying...
              </span>
            ) : (
              'Verify Email'
            )}
          </Button>

          {/* Resend Code Section */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn&apos;t receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0 || isResending}
                className={`text-primary hover:underline font-medium ${
                  resendCooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isResending ? (
                  'Sending...'
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  'Resend Code'
                )}
              </button>
            </p>
          </div>

          {/* Back to Login Link */}
          <div className="text-center pt-2">
            <Link 
              href="/login" 
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}