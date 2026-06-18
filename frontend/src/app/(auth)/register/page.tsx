/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Image from 'next/image'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// State management and utilities
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

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
    .regex(/^[0-9]{9}$/, 'Phone number must be exactly 9 digits'),
  
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

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      })
      
      localStorage.setItem('verify_email', data.email)
      toast.success('Account created! Please verify your email address.')
      router.push('/verify-otp')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.'
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 py-12 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-slate-50 to-blue-50/50 antialiased selection:bg-indigo-500/10">
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
            <CardTitle className="text-xl font-bold text-slate-800">Create Account</CardTitle>
            <CardDescription className="text-slate-500 text-sm">
              Join EventHub to start managing your events
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Full Name Field */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  {...register('fullName')}
                  aria-invalid={!!errors.fullName}
                  disabled={isLoading}
                  className={`h-11 rounded-xl bg-white/80 border-slate-200/80 shadow-sm transition-all focus-visible:ring-indigo-500 focus-visible:border-indigo-500 ${errors.fullName ? 'border-red-400' : ''}`}
                />
                {errors.fullName ? (
                  <p className="text-xs font-medium text-red-500 mt-1">⚠️ {errors.fullName.message}</p>
                ) : (
                  <p className="text-[11px] text-slate-400 pl-1">Your public profile name</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register('email')}
                  aria-invalid={!!errors.email}
                  disabled={isLoading}
                  className={`h-11 rounded-xl bg-white/80 border-slate-200/80 shadow-sm transition-all focus-visible:ring-indigo-500 focus-visible:border-indigo-500 ${errors.email ? 'border-red-400' : ''}`}
                />
                {errors.email ? (
                  <p className="text-xs font-medium text-red-500 mt-1">⚠️ {errors.email.message}</p>
                ) : (
                  <p className="text-[11px] text-slate-400 pl-1">Requires active OTP verification token</p>
                )}
              </div>

              {/* Phone Number Field */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-sm font-semibold text-slate-400 select-none">
                    +237
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="612345678"
                    className="pl-14 h-11 rounded-xl bg-white/80 border-slate-200/80 shadow-sm focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                    {...register('phone')}
                    aria-invalid={!!errors.phone}
                    disabled={isLoading}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs font-medium text-red-500 mt-1">⚠️ {errors.phone.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
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
                    className={`h-11 rounded-xl bg-white/80 border-slate-200/80 shadow-sm transition-all pr-10 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 ${errors.password ? 'border-red-400' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-xs font-medium text-red-500 mt-1">⚠️ {errors.password.message}</p>
                ) : (
                  <p className="text-[11px] text-slate-400 pl-1">Min 8 chars, 1 uppercase letter, 1 digit</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
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
                    className={`h-11 rounded-xl bg-white/80 border-slate-200/80 shadow-sm transition-all pr-10 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs font-medium text-red-500 mt-1">⚠️ {errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 rounded-xl font-medium bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all text-white shadow-md shadow-indigo-600/10 mt-4" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>

              {/* Terms Agreement Notice */}
              <p className="text-[11px] text-center text-slate-400 px-4 mt-3">
                By signing up, you accept our{' '}
                <Link href="/terms" className="text-indigo-500 font-medium hover:underline">Terms</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-indigo-500 font-medium hover:underline">Privacy Policy</Link>.
              </p>

              {/* Link to Login Page */}
              <p className="text-center text-sm text-slate-600 pt-3 border-t border-slate-200/40">
                Already have an account?{' '}
                <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                  Log in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}