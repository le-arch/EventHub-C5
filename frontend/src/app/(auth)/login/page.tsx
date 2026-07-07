/**
 * Login Page Component
 * 
 * Allows organizers and admins to log in using email or phone number with password.
 * Role selector toggles between Organizer and Admin login.
 * Admin login pre-fills the default admin credentials.
 * On successful login, redirects based on role.
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
import { Eye, EyeOff, Shield, User } from 'lucide-react'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// State management and utilities
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

// Validation schema for login form
const loginSchema = z.object({
  identifier: z.string()
    .min(1, 'Email or phone number is required')
    .refine(
      (value) => {
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

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'organizer' | 'admin'>('organizer')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  const handleRoleChange = (newRole: 'organizer' | 'admin') => {
    setRole(newRole)
    if (newRole === 'admin') {
      setValue('identifier', 'admin@eventhub.com')
    }
  }

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.identifier, data.password)
      const user = useAuthStore.getState().user
      toast.success('Welcome back! Redirecting...')
      router.push(user?.role === 'admin' ? '/admin/users' : '/organizer/events')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Invalid credentials. Please try again.'
      toast.error(errorMessage)
    }
  }

  return (
    <Card className="glass border-l-4">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>
          Log in to manage your events and track ticket sales
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Role Selector */}
          <div className="flex rounded-lg border p-1 bg-muted/50">
            <button
              type="button"
              onClick={() => handleRoleChange('organizer')}
              className={`flex items-center justify-center gap-2 flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                role === 'organizer'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <User className="h-4 w-4" />
              Organizer
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex items-center justify-center gap-2 flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                role === 'admin'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Shield className="h-4 w-4" />
              Admin
            </button>
          </div>
          
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
              className={errors.identifier ? 'border-red-500' : ''}
            />
            {role === 'admin' && (
              <p className="text-xs text-muted-foreground">
                Default admin: <span className="font-mono">admin@eventhub.com</span>
              </p>
            )}
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
                className={errors.password ? 'border-red-500' : ''}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              role === 'admin' ? 'Login as Admin' : 'Login'
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