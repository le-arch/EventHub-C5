/**
 * EventCard Component
 * 
 * Displays event information in a card format for the dashboard.
 * Includes cover image, title, date, venue, ticket stats, and quick actions.
 * 
 * @module EventCard
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Users, Ticket, MoreVertical, Edit, Eye, QrCode, Trash2 } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EventStatusBadge } from './EventStatusBadge'
import { formatDate, formatCurrency } from '@/lib/utils'

interface EventCardProps {
  event: {
    id: string
    title: string
    coverImageUrl: string | null
    startDate: string
    venue: string
    city: string
    status: 'draft' | 'published' | 'cancelled' | 'completed'
    ticketStats: {
      totalSold: number
      totalRevenue: number
      totalAttendees: number
    }
  }
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onDuplicate?: (id: string) => void
  onViewAttendees?: (id: string) => void
  onCheckin?: (id: string) => void
}

export function EventCard({ event, onEdit, onDelete, onDuplicate, onViewAttendees, onCheckin }: EventCardProps) {
  const hasCoverImage = event.coverImageUrl && event.coverImageUrl !== ''

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
      {/* Cover Image */}
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/10">
        {hasCoverImage ? (
          <Image
            src={event.coverImageUrl!}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="h-12 w-12 text-primary/40" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <EventStatusBadge status={event.status} />
        </div>
        
        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 left-2 bg-white/80 hover:bg-card h-8 w-8"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onEdit?.(event.id)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Event
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewAttendees?.(event.id)}>
              <Users className="h-4 w-4 mr-2" />
              View Attendees
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCheckin?.(event.id)}>
              <QrCode className="h-4 w-4 mr-2" />
              Check-in Scanner
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate?.(event.id)}>
              <Eye className="h-4 w-4 mr-2" />
              Duplicate Event
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete?.(event.id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Event
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Event Info */}
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">
          {event.title}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(event.startDate)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{event.venue}, {event.city}</span>
        </div>

        {/* Ticket Stats */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Ticket className="h-3 w-3" />
              <span>Sold</span>
            </div>
            <p className="font-semibold text-sm">{event.ticketStats.totalSold}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>Revenue</span>
            </div>
            <p className="font-semibold text-sm">{formatCurrency(event.ticketStats.totalRevenue)}</p>
          </div>
        </div>
      </CardContent>

      {/* Action Buttons */}
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Link href={`/organizer/checkin/${event.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <QrCode className="h-3 w-3 mr-1" />
            Check-in
          </Button>
        </Link>
        <Link href={`/organizer/events/${event.id}`} className="flex-1">
          <Button size="sm" className="w-full">
            Manage
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}