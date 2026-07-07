'use client'

import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PieChart, Ticket } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

interface TicketBreakdown {
  name: string
  sold: number
  revenue: number
  percentage: number
}

interface TicketAnalyticsTabProps {
  ticketBreakdown: TicketBreakdown[]
}

export function TicketAnalyticsTab({ ticketBreakdown }: TicketAnalyticsTabProps) {
  return (
    <div className="border-l-4 border-l-emerald-500 bg-card border-border/80 shadow-sm rounded-2xl p-5">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Ticket Distribution
            </CardTitle>
            <CardDescription>
              Percentage of tickets sold by type
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ticketBreakdown.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Ticket className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p>No ticket data available</p>
                </div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={ticketBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="sold"
                    >
                      {ticketBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} tickets`, 'Sold']} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              Ticket Type Details
            </CardTitle>
            <CardDescription>
              Breakdown by ticket category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ticketBreakdown.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Ticket className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p>No ticket types available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ticketBreakdown.map((ticket, index) => (
                  <div key={ticket.name} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{ticket.name}</span>
                      </div>
                      <Badge variant="outline" className="font-mono">
                        {ticket.percentage}%
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{ticket.sold} sold</span>
                      <span>{formatCurrency(ticket.revenue)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${ticket.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
