/**
 * Organizer Events Dashboard Page
 * 
 * Displays all events created by the organizer with:
 * - Grid layout of event cards
 * - Search functionality
 * - Pagination for large event lists
 * - Quick actions (edit, view attendees, check-in, delete)
 * - Status badges and ticket sales summary
 * - Breadcrumb navigation
 * - Confirmation dialog for delete actions
 * - Purple/Blue theme
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
  TrendingUp,
  CheckCircle,
  XCircle,
  FileText,
  RefreshCw,
} from 'lucide-react'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  
  // State for events data
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  // Delete dialog state
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch events on component mount or when page/pageSize/search changes
  useEffect(() => {
    fetchEvents()
  }, [page, pageSize, searchTerm])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const response = await api.get('/events', {
        params: {
          page,
          limit: pageSize,
          search: searchTerm || undefined,
        },
      })
      setEvents(response.data.events || [])
      setTotalCount(response.data.total || 0)
      setTotalPages(response.data.totalPages || Math.ceil((response.data.total || 0) / pageSize))
    } catch (error) {
      toast.error('❌ Failed to load events')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return
    
    setIsDeleting(true)
    try {
      await api.delete(`/events/${eventToDelete.id}`)
      toast.success(`✅ "${eventToDelete.title}" has been deleted`)
      setEvents(events.filter(e => e.id !== eventToDelete.id))
      setEventToDelete(null)
      fetchEvents()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete event'
      toast.error(`❌ ${errorMessage}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Published ✅
          </Badge>
        )
      case 'draft':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
            <FileText className="h-3 w-3 mr-1" />
            Draft 📝
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled ❌
          </Badge>
        )
      case 'completed':
        return (
          <Badge className="bg-sky-100 text-sky-800 border-sky-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed 🏁
          </Badge>
        )
      default:
        return null
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setPage(1)
  }

  const clearSearch = () => {
    setSearchTerm('')
    setPage(1)
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-64" />
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="h-40 w-full rounded-t-lg" />
              <CardContent className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="grid grid-cols-2 gap-2 pt-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-center">
          <Skeleton className="h-10 w-80" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Dashboard', href: '/organizer/events' },
          { label: 'My Events', href: '/organizer/events', isActive: true },
        ]}
        showHome
      />

      {/* Header with Purple/Blue Gradient */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 p-5 rounded-xl shadow-lg text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Calendar className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Events 📅</h1>
            <p className="text-white/80 text-sm mt-0.5">
              Manage all your events, track sales, and check in attendees
            </p>
          </div>
        </div>
        <Link href="/organizer/create">
          <Button className="bg-white text-purple-600 hover:bg-gray-100">
            <Plus className="h-4 w-4 mr-2" />
            Create New Event ✨
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative bg-white rounded-lg shadow-sm border border-purple-100">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
        <Input
          placeholder="🔍 Search events by title, venue, or city..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-24 border-0 focus:ring-0"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
          >
            Clear ✕
          </button>
        )}
      </div>

      {/* Results Count */}
      {!loading && events.length > 0 && (
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Ticket className="h-4 w-4 text-purple-500" />
          Showing <span className="font-semibold text-purple-700">{events.length}</span> of <span className="font-semibold">{totalCount}</span> event{totalCount !== 1 ? 's' : ''}
        </div>
      )}

      {/* Events Grid */}
      {events.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-2 border-gray-200">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-gray-400" />
                No events found 📭
              </h3>
              <p className="text-gray-500 max-w-sm">
                {searchTerm
                  ? `No results for "${searchTerm}". Try adjusting your search terms. 🔍`
                  : "Get started by creating your first event 🚀"}
              </p>
              {!searchTerm && (
                <Link href="/organizer/create">
                  <Button className="bg-purple-600 hover:bg-purple-700">Create Your First Event ✨</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden group hover:shadow-xl transition-shadow card-hover border-t-4 border-t-purple-500">
                {/* Cover Image */}
                <div className="relative h-40 bg-gradient-to-br from-purple-100 to-blue-100">
                  {event.coverImageUrl ? (
                    <img
                      src={event.coverImageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-purple-300/50" />
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
                    <DropdownMenuContent align="start" className="border-purple-200">
                      <DropdownMenuItem asChild>
                        <Link href={`/organizer/events/${event.id}`} className="cursor-pointer hover:bg-purple-50">
                          <Edit className="h-4 w-4 mr-2 text-purple-600" />
                          ✏️ Edit Event
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/organizer/attendees/${event.id}`} className="cursor-pointer hover:bg-purple-50">
                          <Users className="h-4 w-4 mr-2 text-purple-600" />
                          👥 View Attendees
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/organizer/checkin/${event.id}`} className="cursor-pointer hover:bg-purple-50">
                          <QrCode className="h-4 w-4 mr-2 text-purple-600" />
                          📷 Check-in Scanner
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/organizer/analytics/${event.id}`} className="cursor-pointer hover:bg-purple-50">
                          <Eye className="h-4 w-4 mr-2 text-purple-600" />
                          📊 Analytics
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setEventToDelete(event)}
                        className="text-red-600 cursor-pointer hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        🗑️ Delete Event
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Event Info */}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1 text-gray-800">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Calendar className="h-3 w-3 text-purple-400" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <MapPin className="h-3 w-3 text-purple-400" />
                    <span className="line-clamp-1">{event.venueName}, {event.city}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-xs text-purple-600">
                        <Ticket className="h-3 w-3" />
                        <span>Tickets Sold</span>
                      </div>
                      <p className="font-semibold text-lg text-purple-700">{event.ticketStats.totalSold}</p>
                    </div>
                    <div className="text-center p-2 bg-emerald-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-xs text-emerald-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>Revenue</span>
                      </div>
                      <p className="font-semibold text-lg text-emerald-700">
                        {formatCurrency(event.ticketStats.totalRevenue)}
                      </p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 flex gap-2">
                  <Link href={`/organizer/checkin/${event.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                      <QrCode className="h-3 w-3 mr-1" />
                      Check-in
                    </Button>
                  </Link>
                  <Link href={`/organizer/events/${event.id}`} className="flex-1">
                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                      Manage
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[9, 18, 36]}
                totalItems={totalCount}
                showFirstLast
              />
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={!!eventToDelete}
        onOpenChange={(open) => !open && setEventToDelete(null)}
        onConfirm={handleDeleteEvent}
        title="🗑️ Delete Event"
        description={`Are you sure you want to delete "${eventToDelete?.title || 'this event'}"?`}
        confirmText="Yes, Delete Event"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      >
        <div className="mt-4 p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-semibold">Warning!</span>
          </div>
          <p className="text-sm text-red-600">
            This action cannot be undone. All ticket sales and attendee data will be permanently removed.
          </p>
        </div>
      </ConfirmationDialog>
    </div>
  )
}