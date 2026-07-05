/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Organizer Settings Page
 * 
 * Allows organizers to manage their profile and account settings.
 * Features:
 * - Update profile information
 * - Change password
 * - Manage notification preferences
 * - View account status
 * - Breadcrumb navigation
 * - Confirmation dialog for destructive actions
 * 
 * @module SettingsPage
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Key, Bell, Shield, AlertCircle, User, Mail, Phone, Lock, Eye, EyeOff, Trash2, Settings, Calendar, Sun } from 'lucide-react'

// shadcn/ui components
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog'
import { ThemeSelector } from '@/components/settings/ThemeSelector'

// Utilities
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

// Profile update schema
const profileSchema = z.object({
  fullName: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(12, 'Phone number must be at least 12 digits'),
})

// Password change schema
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

interface User {
  id: string
  fullName: string
  email: string
  phone: string
  isEmailVerified: boolean
  createdAt: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { user: authUser, logout } = useAuthStore()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
    },
  })

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  // Fetch user data
  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data)
      profileForm.reset({
        fullName: response.data.fullName,
        email: response.data.email,
        phone: response.data.phone,
      })
      const savedPrefs = localStorage.getItem('notification_preferences')
      if (savedPrefs) {
        setEmailNotifications(JSON.parse(savedPrefs).emailNotifications)
      }
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (data: ProfileFormValues) => {
    setIsSaving(true)
    try {
      await api.put('/auth/profile', data)
      toast.success('Profile updated successfully')
      if (authUser) {
        authUser.fullName = data.fullName
        authUser.email = data.email
        authUser.phone = data.phone
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (data: PasswordFormValues) => {
    setIsChangingPassword(true)
    try {
      await api.post('/auth/change-password', {
        current_password: data.currentPassword,
        new_password: data.newPassword,
      })
      toast.success('Password changed successfully')
      passwordForm.reset()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSavePreferences = () => {
    const preferences = { emailNotifications }
    localStorage.setItem('notification_preferences', JSON.stringify(preferences))
    toast.success('Preferences saved')
  }

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/account')
      toast.success('Account permanently closed')
      logout()
      router.push('/')
    } catch (error) {
      toast.error('Failed to delete account')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8">
        <Skeleton className="h-5 w-48 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 rounded-md" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8 text-slate-900 antialiased">
      {/* Breadcrumb */}
      <div className="opacity-90">
        <Breadcrumb 
          items={[
            { label: 'Dashboard', href: '/organizer/events' },
            { label: 'Settings', href: '#', isActive: true },
          ]}
          showHome
        />
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 pb-2 border-b border-slate-100">
        <div className="p-3 bg-indigo-50 border border-indigo-100/60 rounded-xl text-indigo-600">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Account Settings
          </h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">
            Manage your profile, security, and notification preferences
          </p>
        </div>
      </div>

      {/* Vertical Tabs Layout */}
      <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-6 md:gap-8">
        <TabsList className="flex flex-row md:flex-col bg-card border border-border rounded-2xl p-2 shadow-sm h-fit w-full md:w-56 shrink-0 gap-1">
          <TabsTrigger 
            value="profile" 
            className="flex items-center gap-3 justify-start w-full px-4 py-3 text-sm font-medium rounded-xl data-active:bg-indigo-50 dark:data-active:bg-indigo-900/30 data-active:text-indigo-700 dark:data-active:text-indigo-300 data-active:border-l-indigo-500 dark:data-active:border-l-indigo-400 data-active:shadow-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            <User className="h-4 w-4 shrink-0" />
            Profile Details
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="flex items-center gap-3 justify-start w-full px-4 py-3 text-sm font-medium rounded-xl data-active:bg-indigo-50 dark:data-active:bg-indigo-900/30 data-active:text-indigo-700 dark:data-active:text-indigo-300 data-active:border-l-indigo-500 dark:data-active:border-l-indigo-400 data-active:shadow-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            <Lock className="h-4 w-4 shrink-0" />
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="flex items-center gap-3 justify-start w-full px-4 py-3 text-sm font-medium rounded-xl data-active:bg-indigo-50 dark:data-active:bg-indigo-900/30 data-active:text-indigo-700 dark:data-active:text-indigo-300 data-active:border-l-indigo-500 dark:data-active:border-l-indigo-400 data-active:shadow-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            <Bell className="h-4 w-4 shrink-0" />
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="appearance" 
            className="flex items-center gap-3 justify-start w-full px-4 py-3 text-sm font-medium rounded-xl data-active:bg-indigo-50 dark:data-active:bg-indigo-900/30 data-active:text-indigo-700 dark:data-active:text-indigo-300 data-active:border-l-indigo-500 dark:data-active:border-l-indigo-400 data-active:shadow-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            <Sun className="h-4 w-4 shrink-0" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-w-0">
        {/* Profile Content Segment */}
        <TabsContent value="profile" className="mt-0 focus-visible:outline-none">
          <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm">
                Update your personal information and contact details.
              </CardDescription>
            </CardHeader>
            <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)}>
              <CardContent className="p-6 md:p-8 space-y-6">
                
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Full Name
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      {...profileForm.register('fullName')}
                      className="pl-11 bg-white border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 rounded-xl"
                    />
                  </div>
                  {profileForm.formState.errors.fullName && (
                    <p className="text-xs font-medium text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {profileForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      {...profileForm.register('email')}
                      className="pl-11 bg-white border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 rounded-xl"
                    />
                  </div>
                  {profileForm.formState.errors.email && (
                    <p className="text-xs font-medium text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {profileForm.formState.errors.email.message}
                    </p>
                  )}
                  {!user.isEmailVerified && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2.5 mt-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>Email not verified. Check your inbox for the verification link.</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Phone Number
                  </Label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <Input
                      id="phone"
                      placeholder="237612345678"
                      {...profileForm.register('phone')}
                      className="pl-11 bg-white border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 rounded-xl"
                    />
                  </div>
                  {profileForm.formState.errors.phone && (
                    <p className="text-xs font-medium text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {profileForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <Calendar className="h-4 w-4 text-slate-300" />
                  <span>Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</span>
                </div>
              </CardContent>
              <CardFooter className="p-6 md:p-8 bg-slate-50/30 border-t border-slate-100 flex justify-end">
                <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl shadow-sm font-medium px-5">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Security Content Segment */}
        <TabsContent value="security" className="mt-0 focus-visible:outline-none space-y-6">
          <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Lock className="h-5 w-5 text-indigo-600" />
                Change Password
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm">
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <form onSubmit={passwordForm.handleSubmit(handleChangePassword)}>
              <CardContent className="p-6 md:p-8 space-y-5">
                
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      {...passwordForm.register('currentPassword')}
                      className="pl-11 pr-10 bg-white border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-xs font-medium text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wider text-slate-500">New Password</Label>
                  <div className="relative group">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      {...passwordForm.register('newPassword')}
                      className="pl-11 pr-10 bg-white border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs font-medium text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                  <p className="text-[11px] font-medium text-slate-400 leading-normal bg-slate-50 border border-slate-100 rounded-lg p-2">
                    Must be at least 8 characters with at least one uppercase letter and one number.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Confirm New Password</Label>
                  <div className="relative group">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      {...passwordForm.register('confirmPassword')}
                      className="pl-11 pr-10 bg-white border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-xs font-medium text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-6 md:p-8 bg-slate-50/30 border-t border-slate-100 flex justify-end">
                <Button type="submit" disabled={isChangingPassword} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium px-5 shadow-sm">
                  <Key className="h-4 w-4 mr-2" />
                  {isChangingPassword ? 'Updating...' : 'Update Password Security'}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Danger Zone Structure Component */}
          <Card className="border border-rose-100 bg-rose-50/20 rounded-2xl overflow-hidden shadow-none">
            <CardHeader className="p-6 md:p-8 border-b border-rose-100/60 bg-rose-50/40">
              <CardTitle className="text-rose-700 text-xl font-bold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-600" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-rose-600/80 text-sm">
                Irreversible account actions. Proceed with caution.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                  <p className="font-bold text-slate-800">Delete Account</p>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
                    Permanently delete your account and remove all associated data. This cannot be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 active:scale-98 font-semibold rounded-xl px-5 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Close Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Content Segment */}
        <TabsContent value="appearance" className="mt-0 focus-visible:outline-none">
          <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Sun className="h-5 w-5 text-indigo-600" />
                Appearance
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm">
                Choose how EventHub looks for you. Changes apply instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <ThemeSelector />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Content Segment */}
        <TabsContent value="notifications" className="mt-0 focus-visible:outline-none">
          <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Bell className="h-5 w-5 text-indigo-600" />
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm">
                Choose which notifications you want to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-xl transition-all hover:bg-slate-50/80">
                <div className="space-y-1 pr-4">
                  <p className="font-bold text-slate-800 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-indigo-500" />
                    Email Notifications
                  </p>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Receive email updates about ticket sales and event activity.
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  className="data-[state=checked]:bg-indigo-600"
                />
              </div>
            </CardContent>
            <CardFooter className="p-6 md:p-8 bg-slate-50/30 border-t border-slate-100 flex justify-end">
              <Button onClick={handleSavePreferences} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium px-5 shadow-sm">
                <Bell className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </div>
      </Tabs>

      {/* Structured Account Purge Confirmation Overlays */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        description="Are you sure you want to permanently delete your account?"
        confirmText="Delete Account"
        cancelText="Cancel"
        variant="danger"
      >
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-left space-y-3">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span className="font-bold text-sm">This action cannot be undone</span>
          </div>
          <ul className="space-y-1.5 text-xs text-rose-600 font-medium pl-5 list-disc leading-relaxed">
            <li>All your events and ticket types will be permanently deleted.</li>
            <li>All sales records, attendee data, and revenue history will be removed.</li>
            <li>Your account cannot be recovered after deletion.</li>
          </ul>
        </div>
      </ConfirmationDialog>
    </div>
  )
}