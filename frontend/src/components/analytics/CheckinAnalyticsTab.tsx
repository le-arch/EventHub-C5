'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Ticket, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface TicketBreakdown {
  name: string
  sold: number
  revenue: number
  percentage: number
}

interface CheckinRecord {
  name: string
  ticketType: string
  checkedInAt: string
}

interface CheckinAnalyticsTabProps {
  recentCheckins: CheckinRecord[]
  ticketBreakdown?: TicketBreakdown[]
}

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export function CheckinAnalyticsTab({ recentCheckins, ticketBreakdown }: CheckinAnalyticsTabProps) {
  return (
    <div className="space-y-6">
      {/* Ticket Type Breakdown */}
      {ticketBreakdown && ticketBreakdown.length > 0 && (
        <Card className="border-l-4 border-l-emerald-500 border-border/80 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              Ticket Types
            </CardTitle>
            <CardDescription>
              Check-in breakdown by ticket category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ticketBreakdown.map((ticket, index) => (
                <div
                  key={ticket.name}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{ticket.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.sold} sold &middot; {formatCurrency(ticket.revenue)}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {ticket.percentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Check-ins */}
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
                        <Badge variant="outline" className="text-xs bg-blue-300">
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
    </div>
  )
}
