/**
 * Admin Settings Page
 * 
 * Allows admin to configure system settings and preferences.
 * Features include:
 * - Horizontal nav bar (full-width) as separate component
 * - Full-width content panels
 * - General, Security, Notifications, System tabs
 * - Breadcrumb navigation
 * 
 * @module AdminSettingsPage
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Settings,
  Globe,
  Shield,
  Bell,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Server,
  Mail,
  Zap,
} from 'lucide-react'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

// Custom components
import { Breadcrumb as CustomBreadcrumb } from '@/components/common/Breadcrumb'

// Types
interface SystemSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  supportEmail: string
  timezone: string
  dateFormat: string
  currency: string
  requireEmailVerification: boolean
  sessionTimeout: number
  passwordMinLength: number
  requireUppercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  enableEmailNotifications: boolean
  enablePushNotifications: boolean
  maintenanceMode: boolean
}

type TabKey = 'general' | 'security' | 'notifications' | 'system'

export default function AdminSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('general')

  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'EventHub',
    siteDescription: 'Event Management Platform for Cameroon',
    contactEmail: 'contact@eventhub.com',
    supportEmail: 'support@eventhub.com',
    timezone: 'Africa/Douala',
    dateFormat: 'DD/MM/YYYY',
    currency: 'XAF',
    requireEmailVerification: true,
    sessionTimeout: 60,
    passwordMinLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    enableEmailNotifications: true,
    enablePushNotifications: false,
    maintenanceMode: false,
  })

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      toast.success('✅ Settings saved successfully!')
    } catch (error) {
      toast.error('❌ Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    toast.info('🔄 Settings reset to default')
  }

  // ----- Tab configuration -----
  const tabs: { key: TabKey; label: string; icon: React.ReactNode; accent: string }[] = [
    { key: 'general', label: 'General', icon: <Globe className="h-4 w-4" />, accent: 'purple' },
    { key: 'security', label: 'Security', icon: <Shield className="h-4 w-4" />, accent: 'blue' },
    { key: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" />, accent: 'amber' },
    { key: 'system', label: 'System', icon: <Server className="h-4 w-4" />, accent: 'emerald' },
  ]

  const accentColors: Record<string, string> = {
    purple: 'text-purple-700 border-b-purple-600 bg-purple-50',
    blue: 'text-blue-700 border-b-blue-600 bg-blue-50',
    amber: 'text-amber-700 border-b-amber-600 bg-amber-50',
    emerald: 'text-emerald-700 border-b-emerald-600 bg-emerald-50',
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-64 animate-pulse bg-gray-200 rounded" />
        <div className="h-24 w-full animate-pulse bg-gray-200 rounded-xl" />
        <div className="h-96 w-full animate-pulse bg-gray-200 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <CustomBreadcrumb 
        items={[
          { label: 'Admin', href: '/admin/users' },
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
            <h1 className="text-2xl font-bold">System Settings <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600" >⚙️</span> </h1>
            <p className="text-white/80 text-sm mt-0.5">
              Configure platform settings and preferences
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white backdrop-blur-sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Defaults
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-white text-purple-600 hover:bg-gray-100"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4 text-gray-500" />
                Save Settings
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* 
          NAVIGATION TABS – FULL WIDTH (Separate Component) */}
      <div className="w-full bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="flex w-full overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            const activeClass = isActive ? accentColors[tab.accent] : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200
                  border-b-2 border-transparent whitespace-nowrap flex-1 justify-center
                  ${activeClass}
                  ${isActive ? `border-b-${tab.accent === 'purple' ? 'purple' : tab.accent}-600` : 'hover:border-gray-300'}
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 
          CONTENT PANELS – FULL WIDTH (Separate Component) */}
      <div className="w-full">
        {/* General Panel */}
        {activeTab === 'general' && (
          <Card className="w-full border-l-4 border-l-purple-500 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-600" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic platform configuration and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Input
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="pl-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                      className="pl-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                  >
                    <SelectTrigger className="border-purple-200 focus:ring-purple-500">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Africa/Douala">Africa/Douala (UTC+1)</SelectItem>
                      <SelectItem value="Africa/Lagos">Africa/Lagos (UTC+1)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={settings.dateFormat}
                    onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}
                  >
                    <SelectTrigger className="border-purple-200 focus:ring-purple-500">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent className="bg-white" >
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => setSettings({ ...settings, currency: value })}
                  >
                    <SelectTrigger className="border-purple-200 focus:ring-purple-500">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="bg-white" >
                      <SelectItem value="XAF">XAF - Central African CFA</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Panel */}
        {activeTab === 'security' && (
          <Card className="w-full border-l-4 border-l-blue-500 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Authentication and security policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 60 })}
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) || 8 })}
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Require Uppercase Letters</p>
                    <p className="text-sm text-gray-500">Password must contain at least one uppercase letter</p>
                  </div>
                  <Switch
                    checked={settings.requireUppercase}
                    onCheckedChange={(checked) => setSettings({ ...settings, requireUppercase: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Require Numbers</p>
                    <p className="text-sm text-gray-500">Password must contain at least one number</p>
                  </div>
                  <Switch
                    checked={settings.requireNumbers}
                    onCheckedChange={(checked) => setSettings({ ...settings, requireNumbers: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Require Special Characters</p>
                    <p className="text-sm text-gray-500">Password must contain at least one special character</p>
                  </div>
                  <Switch
                    checked={settings.requireSpecialChars}
                    onCheckedChange={(checked) => setSettings({ ...settings, requireSpecialChars: checked })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Require Email Verification</p>
                  <p className="text-sm text-gray-500">New users must verify their email address</p>
                </div>
                <Switch
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
                />
              </div>
            </CardContent>
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
              <CardDescription>
                Configure notification channels and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-amber-600" />
                    Email Notifications
                  </p>
                  <p className="text-sm text-gray-500">Send system notifications via email</p>
                </div>
                <Switch
                  checked={settings.enableEmailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableEmailNotifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-600" />
                    Push Notifications
                  </p>
                  <p className="text-sm text-gray-500">Send push notifications to admin devices</p>
                </div>
                <Switch
                  checked={settings.enablePushNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, enablePushNotifications: checked })}
                />
              </div>
              <Separator />
              <div>
                <Label htmlFor="notificationEmail">Notification Email Address</Label>
                <Input
                  id="notificationEmail"
                  placeholder="admin@eventhub.com"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Panel */}
        {activeTab === 'system' && (
          <Card className="w-full border-l-4 border-l-emerald-500 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-emerald-600" />
                System Status & Configuration
              </CardTitle>
              <CardDescription>
                System health, maintenance mode, and advanced settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">Database</span>
                  </div>
                  <p className="text-sm text-emerald-700 mt-1">Connected ✓</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">API Server</span>
                  </div>
                  <p className="text-sm text-emerald-700 mt-1">Running ✓</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <span className="font-medium">Email Service</span>
                  </div>
                  <p className="text-sm text-amber-700 mt-1"> Not Configured</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-600" />
                    Maintenance Mode
                  </p>
                  <p className="text-sm text-gray-500">Put the platform in maintenance mode (all users see maintenance page)</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Danger Zone</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  Resetting the platform will clear all data. This action cannot be undone.
                </p>
                <Button variant="destructive" className="mt-3" size="sm">
                  Reset Platform
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Save Changes Footer */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4 text-gray-500" />
              Save Settings
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}