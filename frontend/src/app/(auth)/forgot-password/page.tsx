/**
 * Forgot Password Page Component
 * 
 * Allows organizers to request a password reset link sent to their email.
 * Two-step process:
 * 1. Enter email to request reset link
 * 2. Show confirmation message with instructions
 * 
 * @module ForgotPasswordPage
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// shadcn/ui components
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'

// Utilities
import { toast } from 'sonner'
import api from '@/src/lib/api'

// Validation schema - only requires email
const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  /**
   * Handles password reset request
   * Sends a reset link to the provided email
   */
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsSubmitting(true)
    try {
      await api.post('/auth/forgot-password', { email: data.email })
      setSubmittedEmail(data.email)
      setIsSubmitted(true)
      toast.success('Password reset link sent to your email')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Don't reveal if email exists or not for security
      // Show generic message to prevent email enumeration
      toast.success('If an account exists, you will receive a reset link')
      setIsSubmitted(true)
      setSubmittedEmail(data.email)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show success message after request is sent
  if (isSubmitted) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
            <span className="text-2xl">📧</span>
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent a password reset link to
            <br />
            <span className="font-medium text-gray-900">{submittedEmail}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-gray-600">
            Click the link in the email to reset your password.
            The link will expire in 1 hour.
          </p>
          
          <div className="space-y-3">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Back to Login
              </Button>
            </Link>
            
            <p className="text-xs text-gray-400">
              Did not receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-primary hover:underline"
              >
                try again
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
              aria-invalid={!!errors.email}
              disabled={isSubmitting}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending...
              </span>
            ) : (
              'Send Reset Link'
            )}
          </Button>

          {/* Back to Login Link */}
          <p className="text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Back to Login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}