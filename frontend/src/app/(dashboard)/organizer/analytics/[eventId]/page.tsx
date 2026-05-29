/**
 * Analytics Dashboard Page
 * 
 * Displays comprehensive analytics for an event:
 * - Sales over time chart
 * - Ticket type breakdown
 * - Check-in progress
 * - Revenue summary
 * 
 * @module AnalyticsPage
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  TrendingUp,
  Ticket,
  Users,
  Calendar,
  TrendingDown,
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// shadcn/ui components
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Badge } from '@/src/components/ui/badge'

// Utilities
import api from '@/src/lib/api'
import { formatCurrency, formatDate } from '@/src/lib/utils'

// Colors for pie chart
const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

interface DailySales {
  date: string
  tickets: number
  revenue: number
}

interface TicketBreakdown {
  name: string
  sold: number
  revenue: number
  percentage: number
}

interface EventAnalytics {
  totalTickets: number
  totalRevenue: number
  checkinCount: number
  checkinPercentage: number
  dailySales: DailySales[]
  ticketBreakdown: TicketBreakdown[]
  recentCheckins: {
    name: string
    ticketType: string
    checkedInAt: string
  }[]
}

interface Event {
  id: string
  title: string
  startDate: string
  startTime: string
  venueName: string
  city: string
  status: string
}

export default function AnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [params.eventId])

  const fetchAnalytics = async () => {
    try {
      const [eventRes, analyticsRes] = await Promise.all([
        api.get(`/events/${params.eventId}`),
        api.get(`/events/${params.eventId}/analytics`),
      ])
      
      setEvent(eventRes.data.event)
      setAnalytics(analyticsRes.data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    )
  }

  if (!event || !analytics) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/organizer/events')}
          className="mb-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Events
        </Button>
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <p className="text-gray-500">
          {formatDate(event.startDate)} • {event.venueName}, {event.city}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total Tickets Sold</p>
                <p className="text-2xl font-bold">{analytics.totalTickets}</p>
              </div>
              <Ticket className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(analytics.totalRevenue)}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Checked In</p>
                <p className="text-2xl font-bold">
                  {analytics.checkinCount} / {analytics.totalTickets}
                </p>
              </div>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Check-in Rate</p>
                <p className="text-2xl font-bold">{analytics.checkinPercentage}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${analytics.checkinPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales">Sales Overview</TabsTrigger>
          <TabsTrigger value="tickets">Ticket Breakdown</TabsTrigger>
          <TabsTrigger value="checkins">Check-in Activity</TabsTrigger>
        </TabsList>

        {/* Sales Overview Tab */}
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Over Time</CardTitle>
              <CardDescription>
                Daily ticket sales and revenue trend
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.dailySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" stroke="#2563EB" />
                    <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'revenue') return formatCurrency(value as number)
                        return value
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="tickets"
                      name="Tickets Sold"
                      stroke="#2563EB"
                      fill="#2563EB"
                      fillOpacity={0.1}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ticket Breakdown Tab */}
        <TabsContent value="tickets" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Distribution</CardTitle>
                <CardDescription>
                  Percentage of tickets sold by type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.ticketBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sold"
                      >
                        {analytics.ticketBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} tickets`, 'Sold']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ticket Type Details</CardTitle>
                <CardDescription>
                  Breakdown by ticket category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.ticketBreakdown.map((ticket, index) => (
                    <div key={ticket.name} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{ticket.name}</span>
                        </div>
                        <Badge variant="outline">
                          {ticket.percentage}%
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{ticket.sold} sold</span>
                        <span>{formatCurrency(ticket.revenue)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${ticket.percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Check-in Activity Tab */}
        <TabsContent value="checkins" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Check-ins</CardTitle>
              <CardDescription>
                Last 20 attendees checked in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.recentCheckins.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No check-ins recorded yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">Attendee Name</th>
                        <th className="text-left py-2 px-3">Ticket Type</th>
                        <th className="text-left py-2 px-3">Check-in Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentCheckins.map((checkin, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-2 px-3 font-medium">{checkin.name}</td>
                          <td className="py-2 px-3">{checkin.ticketType}</td>
                          <td className="py-2 px-3 text-gray-500">
                            {new Date(checkin.checkedInAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}