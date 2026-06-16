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
  venueName: string
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
        return <Badge className="bg-green-100 text-green-800">✅ Published</Badge>
      case 'draft':
        return <Badge variant="secondary">📝 Draft</Badge>
      case 'cancelled':
        return <Badge variant="destructive">❌ Cancelled</Badge>
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">🏁 Completed</Badge>
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
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Attendees Overview 👥</h1>
            <p className="text-gray-500 mt-1">
              View attendee counts for all your events
            </p>
          </div>
        </div>
        <Card className="text-center py-12">
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
                <Button>Create Your First Event ✨</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate total attendees across all events
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

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Attendees Overview 👥</h1>
          <p className="text-gray-500 mt-1">
            View attendee counts for all your events
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalAttendees}</p>
            <p className="text-sm text-gray-500">Total Attendees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Ticket className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalTicketsSold}</p>
            <p className="text-sm text-gray-500">Total Tickets Sold</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow card-hover">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                {getStatusBadge(event.status)}
              </div>
              <CardDescription>
                {formatDate(event.startDate)} • {event.venueName}, {event.city}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-2 bg-purple-50 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Attendees</p>
                  <p className="text-xl font-bold text-purple-600">
                    {event.ticketStats.totalAttendees}
                  </p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <Ticket className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Tickets Sold</p>
                  <p className="text-xl font-bold text-blue-600">
                    {event.ticketStats.totalSold}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500 flex justify-between">
                <span>💰 Revenue: {formatCurrency(event.ticketStats.totalRevenue)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/organizer/attendees/${event.id}`} className="w-full">
                <Button variant="outline" className="w-full">
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
        <Card className="bg-amber-50 border-amber-200">
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