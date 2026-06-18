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

import { useState, useEffect, useCallback } from 'react'
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

  const fetchEvents = useCallback(async () => {
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
      setEvents(response.data.events || [])
      setTotalCount(response.data.total || 0)
      setTotalPages(response.data.totalPages || Math.ceil((response.data.total || 0) / pageSize))
    } catch (error) {
      toast.error('❌ Failed to load events')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchTerm, statusFilter])

  /**
   * Filter events based on search term and status filter (client‑side after fetch)
   */
  const filteredEvents = (events || []).filter((event) => {
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
        return <Badge className="bg-emerald-100 text-emerald-800 flex items-center gap-1 border-emerald-200">
          <CheckCircle className="h-3 w-3" />
          Published ✅
        </Badge>
      case 'draft':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600 flex items-center gap-1">
          <FileText className="h-3 w-3" />
          Draft 📝
        </Badge>
      case 'cancelled':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Cancelled ❌
        </Badge>
      case 'completed':
        return <Badge className="bg-sky-100 text-sky-800 flex items-center gap-1 border-sky-200">
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

      {/* Header with Purple/Blue Gradient */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 p-5 rounded-xl shadow-lg text-white">
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          <CalendarDays className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Event Management 📅</h1>
          <p className="text-white/80 text-sm mt-0.5">
            View and manage all events across the platform
          </p>
        </div>
      </div>

      {/* Search and Filters Card with Purple Border */}
      <Card className="border-l-4 border-l-purple-500 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500" />
              <Input
                placeholder="🔍 Search by event title or organizer..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="pl-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value)
              setPage(1)
            }}>
              <SelectTrigger className="w-full sm:w-48 border-purple-200 focus:ring-purple-500">
                <Filter className="h-4 w-4 mr-2 text-purple-500" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="published">✅ Published</SelectItem>
                <SelectItem value="draft">📝 Draft</SelectItem>
                <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                <SelectItem value="completed">🏁 Completed</SelectItem>
              </SelectContent>
            </Select>
            {(searchTerm || statusFilter !== 'all') && (
              <Button 
                variant="ghost" 
                onClick={handleResetFilters} 
                className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
              >
                Reset Filters ✕
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count with Color */}
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-purple-500" />
        Showing <span className="font-semibold text-purple-700">{filteredEvents.length}</span> of <span className="font-semibold">{totalCount}</span> event{totalCount !== 1 ? 's' : ''}
      </div>

      {/* Events Table Card with Blue Accent */}
      <Card className="border-t-4 border-t-blue-500 shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <TableRow>
                  <TableHead className="text-purple-800">📋 Event</TableHead>
                  <TableHead className="text-purple-800">👤 Organizer</TableHead>
                  <TableHead className="text-purple-800">📍 Venue</TableHead>
                  <TableHead className="text-purple-800">📅 Date</TableHead>
                  <TableHead className="text-purple-800">🎟️ Tickets</TableHead>
                  <TableHead className="text-purple-800">💰 Revenue</TableHead>
                  <TableHead className="text-purple-800">📊 Status</TableHead>
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
                            className="text-purple-600"
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id} className="hover:bg-purple-50/50 transition-colors">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-800">{event.title}</p>
                          <p className="text-xs text-gray-500 font-mono">ID: {event.id.slice(0, 8)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-purple-400" />
                          <div>
                            <p className="text-sm font-medium">{event.organizerName}</p>
                            <p className="text-xs text-gray-500">{event.organizerEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-blue-400" />
                          <span className="text-sm">{event.venueName}, {event.city}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-purple-400" />
                          <span className="text-sm">{formatDate(event.startDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-blue-600">{event.ticketsSold.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-emerald-600">
                          {formatCurrency(event.totalRevenue)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-purple-500 hover:text-purple-700 hover:bg-purple-50">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-purple-200">
                            <DropdownMenuItem asChild className="hover:bg-purple-50">
                              <Link href={`/e/${event.id}`} target="_blank">
                                <Eye className="h-4 w-4 mr-2 text-purple-500" />
                                👁️ View Event Page
                              </Link>
                            </DropdownMenuItem>
                            {event.status !== 'cancelled' && event.status !== 'completed' && (
                              <DropdownMenuItem
                                onClick={() => setEventToCancel(event)}
                                className="text-red-600 hover:bg-red-50"
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
        <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
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
        </div>
      )}

      {/* Stats Summary Cards with Colorful Gradients */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <CalendarDays className="h-7 w-7 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-700">{events.length}</p>
              <p className="text-sm text-purple-600">Total Events 📋</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-7 w-7 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-700">
                {events.filter(e => e.status === 'published').length}
              </p>
              <p className="text-sm text-emerald-600">Published ✅</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <Ticket className="h-7 w-7 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-700">
                {events.reduce((sum, e) => sum + e.ticketsSold, 0).toLocaleString()}
              </p>
              <p className="text-sm text-blue-600">Total Tickets Sold 🎟️</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <DollarSign className="h-7 w-7 text-amber-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-700">
                {formatCurrency(events.reduce((sum, e) => sum + e.totalRevenue, 0))}
              </p>
              <p className="text-sm text-amber-600">Total Revenue 💰</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancel Event Confirmation Dialog */}
      <ConfirmationDialog
        open={!!eventToCancel}
        onOpenChange={() => setEventToCancel(null)}
        onConfirm={handleCancelEvent}
        title="❌ Cancel Event"
        description={`Are you sure you want to cancel "${eventToCancel?.title}"?`}
        confirmText="Yes, Cancel Event"
        cancelText="Back"
        variant="danger"
        isLoading={isProcessing}
      >
        <div className="mt-4 p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-semibold">Warning! This action cannot be undone.</span>
          </div>
          <ul className="space-y-1 text-sm text-red-600 ml-6 list-disc">
            <li>Event will be marked as cancelled</li>
            <li>No further ticket sales will be possible</li>
            <li>Ticket holders will be notified (if email notifications are enabled)</li>
            <li>Event will be hidden from public listings</li>
          </ul>
        </div>
      </ConfirmationDialog>
    </div>
  )
}