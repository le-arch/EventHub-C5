'use client'

import { AlertCircle, CheckCircle, Server, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

interface SystemSettingsTabProps {
  settings: SystemSettings
  onChange: (key: string, value: any) => void
}

export default function SystemSettingsTab({ settings, onChange }: SystemSettingsTabProps) {
  return (
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
            onCheckedChange={(checked) => onChange('maintenanceMode', checked)}
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
  )
}
