'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Users } from 'lucide-react'

interface CheckinRecord {
  name: string
  ticketType: string
  checkedInAt: string
}

interface CheckinAnalyticsTabProps {
  recentCheckins: CheckinRecord[]
}

export function CheckinAnalyticsTab({ recentCheckins }: CheckinAnalyticsTabProps) {
  return (
    <Card className="border-l-4 border-l-purple-500 border-border/80 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Recent Check-ins
        </CardTitle>
        <CardDescription>
          Last 20 attendees checked in
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentCheckins.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p>No check-ins recorded yet</p>
            <p className="text-sm mt-1">Check-ins will appear here once attendees arrive</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Attendee Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Ticket Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Check-in Time</th>
                </tr>
              </thead>
              <tbody>
                {recentCheckins.map((checkin, index) => (
                  <tr key={index} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{checkin.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">
                        {checkin.ticketType}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {checkin.checkedInAt ? new Date(checkin.checkedInAt).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
