/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Email Verification (OTP) Page Component
 * * After registration, users enter the 6-digit OTP sent to their email.
 * Uses the reusable OTPInput component with auto-focus, paste support,
 * and resend functionality with cooldown.
 * * @module VerifyOTPPage
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, CheckCircle, RefreshCw, ArrowLeft, Loader2 } from 'lucide-react'
import Image from 'next/image'

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
  const handleOTPComplete = () => {
    // Auto-submit when all digits are entered
    handleVerify()
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-slate-50 to-blue-50/50 antialiased selection:bg-indigo-500/10">
      <div className="w-full max-w-md space-y-6">
        
        {/* App Branding Top Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-white border border-slate-200/60 rounded-2xl shadow-sm backdrop-blur-md">
            <Image src="/images/logo.svg" alt="Logo" width={40} height={40} className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">EventHub</h1>
        </div>

        {/* Premium Glassmorphism Container Panel */}
        <Card className="shadow-[0_8px_32px_rgba(0,0,0,0.04)] border-white/40 bg-white/60 backdrop-blur-xl rounded-2xl">
          <CardHeader className="space-y-2 pb-6 text-center">
            <div className="mx-auto w-12 h-12 bg-indigo-50 border border-indigo-100/80 shadow-sm rounded-2xl flex items-center justify-center mb-1 animate-pulse">
              <Mail className="h-5 w-5 text-indigo-600" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-800">Verify Your Email</CardTitle>
            <CardDescription className="text-slate-500 text-sm leading-relaxed">
              We sent a 6-digit verification code to
              <br />
              <span className="font-semibold text-slate-800 break-all bg-slate-200/50 px-2 py-0.5 rounded-md inline-block mt-1">{email}</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              
              {/* OTP Input UI Component Block Wrapper */}
              <div className="flex justify-center py-2">
                <OTPInput
                  length={6}
                  value={otp}
                  onChange={setOtp}
                  onComplete={handleOTPComplete}
                  isDisabled={isLoading}
                  autoFocus={true}
                />
              </div>

              {/* Verification Submit Trigger Action Button */}
              <Button 
                onClick={handleVerify} 
                className="w-full h-11 rounded-xl font-medium bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all text-white shadow-md shadow-indigo-600/10" 
                disabled={isLoading || otp.some(digit => digit === '')}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Verifying security token...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Verify & Continue
                  </span>
                )}
              </Button>

              {/* Resend Code Section Area Controls */}
              <div className="text-center pt-2 border-t border-slate-200/40">
                <p className="text-sm text-slate-600">
                  Didn&apos;t receive the code?{' '}
                  <button
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || isResending}
                    className={`text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1.5 transition-all focus:outline-none ${
                      resendCooldown > 0 ? 'opacity-50 cursor-not-allowed text-slate-400' : ''
                    }`}
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Sending...
                      </>
                    ) : resendCooldown > 0 ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin duration-[3s]" />
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

              {/* Back to Login Anchor Navigation Link */}
              <div className="text-center">
                <Link 
                  href="/login" 
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 transition-colors group"
                >
                  <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
                  Back to Login
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}