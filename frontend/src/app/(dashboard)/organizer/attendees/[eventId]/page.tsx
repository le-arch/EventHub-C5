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
 * - Purple/Blue theme
 * 
 * @module AttendeeListPage
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Users,
  TrendingUp,
  CheckCircle,
  Calendar,
  MapPin,
  Ticket,
  AlertCircle,
  RefreshCw,
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

  // Redirect if no eventId is provided
  useEffect(() => {
    if (!eventId) {
      router.replace('/organizer/events')
    }
  }, [eventId, router])

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
    if (eventId) {
      fetchEventAndAttendees()
    }
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
      
      const attendeesList = attendeesRes.data?.attendees || []
      setAttendees(attendeesList)
      setFilteredAttendees(attendeesList)
      setTotalCount(attendeesRes.data?.total || 0)
      setTotalPages(attendeesRes.data?.totalPages || Math.ceil((attendeesRes.data?.total || 0) / pageSize))
      
      const summaryData = summaryRes.data?.summary || {
        totalAttendees: 0,
        totalRevenue: 0,
        checkedInCount: 0,
        checkInPercentage: 0,
        ticketBreakdown: [],
      }
      setSummary(summaryData)

      const types = [...new Set(attendeesList.map((a: Attendee) => a.ticketType))]
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

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(term) ||
          a.phone.includes(term)
      )
    }

    if (filters.ticketType !== 'all') {
      filtered = filtered.filter((a) => a.ticketType === filters.ticketType)
    }

    if (filters.checkInStatus !== 'all') {
      filtered = filtered.filter((a) =>
        filters.checkInStatus === 'checked_in' ? a.checkedIn : !a.checkedIn
      )
    }

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

  const handleCheckIn = useCallback(async (attendeeId: string) => {
    try {
      const response = await api.post(`/attendees/${attendeeId}/checkin`)
      
      setAttendees((prev) =>
        prev.map((a) =>
          a.id === attendeeId
            ? { ...a, checkedIn: true, checkedInAt: new Date().toISOString() }
            : a
        )
      )
      
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

      {/* Header with Purple/Blue Gradient */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 p-5 rounded-xl shadow-lg text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Attendees 👥</h1>
            <p className="text-white/80 text-sm mt-0.5 flex items-center gap-2 flex-wrap">
              <Calendar className="h-3 w-3" />
              {formatDate(event.startDate)} at {formatTime(event.startTime)}
              <span className="mx-1">•</span>
              <MapPin className="h-3 w-3" />
              {event.venueName}, {event.city}
            </p>
          </div>
        </div>
        <ExportButton
          attendees={filteredAttendees}
          eventName={event.title}
          onExport={handleExport}
          isLoading={isExporting}
        />
      </div>

      {/* Summary Cards with Gradients */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-purple-600">Total Attendees</p>
                  <p className="text-2xl font-bold text-purple-700">{summary.totalAttendees}</p>
                </div>
                <Users className="h-5 w-5 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-emerald-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {formatCurrency(summary.totalRevenue)}
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-blue-600">Checked In ✅</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {summary.checkedInCount} / {summary.totalAttendees}
                  </p>
                </div>
                <CheckCircle className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-amber-600">Check-in Rate 📊</p>
                  <p className="text-2xl font-bold text-amber-700">{summary.checkInPercentage}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
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
        <Card className="border-l-4 border-l-purple-500 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
              <Ticket className="h-4 w-4 text-purple-500" />
              Ticket Sales Breakdown 🎟️
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.ticketBreakdown.map((ticket) => (
                <div
                  key={ticket.name}
                  className="flex justify-between items-center p-3 bg-purple-50/50 rounded-xl border border-purple-100"
                >
                  <div>
                    <p className="font-medium text-gray-800">{ticket.name}</p>
                    <p className="text-sm text-gray-500">{ticket.sold} sold</p>
                  </div>
                  <p className="font-semibold text-purple-600">
                    {formatCurrency(ticket.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters Card */}
      <Card className="border-l-4 border-l-blue-500 shadow-md">
        <CardContent className="pt-6">
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
              <Button variant="ghost" onClick={handleResetFilters} className="text-purple-600 hover:text-purple-800 hover:bg-purple-50">
                Reset Filters ✕
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-500 flex items-center justify-between flex-wrap gap-2">
        <span>
          Showing <span className="font-semibold text-purple-700">{filteredAttendees?.length || 0}</span> of <span className="font-semibold">{attendees?.length || 0}</span> attendees
        </span>
        {filteredAttendees?.length > 0 && (
          <span className="text-xs bg-blue-50 px-3 py-1 rounded-full text-blue-700">
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
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No attendees found 📭</p>
              {(searchTerm || activeFilterCount > 0) && (
                <Button variant="link" onClick={handleResetFilters} className="text-purple-600">
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
        <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
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
        </div>
      )}

      {/* Empty State for No Results */}
      {filteredAttendees.length === 0 && attendees.length > 0 && (
        <Card className="border-dashed border-2 border-amber-200 bg-amber-50/30">
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="h-12 w-12 text-amber-400" />
              <p className="text-gray-500">No attendees match your search criteria 🔍</p>
              <Button variant="link" onClick={handleResetFilters} className="text-purple-600">
                Clear all filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}