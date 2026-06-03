/**
 * Registration Page Component
 * 
 * Allows new organizers to create an account.
 * After successful registration, user is redirected to OTP verification page.
 * All fields are validated before submission.
 * 
 * @module RegisterPage
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// State management and utilities
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

// Validation schema for registration form
// Includes full name, email, phone (Cameroon format), and password confirmation
const registerSchema = z.object({
  fullName: z.string()
    .min(3, 'Full name must be at least 3 characters')
    .max(100, 'Full name is too long')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Name can only contain letters and spaces'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^237[0-9]{9}$/, 'Phone number must be 12 digits starting with 237 (e.g., 237612345678)'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Initialize react-hook-form with zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  })

  /**
   * Handles form submission
   * Creates new organizer account
   * On success: stores email for OTP verification and redirects
   * On error: displays error message
   */
  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // Call registration API
      await registerUser({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      })
      
      // Store email for OTP verification page
      localStorage.setItem('verify_email', data.email)
      
      toast.success('Account created! Please verify your email address.')
      router.push('/verify-otp')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.'
      toast.error(errorMessage)
    }
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>
          Join EventHub to start managing your events
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Full Name Field */}
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              {...register('fullName')}
              aria-invalid={!!errors.fullName}
              disabled={isLoading}
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>
            )}
            <p className="text-xs text-gray-400">
              Your full name will be displayed on your organizer profile
            </p>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
              aria-invalid={!!errors.email}
              disabled={isLoading}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
            <p className="text-xs text-gray-400">
              We'll send a verification code to this email
            </p>
          </div>

          {/* Phone Number Field (Cameroon Format) */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                +237
              </span>
              <Input
                id="phone"
                type="tel"
                placeholder="612345678"
                className="pl-14"
                {...register('phone')}
                aria-invalid={!!errors.phone}
                disabled={isLoading}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
            )}
            <p className="text-xs text-gray-400">
              Enter your phone number without the country code (e.g., 612345678)
            </p>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                {...register('password')}
                aria-invalid={!!errors.password}
                disabled={isLoading}
                className={errors.password ? 'border-red-500' : ''}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
            )}
            <p className="text-xs text-gray-400">
              Must be at least 8 characters with one uppercase letter and one number
            </p>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                {...register('confirmPassword')}
                aria-invalid={!!errors.confirmPassword}
                disabled={isLoading}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </Button>

          {/* Terms Agreement Notice */}
          <p className="text-xs text-center text-gray-500">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>

          {/* Link to Login Page */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}