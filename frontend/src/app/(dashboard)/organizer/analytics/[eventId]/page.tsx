// Analytics Page
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
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { Breadcrumb } from '@/components/common/Breadcrumb'
import { SalesAnalyticsTab } from '@/components/analytics/SalesAnalyticsTab'
import { TicketAnalyticsTab } from '@/components/analytics/TicketAnalyticsTab'
import { CheckinAnalyticsTab } from '@/components/analytics/CheckinAnalyticsTab'

import api from '@/lib/api'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

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
  const [activeTab, setActiveTab] = useState<'sales' | 'tickets' | 'checkins'>('sales')

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

  if (loading) {
    return (
      <div key={params.eventId} className="space-y-6">
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

  // Get accent based on active tab
  const tabAccents = {
    sales: 'border-blue-600 text-blue-600 bg-blue-50/50',
    tickets: 'border-emerald-600 text-emerald-600 bg-emerald-50/50',
    checkins: 'border-purple-600 text-purple-600 bg-purple-50/50',
  }

  return (
    <div key={params.eventId} className="space-y-6">
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
            <p className="text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
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
                <p className="text-sm text-muted-foreground">Total Tickets Sold </p>
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
                <p className="text-sm text-muted-foreground">Total Revenue </p>
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
                <p className="text-sm text-muted-foreground">Checked In </p>
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
                  <p className="text-sm text-muted-foreground">Check-in Rate </p>
                  <p className="text-3xl font-bold text-amber-600">{analytics.checkinPercentage}%</p>
                </div>
                <TrendingUp className="h-5 w-5 text-amber-400" />
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${analytics.checkinPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Tabs */}
      <div className="space-y-6">
        {/* Tab Triggers */}
        <div className="w-full bg-card rounded-xl shadow-sm border border-border/60 overflow-hidden">
          <div className="flex w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab('sales')}
              className={`
                flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200
                border-b-2 flex-1 justify-center
                ${activeTab === 'sales' 
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }
              `}
            >
              <TrendingUp className="h-4 w-4" />
              Sales
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`
                flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200
                border-b-2 flex-1 justify-center
                ${activeTab === 'tickets' 
                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }
              `}
            >
              <PieChart className="h-4 w-4" />
              Tickets
            </button>
            <button
              onClick={() => setActiveTab('checkins')}
              className={`
                flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200
                border-b-2 flex-1 justify-center
                ${activeTab === 'checkins' 
                  ? 'border-purple-600 text-purple-600 bg-purple-50/50' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }
              `}
            >
              <CheckCircle className="h-4 w-4" />
              Check-ins
            </button>
          </div>
        </div>

        {/* Tab Content - Directly under the triggers */}
        <div className="space-y-6">
          {activeTab === 'sales' && (
            <SalesAnalyticsTab dailySales={analytics.dailySales} />
          )}
          {activeTab === 'tickets' && (
            <TicketAnalyticsTab ticketBreakdown={analytics.ticketBreakdown} />
          )}
          {activeTab === 'checkins' && (
            <CheckinAnalyticsTab recentCheckins={analytics.recentCheckins} />
          )}
        </div>
      </div>
    </div>
  )
}