/**
 * Admin Events Management Page
 * 
 * Allows admin to view all events across all organizers.
 * Features include:
 * - Search by event title or organizer
 * - Filter by event status
 * - Sort by date
 * - Cancel events
 * - View event details
 * 
 * @module AdminEventsPage
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  MoreVertical,
  Calendar,
  MapPin,
  User,
  Eye,
  XCircle,
  AlertCircle,
} from 'lucide-react'

// shadcn/ui components
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Badge } from '@/src/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Skeleton } from '@/src/components/ui/skeleton'

// Utilities
import api from '@/src/lib/api'
import { toast } from 'sonner'
import { formatDate, formatCurrency } from '@/src/lib/utils'

// Type definitions
interface Event {
  id: string
  title: string
  organizerName: string
  organizerEmail: string
  venueName: string
  city: string
  startDate: string
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  ticketsSold: number
  totalRevenue: number
  createdAt: string
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [eventToCancel, setEventToCancel] = useState<Event | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents()
  }, [])

  /**
   * Fetch all events from API
   */
  async function fetchEvents() {
    try {
      const response = await api.get('/admin/events')
      setEvents(response.data.events)
    } catch {
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Filter events based on search term and status filter
   */
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      searchTerm === '' ||
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizerName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  /**
   * Cancel an event
   */
  const handleCancelEvent = async (eventId: string) => {
    setIsProcessing(true)
    try {
      await api.put(`/admin/events/${eventId}/cancel`)
      toast.success('Event cancelled successfully')
      fetchEvents()
    } catch {
      toast.error('Failed to cancel event')
    } finally {
      setIsProcessing(false)
      setEventToCancel(null)
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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Event Management</h1>
        <p className="text-gray-500 mt-1">
          View and manage all events across the platform
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by event title or organizer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Tickets</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No events found</p>
                        {(searchTerm || statusFilter !== 'all') && (
                          <Button
                            variant="link"
                            onClick={() => {
                              setSearchTerm('')
                              setStatusFilter('all')
                            }}
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-xs text-gray-500">ID: {event.id.slice(0, 8)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm">{event.organizerName}</p>
                            <p className="text-xs text-gray-500">{event.organizerEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{event.venueName}, {event.city}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{formatDate(event.startDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{event.ticketsSold}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatCurrency(event.totalRevenue)}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/e/${event.id}`} target="_blank">
                                <Eye className="h-4 w-4 mr-2" />
                                View Event Page
                              </Link>
                            </DropdownMenuItem>
                            {event.status !== 'cancelled' && event.status !== 'completed' && (
                              <DropdownMenuItem
                                onClick={() => setEventToCancel(event)}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Event
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{events.length}</p>
              <p className="text-sm text-gray-500">Total Events</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {events.filter(e => e.status === 'published').length}
              </p>
              <p className="text-sm text-gray-500">Published</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {events.reduce((sum, e) => sum + e.ticketsSold, 0)}
              </p>
              <p className="text-sm text-gray-500">Total Tickets Sold</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(events.reduce((sum, e) => sum + e.totalRevenue, 0))}
              </p>
              <p className="text-sm text-gray-500">Total Revenue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancel Event Dialog */}
      <Dialog open={!!eventToCancel} onOpenChange={() => setEventToCancel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel &quot;{eventToCancel?.title}&quot;?
              <br />
              <br />
              This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Mark the event as cancelled</li>
                <li>Prevent further ticket sales</li>
                <li>Notify all ticket holders (if email notifications are enabled)</li>
              </ul>
              <span className="text-red-600 font-medium mt-2 block">
                This action cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventToCancel(null)}>
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={() => eventToCancel && handleCancelEvent(eventToCancel.id)}
              disabled={isProcessing}
            >
              {isProcessing ? 'Cancelling...' : 'Cancel Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}