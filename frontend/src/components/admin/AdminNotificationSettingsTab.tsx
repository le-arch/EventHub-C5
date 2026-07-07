'use client'

import { Bell, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { SystemSettings } from '@/components/admin/GeneralSettingsTab'

interface AdminNotificationSettingsTabProps {
  settings: SystemSettings
  onChange: (key: string, value: any) => void
}

export default function AdminNotificationSettingsTab({ settings, onChange }: AdminNotificationSettingsTabProps) {
  return (
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
            onCheckedChange={(checked) => onChange('enableEmailNotifications', checked)}
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
            onCheckedChange={(checked) => onChange('enablePushNotifications', checked)}
          />
        </div>
        <Separator />
        <div>
          <Label htmlFor="notificationEmail">Notification Email Address</Label>
          <Input
            id="notificationEmail"
            placeholder="admin@eventhub.com"
            value={settings.supportEmail}
            onChange={(e) => onChange('supportEmail', e.target.value)}
            className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
          />
        </div>
      </CardContent>
    </Card>
  )
}
