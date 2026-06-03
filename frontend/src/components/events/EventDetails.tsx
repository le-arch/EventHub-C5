/**
 * EventDetails Component
 * 
 * Displays detailed event information including description, venue, date/time,
 * and ticket summary. Used on public event page and organizer dashboard.
 * 
 * @module EventDetails
 */

'use client'

import Image from 'next/image'
import { Calendar, MapPin, Clock, Users, Ticket, Share2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import { EventStatusBadge } from './EventStatusBadge'

interface EventDetailsProps {
  event: {
    id: string
    title: string
    description: string | null
    venueName: string
    venueAddress: string | null
    city: string
    startDate: string
    endDate: string | null
    startTime: string
    endTime: string | null
    coverImageUrl: string | null
    status: 'draft' | 'published' | 'cancelled' | 'completed'
    ticketStats?: {
      totalSold: number
      totalRevenue: number
      availableTickets: number
    }
  }
  showShareButton?: boolean
  onShare?: () => void
  isPublicView?: boolean
}

export function EventDetails({ 
  event, 
  showShareButton = false, 
  onShare,
  isPublicView = false 
}: EventDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Cover Image */}
      {event.coverImageUrl && (
        <div className="aspect-video rounded-xl overflow-hidden">
          <Image
            src={event.coverImageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Title and Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          {!isPublicView && <EventStatusBadge status={event.status} />}
        </div>
        
        {/* Share Button */}
        {showShareButton && onShare && (
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Event
          </Button>
        )}
      </div>

      {/* Event Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Date</p>
                <p className="text-gray-600">{formatDate(event.startDate)}</p>
                {event.endDate && event.endDate !== event.startDate && (
                  <p className="text-sm text-gray-500">
                    to {formatDate(event.endDate)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Time</p>
                <p className="text-gray-600">{formatTime(event.startTime)}</p>
                {event.endTime && event.endTime !== event.startTime && (
                  <p className="text-sm text-gray-500">
                    to {formatTime(event.endTime)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Venue</p>
                <p className="text-gray-600">{event.venueName}</p>
                {event.venueAddress && (
                  <p className="text-sm text-gray-500">{event.venueAddress}</p>
                )}
                <p className="text-sm text-gray-500">{event.city}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {event.ticketStats && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Ticket className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Tickets</p>
                  <p className="text-gray-600">
                    {event.ticketStats.totalSold} sold
                  </p>
                  <p className="text-sm text-gray-500">
                    {event.ticketStats.availableTickets} available
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Description */}
      {event.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About this event</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-600 whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}