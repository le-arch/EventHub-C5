/**
 * Attendee List Page
 * 
 * Displays all attendees who purchased tickets for an event.
 * Features include:
 * - Search by name or phone
 * - Filter by check-in status
 * - View attendee details
 * - Export to CSV (coming soon)
 * 
 * @module AttendeeListPage
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Search,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  Calendar,
  Phone,
  Ticket,
  ArrowLeft,
  Users,
  TrendingUp,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Badge } from '@/src/components/ui/badge'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'

// Utilities
import api from '@/src/lib/api'
import { toast } from 'sonner'
import { formatDate, formatTime, formatCurrency } from '@/src/lib/utils'

// Type definitions
interface Attendee {
  id: string
  name: string
  phone: string
  ticketType: string
  quantity: number
  unitPrice: number
  totalPaid: number
  checkedIn: boolean
  checkedInAt: string | null
  purchasedAt: string
  qrCodeUrl: string
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

export default function AttendeeListPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [checkinFilter, setCheckinFilter] = useState<'all' | 'checked_in' | 'not_checked'>('all')

  // Fetch data on mount
  useEffect(() => {
    fetchEventAndAttendees()
  }, [params.eventId])

  const fetchEventAndAttendees = async () => {
    try {
      const [eventRes, attendeesRes, summaryRes] = await Promise.all([
        api.get(`/events/${params.eventId}`),
        api.get(`/events/${params.eventId}/attendees`),
        api.get(`/events/${params.eventId}/analytics`),
      ])
      
      setEvent(eventRes.data.event)
      setAttendees(attendeesRes.data.attendees)
      setSummary(summaryRes.data.summary)
    } catch (error) {
      toast.error('Failed to load attendees')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Filter attendees based on search and check-in status
   */
  const filteredAttendees = attendees.filter((attendee) => {
    const matchesSearch =
      searchTerm === '' ||
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.phone.includes(searchTerm)
    
    const matchesFilter =
      checkinFilter === 'all' ||
      (checkinFilter === 'checked_in' && attendee.checkedIn) ||
      (checkinFilter === 'not_checked' && !attendee.checkedIn)
    
    return matchesSearch && matchesFilter
  })

  /**
   * Export to CSV (placeholder - implement with backend)
   */
  const handleExport = () => {
    toast.info('CSV export coming soon')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/organizer/events')}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Events
          </Button>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-gray-500">
            {formatDate(event.startDate)} at {formatTime(event.startTime)} • {event.venueName}, {event.city}
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
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
                  <p className="text-sm text-gray-500">Checked In</p>
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
                  <p className="text-sm text-gray-500">Check-in Rate</p>
                  <p className="text-2xl font-bold">{summary.checkInPercentage}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
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
            <CardTitle className="text-lg">Ticket Sales Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.ticketBreakdown.map((ticket) => (
                <div key={ticket.name} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{ticket.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {ticket.sold} sold
                    </span>
                  </div>
                  <span className="font-semibold">{formatCurrency(ticket.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={checkinFilter}
          onValueChange={(value) => setCheckinFilter(value as typeof checkinFilter)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Attendees</SelectItem>
            <SelectItem value="checked_in">Checked In</SelectItem>
            <SelectItem value="not_checked">Not Checked In</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Attendee Table - Desktop */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attendee Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Ticket Type</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Amount Paid</TableHead>
                <TableHead className="text-center">Check-in Status</TableHead>
                <TableHead>Check-in Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-gray-500">No attendees found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAttendees.map((attendee) => (
                  <TableRow key={attendee.id}>
                    <TableCell className="font-medium">{attendee.name}</TableCell>
                    <TableCell>{attendee.phone}</TableCell>
                    <TableCell>{attendee.ticketType}</TableCell>
                    <TableCell className="text-center">{attendee.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(attendee.totalPaid)}
                    </TableCell>
                    <TableCell className="text-center">
                      {attendee.checkedIn ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Checked In
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Not Checked
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {attendee.checkedInAt
                        ? formatTime(attendee.checkedInAt)
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile View - Cards */}
      <div className="block md:hidden space-y-3">
        {filteredAttendees.map((attendee) => (
          <Card key={attendee.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-lg">{attendee.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Phone className="h-3 w-3" />
                    <span>{attendee.phone}</span>
                  </div>
                </div>
                {attendee.checkedIn ? (
                  <Badge className="bg-green-100 text-green-800">
                    ✓ Checked In
                  </Badge>
                ) : (
                  <Badge variant="secondary">Not Checked</Badge>
                )}
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <div>
                  <div className="flex items-center gap-1 text-sm">
                    <Ticket className="h-3 w-3 text-gray-400" />
                    <span>{attendee.ticketType} × {attendee.quantity}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Paid: {formatCurrency(attendee.totalPaid)}
                  </p>
                </div>
                {attendee.checkedInAt && (
                  <p className="text-xs text-gray-400">
                    {formatTime(attendee.checkedInAt)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}