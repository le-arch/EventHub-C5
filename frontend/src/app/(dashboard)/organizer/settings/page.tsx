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
import { Save, Key, Bell, Shield, AlertCircle, User, Mail, Phone, Lock, Eye, EyeOff, Trash2, Settings } from 'lucide-react'

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
      setUser(response.data.user)
      profileForm.reset({
        fullName: response.data.user.fullName,
        email: response.data.user.email,
        phone: response.data.user.phone,
      })
      // Load preferences from localStorage
      const savedPrefs = localStorage.getItem('notification_preferences')
      if (savedPrefs) {
        setEmailNotifications(JSON.parse(savedPrefs).emailNotifications)
      }
    } catch (error) {
      toast.error('❌ Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Update profile information
   */
  const handleUpdateProfile = async (data: ProfileFormValues) => {
    setIsSaving(true)
    try {
      await api.put('/auth/profile', data)
      toast.success('✅ Profile updated successfully')
      // Update auth store user
      if (authUser) {
        authUser.fullName = data.fullName
        authUser.email = data.email
        authUser.phone = data.phone
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || '❌ Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Change password
   */
  const handleChangePassword = async (data: PasswordFormValues) => {
    setIsChangingPassword(true)
    try {
      await api.post('/auth/change-password', {
        current_password: data.currentPassword,
        new_password: data.newPassword,
      })
      toast.success('✅ Password changed successfully')
      passwordForm.reset()
    } catch (error: any) {
      toast.error(error.response?.data?.error || '❌ Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  /**
   * Save notification preferences
   */
  const handleSavePreferences = () => {
    const preferences = { emailNotifications }
    localStorage.setItem('notification_preferences', JSON.stringify(preferences))
    toast.success('✅ Preferences saved')
  }

  /**
   * Request account deletion
   */
  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/account')
      toast.success('🗑️ Account deleted. We are sad to see you go!')
      logout()
      router.push('/')
    } catch (error) {
      toast.error('❌ Failed to delete account')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Dashboard', href: '/organizer/events' },
          { label: 'Settings', href: '#', isActive: true },
        ]}
        showHome
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Settings ⚙️</h1>
          <p className="text-gray-500 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile 👤
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security 🔒
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications 🔔
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)}>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    {...profileForm.register('fullName')}
                  />
                  {profileForm.formState.errors.fullName && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {profileForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...profileForm.register('email')}
                  />
                  {profileForm.formState.errors.email && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {profileForm.formState.errors.email.message}
                    </p>
                  )}
                  {!user.isEmailVerified && (
                    <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Email not verified. Check your inbox for verification link.
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="237612345678"
                    {...profileForm.register('phone')}
                  />
                  {profileForm.formState.errors.phone && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {profileForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes 💾'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure 🔐
              </CardDescription>
            </CardHeader>
            <form onSubmit={passwordForm.handleSubmit(handleChangePassword)}>
              <CardContent className="space-y-4">
                {/* Current Password */}
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      {...passwordForm.register('currentPassword')}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      {...passwordForm.register('newPassword')}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Must be at least 8 characters with one uppercase letter and one number
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      {...passwordForm.register('confirmPassword')}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isChangingPassword}>
                  <Key className="h-4 w-4 mr-2" />
                  {isChangingPassword ? 'Changing...' : 'Change Password 🔑'}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 mt-6">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Danger Zone ⚠️
              </CardTitle>
              <CardDescription>
                Irreversible account actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="font-medium">Delete Account 🗑️</p>
                  <p className="text-sm text-gray-500">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to receive notifications 🔔
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Email Notifications
                  </p>
                  <p className="text-sm text-gray-500">
                    Receive event updates and ticket sale alerts via email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePreferences}>
                <Bell className="h-4 w-4 mr-2" />
                Save Preferences 💾
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Account Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteAccount}
        title="⚠️ Delete Account"
        description="Are you absolutely sure you want to delete your account?"
        confirmText="Yes, Delete My Account"
        cancelText="Cancel"
        variant="danger"
      >
        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Warning! This action cannot be undone.</span>
          </div>
          <ul className="space-y-1 text-sm text-red-600 ml-6 list-disc">
            <li>All your events will be permanently deleted</li>
            <li>All ticket sales and attendee data will be removed</li>
            <li>You will lose access to your organizer account</li>
            <li>Your email and phone cannot be used to register again immediately</li>
          </ul>
        </div>
      </ConfirmationDialog>
    </div>
  )
}