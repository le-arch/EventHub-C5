/**
 * Attendees Overview Page
 * 
 * Displays all events with the number of attendees per event.
 * Allows organizers to quickly see attendee counts and navigate to detailed lists.
 * 
 * @module AttendeesOverviewPage
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Users,
  Ticket,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'

// Utilities
import api from '@/lib/api'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface Event {
  id: string
  title: string
  startDate: string
  venue: string
  city: string
  status: string
  ticketStats: {
    totalSold: number
    totalRevenue: number
    totalAttendees: number
  }
}

export default function AttendeesOverviewPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const response = await api.get('/events')
      setEvents(response.data.events || [])
    } catch (error) {
      toast.error('❌ Failed to load events')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">✅ Published</Badge>
      case 'draft':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600">📝 Draft</Badge>
      case 'cancelled':
        return <Badge variant="destructive">❌ Cancelled</Badge>
      case 'completed':
        return <Badge className="bg-sky-100 text-sky-800 border-sky-200">🏁 Completed</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-64" />
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="space-y-6">
        <Breadcrumb 
          items={[
            { label: 'Dashboard', href: '/organizer/events' },
            { label: 'Attendees', href: '#', isActive: true },
          ]}
          showHome
        />
        <div className="flex items-center gap-4 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 p-5 rounded-xl shadow-lg text-white">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Attendees Overview 👥</h1>
            <p className="text-gray-700 mt-1">
              View attendee counts for all your events
            </p>
          </div>
        </div>
        <Card className="text-center py-12 border-dashed border-2 border-gray-200">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-lg">No events found 📭</h3>
              <p className="text-gray-500 max-w-sm">
                Create an event to start tracking attendees
              </p>
              <Link href="/organizer/create">
                <Button className="bg-purple-600 hover:bg-purple-700">Create Your First Event ✨</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalAttendees = events.reduce((sum, e) => sum + e.ticketStats.totalAttendees, 0)
  const totalTicketsSold = events.reduce((sum, e) => sum + e.ticketStats.totalSold, 0)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Dashboard', href: '/organizer/events' },
          { label: 'Attendees', href: '#', isActive: true },
        ]}
        showHome
      />

      {/* Header with Purple/Blue Gradient */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 p-5 rounded-xl shadow-lg text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Attendees Overview 👥</h1>
            <p className="text-white/80 text-sm mt-0.5">
              View attendee counts for all your events
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={fetchEvents}
          className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white backdrop-blur-sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh 
        </Button>
      </div>

      {/* Summary Stats with Gradients */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md">
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-700">{totalAttendees}</p>
            <p className="text-sm text-purple-600">Total Attendees</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md">
          <CardContent className="pt-6 text-center">
            <Ticket className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-700">{totalTicketsSold}</p>
            <p className="text-sm text-blue-600">Total Tickets Sold</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow card-hover border-t-4 border-t-purple-500">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="line-clamp-1 text-gray-800">{event.title}</CardTitle>
                {getStatusBadge(event.status)}
              </div>
              <CardDescription>
                📅 {formatDate(event.startDate)} • 📍 {event.venue}, {event.city}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <Users className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs text-purple-600">Attendees</p>
                  <p className="text-xl font-bold text-purple-700">
                    {event.ticketStats.totalAttendees}
                  </p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <Ticket className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-blue-600">Tickets Sold</p>
                  <p className="text-xl font-bold text-blue-700">
                    {event.ticketStats.totalSold}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500 flex justify-between">
                <span>💰 Revenue: <span className="font-semibold text-emerald-600">{formatCurrency(event.ticketStats.totalRevenue)}</span></span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/organizer/attendees/${event.id}`} className="w-full">
                <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                  View Attendee List
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Empty state for events with zero attendees */}
      {events.every(e => e.ticketStats.totalAttendees === 0) && events.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-amber-800 font-medium">No attendees yet</p>
            <p className="text-sm text-amber-600 mt-1">
              Your events currently have no attendees. Share your event links to start selling tickets!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}