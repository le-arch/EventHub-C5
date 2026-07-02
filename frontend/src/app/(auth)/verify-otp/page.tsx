/**
 * Email Verification (OTP) Page Component
 * 
 * After registration, users enter the 6-digit OTP sent to their email.
 * Uses the reusable OTPInput component with auto-focus, paste support,
 * and resend functionality with cooldown.
 * 
 * @module VerifyOTPPage
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Custom components
import { OTPInput } from '@/components/auth/OTPInput'

// State management and utilities
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function VerifyOTPPage() {
  const router = useRouter()
  const { verifyOTP, isLoading } = useAuthStore()
  
  // State for 6-digit OTP
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isResending, setIsResending] = useState(false)

  // Load email from localStorage on component mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('verify_email')
    if (!storedEmail) {
      toast.error('❌ Please register first')
      router.push('/register')
      return
    }
    setEmail(storedEmail)
  }, [router])

  // Handle countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  /**
   * Handles OTP verification submission
   */
  const handleVerify = async () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      toast.error('❌ Please enter the complete 6-digit code')
      return
    }

    try {
      await verifyOTP(email, otpString)
      localStorage.removeItem('verify_email')
      toast.success('✅ Email verified! You can now log in.')
      router.push('/login')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '❌ Invalid verification code. Please try again.'
      toast.error(errorMessage)
      setOtp(['', '', '', '', '', ''])
    }
  }

  /**
   * Handles resend OTP request
   */
  const handleResend = async () => {
    if (resendCooldown > 0) return
    
    setIsResending(true)
    try {
      await api.post('/auth/resend-otp', { email })
      toast.success('📧 New verification code sent to your email')
      setResendCooldown(60)
      setOtp(['', '', '', '', '', ''])
    } catch (error: any) {
      toast.error(error.response?.data?.error || '❌ Failed to resend code')
    } finally {
      setIsResending(false)
    }
  }

  /**
   * Handle complete OTP entry
   */
  const handleOTPComplete = (otpString: string) => {
    // Auto-submit when all digits are entered
    handleVerify()
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Verify Your Email 📧</CardTitle>
        <CardDescription>
          We sent a 6-digit verification code to
          <br />
          <span className="font-medium text-gray-900">{email}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* OTP Input Component */}
          <OTPInput
            length={6}
            value={otp}
            onChange={setOtp}
            onComplete={handleOTPComplete}
            isDisabled={isLoading}
            autoFocus={true}
          />

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
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Verify Email
              </span>
            )}
          </Button>

          {/* Resend Code Section */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn&apos;t receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0 || isResending}
                className={`text-primary hover:underline font-medium inline-flex items-center gap-1 ${
                  resendCooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <RefreshCw className="h-3 w-3" />
                    Resend in {resendCooldown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3" />
                    Resend Code
                  </>
                )}
              </button>
            </p>
          </div>

          {/* Back to Login Link */}
          <div className="text-center pt-2">
            <Link 
              href="/login" 
              className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Login
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}