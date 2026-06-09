/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Attendee List Page
 * 
 * Displays all attendees who purchased tickets for an event.
 * Features include:
 * - Search by name or phone
 * - Filter by ticket type and check-in status
 * - View attendee details in table (desktop) or card (mobile)
 * - Export to CSV/Excel
 * - Real-time check-in status
 * - Pagination for large attendee lists
 * - Breadcrumb navigation
 * 
 * @module AttendeeListPage
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft,
  Users,
  TrendingUp,
  CheckCircle,
  Download,
  Filter,
  Calendar,
  MapPin,
  Ticket,
  AlertCircle,
} from 'lucide-react'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { Pagination } from '@/components/common/Pagination'
import { AttendeeSearch } from '@/components/attendees/AttendeeSearch'
import { AttendeeFilters } from '@/components/attendees/AttendeeFilters'
import { AttendeeTable } from '@/components/attendees/AttendeeTable'
import { AttendeeCard } from '@/components/attendees/AttendeeCard'
import { ExportButton } from '@/components/attendees/ExportButton'

// Utilities
import api from '@/lib/api'
import { toast } from 'sonner'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'

// Types
interface Attendee {
  id: string
  name: string
  phone: string
  email?: string
  ticketType: string
  quantity: number
  unitPrice: number
  totalPaid: number
  checkedIn: boolean
  checkedInAt: string | null
  purchasedAt: string
  qrCodeUrl?: string
}

interface Event {
  id: string
  title: string
  startDate: string
  startTime: string
  venueName: string
  city: string
}

interface Summary {
  totalAttendees: number
  totalRevenue: number
  checkedInCount: number
  checkInPercentage: number
  ticketBreakdown: {
    name: string
    sold: number
    revenue: number
  }[]
}

interface FilterOptions {
  ticketType: string
  checkInStatus: 'all' | 'checked_in' | 'not_checked'
  dateFrom: string
  dateTo: string
}

