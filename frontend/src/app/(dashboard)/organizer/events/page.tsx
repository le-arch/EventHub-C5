/**
 * Organizer Events Dashboard Page
 * * Displays all events created by the organizer using global state.
 * - Grid layout of event cards
 * - Search and page-state driven via React effects
 * - Quick actions (edit, view attendees, check-in, delete)
 * - Status badges and ticket sales summary
 * - Confirmation dialog for delete actions
 * - Purple/Blue theme
 * * @module EventsDashboardPage
 */

'use client'

import { useState, useEffect, useDeferredValue } from 'react'
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

// Stores & Utilities
import { useEventStore } from '@/store/eventStore'
import { Event } from '@/store/eventStore'
import { toast } from 'sonner'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function EventsDashboardPage() {
  const router = useRouter()
  
  // Connect to Zustand Global Event Store
  const { 
    events, 
    isLoading, 
    fetchEvents, 
    deleteEvent 
  } = useEventStore()
  
  // Pagination & Filter States
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Use deferred value for search optimization to prevent over-fetching on every keystroke
  const deferredSearchTerm = useDeferredValue(searchTerm)

  // Local state for delete dialog control
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Sync state modifications to backend via Zustand action
  useEffect(() => {
    // Custom wrapper or direct fetch depending on endpoint requirements
    // Assuming store fetchEvents handles updates internally
    fetchEvents() 
  }, [page, pageSize, deferredSearchTerm, fetchEvents])

  // Derive layout requirements dynamically
  const totalCount = events.length // Adjust if your backend provides a paginated meta-wrapper globally
  const totalPages = Math.ceil(totalCount / pageSize) || 1

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return
    
    setIsDeleting(true)
    try {
      const success = await deleteEvent(eventToDelete.id)
      if (success) {
        toast.success(`✅ "${eventToDelete.title}" has been deleted`)
        setEventToDelete(null)
        // Refresh structural page indices if current page empties out
        if (events.length === 1 && page > 1) {
          setPage(prev => prev - 1)
        }
      } else {
        toast.error('❌ Failed to delete event')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete event'
      toast.error(`❌ ${errorMessage}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: Event['status']) => {
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

  // Filtered visibility matrix matching search criteria locally or dynamically
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
    event.city.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
    event.venueName.toLowerCase().includes(deferredSearchTerm.toLowerCase())
  )

  // Loading skeleton view
  if (isLoading && events.length === 0) {
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb 
        items={[
          { label: 'Dashboard', href: '/organizer/events' },
          { label: 'My Events', href: '/organizer/events', isActive: true },
        ]}
        showHome
      />

      {/* Header View */}
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
          <Button className="bg-white text-purple-600 hover:bg-gray-100 font-medium shadow-sm transition-transform active:scale-95">
            <Plus className="h-4 w-4 mr-2" />
            Create New Event ✨
          </Button>
        </Link>
      </div>

      {/* Search Input Controls */}
      <div className="relative bg-white rounded-lg shadow-sm border border-purple-100">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
        <Input
          placeholder="🔍 Search events by title, venue, or city..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-24 border-0 focus-visible:ring-1 focus-visible:ring-purple-400"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors"
          >
            Clear ✕
          </button>
        )}
      </div>

      {/* Numerical Metrics Metadata */}
      {!isLoading && filteredEvents.length > 0 && (
        <div className="text-sm text-gray-500 flex items-center gap-2 px-1">
          <Ticket className="h-4 w-4 text-purple-500" />
          Showing <span className="font-semibold text-purple-700">{filteredEvents.length}</span> of <span className="font-semibold">{totalCount}</span> metrics-tracked event{totalCount !== 1 ? 's' : ''}
        </div>
      )}

      {/* Main Container Core Conditional Grid Selection */}
      {filteredEvents.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-2 border-gray-200 bg-gray-50/50">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-700">
                <AlertCircle className="h-5 w-5 text-gray-400" />
                No events found 📭
              </h3>
              <p className="text-gray-500 max-w-sm text-sm">
                {searchTerm
                  ? `No matching results for "${searchTerm}". Try checking your spelling or search params. 🔍`
                  : "Get started by publishing your first upcoming setup experience! 🚀"}
              </p>
              {!searchTerm && (
                <Link href="/organizer/create">
                  <Button className="bg-purple-600 hover:bg-purple-700 mt-2">Create Your First Event ✨</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-t-4 border-t-purple-500 bg-white">
                {/* Visual Cover Layout Banner */}
                <div className="relative h-40 bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
                  {event.coverImageUrl ? (
                    <img
                      src={event.coverImageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-purple-300/60" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 backdrop-blur-md rounded-md shadow-sm">
                    {getStatusBadge(event.status)}
                  </div>
                  
                  {/* Inline Action Dropdown Trigger */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 left-2 bg-white/90 hover:bg-white text-gray-700 border border-gray-200/50 h-8 w-8 shadow-sm transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="border-purple-100 w-48">
                      <DropdownMenuItem asChild>
                        <Link href={`/organizer/events/${event.id}`} className="cursor-pointer gap-2">
                          <Edit className="h-4 w-4 text-purple-600" />
                          <span>✏️ Edit Details</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/organizer/attendees/${event.id}`} className="cursor-pointer gap-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          <span>👥 View Attendees</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/organizer/checkin/${event.id}`} className="cursor-pointer gap-2">
                          <QrCode className="h-4 w-4 text-purple-600" />
                          <span>📷 Entry Scanner</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setEventToDelete(event)}
                        className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700 gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>🗑️ Delete Event</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Event Core Meta-Content */}
                <CardContent className="p-4">
                  <h3 className="font-bold text-base mb-1.5 line-clamp-1 text-gray-800 group-hover:text-purple-700 transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <Calendar className="h-3.5 w-3.5 text-purple-400" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <MapPin className="h-3.5 w-3.5 text-purple-400" />
                    <span className="line-clamp-1">{event.venueName}, {event.city}</span>
                  </div>

                  {/* Operational Performance Visual Badging Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                    <div className="text-center p-2 bg-purple-50/70 rounded-lg border border-purple-100/30">
                      <div className="flex items-center justify-center gap-1 text-[11px] text-purple-600 font-medium">
                        <Ticket className="h-3 w-3" />
                        <span>Tickets Sold</span>
                      </div>
                      <p className="font-bold text-base text-purple-700 mt-0.5">
                        {event.ticketStats?.totalSold || 0}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-emerald-50/70 rounded-lg border border-emerald-100/30">
                      <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-600 font-medium">
                        <TrendingUp className="h-3 w-3" />
                        <span>Revenue</span>
                      </div>
                      <p className="font-bold text-base text-emerald-700 mt-0.5">
                        {formatCurrency(event.ticketStats?.totalRevenue || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>

                {/* Core Footer Interactive Layer */}
                <CardFooter className="p-4 pt-0 flex gap-2">
                  <Link href={`/organizer/checkin/${event.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 font-medium">
                      <QrCode className="h-3.5 w-3.5 mr-1" />
                      Check-in
                    </Button>
                  </Link>
                  <Link href={`/organizer/events/${event.id}`} className="flex-1">
                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-sm">
                      Manage
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Unified Pagination Viewport */}
          {totalPages > 1 && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 mt-4">
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

      {/* Global State Confirmation Dialog Block */}
      <ConfirmationDialog
        open={!!eventToDelete}
        onOpenChange={(open) => !open && setEventToDelete(null)}
        onConfirm={handleDeleteEvent}
        title="🗑️ Delete Event Permanently"
        description={`Are you completely sure you want to delete "${eventToDelete?.title || 'this event'}"?`}
        confirmText="Yes, Delete Event"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      >
        <div className="mt-4 p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200">
          <div className="flex items-center gap-2 text-red-700 mb-1.5">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-bold text-sm">Critical Warning!</span>
          </div>
          <p className="text-xs text-red-600 leading-relaxed">
            This action instantly triggers cascade removal from our databases. All global registered transaction logs, attendee ticket codes, and tracking statistics will be erased completely. This cannot be undone.
          </p>
        </div>
      </ConfirmationDialog>
    </div>
  )
}