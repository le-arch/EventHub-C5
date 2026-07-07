'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Settings, User, Lock, Bell } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import ProfileSettingsTab, { profileSchema, passwordSchema, ProfileFormValues, PasswordFormValues } from '@/components/settings/ProfileSettingsTab'
import SecuritySettingsTab from '@/components/settings/SecuritySettingsTab'
import NotificationSettingsTab from '@/components/settings/NotificationSettingsTab'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '', email: '', phone: '' },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  useEffect(() => { fetchUserProfile() }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data.user)
      profileForm.reset({
        fullName: response.data.user.fullName,
        email: response.data.user.email,
        phone: response.data.user.phone,
      })
      const savedPrefs = localStorage.getItem('notification_preferences')
      if (savedPrefs) setEmailNotifications(JSON.parse(savedPrefs).emailNotifications)
    } catch { toast.error('Failed to load profile') }
    finally { setLoading(false) }
  }

  const handleUpdateProfile = async (data: ProfileFormValues) => {
    setIsSaving(true)
    try {
      await api.put('/auth/profile', data)
      toast.success('Profile updated successfully')
      if (authUser) Object.assign(authUser, data)
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed to update profile') }
    finally { setIsSaving(false) }
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
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed to change password') }
    finally { setIsChangingPassword(false) }
  }

  const handleSavePreferences = () => {
    localStorage.setItem('notification_preferences', JSON.stringify({ emailNotifications }))
    toast.success('Preferences saved')
  }

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/account')
      toast.success('Account permanently closed')
      logout()
      router.push('/')
    } catch { toast.error('Failed to delete account') }
  }

  if (loading) return (
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

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8 text-foreground antialiased">
      <div className="opacity-90">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/organizer/events' },
            { label: 'Settings', href: '#', isActive: true },
          ]}
          showHome
        />
      </div>

      <div className="flex items-center gap-4 pb-2 border-b border-slate-100">
        <div className="p-3 bg-indigo-50 border border-indigo-100/60 rounded-xl text-indigo-600">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Account Settings
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage your credentials, preferences, and personal visibility records
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <div className="bg-card rounded-xl shadow-sm border border-border/60 overflow-hidden">
          <div className="flex w-full overflow-x-auto">
            <TabsList className="flex bg-transparent h-auto p-0 w-full rounded-none">
              <TabsTrigger value="profile" className="flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 flex-1 justify-center border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-purple-50/50 data-[state=active]:shadow-none text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-none">
                <User className="h-4 w-4" /> Profile Details
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 flex-1 justify-center border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50 data-[state=active]:shadow-none text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-none">
                <Lock className="h-4 w-4" /> Security & Credentials
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 flex-1 justify-center border-b-2 border-transparent data-[state=active]:border-amber-600 data-[state=active]:text-amber-600 data-[state=active]:bg-amber-50/50 data-[state=active]:shadow-none text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-none">
                <Bell className="h-4 w-4" /> Notifications
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="profile" className="mt-0 focus-visible:outline-none">
          <ProfileSettingsTab form={profileForm} isSaving={isSaving} user={user} onSubmit={handleUpdateProfile} />
        </TabsContent>

        <TabsContent value="security" className="mt-0 focus-visible:outline-none space-y-6">
          <SecuritySettingsTab
            passwordForm={passwordForm}
            isChangingPassword={isChangingPassword}
            showCurrentPassword={showCurrentPassword}
            setShowCurrentPassword={setShowCurrentPassword}
            showNewPassword={showNewPassword}
            setShowNewPassword={setShowNewPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            onChangePassword={handleChangePassword}
            onDeleteAccount={handleDeleteAccount}
            showDeleteDialog={showDeleteDialog}
            setShowDeleteDialog={setShowDeleteDialog}
          />
        </TabsContent>

        <TabsContent value="notifications" className="mt-0 focus-visible:outline-none">
          <NotificationSettingsTab
            emailNotifications={emailNotifications}
            setEmailNotifications={setEmailNotifications}
            onSavePreferences={handleSavePreferences}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}