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
  DollarSign,
  ArrowRight,
} from 'lucide-react'
import Image from 'next/image'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
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

interface Event {
  id: string
  title: string
  description: string
  venue: string
  city: string
  startDate: string
  startTime: string
  coverImageUrl: string | null
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  capacityRange?: {
    lower: number;
    upper: number;
  } | null;
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
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const clearSearch = () => {
    setSearchInput('')
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchInput])

  useEffect(() => {
    fetchEvents()
  }, [page, pageSize, debouncedSearch])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const response = await api.get('/events', {
        params: {
          page,
          limit: pageSize,
          search: debouncedSearch || undefined,
        },
      })
      setEvents(response.data.events)
      setTotalCount(response.data.total)
      setTotalPages(response.data.totalPages || Math.ceil(response.data.total / pageSize))
    } catch (error) {
      toast.error('Failed to load events')
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
      toast.success(`"${eventToDelete.title}" has been deleted`)
      setEvents(events.filter(e => e.id !== eventToDelete.id))
      setEventToDelete(null)
      fetchEvents()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete event'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/60 font-medium px-2.5 py-0.5 rounded-full shadow-sm hover:bg-emerald-50">
            <CheckCircle className="h-3 w-3 mr-1 text-emerald-600" />
            Published
          </Badge>
        )
      case 'draft':
        return (
          <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200 font-medium px-2.5 py-0.5 rounded-full hover:bg-slate-100">
            <FileText className="h-3 w-3 mr-1 text-slate-500" />
            Draft
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200/60 font-medium px-2.5 py-0.5 rounded-full hover:bg-rose-50">
            <XCircle className="h-3 w-3 mr-1 text-rose-600" />
            Cancelled
          </Badge>
        )
      case 'completed':
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200/60 font-medium px-2.5 py-0.5 rounded-full hover:bg-blue-50">
            <CheckCircle className="h-3 w-3 mr-1 text-blue-600" />
            Completed
          </Badge>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">
        <Skeleton className="h-5 w-48 rounded-md" />
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64 rounded-md" />
            <Skeleton className="h-4 w-96 rounded-md" />
          </div>
          <Skeleton className="h-11 w-44 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden border-slate-100 shadow-sm">
              <Skeleton className="h-44 w-full" />
              <CardContent className="p-5 space-y-4">
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                  <Skeleton className="h-4 w-2/3 rounded-md" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8 text-slate-900 antialiased">
      {/* Breadcrumb Section */}
      <div className="opacity-90">
        <Breadcrumb 
          items={[
            { label: 'Dashboard', href: '/organizer/events' },
            { label: 'My Events', href: '/organizer/events', isActive: true },
          ]}
          showHome
        />
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent flex items-center gap-3">
            <Calendar className="h-8 w-8 text-indigo-600" />
            My Events
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm md:text-base">
            Manage your lineup, view precise ticketing velocity, and manage attendance checks.
          </p>
        </div>
        <Link href="/organizer/create" className="w-full md:w-auto">
          <Button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition-transform text-white shadow-md shadow-indigo-100 px-5 py-6 rounded-xl font-medium flex items-center justify-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Event
          </Button>
        </Link>
      </div>

      {/* Search and Filters Context */}
      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <Input
            placeholder="Search events by title, venue, or city..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-12 pr-24 py-6 bg-slate-50/50 border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all text-base placeholder:text-slate-400"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100"
            >
              Clear
            </button>
          )}
        </div>

        {events.length > 0 && (
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 px-1">
            <Ticket className="h-3.5 w-3.5 text-slate-400" />
            Showing {events.length} of {totalCount} total event{totalCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Grid Content / Empty States */}
      {events.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/30 rounded-2xl p-12 text-center shadow-none">
          <CardContent className="p-0">
            <div className="flex flex-col items-center max-w-sm mx-auto space-y-4">
              <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center text-indigo-500">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-xl text-slate-800">
                No events found
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {debouncedSearch
                  ? `We couldn't find matches for "${debouncedSearch}". Refine your keywords or browse the catalog.`
                  : "Get started by publishing your very first public or private event sequence."}
              </p>
              {!debouncedSearch && (
                <Link href="/organizer/create">
                  <Button className="mt-2 bg-slate-900 hover:bg-slate-800 rounded-xl px-5">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Event
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="group overflow-hidden border border-slate-100 bg-white hover:border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl flex flex-col">
                
                {/* Media Anchor Block */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  {event.coverImageUrl ? (
                    <Image
                      src={event.coverImageUrl}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50/50 to-slate-100">
                      <Calendar className="h-12 w-12 text-indigo-200" />
                    </div>
                  )}
                  
                  {/* Absolute Badge Layers */}
                  <div className="absolute top-3 right-3 z-10">
                    {getStatusBadge(event.status)}
                  </div>
                  
                  <div className="absolute top-3 left-3 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-white/90 backdrop-blur-md hover:bg-white text-slate-700 h-8 w-8 rounded-lg shadow-sm border border-slate-200/20 active:scale-95 transition-transform"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48 rounded-xl p-1.5 shadow-xl border-slate-100">
                        <DropdownMenuItem asChild className="rounded-lg">
                          <Link href={`/organizer/events/${event.id}`} className="cursor-pointer gap-2 py-2 text-slate-700">
                            <Edit className="h-4 w-4 text-slate-400" />
                            Edit Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-lg">
                          <Link href={`/organizer/attendees/${event.id}`} className="cursor-pointer gap-2 py-2 text-slate-700">
                            <Users className="h-4 w-4 text-slate-400" />
                            Attendees
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-lg">
                          <Link href={`/organizer/checkin/${event.id}`} className="cursor-pointer gap-2 py-2 text-slate-700">
                            <QrCode className="h-4 w-4 text-slate-400" />
                            Check-in Gateway
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-lg">
                          <Link href={`/organizer/analytics/${event.id}`} className="cursor-pointer gap-2 py-2 text-slate-700">
                            <Eye className="h-4 w-4 text-slate-400" />
                            Performance Data
                          </Link>
                        </DropdownMenuItem>
                        <div className="h-px bg-slate-100 my-1" />
                        <DropdownMenuItem
                          onClick={() => setEventToDelete(event)}
                          className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 rounded-lg cursor-pointer gap-2 py-2 font-medium"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Primary Card Core Content */}
                <CardContent className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="font-bold text-xl tracking-tight text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-1.5 text-sm font-medium text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{event.venue}, {event.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Operational Performance Data */}
                  <div className="grid grid-cols-2 gap-3 pt-4 mt-5 border-t border-slate-100/80 bg-slate-50/40 rounded-xl p-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <Ticket className="h-3 w-3 text-slate-400" />
                        <span>Tickets</span>
                      </div>
                      <p className="font-bold text-lg text-slate-700">{event.ticketStats.totalSold}</p>
                    </div>
                    <div className="space-y-0.5 border-l border-slate-200/60 pl-3">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <TrendingUp className="h-3 w-3 text-slate-400" />
                        <span>Revenue</span>
                      </div>
                      <p className="font-bold text-lg text-indigo-600">
                        {formatCurrency(event.ticketStats.totalRevenue)}
                      </p>
                    </div>
                  </div>
                </CardContent>

                {/* Card Structural Footer Button Groups */}
                <CardFooter className="p-5 pt-0 flex gap-2.5">
                  <Link href={`/organizer/checkin/${event.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl py-5 font-medium transition-colors flex items-center justify-center gap-1.5">
                      <QrCode className="h-4 w-4 text-slate-500" />
                      Check-In
                    </Button>
                  </Link>
                  <Link href={`/organizer/events/${event.id}`} className="flex-1">
                    <Button size="sm" className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl py-5 font-medium transition-colors group/btn">
                      Manage
                      <ArrowRight className="h-4 w-4 ml-1 opacity-60 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination Block */}
          {totalPages > 1 && (
            <div className="pt-4 border-t border-slate-100">
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

      {/* Global Context System Overlays */}
      <ConfirmationDialog
        open={!!eventToDelete}
        onOpenChange={(open) => !open && setEventToDelete(null)}
        onConfirm={handleDeleteEvent}
        title="Delete Event Archive"
        description={`Are you completely sure you want to purge "${eventToDelete?.title || 'this selected item'}"?`}
        confirmText="Confirm Permanent Deletion"
        cancelText="Dismiss"
        variant="danger"
        isLoading={isDeleting}
      >
        <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-xl text-left">
          <div className="flex items-center gap-2 text-rose-700 mb-1.5">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <span className="font-semibold text-sm">Irrevocable Modification Warning</span>
          </div>
          <p className="text-xs text-rose-600/90 leading-relaxed">
            Executing this step completely deletes your event parameters, customer transactional linkages, sales accounting records, and operational access keys.
          </p>
        </div>
      </ConfirmationDialog>
    </div>
  )
}