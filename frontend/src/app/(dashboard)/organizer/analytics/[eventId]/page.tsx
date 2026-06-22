/**
 * Analytics Dashboard Page
 * 
 * Displays comprehensive analytics for an event:
 * - Sales over time chart
 * - Ticket type breakdown
 * - Check-in progress
 * - Revenue summary
 * - Breadcrumb navigation
 * - Purple/Blue theme
 * - Horizontal nav bar tabs
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
  BarChart3,
  PieChart,
  CheckCircle,
  Clock,
  RefreshCw,
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'

// Utilities
import api from '@/lib/api'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { toast } from 'sonner'

// Enhanced chart colors (purple/blue theme)
const CHART_COLORS = ['#7C3AED', '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#EC4899']
const CHART_GRADIENTS = {
  tickets: {
    start: '#7C3AED',
    end: '#2563EB',
  },
  revenue: {
    start: '#10B981',
    end: '#059669',
  },
}

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

type TabKey = 'sales' | 'tickets' | 'checkins'

export default function AnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<Event | null>(null)
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('sales')

  // Redirect if no eventId is provided
  useEffect(() => {
    if (!eventId) {
      router.replace('/organizer/events')
    }
  }, [eventId, router])

  useEffect(() => {
    if (eventId) {
      fetchAnalytics()
    }
  }, [eventId])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const [eventRes, analyticsRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/events/${eventId}/analytics`),
      ])

      if (!eventRes.data?.event) {
        throw new Error('Event not found')
      }

      setEvent(eventRes.data.event)

      const data = analyticsRes.data || {}
      setAnalytics({
        totalTickets: data.totalTickets ?? 0,
        totalRevenue: data.totalRevenue ?? 0,
        checkinCount: data.checkinCount ?? 0,
        checkinPercentage: data.checkinPercentage ?? 0,
        dailySales: data.dailySales ?? [],
        ticketBreakdown: data.ticketBreakdown ?? [],
        recentCheckins: data.recentCheckins ?? [],
      })
    } catch (error: any) {
      console.error('Failed to load analytics:', error)
      if (error.response?.status === 404) {
        toast.error('❌ Event not found')
        router.push('/organizer/events')
      } else {
        toast.error('❌ Failed to load analytics')
      }
    } finally {
      setLoading(false)
    }
  }

  // Tab configuration
  const tabs: { key: TabKey; label: string; icon: React.ReactNode; accent: string }[] = [
    { key: 'sales', label: 'Sales Overview', icon: <TrendingUp className="h-4 w-4" />, accent: 'purple' },
    { key: 'tickets', label: 'Ticket Breakdown', icon: <PieChart className="h-4 w-4" />, accent: 'blue' },
    { key: 'checkins', label: 'Check-in Activity', icon: <CheckCircle className="h-4 w-4" />, accent: 'emerald' },
  ]

  const accentColors: Record<string, string> = {
    purple: 'text-purple-700 border-b-purple-600 bg-purple-50',
    blue: 'text-blue-700 border-b-blue-600 bg-blue-50',
    emerald: 'text-emerald-700 border-b-emerald-600 bg-emerald-50',
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-purple-600">
              🎟️ Tickets Sold: <span className="font-semibold">{payload[0]?.value || 0}</span>
            </p>
            <p className="text-emerald-600">
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
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
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

      {/* Header with Purple/Blue Gradient */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 p-5 rounded-xl shadow-lg text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <BarChart3 className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard 📊</h1>
            <p className="text-white/80 text-sm mt-0.5 flex items-center gap-2 flex-wrap">
              <Calendar className="h-3 w-3" />
              {formatDate(event.startDate)} at {formatTime(event.startTime)}
              <span className="mx-1">•</span>
              <MapPin className="h-3 w-3" />
              {event.venueName}, {event.city}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchAnalytics()}
          className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white backdrop-blur-sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh 
        </Button>
      </div>

      {/* Summary Cards with Colorful Gradients */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-purple-600">Total Tickets Sold 🎟️</p>
                <p className="text-3xl font-bold text-purple-700">{analytics.totalTickets}</p>
              </div>
              <Ticket className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-emerald-600">Total Revenue 💰</p>
                <p className="text-3xl font-bold text-emerald-700">
                  {formatCurrency(analytics.totalRevenue)}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-blue-600">Checked In ✅</p>
                <p className="text-3xl font-bold text-blue-700">
                  {analytics.checkinCount} / {analytics.totalTickets}
                </p>
              </div>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-amber-600">Check-in Rate 📊</p>
                  <p className="text-3xl font-bold text-amber-700">{analytics.checkinPercentage}%</p>
                </div>
                <TrendingUp className="h-5 w-5 text-amber-500" />
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

      {/* Horizontal Nav Bar Tabs */}
      <div className="w-full bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="flex w-full overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            const activeClass = isActive
              ? accentColors[tab.accent]
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200
                  border-b-2 border-transparent whitespace-nowrap flex-1 justify-center
                  ${activeClass}
                  ${isActive ? `border-b-${tab.accent === 'purple' ? 'purple' : tab.accent}-600` : 'hover:border-gray-300'}
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content Panels */}
      <div className="w-full">
        {/* Sales Overview Tab */}
        {activeTab === 'sales' && (
          <Card className="w-full border-l-4 border-l-purple-500 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Sales Over Time
              </CardTitle>
              <CardDescription>
                Daily ticket sales and revenue trend 📅
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.dailySales.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Ticket className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No sales data available yet 📭</p>
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
                        stroke="#7C3AED"
                        fill="#7C3AED"
                        fillOpacity={0.15}
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
        )}

        {/* Ticket Breakdown Tab */}
        {activeTab === 'tickets' && (
          <div className="grid lg:grid-cols-2 gap-6 w-full">
            <Card className="w-full border-l-4 border-l-blue-500 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  Ticket Distribution
                </CardTitle>
                <CardDescription>
                  Percentage of tickets sold by type 🎟️
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
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} tickets`, 'Sold']} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="w-full border-l-4 border-l-indigo-500 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-indigo-600" />
                  Ticket Type Details
                </CardTitle>
                <CardDescription>
                  Breakdown by ticket category 📋
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
                              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                            />
                            <span className="font-medium text-gray-800">{ticket.name}</span>
                          </div>
                          <Badge variant="outline" className="font-mono bg-gray-50">
                            {ticket.percentage}%
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>🎟️ {ticket.sold} sold</span>
                          <span>💰 {formatCurrency(ticket.revenue)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${ticket.percentage}%`,
                              backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
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
        )}

        {/* Check-in Activity Tab */}
        {activeTab === 'checkins' && (
          <Card className="w-full border-l-4 border-l-emerald-500 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                Recent Check-ins
              </CardTitle>
              <CardDescription>
                Last 20 attendees checked in ✅
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
                      <tr className="border-b bg-gradient-to-r from-emerald-50 to-green-50">
                        <th className="text-left py-3 px-4 font-semibold text-sm text-emerald-800">👤 Attendee Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-emerald-800">🎟️ Ticket Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-emerald-800">⏰ Check-in Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentCheckins.map((checkin, index) => (
                        <tr key={index} className="border-b last:border-0 hover:bg-emerald-50/50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-800">{checkin.name}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50">
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
        )}
      </div>
    </div>
  )
}