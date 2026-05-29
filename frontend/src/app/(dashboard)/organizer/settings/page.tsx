/**
 * Organizer Settings Page
 * 
 * Allows organizers to manage their profile and account settings.
 * Features:
 * - Update profile information
 * - Change password
 * - Manage notification preferences
 * - View account status
 * 
 * @module SettingsPage
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Key, Bell, Shield, AlertCircle } from 'lucide-react'

// shadcn/ui components
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { Switch } from '@/src/components/ui/switch'
import { toast } from 'sonner'
import { Skeleton } from '@/src/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'

// Utilities
import api from '@/src/lib/api'
import { useAuthStore } from '@/src/store/authStore'

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
      toast.error('Failed to load profile')
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
      toast.success('Profile updated successfully')
      // Update auth store user
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
      toast.success('Password changed successfully')
      passwordForm.reset()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change password')
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
    toast.success('Preferences saved')
  }

  /**
   * Request account deletion
   */
  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/account')
      toast.success('Account deleted. We are sad to see you go!')
      logout()
      router.push('/')
    } catch (error) {
      toast.error('Failed to delete account')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)}>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    {...profileForm.register('fullName')}
                  />
                  {profileForm.formState.errors.fullName && (
                    <p className="text-sm text-red-500 mt-1">
                      {profileForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...profileForm.register('email')}
                  />
                  {profileForm.formState.errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {profileForm.formState.errors.email.message}
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
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    {...profileForm.register('phone')}
                  />
                  {profileForm.formState.errors.phone && (
                    <p className="text-sm text-red-500 mt-1">
                      {profileForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-500">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <form onSubmit={passwordForm.handleSubmit(handleChangePassword)}>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...passwordForm.register('currentPassword')}
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...passwordForm.register('newPassword')}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register('confirmPassword')}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isChangingPassword}>
                  <Key className="h-4 w-4 mr-2" />
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 mt-6">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible account actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-gray-500">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
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
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Email Notifications</p>
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
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your events, tickets, and attendee data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, delete my account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}