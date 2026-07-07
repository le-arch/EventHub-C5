'use client'

import { Shield } from 'lucide-react'
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
import type { SystemSettings } from '@/components/admin/GeneralSettingsTab'

interface AdminSecuritySettingsTabProps {
  settings: SystemSettings
  onChange: (key: string, value: any) => void
}

export default function AdminSecuritySettingsTab({ settings, onChange }: AdminSecuritySettingsTabProps) {
  return (
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
              onChange={(e) => onChange('sessionTimeout', parseInt(e.target.value) || 60)}
              className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
            <Input
              id="passwordMinLength"
              type="number"
              value={settings.passwordMinLength}
              onChange={(e) => onChange('passwordMinLength', parseInt(e.target.value) || 8)}
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
              onCheckedChange={(checked) => onChange('requireUppercase', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Require Numbers</p>
              <p className="text-sm text-gray-500">Password must contain at least one number</p>
            </div>
            <Switch
              checked={settings.requireNumbers}
              onCheckedChange={(checked) => onChange('requireNumbers', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Require Special Characters</p>
              <p className="text-sm text-gray-500">Password must contain at least one special character</p>
            </div>
            <Switch
              checked={settings.requireSpecialChars}
              onCheckedChange={(checked) => onChange('requireSpecialChars', checked)}
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
            onCheckedChange={(checked) => onChange('requireEmailVerification', checked)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
