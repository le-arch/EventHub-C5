/**
 * Analytics Dashboard Page
 * 
 * Displays comprehensive analytics for an event:
 * - Sales over time chart
 * - Ticket type breakdown
 * - Check-in progress
 * - Revenue summary
 * - Breadcrumb navigation
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
  MapPin,
  TrendingDown,
  BarChart3,
  PieChart,
  CheckCircle,
  Clock,
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RePieChart,
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
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'

// Utilities
import api from '@/lib/api'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

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
  venue: string
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

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600">
              🎟️ Tickets Sold: <span className="font-semibold">{payload[0]?.value || 0}</span>
            </p>
            <p className="text-green-600">
              💰 Revenue: <span className="font-semibold">{formatCurrency(payload[1]?.value || 0)}</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!event || !analytics) return null

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Dashboard', href: '/organizer/events' },
          { label: 'Events', href: '/organizer/events' },
          { label: event.title, href: `/organizer/events/${event.id}` },
          { label: 'Analytics', href: '#', isActive: true },
        ]}
        showHome
      />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/organizer/events')}
            className="-ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Events
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600" > 📊</span></h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
              <Calendar className="h-3 w-3" />
              {formatDate(event.startDate)} at {formatTime(event.startTime)}
              <span className="mx-1">•</span>
              <MapPin className="h-3 w-3" />
              {event.venue}, {event.city}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total Tickets Sold </p>
                <p className="text-3xl font-bold text-blue-600">{analytics.totalTickets}</p>
              </div>
              <Ticket className="h-5 w-5 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total Revenue </p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(analytics.totalRevenue)}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Checked In </p>
                <p className="text-3xl font-bold text-purple-600">
                  {analytics.checkinCount} / {analytics.totalTickets}
                </p>
              </div>
              <Users className="h-5 w-5 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Check-in Rate </p>
                  <p className="text-3xl font-bold text-amber-600">{analytics.checkinPercentage}%</p>
                </div>
                <TrendingUp className="h-5 w-5 text-amber-400" />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${analytics.checkinPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Sales 
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <PieChart className="h-4 w-4 text-green-600" />
            Tickets 
          </TabsTrigger>
          <TabsTrigger value="checkins" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-purple-400" />
            Check-ins 
          </TabsTrigger>
        </TabsList>

        {/* Sales Overview Tab */}
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Sales Over Time
              </CardTitle>
              <CardDescription>
                Daily ticket sales and revenue trend 
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.dailySales.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Ticket className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No sales data available yet </p>
                    <p className="text-sm mt-1">Sales will appear once tickets are purchased</p>
                  </div>
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.dailySales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        tickLine={false}
                      />
                      <YAxis 
                        yAxisId="left" 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        tickLine={false}
                        label={{ value: 'Tickets Sold', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6B7280' } }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right"
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        tickLine={false}
                        tickFormatter={(value) => `${value / 1000}k`}
                        label={{ value: 'Revenue (XAF)', angle: 90, position: 'insideRight', style: { fontSize: 12, fill: '#6B7280' } }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="tickets"
                        name="Tickets Sold"
                        stroke="#2563EB"
                        fill="#2563EB"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ticket Breakdown Tab */}
        <TabsContent value="tickets" className="space-y-6">
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
                {analytics.ticketBreakdown.length === 0 ? (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Ticket className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No ticket data available</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={analytics.ticketBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="sold"
                        >
                          {analytics.ticketBreakdown.map((entry, index) => (
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
                {analytics.ticketBreakdown.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Ticket className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No ticket types available</p>
                  </div>
                ) : (
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
                          <Badge variant="outline" className="font-mono">
                            {ticket.percentage}%
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span> {ticket.sold} sold</span>
                          <span> {formatCurrency(ticket.revenue)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
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
        </TabsContent>

        {/* Check-in Activity Tab */}
        <TabsContent value="checkins" className="space-y-6">
          <Card>
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
              {analytics.recentCheckins.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No check-ins recorded yet 📭</p>
                  <p className="text-sm mt-1">Check-ins will appear here once attendees arrive</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-sm"><span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600" >👤</span> Attendee Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm"><span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600" >🎟️</span> Ticket Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm"><span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600" >⏰</span> Check-in Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentCheckins.map((checkin, index) => (
                        <tr key={index} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-medium">{checkin.name}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs">
                              {checkin.ticketType}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-500">
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