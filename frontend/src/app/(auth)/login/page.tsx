/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Eye, EyeOff, Loader2, Mail } from 'lucide-react'
import Image from 'next/image'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// State management and utilities
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

const loginSchema = z.object({
  identifier: z.string()
    .min(1, 'Email or phone number is required')
    .refine(
      (value) => {
        const isEmail = value.includes('@')
        const isPhone = /^[0-9]{9}$/.test(value)
        return isEmail || isPhone
      },
      { message: 'Enter a valid email or phone number (e.g., 612345678)' }
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

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.identifier, data.password)
      toast.success('Welcome back! Redirecting to dashboard...')
      router.push('/organizer/events')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Invalid credentials. Please try again.'
      toast.error(errorMessage)
    }
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

        {/* Premium Frosted Glass Card Wrapper */}
        <Card className="shadow-[0_8px_32px_rgba(0,0,0,0.04)] border-white/40 bg-white/60 backdrop-blur-xl rounded-2xl">
          <CardHeader className="space-y-1.5 pb-6 text-center">
            <CardTitle className="text-xl font-bold text-slate-800">Welcome Back</CardTitle>
            <CardDescription className="text-slate-500 text-sm">
              Log in to manage your events and track ticket sales
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Identifier Field (Email or Phone) */}
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                  Email or Phone Number
                </Label>
                <div className="relative">
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="john@example.com or 612345678"
                    {...register('identifier')}
                    aria-invalid={!!errors.identifier}
                    disabled={isLoading}
                    className={`h-11 rounded-xl bg-white/80 border-slate-200/80 shadow-sm transition-all focus-visible:ring-indigo-500 focus-visible:border-indigo-500 ${errors.identifier ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  />
                </div>
                {errors.identifier && (
                  <p className="text-xs font-medium text-red-500 mt-1 flex items-center gap-1 animate-fadeIn">
                    ⚠️ {errors.identifier.message}
                  </p>
                )}
              </div>

              {/* Password Field with Show/Hide Toggle */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700 tracking-wide uppercase">Password</Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
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
                    className={`h-11 rounded-xl bg-white/80 border-slate-200/80 shadow-sm transition-all pr-10 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 ${errors.password ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs font-medium text-red-500 mt-1 flex items-center gap-1 animate-fadeIn">
                    ⚠️ {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 rounded-xl font-medium bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all text-white shadow-md shadow-indigo-600/10 mt-2" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Signing you in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Link to Registration Page */}
              <p className="text-center text-sm text-slate-600 mt-5 pt-2 border-t border-slate-200/40">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                  Create Account
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}