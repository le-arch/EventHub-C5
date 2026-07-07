// page.tsx - Admin Settings
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Settings,
  Globe,
  Shield,
  Bell,
  Server,
  Save,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

import { Breadcrumb as CustomBreadcrumb } from '@/components/common/Breadcrumb'
import GeneralSettingsTab, { type SystemSettings, type TabKey } from '@/components/admin/GeneralSettingsTab'
import AdminSecuritySettingsTab from '@/components/admin/AdminSecuritySettingsTab'
import AdminNotificationSettingsTab from '@/components/admin/AdminNotificationSettingsTab'
import SystemSettingsTab from '@/components/admin/SystemSettingsTab'

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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      toast.success('✅ Settings saved successfully!')
    } catch {
      toast.error('❌ Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    toast.info('🔄 Settings reset to default')
  }

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; accent: string }[] = [
    { key: 'general', label: 'General', icon: <Globe className="h-4 w-4" />, accent: 'purple' },
    { key: 'security', label: 'Security', icon: <Shield className="h-4 w-4" />, accent: 'blue' },
    { key: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" />, accent: 'amber' },
    { key: 'system', label: 'System', icon: <Server className="h-4 w-4" />, accent: 'emerald' },
  ]

  const accentColors: Record<string, string> = {
    purple: 'text-purple-600 border-b-purple-600 bg-purple-50/50',
    blue: 'text-blue-600 border-b-blue-600 bg-blue-50/50',
    amber: 'text-amber-600 border-b-amber-600 bg-amber-50/50',
    emerald: 'text-emerald-600 border-b-emerald-600 bg-emerald-50/50',
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

  // Get the accent color for the active tab
  const activeTabInfo = tabs.find(t => t.key === activeTab)
  const activeAccent = activeTabInfo?.accent || 'purple'

  return (
    <div className="space-y-6">
      <CustomBreadcrumb
        items={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Settings', href: '#', isActive: true },
        ]}
        showHome
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 p-5 rounded-xl shadow-lg text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Settings className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">System Settings ⚙️</h1>
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
            className="bg-card text-purple-600 hover:bg-muted"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Settings
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs Container - Using Tabs component from shadcn/ui */}
      <div className="w-full">
        <div className="w-full bg-card rounded-xl shadow-sm border border-border/60 overflow-hidden">
          {/* Tab Triggers */}
          <div className="flex w-full overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key
              const activeClass = isActive ? accentColors[tab.accent] : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200
                    border-b-2 border-transparent whitespace-nowrap flex-1 justify-center
                    ${activeClass}
                    ${isActive ? `border-b-${tab.accent === 'purple' ? 'purple' : tab.accent}-600` : 'hover:border-border'}
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content - Directly under the triggers */}
        <div className="mt-6">
          {activeTab === 'general' && (
            <GeneralSettingsTab settings={settings} onChange={handleChange} />
          )}
          {activeTab === 'security' && (
            <AdminSecuritySettingsTab settings={settings} onChange={handleChange} />
          )}
          {activeTab === 'notifications' && (
            <AdminNotificationSettingsTab settings={settings} onChange={handleChange} />
          )}
          {activeTab === 'system' && (
            <SystemSettingsTab settings={settings} onChange={handleChange} />
          )}
        </div>
      </div>

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
              <Save className="h-4 w-4" />
              Save Settings
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}