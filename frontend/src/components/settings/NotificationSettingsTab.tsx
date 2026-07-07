'use client'

import { Bell, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface NotificationSettingsTabProps {
  emailNotifications: boolean
  setEmailNotifications: (v: boolean) => void
  onSavePreferences: () => void
}

export default function NotificationSettingsTab({
  emailNotifications,
  setEmailNotifications,
  onSavePreferences,
}: NotificationSettingsTabProps) {
  return (
    <Card className="border-l-4 border-l-amber-500 border-border/80 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="p-6 md:p-8 bg-muted/50 border-b border-border/50">
        <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-600" />
          Notification Routing Preferences
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Control the alert dispatch frequencies matching connected webhook and gateway relays.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <div className="flex justify-between items-center p-4 bg-muted/50 border border-slate-100 rounded-xl transition-all hover:bg-muted/50/80">
          <div className="space-y-1 pr-4">
            <p className="font-bold text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4 text-indigo-500" />
              Transaction & Ticketing Webhook Summaries
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Receive programmatic automated accounting updates alongside immediate public ticket sale notices.
            </p>
          </div>
          <Switch
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
            className="data-[state=checked]:bg-indigo-600"
          />
        </div>
      </CardContent>
      <CardFooter className="p-6 md:p-8 bg-muted/50/30 border-t border-slate-100 flex justify-end">
        <Button onClick={onSavePreferences} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium px-5 shadow-sm">
          <Bell className="h-4 w-4 mr-2" />
          Save Channel Preferences
        </Button>
      </CardFooter>
    </Card>
  )
}
