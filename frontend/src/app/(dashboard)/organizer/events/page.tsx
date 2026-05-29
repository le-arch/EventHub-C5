/**
 * Organizer Events Dashboard Page
 * 
 * Displays all events created by the organizer with:
 * - Grid layout of event cards
 * - Search functionality
 * - Quick actions (edit, view attendees, check-in, delete)
 * - Status badges and ticket sales summary
 * 
 * @module EventsDashboardPage
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  MoreVertical,
  Calendar,
  MapPin,
  Users,
  Ticket,
  Eye,
  Edit,
  QrCode,
  Trash2,
  AlertCircle,
} from 'lucide-react'

// shadcn/ui components
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'
import { Badge } from '@/src/components/ui/badge'
import { Skeleton } from '@/src/components/ui/skeleton'

// Utilities
import api from '@/src/lib/api'
import { toast } from 'sonner'
import { formatDate, formatCurrency } from '@/src/lib/utils'

// Type definitions
interface Event {
  id: string
  title: string
  description: string
  venueName: string
  city: string
  startDate: string
  startTime: string
  coverImageUrl: string | null
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  ticketStats: {
    totalSold: number
    totalRevenue: number
    totalAttendees: number
  }
  createdAt: string
}

export default function EventsDashboardPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents()
  }, [])

  /**
   * Fetch all events for the logged-in organizer
   */
  const fetchEvents = async () => {
    try {
      const response = await api.get('/events')
      setEvents(response.data.events)
    } catch (error) {
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Delete an event
   */
  const handleDeleteEvent = async () => {
    if (!eventToDelete) return
    
    setIsDeleting(true)
    try {
      await api.delete(`/events/${eventToDelete.id}`)
      toast.success('Event deleted successfully')
      setEvents(events.filter(e => e.id !== eventToDelete.id))
      setEventToDelete(null)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete event'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  /**
   * Get status badge for event
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>
      default:
        return null
    }
  }

  /**
   * Filter events by search term
   */
  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="h-40 w-full rounded-t-lg" />
              <CardContent className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Events</h1>
          <p className="text-gray-500 mt-1">
            Manage all your events, track sales, and check in attendees
          </p>
        </div>
        <Link href="/organizer/create">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create New Event
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search events by title, venue, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-lg">No events found</h3>
              <p className="text-gray-500 max-w-sm">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Get started by creating your first event"}
              </p>
              {!searchTerm && (
                <Link href="/organizer/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Event
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              {/* Cover Image */}
              <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/10">
                {event.coverImageUrl ? (
                  <img
                    src={event.coverImageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-primary/40" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(event.status)}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 left-2 bg-white/80 hover:bg-white h-8 w-8"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem asChild>
                      <Link href={`/organizer/events/${event.id}`} className="cursor-pointer">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Event
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/organizer/attendees/${event.id}`} className="cursor-pointer">
                        <Users className="h-4 w-4 mr-2" />
                        View Attendees
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/organizer/checkin/${event.id}`} className="cursor-pointer">
                        <QrCode className="h-4 w-4 mr-2" />
                        Check-in Scanner
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/organizer/analytics/${event.id}`} className="cursor-pointer">
                        <Eye className="h-4 w-4 mr-2" />
                        Analytics
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setEventToDelete(event)}
                      className="text-red-600 cursor-pointer"
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
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">{event.venueName}, {event.city}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Tickets Sold</p>
                    <p className="font-semibold">{event.ticketStats.totalSold}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="font-semibold">
                      {formatCurrency(event.ticketStats.totalRevenue)}
                    </p>
                  </div>
                </div>
              </CardContent>

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
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!eventToDelete} onOpenChange={() => setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{eventToDelete?.title}"?
              <br />
              <br />
              This action cannot be undone. All ticket sales and attendee data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Event'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}