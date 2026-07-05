/**
 * Admin Events Management Page
 * * Allows admin to view all events across all organizers.
 * Features include:
 * - Search by event title or organizer
 * - Filter by event status
 * - Sort by date
 * - Cancel events
 * - View event details
 * - Pagination for large event lists
 * - Breadcrumb navigation
 * - Confirmation dialog for cancellations
 * - Uses global event store for state management
 * * @module AdminEventsPage
 */

'use client'

import { useState, useEffect, useDeferredValue, useCallback } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  MoreVertical,
  Calendar,
  MapPin,
  Users,
  Eye,
  XCircle,
  Ban,
  AlertCircle,
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

// Stores & Utilities
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { toast } from 'sonner'
import { formatDate, formatCurrency } from '@/lib/utils'

interface AdminEvent {
  id: string
  title: string
  description: string | null
  venue: string
  city: string
  startDate: string
  endDate: string | null
  startTime: string
  endTime: string | null
  coverImageUrl: string | null
  status: string
  capacityRange?: { lower: number; upper: number }
  ticketsSold: number
  totalRevenue: number
  createdAt: string
  updatedAt: string
  organizerId: string
  organizerName: string
  organizerEmail: string
}

export default function AdminEventsPage() {
  const { user: adminUser } = useAuthStore()
  
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [eventToCancel, setEventToCancel] = useState<AdminEvent | null>(null)
  const [eventToSuspend, setEventToSuspend] = useState<AdminEvent | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const fetchAdminEvents = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: Record<string, string | number> = {
        page,
        limit: pageSize,
        search: deferredSearchTerm || '',
        status: statusFilter !== 'all' ? statusFilter : '',
      }
      const response = await api.get('/admin/events', { params })
      const data = response.data
      const mapped = ((data.events || []) as Record<string, unknown>[]).map((e) => ({
        ...e as unknown as AdminEvent,
        ticketsSold: ((e.ticketStats as Record<string, number>)?.totalSold) || 0,
        totalRevenue: ((e.ticketStats as Record<string, number>)?.totalRevenue) || 0,
      }))
      setEvents(mapped)
      setTotalCount(data.total || 0)
    } catch {
      setEvents([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, deferredSearchTerm, statusFilter])

  useEffect(() => {
    fetchAdminEvents()
  }, [fetchAdminEvents])

  const totalPages = Math.ceil(totalCount / pageSize) || 1

  const handleCancelEvent = async () => {
    if (!eventToCancel) return
    setIsProcessing(true)
    try {
      await api.put(`/admin/events/${eventToCancel.id}/cancel`)
      toast.success(`✅ "${eventToCancel.title}" cancelled successfully`)
      fetchAdminEvents()
    } catch {
      toast.error('❌ Failed to cancel event')
    } finally {
      setIsProcessing(false)
      setEventToCancel(null)
    }
  }

  const handleSuspendEvent = async () => {
    if (!eventToSuspend) return
    setIsProcessing(true)
    try {
      await api.put(`/admin/events/${eventToSuspend.id}/suspend`)
      toast.success(`⛔ "${eventToSuspend.title}" suspended successfully`)
      fetchAdminEvents()
    } catch {
      toast.error('❌ Failed to suspend event')
    } finally {
      setIsProcessing(false)
      setEventToSuspend(null)
    }
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPage(1)
  }

  /**
   * Get status badge for event with high-contrast font metrics
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <Badge className="bg-emerald-100 text-emerald-900 font-bold flex items-center gap-1 border border-emerald-300 shadow-sm">
            <CheckCircle className="h-3 w-3 text-emerald-700 fill-emerald-100" />
            Published 
          </Badge>
        )
      case 'draft':
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-amber-100 text-amber-950 font-bold border border-amber-300 shadow-sm">
            <FileText className="h-3 w-3 text-amber-700 fill-amber-200" />
            Draft 
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="destructive" className="flex items-center gap-1 bg-red-100 text-red-950 font-bold border border-red-300 shadow-sm hover:bg-red-100">
            <XCircle className="h-3 w-3 text-red-700" />
            Cancelled
          </Badge>
        )
      case 'completed':
        return (
          <Badge className="bg-blue-100 text-blue-950 font-bold flex items-center gap-1 border border-blue-300 shadow-sm">
            <CheckCircle className="h-3 w-3 text-blue-700" />
            Completed
          </Badge>
        )
      default:
        return null
    }
  }

  // Loading skeleton
  if (isLoading && events.length === 0) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto bg-background min-h-screen">
        <Skeleton className="h-6 w-64 bg-purple-200/50" />
        <div>
          <Skeleton className="h-8 w-48 mb-2 bg-purple-200/50" />
          <Skeleton className="h-4 w-64 bg-purple-200/50" />
        </div>
        <Skeleton className="h-12 w-full bg-purple-200/50" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full bg-purple-200/50" />
          ))}
        </div>
        <Skeleton className="h-12 w-full max-w-md mx-auto bg-purple-200/50" />
      </div>
    )
  }

  // Check if admin is authenticated
  if (!adminUser || adminUser.role !== 'admin') {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <Card className="text-center py-12 border-2 border-red-200 bg-white shadow-xl max-w-md w-full">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center border border-red-300">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-black text-xl text-foreground tracking-tight">Access Denied</h3>
              <p className="text-muted-foreground max-w-sm text-sm font-medium leading-relaxed">
                You need administrative credentials and structural privileges to view this management platform module.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto bg-background min-h-screen text-foreground">
      {/* Breadcrumb Section */}
      <Breadcrumb 
        items={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Events', href: '#', isActive: true },
        ]}
        showHome
      />

      {/* Main Feature Dashboard Jumbotron Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 p-6 rounded-2xl shadow-md text-white border border-purple-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md border border-white/20 shadow-inner">
            <CalendarDays className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Event Management <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600">📅</span></h1>
            <p className="text-purple-100 text-sm font-medium mt-0.5">
              Supervise, review performance metrics, and moderate production events platform-wide.
            </p>
          </div>
        </div>
        <div className="text-purple-950 text-sm font-bold bg-white px-4 py-2.5 rounded-xl shadow-md border border-purple-200">
          Total Base: <span className="text-purple-700 font-extrabold text-base ml-1">{totalCount}</span> metrics accounts
        </div>
      </div>

      {/* Filter and Search Layout Grid */}
      <Card className="border-2 border-purple-100 bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-600 z-10" />
              <Input
                placeholder="🔍 Search by event title or organizer details..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="pl-11 pr-4 py-6 text-gray-900 placeholder:text-gray-500 font-medium border-2 border-purple-100 focus-visible:border-purple-500 focus-visible:ring-purple-500 rounded-xl shadow-sm bg-white"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value)
                setPage(1)
              }}>
                <SelectTrigger className="w-full sm:w-52 py-6 border-2 border-purple-100 text-gray-900 font-bold focus:border-purple-500 focus:ring-purple-500 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-purple-600" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="border-2 border-purple-100 bg-white font-semibold">
                  <SelectItem value="all" className="text-gray-900">All Status Categories</SelectItem>
                  <SelectItem value="published" className="text-emerald-950">Published Events</SelectItem>
                  <SelectItem value="draft" className="text-amber-950">Draft Backlogs</SelectItem>
                  <SelectItem value="cancelled" className="text-red-950">Cancelled Buffers</SelectItem>
                  <SelectItem value="completed" className="text-blue-950">Completed Operations</SelectItem>
                </SelectContent>
              </Select>
              
              {(searchTerm || statusFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={handleResetFilters} 
                  className="border-2 border-red-200 text-red-700 font-bold hover:bg-red-50 hover:text-red-800 py-6 px-5 rounded-xl shadow-sm"
                >
                  Clear Filters ✕
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Count Tracker Info Layer */}
      <div className="text-sm text-gray-700 flex items-center gap-2 px-1 font-semibold">
        <CalendarDays className="h-4 w-4 text-purple-600" />
        Showing <span className="text-purple-700 font-black">{events.length}</span> out of <span className="text-gray-900 font-black">{totalCount}</span> functional system queries
      </div>

      {/* Main Core Architecture Spreadsheet Table */}
      <Card className="border border-purple-100 bg-white shadow-md rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-purple-100/60 border-b border-purple-200">
                <TableRow>
                  <TableHead className="text-purple-950 font-black text-sm py-4"><span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600">📋</span> Event Details</TableHead>
                  <TableHead className="text-purple-950 font-black text-sm py-4"><span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600" >👤</span> Organizer Signature</TableHead>
                  <TableHead className="text-purple-950 font-black text-sm py-4"><span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600" >📍</span> Venue / Hub</TableHead>
                  <TableHead className="text-purple-950 font-black text-sm py-4"><span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600" >📅</span> Timestamp</TableHead>
                  <TableHead className="text-purple-950 font-black text-sm py-4"><span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600" >🎟️</span> Tickets</TableHead>
                  <TableHead className="text-purple-950 font-black text-sm py-4"><span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600" >💰</span> Gross Revenue</TableHead>
                  <TableHead className="text-purple-950 font-black text-sm py-4"><span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600" >📊</span> Deployment</TableHead>
                  <TableHead className="text-purple-950 font-black text-sm py-4 w-16 text-center"><span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600">📌</span> Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16 bg-white">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center border-2 border-purple-100">
                          <AlertCircle className="h-8 w-8 text-purple-600" />
                        </div>
                        <p className="text-gray-900 font-black text-lg">No matching records found <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600">📭</span></p>
                        <p className="text-sm text-gray-600 font-medium max-w-sm leading-relaxed">
                          {searchTerm || statusFilter !== 'all' 
                            ? 'The filters applied yield zero query records. Adjust parameters to check alternate rows.' 
                            : 'No events are registered on the host clusters yet.'}
                        </p>
                        {(searchTerm || statusFilter !== 'all') && (
                          <Button
                            variant="link"
                            onClick={handleResetFilters}
                            className="text-purple-700 font-bold underline decoration-2 hover:text-purple-900 mt-1"
                          >
                            Reset filters pipeline 
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => (
                    <TableRow 
                      key={event.id} 
                      className="hover:bg-purple-50/50 border-b border-purple-100/60 transition-colors"
                    >
                      <TableCell className="py-4">
                        <div>
                          <p className="font-bold text-gray-900 text-base leading-snug">{event.title}</p>
                          <p className="text-xs font-mono font-bold text-purple-700 mt-1">ID: {event.id.slice(0, 8)}</p>
                          {event.capacityRange && (
                            <div className="text-xs text-gray-700 font-semibold bg-gray-100 border border-gray-200 inline-block px-2 py-0.5 rounded-md mt-1.5">
                              Capacity bounds: {event.capacityRange.lower} – {event.capacityRange.upper}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-purple-100 border border-purple-200 rounded-xl shrink-0">
                            <Users className="h-4 w-4 text-purple-700" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{event.organizerName}</p>
                            <p className="text-xs font-semibold text-gray-600 mt-0.5">{event.organizerEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-start gap-1.5 max-w-[180px]">
                          <MapPin className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                          <span className="text-sm font-bold text-gray-800 leading-tight">
                            {event.venue}, <span className="text-purple-950 font-black">{event.city}</span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-purple-600 shrink-0" />
                          <span className="text-sm font-bold text-gray-800">
                            {formatDate(event.startDate)}
                            <span className="block text-xs font-semibold text-gray-500 mt-0.5">
                              {event.startTime}
                            </span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-extrabold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200 text-sm">
                          {event.ticketsSold.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-sm">
                          {formatCurrency(event.totalRevenue)}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">{getStatusBadge(event.status)}</TableCell>
                      <TableCell className="py-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="hover:bg-purple-100 text-gray-700 hover:text-purple-950 border border-transparent hover:border-purple-200 rounded-xl h-9 w-9"
                            >
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-2 border-purple-100 bg-white p-1.5 rounded-xl shadow-lg min-w-[170px] font-bold">
                            <DropdownMenuItem asChild>
                              <Link href={`/e/${event.id}`} target="_blank" className="cursor-pointer flex items-center gap-2 p-2 rounded-lg text-gray-900 hover:bg-purple-50">
                                <Eye className="h-4 w-4 text-purple-700" />
                                 View Live Link
                              </Link>
                            </DropdownMenuItem>
                            {event.status !== 'suspended' && event.status !== 'archived' && (
                              <DropdownMenuItem
                                onClick={() => setEventToSuspend(event)}
                                className="text-amber-700 cursor-pointer focus:bg-amber-50 focus:text-amber-800 flex items-center gap-2 p-2 rounded-lg mt-1"
                              >
                                <Ban className="h-4 w-4 text-amber-600" />
                                 Suspend Event
                              </DropdownMenuItem>
                            )}
                            {event.status !== 'cancelled' && event.status !== 'archived' && event.status !== 'suspended' && (
                              <DropdownMenuItem
                                onClick={() => setEventToCancel(event)}
                                className="text-red-700 cursor-pointer focus:bg-red-50 focus:text-red-800 flex items-center gap-2 p-2 rounded-lg mt-1"
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
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

      {/* Pagination Controller Container */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
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

      {/* High-Contrast Bottom Aggregated KPI Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-purple-200 bg-white shadow-sm rounded-xl">
          <CardContent className="pt-5 pb-5">
            <div className="text-center">
              <CalendarDays className="h-7 w-7 text-purple-700 mx-auto mb-2" />
              <p className="text-3xl font-black text-gray-900 tracking-tight">{events.length}</p>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-1">Total Query Rows</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-emerald-300 bg-white shadow-sm rounded-xl">
          <CardContent className="pt-5 pb-5">
            <div className="text-center">
              <CheckCircle className="h-7 w-7 text-emerald-700 mx-auto mb-2" />
              <p className="text-3xl font-black text-emerald-700 tracking-tight">
                {events.filter(e => e.status === 'published').length}
              </p>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-1">Live Broadcasts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-300 bg-white shadow-sm rounded-xl">
          <CardContent className="pt-5 pb-5">
            <div className="text-center">
              <Ticket className="h-7 w-7 text-blue-700 mx-auto mb-2" />
              <p className="text-3xl font-black text-blue-900 tracking-tight">
                {events.reduce((sum, e) => sum + e.ticketsSold, 0).toLocaleString()}
              </p>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-1">Receipt Indexes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-amber-300 bg-white shadow-sm rounded-xl">
          <CardContent className="pt-5 pb-5">
            <div className="text-center">
              <DollarSign className="h-7 w-7 text-amber-700 mx-auto mb-2" />
              <p className="text-3xl font-black text-amber-900 tracking-tight">
                {formatCurrency(events.reduce((sum, e) => sum + e.totalRevenue, 0))}
              </p>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-1">Combined Ledger</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Structured Confirmation Dialog Box for Platform Moderation */}
      <ConfirmationDialog
        open={!!eventToCancel}
        onOpenChange={() => setEventToCancel(null)}
        onConfirm={handleCancelEvent}
        title=" Cancel Platform Event Record"
        description={`Are you absolutely sure you want to flag and cancel "${eventToCancel?.title}"? This process blocks future checkouts instantly and terminates tickets.`}
        confirmText="Confirm Event Cancellation"
        cancelText="Dismiss Action"
        variant="danger"
        isLoading={isProcessing}
      >
        <div className="mt-4 p-4 bg-gradient-to-br from-red-50 to-amber-50 rounded-xl border-2 border-red-200 shadow-sm">
          <div className="flex items-center gap-2 text-red-900 mb-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-700" />
            <span className="font-black text-sm">⚠️ High System Severity Notice</span>
          </div>
          <p className="text-xs text-red-950 font-bold leading-relaxed">
            Cancelling this pipeline transaction halts payment gateways (MTN MoMo & Orange Money) directly. 
            Archived logs will remain saved, but public entry gates will be hidden immediately.
          </p>
        </div>
      </ConfirmationDialog>

      <ConfirmationDialog
        open={!!eventToSuspend}
        onOpenChange={() => setEventToSuspend(null)}
        onConfirm={handleSuspendEvent}
        title=" Suspend Platform Event Record"
        description={`Are you sure you want to suspend "${eventToSuspend?.title}"? Suspended events are hidden from public view but can be restored later.`}
        confirmText="Confirm Suspension"
        cancelText="Dismiss Action"
        variant="danger"
        isLoading={isProcessing}
      >
        <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 shadow-sm">
          <div className="flex items-center gap-2 text-amber-900 mb-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-700" />
            <span className="font-black text-sm">⚠️ Moderate Severity Notice</span>
          </div>
          <p className="text-xs text-amber-950 font-bold leading-relaxed">
            Suspending this event will hide it from public listings and prevent new ticket purchases.
            The event and its data will be preserved and can be restored at any time.
          </p>
        </div>
      </ConfirmationDialog>
    </div>
  )
}