/**
 * Login Page Component
 * 
 * Allows organizers to log in using either email OR phone number with password.
 * On successful login, stores JWT tokens and redirects to the organizer dashboard.
 * 
 * @module LoginPage
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// State management and utilities
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

// Validation schema for login form
// Supports both email format OR phone number format
const loginSchema = z.object({
  identifier: z.string()
    .min(1, 'Email or phone number is required')
    .refine(
      (value) => {
        // Check if input is email (contains @) or phone number (starts with 237 and has 12 digits)
        const isEmail = value.includes('@')
        const isPhone = /^[0-9]{9}$/.test(value)
        return isEmail || isPhone
      },
      { message: 'Enter a valid email or phone number (e.g., 237612345678)' }
    ),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

// TypeScript type inferred from zod schema
type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  // Initialize react-hook-form with zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  /**
   * Handles form submission
   * Calls the login function from auth store
   * On success: redirects to dashboard and shows welcome toast
   * On error: displays error message
   */
  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.identifier, data.password)
      toast.success('Welcome back! Redirecting to dashboard...')
      router.push('/organizer/events')
    } catch (error: any) {
      // Display specific error message from API or generic fallback
      const errorMessage = error.response?.data?.error || 'Invalid credentials. Please try again.'
      toast.error(errorMessage)
    }
  }

  return (
    <Card className="shadow-lg border-border relative overflow-hidden">
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-500" />
      
      <CardHeader className="space-y-1 text-center pt-6">
        <CardTitle className="text-2xl font-bold text-foreground">Welcome Back</CardTitle>
        <CardDescription>
          Log in to manage your events and track ticket sales
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Identifier Field (Email or Phone) */}
          <div className="space-y-2">
            <Label htmlFor="identifier">
              Email or Phone Number
            </Label>
            <Input
              id="identifier"
              type="text"
              placeholder="john@example.com or 612345678"
              {...register('identifier')}
              aria-invalid={!!errors.identifier}
              disabled={isLoading}
              className={errors.identifier ? 'border-red-500 focus-visible:ring-red-500/20 focus-visible:border-red-500' : 'focus-visible:ring-primary/20 focus-visible:border-primary'}
            />
            {errors.identifier && (
              <p className="text-sm text-red-500 mt-1">
                {errors.identifier.message}
              </p>
            )}
          </div>

          {/* Password Field with Show/Hide Toggle */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link 
                href="/forgot-password" 
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                aria-invalid={!!errors.password}
                disabled={isLoading}
                className={errors.password ? 'border-red-500 focus-visible:ring-red-500/20 focus-visible:border-red-500' : 'focus-visible:ring-primary/20 focus-visible:border-primary'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (<EyeOff className="h-4 w-4" aria-hidden="true" />) : (<Eye className="h-4 w-4" aria-hidden="true" />) }
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {errors.password.message}
              </p>
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
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </Button>

          {/* Link to Registration Page */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
