/**
 * Forgot Password Page Component
 * 
 * Allows organizers to request a password reset link sent to their email.
 * Uses the reusable PasswordResetForm component with multi-step flow:
 * 1. Enter email to request reset link
 * 2. Enter OTP verification code
 * 3. Create new password
 * 
 * @module ForgotPasswordPage
 */

'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Custom components
import { PasswordResetForm } from '@/components/auth/PasswordResetForm'

export default function ForgotPasswordPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/login')
  }

  const handleCancel = () => {
    router.push('/login')
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Back to Login Link */}
      <div className="mb-4">
        <Link 
          href="/login" 
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Login
        </Link>
      </div>

      {/* Password Reset Form */}
      <PasswordResetForm 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}