'use client'

import { Globe, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

export interface SystemSettings {
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

export type TabKey = 'general' | 'security' | 'notifications' | 'system'

interface GeneralSettingsTabProps {
  settings: SystemSettings
  onChange: (key: string, value: any) => void
}

export default function GeneralSettingsTab({ settings, onChange }: GeneralSettingsTabProps) {
  return (
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
              onChange={(e) => onChange('siteName', e.target.value)}
              className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <div>
            <Label htmlFor="siteDescription">Site Description</Label>
            <Input
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => onChange('siteDescription', e.target.value)}
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
                onChange={(e) => onChange('contactEmail', e.target.value)}
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
                onChange={(e) => onChange('supportEmail', e.target.value)}
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
              onValueChange={(value) => onChange('timezone', value)}
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
              onValueChange={(value) => onChange('dateFormat', value)}
            >
              <SelectTrigger className="border-purple-200 focus:ring-purple-500">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent className="bg-white">
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
              onValueChange={(value) => onChange('currency', value)}
            >
              <SelectTrigger className="border-purple-200 focus:ring-purple-500">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="XAF">XAF - Central African CFA</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
