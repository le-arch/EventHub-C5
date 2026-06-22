/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Organizer Settings Page
 * * Allows organizers to manage their profile and account settings.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Save,
  Key,
  Bell,
  Shield,
  AlertCircle,
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Settings,
  RefreshCw,
} from 'lucide-react'

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
  phone: z.string().min(6, 'Phone number must be provided'),
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

interface UserProfileData {
  id: string
  fullName: string
  email: string
  phone: string
  isEmailVerified: boolean
  createdAt: string
}

type TabKey = 'profile' | 'security' | 'notifications'

export default function SettingsPage() {
  const router = useRouter()
  const { user: authUser, logout } = useAuthStore()
  
  // Initialize with fallback layout to prevent page rendering failure crashes
  const [user, setUser] = useState<UserProfileData>({
    id: '',
    fullName: '',
    email: '',
    phone: '',
    isEmailVerified: true,
    createdAt: new Date().toISOString()
  })
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('profile')

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
      setLoading(true)
      const response = await api.get('/auth/me')
      
      // Defensively parse data handling both raw axios layouts and unwrapped interceptor payloads
      const rawData = response?.data !== undefined ? response.data : response
      
      if (!rawData) {
        throw new Error('No user profile data payload received')
      }

      const cleanProfile: UserProfileData = {
        id: rawData.id || rawData.user?.id || '',
        fullName: rawData.fullName || rawData.user?.fullName || rawData.full_name || 'Organizer',
        email: rawData.email || rawData.user?.email || '',
        phone: rawData.phone || rawData.user?.phone || '',
        isEmailVerified: rawData.isEmailVerified ?? rawData.user?.isEmailVerified ?? true,
        createdAt: rawData.createdAt || rawData.user?.createdAt || new Date().toISOString()
      }

      setUser(cleanProfile)
      
      profileForm.reset({
        fullName: cleanProfile.fullName,
        email: cleanProfile.email,
        phone: cleanProfile.phone,
      })

      // Load preferences from localStorage
      const savedPrefs = localStorage.getItem('notification_preferences')
      if (savedPrefs) {
        setEmailNotifications(JSON.parse(savedPrefs).emailNotifications)
      }
    } catch (error) {
      console.error('Settings Profile Fetch Error:', error)
      toast.error('❌ Failed to load complete profile information')
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
      
      setUser(prev => ({ ...prev, ...data }))
      
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
      toast.success('🗑️ Account deleted successfully.')
      logout()
      router.push('/')
    } catch (error) {
      toast.error('❌ Failed to delete account')
    }
  }

  // Tab configuration
  const tabs: { key: TabKey; label: string; icon: React.ReactNode; accent: string }[] = [
    { key: 'profile', label: 'Profile', icon: <UserIcon className="h-4 w-4" />, accent: 'purple' },
    { key: 'security', label: 'Security', icon: <Lock className="h-4 w-4" />, accent: 'blue' },
    { key: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" />, accent: 'amber' },
  ]

  const accentColors: Record<string, string> = {
    purple: 'text-purple-700 border-b-purple-600 bg-purple-50',
    blue: 'text-blue-700 border-b-blue-600 bg-blue-50',
    amber: 'text-amber-700 border-b-amber-600 bg-amber-50',
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

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

      {/* Header with Purple/Blue Gradient */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 p-5 rounded-xl shadow-lg text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Settings className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings ⚙️</h1>
            <p className="text-white/80 text-sm mt-0.5">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchUserProfile}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white backdrop-blur-sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Horizontal Nav Bar Tabs */}
      <div className="w-full bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="flex w-full overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            const activeClass = isActive
              ? accentColors[tab.accent]
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200
                  border-b-2 border-transparent whitespace-nowrap flex-1 justify-center
                  ${activeClass}
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content Panels */}
      <div className="w-full">
        {/* Profile Panel */}
        {activeTab === 'profile' && (
          <Card className="w-full border-l-4 border-l-purple-500 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-purple-600" />
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
                    <UserIcon className="h-3 w-3 text-purple-500" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    {...profileForm.register('fullName')}
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                  {profileForm.formState.errors.fullName && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {profileForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-purple-500" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...profileForm.register('email')}
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
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
                    <Phone className="h-3 w-3 text-purple-500" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="237612345678"
                    {...profileForm.register('phone')}
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                  {profileForm.formState.errors.phone && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {profileForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Shield className="h-3 w-3 text-purple-500" />
                    Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes 💾'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* Security Panel */}
        {activeTab === 'security' && (
          <Card className="w-full border-l-4 border-l-blue-500 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure 🔐
              </CardDescription>
            </CardHeader>
            <form onSubmit={passwordForm.handleSubmit(handleChangePassword)}>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      {...passwordForm.register('currentPassword')}
                      className="pr-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
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

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      {...passwordForm.register('newPassword')}
                      className="pr-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
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
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      {...passwordForm.register('confirmPassword')}
                      className="pr-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
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
                <Button type="submit" disabled={isChangingPassword} className="bg-blue-600 hover:bg-blue-700">
                  <Key className="h-4 w-4 mr-2" />
                  {isChangingPassword ? 'Changing...' : 'Change Password 🔑'}
                </Button>
              </CardFooter>
            </form>

            <Card className="border-red-200 mt-6">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Danger Zone ⚠️
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="font-medium">Delete Account 🗑️</p>
                    <p className="text-sm text-gray-500">Permanently delete your account data</p>
                  </div>
                  <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="w-full sm:w-auto">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Card>
        )}

        {/* Notifications Panel */}
        {activeTab === 'notifications' && (
          <Card className="w-full border-l-4 border-l-amber-500 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-600" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-amber-600" /> Email Notifications
                  </p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePreferences} className="bg-amber-600 hover:bg-amber-700">
                <Bell className="h-4 w-4 mr-2" /> Save Preferences 💾
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

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
        <div className="mt-4 p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200">
          <p className="text-sm text-red-600 font-medium">This action completely removes your organizer credentials.</p>
        </div>
      </ConfirmationDialog>
    </div>
  )
}