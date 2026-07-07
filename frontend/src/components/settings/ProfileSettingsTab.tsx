'use client'

import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, User, Mail, Phone, AlertCircle, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const profileSchema = z.object({
  fullName: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(12, 'Phone number must be at least 12 digits'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type ProfileFormValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

export { profileSchema, passwordSchema }
export type { ProfileFormValues, PasswordFormValues }

interface ProfileSettingsTabProps {
  form: UseFormReturn<ProfileFormValues>
  isSaving: boolean
  user: { isEmailVerified: boolean; createdAt: string } | null
  onSubmit: (data: ProfileFormValues) => void
}

export default function ProfileSettingsTab({ form, isSaving, user, onSubmit }: ProfileSettingsTabProps) {
  return (
    <Card className="border-l-4 border-l-purple-500 border-border/80 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="p-6 md:p-8 bg-muted/50 border-b border-border/50">
        <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
          <User className="h-5 w-5 text-purple-600" />
          Profile Information
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Update your identity data metrics and core organizer records.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Full Name
            </Label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
              <Input
                id="fullName"
                placeholder="John Doe"
                {...form.register('fullName')}
                className="pl-11 bg-card border-border focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 rounded-xl"
              />
            </div>
            {form.formState.errors.fullName && (
              <p className="text-xs font-medium text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {form.formState.errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address
            </Label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...form.register('email')}
                className="pl-11 bg-card border-border focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 rounded-xl"
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-xs font-medium text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {form.formState.errors.email.message}
              </p>
            )}
            {user && !user.isEmailVerified && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2.5 mt-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Email pending verification. Check your inbox for a modern activation token link.</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Phone Number
            </Label>
            <div className="relative group">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
              <Input
                id="phone"
                placeholder="237612345678"
                {...form.register('phone')}
                className="pl-11 bg-card border-border focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 rounded-xl"
              />
            </div>
            {form.formState.errors.phone && (
              <p className="text-xs font-medium text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Calendar className="h-4 w-4 text-slate-300" />
            <span>Member of platform architecture since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</span>
          </div>
        </CardContent>
        <CardFooter className="p-6 md:p-8 bg-muted/50/30 border-t border-slate-100 flex justify-end">
          <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl shadow-sm font-medium px-5">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
