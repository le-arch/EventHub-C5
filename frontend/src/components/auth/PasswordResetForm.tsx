/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * PasswordResetForm Component
 * 
 * Two-step form for password reset:
 * Step 1: Request reset link with email
 * Step 2: Enter new password with confirmation
 * 
 * @module PasswordResetForm
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Key, CheckCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OTPInput } from './OTPInput'
import api from '@/lib/api'
import { toast } from 'sonner'

// Step 1 Schema: Request reset
const requestResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

// Step 2 Schema: Reset password
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RequestResetForm = z.infer<typeof requestResetSchema>
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

interface PasswordResetFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function PasswordResetForm({ onSuccess, onCancel }: PasswordResetFormProps) {
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [resetToken, setResetToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Step 1 Form
  const requestForm = useForm<RequestResetForm>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: '' },
  })

  // Step 3 Form
  const resetForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  /**
   * Step 1: Request password reset email
   */
  const handleRequestReset = async (data: RequestResetForm) => {
    setIsLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: data.email })
      setEmail(data.email)
      setStep('verify')
      toast.success('Verification code sent to your email')
    } catch (error: any) {
      // Don't reveal if email exists for security
      toast.success('If an account exists, you will receive a reset link')
      setEmail(data.email)
      setStep('verify')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Step 2: Verify OTP and get reset token
   */
  const handleVerifyOTP = async () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit code')
      return
    }

    setIsLoading(true)
    try {
      const response = await api.post('/auth/verify-reset-otp', {
        email,
        otp: otpString,
      })
      setResetToken(response.data.reset_token)
      setStep('reset')
      toast.success('Code verified. Please enter your new password.')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Invalid verification code')
      setOtp(['', '', '', '', '', ''])
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Step 3: Reset password
   */
  const handleResetPassword = async (data: ResetPasswordForm) => {
    setIsLoading(true)
    try {
      await api.post('/auth/reset-password', {
        token: resetToken,
        new_password: data.password,
      })
      toast.success('Password reset successfully! Please log in.')
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Resend OTP code
   */
  const handleResendCode = async () => {
    setIsLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      toast.success('New verification code sent to your email')
      setOtp(['', '', '', '', '', ''])
    } catch (error) {
      toast.error('Failed to resend code')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 1: Request Reset
  if (step === 'request') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a verification code to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={requestForm.handleSubmit(handleRequestReset)} className="space-y-4">
            <div>
              <Label htmlFor="reset-email">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-10"
                  {...requestForm.register('email')}
                  disabled={isLoading}
                />
              </div>
              {requestForm.formState.errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {requestForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
              )}
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  // Step 2: Verify OTP
  if (step === 'verify') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('request')}
              className="p-0 h-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <CardTitle className="text-2xl">Verify Your Identity</CardTitle>
          <CardDescription>
            We sent a 6-digit verification code to <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <OTPInput
            length={6}
            value={otp}
            onChange={setOtp}
            isDisabled={isLoading}
          />

          <Button onClick={handleVerifyOTP} className="w-full" disabled={isLoading || otp.some(d => d === '')}>
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>

          <div className="text-center">
            <button
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-sm text-primary hover:underline disabled:opacity-50"
            >
              Didn&apos;t receive code? Resend
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Step 3: Reset Password
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create New Password</CardTitle>
        <CardDescription>
          Enter your new password below. Make sure it&apos;s secure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative mt-1">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                {...resetForm.register('password')}
                disabled={isLoading}
              />
            </div>
            {resetForm.formState.errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {resetForm.formState.errors.password.message}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Must be at least 8 characters with one uppercase letter and one number
            </p>
          </div>

          <div>
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative mt-1">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                {...resetForm.register('confirmPassword')}
                disabled={isLoading}
              />
            </div>
            {resetForm.formState.errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">
                {resetForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}