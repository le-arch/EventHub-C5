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
 * - Pagination for large event lists
 * - Breadcrumb navigation
 * - Confirmation dialog for cancellations
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
  TrendingUp,
  Ticket,
  CalendarDays,
  DollarSign,
  CheckCircle,
  FileText,
} from 'lucide-react'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog'
import { Pagination } from '@/components/common/Pagination'

// Utilities
import api from '@/lib/api'
import { toast } from 'sonner'
import { formatDate, formatCurrency } from '@/lib/utils'

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
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch events on component mount or when page/pageSize changes
  useEffect(() => {
    fetchEvents()
  }, [page, pageSize])

  /**
   * Fetch all events from API with pagination
   */
  const fetchEvents = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/events', {
        params: {
          page,
          limit: pageSize,
          search: searchTerm || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        },
      })
      setEvents(response.data.events)
      setTotalCount(response.data.total)
      setTotalPages(response.data.totalPages || Math.ceil(response.data.total / pageSize))
    } catch (error) {
      toast.error('❌ Failed to load events')
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
  const handleCancelEvent = async () => {
    if (!eventToCancel) return
    
    setIsProcessing(true)
    try {
      await api.put(`/admin/events/${eventToCancel.id}/cancel`)
      toast.success(`✅ "${eventToCancel.title}" cancelled successfully`)
      fetchEvents()
    } catch (error) {
      toast.error('❌ Failed to cancel event')
    } finally {
      setIsProcessing(false)
      setEventToCancel(null)
    }
  }

  /**
   * Reset search and filters
   */
  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPage(1)
  }

  /**
   * Get status badge for event with icon
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Published ✅
        </Badge>
      case 'draft':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          Draft 📝
        </Badge>
      case 'cancelled':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Cancelled ❌
        </Badge>
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Completed 🏁
        </Badge>
      default:
        return null
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-64" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <Skeleton className="h-12 w-full max-w-md mx-auto" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Events', href: '#', isActive: true },
        ]}
        showHome
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <CalendarDays className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Event Management 📅</h1>
          <p className="text-gray-500 mt-1">
            View and manage all events across the platform
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="🔍 Search by event title or organizer..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value)
              setPage(1)
            }}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="published">✅ Published</SelectItem>
                <SelectItem value="draft">📝 Draft</SelectItem>
                <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                <SelectItem value="completed">🏁 Completed</SelectItem>
              </SelectContent>
            </Select>
            {(searchTerm || statusFilter !== 'all') && (
              <Button variant="ghost" onClick={handleResetFilters} className="sm:w-auto">
                Reset Filters ✕
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Result Count */}
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <CalendarDays className="h-4 w-4" />
        Showing {filteredEvents.length} of {totalCount} event{totalCount !== 1 ? 's' : ''}
      </div>

      {/* Events Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>📋 Event</TableHead>
                  <TableHead>👤 Organizer</TableHead>
                  <TableHead>📍 Venue</TableHead>
                  <TableHead>📅 Date</TableHead>
                  <TableHead>🎟️ Tickets</TableHead>
                  <TableHead>💰 Revenue</TableHead>
                  <TableHead>📊 Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No events found 📭</p>
                        {(searchTerm || statusFilter !== 'all') && (
                          <Button
                            variant="link"
                            onClick={handleResetFilters}
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
                          <p className="text-xs text-gray-500 font-mono">ID: {event.id.slice(0, 8)}</p>
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
                        <span className="font-medium">{event.ticketsSold.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-600">
                          {formatCurrency(event.totalRevenue)}
                        </span>
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
                                👁️ View Event Page
                              </Link>
                            </DropdownMenuItem>
                            {event.status !== 'cancelled' && event.status !== 'completed' && (
                              <DropdownMenuItem
                                onClick={() => setEventToCancel(event)}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                ❌ Cancel Event
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
          totalItems={totalCount}
          showFirstLast
        />
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CalendarDays className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{events.length}</p>
              <p className="text-sm text-gray-500">Total Events 📋</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {events.filter(e => e.status === 'published').length}
              </p>
              <p className="text-sm text-gray-500">Published ✅</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Ticket className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">
                {events.reduce((sum, e) => sum + e.ticketsSold, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Total Tickets Sold 🎟️</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <DollarSign className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(events.reduce((sum, e) => sum + e.totalRevenue, 0))}
              </p>
              <p className="text-sm text-gray-500">Total Revenue 💰</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancel Events Dialog */}
      <ConfirmationDialog
        open={!!eventToCancel}
        onOpenChange={() => setEventToCancel(null)}
        onConfirm={handleCancelEvent}
        title="❌ Cancel Event"
        description={`Are you sure you want to cancel "${eventToCancel?.title}"? This action cannot be undone. Event will be marked as cancelled, no further ticket sales will be possible, ticket holders will be notified (if email notifications are enabled), and the event will be hidden from public listings.`}
        confirmText="Yes, Cancel Event"
        cancelText="Back"
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  )
}