export default function AttendeeListPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  // State
  const [event, setEvent] = useState<Event | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [filteredAttendees, setFilteredAttendees] = useState<Attendee[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({
    ticketType: 'all',
    checkInStatus: 'all',
    dateFrom: '',
    dateTo: '',
  })
  const [ticketTypes, setTicketTypes] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch data on mount
  useEffect(() => {
    fetchEventAndAttendees()
  }, [eventId, page, pageSize])

  // Apply filters and search whenever dependencies change
  useEffect(() => {
    applyFiltersAndSearch()
  }, [attendees, searchTerm, filters])

  const fetchEventAndAttendees = async () => {
    setLoading(true)
    try {
      const [eventRes, attendeesRes, summaryRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/events/${eventId}/attendees`, {
          params: {
            page,
            limit: pageSize,
          },
        }),
        api.get(`/events/${eventId}/analytics`),
      ])

      setEvent(eventRes.data.event)
      setAttendees(attendeesRes.data.attendees)
      setFilteredAttendees(attendeesRes.data.attendees)
      setTotalCount(attendeesRes.data.total)
      setTotalPages(attendeesRes.data.totalPages || Math.ceil(attendeesRes.data.total / pageSize))
      setSummary(summaryRes.data.summary)

      // Extract unique ticket types for filter
      const types = [...new Set(attendeesRes.data.attendees.map((a: Attendee) => a.ticketType))] as string[]
      setTicketTypes(types)
    } catch (error) {
      toast.error('❌ Failed to load attendees')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Apply search and filters to attendees
   */
  const applyFiltersAndSearch = () => {
    let filtered = [...attendees]

    // Apply search (name or phone)
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(term) ||
          a.phone.includes(term)
      )
    }

    // Apply ticket type filter
    if (filters.ticketType !== 'all') {
      filtered = filtered.filter((a) => a.ticketType === filters.ticketType)
    }

    // Apply check-in status filter
    if (filters.checkInStatus !== 'all') {
      filtered = filtered.filter((a) =>
        filters.checkInStatus === 'checked_in' ? a.checkedIn : !a.checkedIn
      )
    }

    // Apply date range filter (purchase date)
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filtered = filtered.filter((a) => new Date(a.purchasedAt) >= fromDate)
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      toDate.setHours(23, 59, 59)
      filtered = filtered.filter((a) => new Date(a.purchasedAt) <= toDate)
    }

    setFilteredAttendees(filtered)
  }

  /**
   * Handle check-in of an attendee
   */
  const handleCheckIn = useCallback(async (attendeeId: string) => {
    try {
      const response = await api.post(`/attendees/${attendeeId}/checkin`)
      
      // Update local state
      setAttendees((prev) =>
        prev.map((a) =>
          a.id === attendeeId
            ? { ...a, checkedIn: true, checkedInAt: new Date().toISOString() }
            : a
        )
      )
      
      // Update summary
      if (summary) {
        setSummary({
          ...summary,
          checkedInCount: summary.checkedInCount + 1,
          checkInPercentage: ((summary.checkedInCount + 1) / summary.totalAttendees) * 100,
        })
      }
      
      toast.success(`✅ ${response.data.attendee_name} checked in successfully!`)
    } catch (error: any) {
      toast.error(`❌ ${error.response?.data?.error || 'Failed to check in attendee'}`)
    }
  }, [summary])

  /**
   * Handle export of attendee list
   */
  const handleExport = async (format: 'csv' | 'excel') => {
    setIsExporting(true)
    try {
      const response = await api.get(`/events/${eventId}/attendees/export`, {
        params: {
          format,
          search: searchTerm || undefined,
          ticketType: filters.ticketType !== 'all' ? filters.ticketType : undefined,
          checkInStatus: filters.checkInStatus !== 'all' ? filters.checkInStatus : undefined,
        },
        responseType: 'blob',
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      const filename = `attendees_${event?.title?.replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 10)}.${format === 'csv' ? 'csv' : 'xlsx'}`
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success(`📥 Exported ${filteredAttendees.length} attendees successfully`)
    } catch (error) {
      toast.error('❌ Failed to export attendees')
    } finally {
      setIsExporting(false)
    }
  }

  /**
   * Reset all filters
   */
  const handleResetFilters = () => {
    setSearchTerm('')
    setFilters({
      ticketType: 'all',
      checkInStatus: 'all',
      dateFrom: '',
      dateTo: '',
    })
    setPage(1)
  }

  /**
   * Calculate active filter count for badge
   */
  const getActiveFilterCount = (): number => {
    let count = 0
    if (filters.ticketType !== 'all') count++
    if (filters.checkInStatus !== 'all') count++
    if (filters.dateFrom) count++
    if (filters.dateTo) count++
    return count
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-64" />
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-12 w-full max-w-md mx-auto" />
      </div>
    )
  }

  if (!event) return null

  const activeFilterCount = getActiveFilterCount()

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Dashboard', href: '/organizer/events' },
          { label: 'Events', href: '/organizer/events' },
          { label: event.title, href: `/organizer/events/${eventId}` },
          { label: 'Attendees', href: '#', isActive: true },
        ]}
        showHome
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/organizer/events')}
              className="-ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Events
            </Button>
          </div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Attendees 👥
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            {formatDate(event.startDate)} at {formatTime(event.startTime)}
            <span className="mx-1">•</span>
            <MapPin className="h-3 w-3" />
            {event.venueName}, {event.city}
          </p>
        </div>
        
        <ExportButton
          attendees={filteredAttendees}
          eventName={event.title}
          onExport={handleExport}
          isLoading={isExporting}
        />
      </div>

      {/* Summary Card */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Total Attendees</p>
                  <p className="text-2xl font-bold">{summary.totalAttendees}</p>
                </div>
                <Users className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.totalRevenue)}
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Checked In ✅</p>
                  <p className="text-2xl font-bold">
                    {summary.checkedInCount} / {summary.totalAttendees}
                  </p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Check-in Rate 📊</p>
                  <p className="text-2xl font-bold">{summary.checkInPercentage}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${summary.checkInPercentage}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ticket Breakdown */}
      {summary && summary.ticketBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Ticket className="h-4 w-4 text-primary" />
              Ticket Sales Breakdown 🎟️
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.ticketBreakdown.map((ticket) => (
                <div
                  key={ticket.name}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{ticket.name}</p>
                    <p className="text-sm text-gray-500">{ticket.sold} sold</p>
                  </div>
                  <p className="font-semibold text-primary">
                    {formatCurrency(ticket.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* =Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <AttendeeSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="🔍 Search by name or phone number..."
          />
        </div>
        
        <AttendeeFilters
          ticketTypes={ticketTypes}
          filters={filters}
          onFiltersChange={setFilters}
          activeFilterCount={activeFilterCount}
        />
        
        {activeFilterCount > 0 && (
          <Button variant="ghost" onClick={handleResetFilters} className="sm:w-auto">
            Reset Filters ✕
          </Button>
        )}
      </div>

      {/* Result Count */}
      <div className="text-sm text-gray-500 flex items-center justify-between flex-wrap gap-2">
        <span>
          Showing {filteredAttendees.length} of {attendees.length} attendees
        </span>
        {filteredAttendees.length > 0 && (
          <span className="text-xs">
            📊 Check-in progress: {summary?.checkedInCount || 0}/{summary?.totalAttendees || 0}
          </span>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <AttendeeTable
          attendees={filteredAttendees}
          onCheckIn={handleCheckIn}
        />
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {filteredAttendees.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No attendees found 📭</p>
              {(searchTerm || activeFilterCount > 0) && (
                <Button variant="link" onClick={handleResetFilters} className="mt-2">
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredAttendees.map((attendee) => (
            <AttendeeCard
              key={attendee.id}
              attendee={attendee}
              onCheckIn={handleCheckIn}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20, 50, 100]}
          totalItems={totalCount}
          showFirstLast
        />
      )}

      {/* Empty State */}
      {filteredAttendees.length === 0 && attendees.length > 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="h-12 w-12 text-gray-300" />
              <p className="text-gray-500">No attendees match your search criteria 🔍</p>
              <Button variant="link" onClick={handleResetFilters} className="mt-2">
                Clear all filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}