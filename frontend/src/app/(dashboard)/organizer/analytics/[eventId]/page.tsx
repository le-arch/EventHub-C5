/**
 * Analytics Dashboard Page
 *
 * Displays comprehensive analytics for an event:
 * - Sales over time chart
 * - Ticket type breakdown
 * - Check-in progress and recent check-ins
 *
 * @module AnalyticsPage
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  TrendingUp,
  Ticket,
  Users,
  Calendar,
  MapPin,
  BarChart3,
  PieChart,
  CheckCircle,
  Clock,
  DollarSign,
} from 'lucide-react'
import {
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

      setEvent(eventRes.data)
      setAnalytics(analyticsRes.data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover p-3 rounded-lg shadow-lg border border-border">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600 dark:text-blue-400">
              Tickets Sold: <span className="font-semibold">{payload[0]?.value || 0}</span>
            </p>
            <p className="text-green-600 dark:text-green-400">
              Revenue: <span className="font-semibold">{formatCurrency(payload[1]?.value || 0)}</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8">
        <Skeleton className="h-5 w-48 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 rounded-md" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (!event || !analytics) return null

  const summaryCards = [
    {
      label: 'Total Tickets Sold',
      value: analytics.totalTickets.toLocaleString(),
      icon: Ticket,
      color: 'blue',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(analytics.totalRevenue),
      icon: DollarSign,
      color: 'green',
    },
    {
      label: 'Checked In',
      value: `${analytics.checkinCount} / ${analytics.totalTickets}`,
      icon: Users,
      color: 'purple',
    },
    {
      label: 'Check-in Rate',
      value: `${analytics.checkinPercentage}%`,
      icon: TrendingUp,
      color: 'amber',
      progress: analytics.checkinPercentage,
    },
  ] as const

  const colorClasses = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      icon: 'text-blue-500 dark:text-blue-400',
      bar: 'bg-blue-500',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-400',
      icon: 'text-green-500 dark:text-green-400',
      bar: 'bg-green-500',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
      icon: 'text-purple-500 dark:text-purple-400',
      bar: 'bg-purple-500',
    },
    amber: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-600 dark:text-amber-400',
      icon: 'text-amber-500 dark:text-amber-400',
      bar: 'bg-amber-500',
    },
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8">
      {/* Breadcrumb */}
      <div className="opacity-90">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/organizer/events' },
            { label: 'Events', href: '/organizer/events' },
            { label: event.title, href: `/organizer/events/${event.id}` },
            { label: 'Analytics', href: '#', isActive: true },
          ]}
          showHome
        />
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 pb-2 border-b border-border">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100/60 dark:border-indigo-800/60 rounded-xl text-indigo-600 dark:text-indigo-400">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Event Analytics
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base flex items-center gap-2 flex-wrap">
            <Calendar className="h-3 w-3" />
            {formatDate(event.startDate)} at {formatTime(event.startTime)}
            <span className="mx-1">&bull;</span>
            <MapPin className="h-3 w-3" />
            {event.venue}, {event.city}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const c = colorClasses[card.color]
          const Icon = card.icon
          return (
            <Card key={card.label} className="border border-border shadow-sm rounded-2xl">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className={`text-2xl font-bold ${c.text}`}>{card.value}</p>
                  </div>
                  <div className={`p-2 ${c.bg} rounded-lg`}>
                    <Icon className={`h-5 w-5 ${c.icon}`} />
                  </div>
                </div>
                {'progress' in card && card.progress !== undefined && (
                  <div className="mt-3 w-full bg-muted rounded-full h-2">
                    <div
                      className={`${c.bar} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${card.progress}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Vertical Tabs Layout */}
      <Tabs defaultValue="sales" className="flex flex-col md:flex-row gap-6 md:gap-8">
        <TabsList className="flex flex-row md:flex-col bg-card border border-border rounded-2xl p-2 shadow-sm h-fit w-full md:w-48 shrink-0 gap-1">
          <TabsTrigger
            value="sales"
            className="flex items-center gap-3 justify-start w-full px-4 py-3 text-sm font-medium rounded-xl data-active:bg-indigo-50 dark:data-active:bg-indigo-900/30 data-active:text-indigo-700 dark:data-active:text-indigo-300 data-active:border-l-indigo-500 dark:data-active:border-l-indigo-400 data-active:shadow-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            <TrendingUp className="h-4 w-4 shrink-0" />
            Sales
          </TabsTrigger>
          <TabsTrigger
            value="tickets"
            className="flex items-center gap-3 justify-start w-full px-4 py-3 text-sm font-medium rounded-xl data-active:bg-indigo-50 dark:data-active:bg-indigo-900/30 data-active:text-indigo-700 dark:data-active:text-indigo-300 data-active:border-l-indigo-500 dark:data-active:border-l-indigo-400 data-active:shadow-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            <PieChart className="h-4 w-4 shrink-0" />
            Tickets
          </TabsTrigger>
          <TabsTrigger
            value="checkins"
            className="flex items-center gap-3 justify-start w-full px-4 py-3 text-sm font-medium rounded-xl data-active:bg-indigo-50 dark:data-active:bg-indigo-900/30 data-active:text-indigo-700 dark:data-active:text-indigo-300 data-active:border-l-indigo-500 dark:data-active:border-l-indigo-400 data-active:shadow-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            <CheckCircle className="h-4 w-4 shrink-0" />
            Check-ins
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-w-0 space-y-6">
          {/* Sales Tab */}
          <TabsContent value="sales" className="mt-0 focus-visible:outline-none space-y-6">
            <Card className="border border-border shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="p-6 md:p-8 bg-muted/50 border-b border-border">
                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Sales Over Time
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  Daily ticket sales and revenue trend
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                {analytics.dailySales.length === 0 ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <Ticket className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                      <p className="text-muted-foreground">No sales data available yet</p>
                      <p className="text-sm text-muted-foreground/60 mt-1">
                        Sales will appear once tickets are purchased
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.dailySales}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          className="text-muted-foreground"
                          tickLine={false}
                        />
                        <YAxis
                          yAxisId="left"
                          tick={{ fontSize: 12 }}
                          className="text-muted-foreground"
                          tickLine={false}
                          label={{ value: 'Tickets Sold', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6B7280' } }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tick={{ fontSize: 12 }}
                          className="text-muted-foreground"
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

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="mt-0 focus-visible:outline-none space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border border-border shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="p-6 md:p-8 bg-muted/50 border-b border-border">
                  <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Ticket Distribution
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    Percentage of tickets sold by type
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  {analytics.ticketBreakdown.length === 0 ? (
                    <div className="h-80 flex items-center justify-center">
                      <div className="text-center">
                        <Ticket className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                        <p className="text-muted-foreground">No ticket data available</p>
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

              <Card className="border border-border shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="p-6 md:p-8 bg-muted/50 border-b border-border">
                  <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Ticket Type Details
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    Breakdown by ticket category
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  {analytics.ticketBreakdown.length === 0 ? (
                    <div className="text-center py-12">
                      <Ticket className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                      <p className="text-muted-foreground">No ticket types available</p>
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
                              <span className="font-medium text-foreground">{ticket.name}</span>
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
          </TabsContent>

          {/* Check-ins Tab */}
          <TabsContent value="checkins" className="mt-0 focus-visible:outline-none space-y-6">
            <Card className="border border-border shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="p-6 md:p-8 bg-muted/50 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                      <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      Check-in Progress
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">
                      Real-time attendance tracking
                    </CardDescription>
                  </div>
                  {analytics.checkinPercentage === 100 && analytics.totalTickets > 0 && (
                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Check-in Rate</span>
                    <span className="font-semibold text-primary">{analytics.checkinPercentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all duration-500"
                      style={{ width: `${analytics.checkinPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <p className="text-xs text-muted-foreground">Checked In</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{analytics.checkinCount}</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-xl">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Remaining</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{analytics.totalTickets - analytics.checkinCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="p-6 md:p-8 bg-muted/50 border-b border-border">
                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Recent Check-ins
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  Last 20 attendees checked in
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                {analytics.recentCheckins.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                    <p className="text-muted-foreground">No check-ins recorded yet</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                      Check-ins will appear here once attendees arrive
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left py-3 px-4 font-semibold text-sm text-foreground">Attendee Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm text-foreground">Ticket Type</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm text-foreground">Check-in Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.recentCheckins.map((checkin, index) => (
                          <tr key={index} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4 font-medium text-foreground">{checkin.name}</td>
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
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
