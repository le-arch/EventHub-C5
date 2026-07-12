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

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  Share2,
  Sparkles,
  BarChart3,
  PartyPopper,
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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
}

const statVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, type: 'spring' as const, stiffness: 80, damping: 12 },
  }),
}

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
      const response = await api.get('/Organization/events', {
        params: {
          page,
          limit: pageSize + 1,
          search: debouncedSearch || undefined,
        },
      })
      const data = Array.isArray(response.data) ? response.data : []
      const hasMore = data.length > pageSize
      const pageEvents = hasMore ? data.slice(0, pageSize) : data
      setEvents(pageEvents)
      setTotalCount(pageEvents.length)
      setTotalPages(hasMore ? page + 1 : page)
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
          <Badge variant="secondary" className="bg-muted/30 text-muted-foreground border-border font-medium px-2.5 py-0.5 rounded-full hover:bg-muted/30">
            <FileText className="h-3 w-3 mr-1 text-muted-foreground" />
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
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8 text-foreground antialiased">
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            >
              <Sparkles className="h-6 w-6 text-amber-500" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent flex items-center gap-3">
              My Events
            </h1>
          </div>
          <p className="text-muted-foreground mt-1.5 text-sm md:text-base ml-0">
            Manage your lineup, view precise ticketing velocity, and manage attendance checks.
          </p>
        </div>
        <Link href="/organizer/create" className="w-full md:w-auto">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-98 transition-all text-white shadow-lg shadow-indigo-200/50 px-6 py-6 rounded-xl font-medium flex items-center justify-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Event
            </Button>
          </motion.div>
        </Link>
      </motion.div>
      <div className="h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent mb-2" />

      {/* Stats Summary */}
      {events.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Total Events', value: totalCount, icon: Calendar, color: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-50', textColor: 'text-indigo-700' },
            { label: 'Tickets Sold', value: events.reduce((s, e) => s + e.ticketStats.totalSold, 0), icon: Ticket, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', textColor: 'text-emerald-700' },
            { label: 'Total Revenue', value: formatCurrency(events.reduce((s, e) => s + e.ticketStats.totalRevenue, 0)), icon: TrendingUp, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', textColor: 'text-amber-700' },
            { label: 'Published', value: events.filter(e => e.status === 'published').length, icon: CheckCircle, color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50', textColor: 'text-blue-700' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={statVariants}
              className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-current opacity-20 group-hover:opacity-40 transition-opacity" />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Search and Filters Context */}
      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
          <Input
            placeholder="Search events by title, venue, or city..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-12 pr-24 py-6 bg-muted/50/50 border-border rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all text-base placeholder:text-muted-foreground"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground text-sm font-medium transition-colors bg-card px-2 py-1 rounded-md shadow-sm border border-slate-100"
            >
              Clear
            </button>
          )}
        </div>

        {events.length > 0 && (
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 px-1">
            <Ticket className="h-3.5 w-3.5 text-muted-foreground" />
            Showing {events.length} of {totalCount} total event{totalCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Grid Content / Empty States */}
      {events.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 80, damping: 12 }}
        >
          <Card className="border-dashed border-2 border-border bg-muted/50/30 rounded-2xl p-12 text-center shadow-none">
            <CardContent className="p-0">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center max-w-sm mx-auto space-y-4"
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1.1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200 rounded-2xl shadow-sm flex items-center justify-center"
                >
                  <PartyPopper className="h-8 w-8 text-indigo-500" />
                </motion.div>
                <h3 className="font-semibold text-xl text-foreground">
                  {debouncedSearch ? 'No events found' : 'Create your first event'}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {debouncedSearch
                    ? `We couldn't find matches for "${debouncedSearch}". Refine your keywords or browse the catalog.`
                    : "Get started by publishing your very first public or private event sequence."}
                </p>
                {!debouncedSearch && (
                  <Link href="/organizer/create">
                    <Button className="mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl px-6 shadow-md hover:shadow-lg transition-all">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Event
                    </Button>
                  </Link>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {events.map((event) => (
              <motion.div key={event.id} variants={cardVariants} whileHover={{ scale: 1.02 }} className="group">
              <Card className="overflow-hidden border border-slate-100 bg-card hover:border-border/80 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl flex flex-col h-full">
                
                {/* Media Anchor Block */}
                <div className="relative h-44 bg-muted/30 overflow-hidden">
                  {event.coverImageUrl ? (
                    <Image
                      src={event.coverImageUrl}
                      alt={event.title}
                      fill
                      unoptimized
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
                          className="bg-white/90 backdrop-blur-md hover:bg-card text-foreground h-8 w-8 rounded-lg shadow-sm border border-border/20 active:scale-95 transition-transform"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48 rounded-xl p-1.5 shadow-xl border-slate-100 bg-white">
                        <DropdownMenuItem asChild className="rounded-lg">
                          <Link href={`/organizer/events/${event.id}`} className="cursor-pointer gap-2 py-2 text-foreground">
                            <Edit className="h-4 w-4 text-muted-foreground" />
                            Edit Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-lg">
                          <Link href={`/organizer/attendees/${event.id}`} className="cursor-pointer gap-2 py-2 text-foreground">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            Attendees
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-lg">
                          <Link href={`/organizer/checkin/${event.id}`} className="cursor-pointer gap-2 py-2 text-foreground">
                            <QrCode className="h-4 w-4 text-muted-foreground" />
                            Check-in Gateway
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-lg">
                          <Link href={`/organizer/analytics/${event.id}`} className="cursor-pointer gap-2 py-2 text-foreground">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            Performance Data
                          </Link>
                        </DropdownMenuItem>
                        {event.status === 'published' && (
                          <DropdownMenuItem asChild className="rounded-lg bd-white">
                            <a
                              href={`https://wa.me/?text=${encodeURIComponent(`Join my event: ${event.title}\n\n${typeof window !== 'undefined' ? window.location.origin : ''}/e/${event.id}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cursor-pointer gap-2 py-2 text-foreground"
                            >
                              <Share2 className="h-4 w-4 text-muted-foreground" />
                              Share on WhatsApp
                            </a>
                          </DropdownMenuItem>
                        )}
                        <div className="h-px bg-muted/30 my-1" />
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
                    <h3 className="font-bold text-xl tracking-tight text-foreground group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-1.5 text-sm font-medium text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="line-clamp-1">{event.venue}, {event.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Operational Performance Data */}
                  <div className="grid grid-cols-2 gap-3 pt-4 mt-5 border-t border-slate-100/80 bg-muted/50/40 rounded-xl p-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <Ticket className="h-3 w-3 text-muted-foreground" />
                        <span>Tickets</span>
                      </div>
                      <p className="font-bold text-lg text-foreground">{event.ticketStats.totalSold}</p>
                    </div>
                    <div className="space-y-0.5 border-l border-border/60 pl-3">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
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
                    <Button variant="outline" size="sm" className="w-full border-border hover:bg-muted/50 hover:text-foreground rounded-xl py-5 font-medium transition-colors flex items-center justify-center gap-1.5">
                      <QrCode className="h-4 w-4 text-muted-foreground" />
                      Check-In
                    </Button>
                  </Link>
                  <Link href={`/organizer/events/${event.id}`} className="flex-1">
                    <Button size="sm" className="w-full bg-slate-600 hover:bg-slate-800 rounded-xl py-5 font-medium transition-colors group/btn">
                      Manage
                      <ArrowRight className="h-4 w-4 ml-1 opacity-60 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              </motion.div>
            ))}
          </motion.div>

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