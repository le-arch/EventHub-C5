'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Ticket,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Share2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog'
import { EventDetailsTab, type EventFormValues } from '@/components/events/EventDetailsTab'
import { TicketTypesTab, type TicketFormValues } from '@/components/events/TicketTypesTab'

import { useEventStore, type Event, type TicketType } from '@/store/eventStore'
import { toast } from 'sonner'
import { formatDate, formatTime } from '@/lib/utils'
import api, { apiClient } from '@/lib/api'

const CAMEROON_CITIES = [
  'Douala', 'Yaoundé', 'Garoua', 'Bamenda', 'Maroua',
  'Bafoussam', 'Nkongsamba', 'Limbe', 'Edéa', 'Kumbo',
  'Bertoua', 'Loum', 'Kribi', 'Mbalmayo', 'Foumban', 'Buea',
]

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().max(5000).optional(),
  venue: z.string().min(3, 'Venue name and address is required'),
  city: z.string().min(2, 'City is required'),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']),
  capacityMin: z.number().min(0).optional(),
  capacityMax: z.number().min(0).optional(),
})

const ticketTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Ticket name required'),
  price: z.number().min(0, 'Price must be 0 or more'),
  quantityAvailable: z.number().min(1, 'At least 1 ticket required'),
  quantitySold: z.number().default(0),
})

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const {
    currentEvent,
    ticketTypes,
    fetchEvent,
    fetchTicketTypes,
    updateEvent,
    publishEvent,
    unpublishEvent,
    isLoading: storeLoading,
  } = useEventStore()

  const [event, setEvent] = useState<Event | null>(null)
  const [localTicketTypes, setLocalTicketTypes] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'tickets'>('details')
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)

  const form = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      venue: '',
      city: '',
      startDate: '',
      startTime: '',
      status: 'draft' as const,
      capacityMin: undefined,
      capacityMax: undefined,
    },
  })

  const ticketForm = useForm({
    resolver: zodResolver(z.object({ ticketTypes: z.array(ticketTypeSchema) })),
    defaultValues: { ticketTypes: [] },
  })

  const { fields, append, remove } = useFieldArray({
    control: ticketForm.control,
    name: 'ticketTypes',
  })

  const handleCoverUploadAction = async (file: File): Promise<string> => {
    try {
      const response = await apiClient.upload<{ url: string }>(
        '/events/upload-image',
        file,
        'image'
      )
      return response.data.url
    } catch (error) {
      toast.error('Failed to upload image asset')
      throw error
    }
  }

  const fetchEventDetails = useCallback(async () => {
    setLoading(true)
    try {
      const [eventData, ticketsData] = await Promise.all([
        fetchEvent(eventId),
        fetchTicketTypes(eventId),
      ])

      if (!eventData) {
        toast.error('Event not found')
        router.push('/organizer/events')
        return
      }

      setEvent(eventData)
      setLocalTicketTypes(ticketsData || [])
      setCoverImageUrl(eventData.coverImageUrl)

      const formattedDate = eventData.startDate?.split('T')[0] ?? ''

      form.reset({
        title: eventData.title,
        description: eventData.description || '',
        venue: eventData.venue,
        city: eventData.city,
        startDate: formattedDate,
        startTime: eventData.startTime,
        status: eventData.status,
        capacityMin: eventData.capacityRange?.lower || undefined,
        capacityMax: eventData.capacityRange?.upper || undefined,
      })

      ticketForm.reset({
        ticketTypes: ticketsData.map((t: TicketType) => ({
          id: t.id,
          name: t.name,
          price: t.price,
          quantityAvailable: t.quantityAvailable,
          quantitySold: t.quantitySold || 0,
        })) || [],
      })
    } catch (error) {
      toast.error('Failed to load event details')
      router.push('/organizer/events')
    } finally {
      setLoading(false)
    }
  }, [eventId, fetchEvent, fetchTicketTypes, form, ticketForm, router])

  useEffect(() => {
    setLoading(true)
    setEvent(null)
    setLocalTicketTypes([])
    setCoverImageUrl(null)
    setActiveTab('details')
    fetchEventDetails()
  }, [eventId, fetchEventDetails])

  const handleSaveEvent = async (data: EventFormValues) => {
    setIsSaving(true)
    try {
      const updateData: Record<string, unknown> = {
        title: data.title,
        description: data.description,
        venue: data.venue,
        city: data.city,
        startDate: data.startDate,
        startTime: data.startTime,
        status: data.status,
        cover_image_url: coverImageUrl || '',
      }

      if (data.capacityMin !== undefined && data.capacityMax !== undefined) {
        updateData.capacityRange = {
          lower: data.capacityMin,
          upper: data.capacityMax,
        }
      }

      const updatedEvent = await updateEvent(eventId, updateData)
      if (updatedEvent) {
        setEvent(updatedEvent)
        toast.success('Event updated successfully')
      }
    } catch (error) {
      toast.error('Failed to update event')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveTickets = async (data: TicketFormValues) => {
    setIsSaving(true)
    try {
      const originalIds = new Set(localTicketTypes.map(t => t.id))
      const formIds = new Set(data.ticketTypes.filter(t => t.id).map(t => t.id))

      for (const ticket of data.ticketTypes) {
        const payload = {
          name: ticket.name,
          price: ticket.price,
          quantity_available: ticket.quantityAvailable,
        }

        if (ticket.id) {
          await api.patch(`/events/${eventId}/ticket-types/${ticket.id}`, payload)
        } else {
          await api.post(`/events/${eventId}/ticket-types`, payload)
        }
      }

      for (const original of localTicketTypes) {
        if (!formIds.has(original.id)) {
          await api.delete(`/events/${eventId}/ticket-types/${original.id}`)
        }
      }

      toast.success('Ticket types updated successfully')
      await fetchEventDetails()
    } catch (error) {
      toast.error('Failed to update ticket types')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    setIsSaving(true)
    try {
      const success = await publishEvent(eventId)
      if (success) {
        setShowPublishDialog(false)
        await fetchEventDetails()
      }
    } catch (error) {
      toast.error('Failed to publish event')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUnpublish = async () => {
    setIsSaving(true)
    try {
      const success = await unpublishEvent(eventId)
      if (success) {
        setShowUnpublishDialog(false)
        await fetchEventDetails()
      }
    } catch (error) {
      toast.error('Failed to unpublish event')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!event) return null

  const isPublished = event.status === 'published'

  return (
    <div className="space-y-6" key={eventId}>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/organizer/events' },
          { label: 'Events', href: '/organizer/events' },
          { label: event.title, href: `/organizer/events/${event.id}` },
          { label: 'Edit Event', href: '#', isActive: true },
        ]}
        showHome
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/organizer/events')} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Edit Event</h1>
            <p className="text-muted-foreground mt-1">
              Update your event details and manage ticket types
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isPublished ? (
            <Button
              variant="outline"
              onClick={() => setShowUnpublishDialog(true)}
              disabled={isSaving}
              className="border-amber-500 text-amber-600 hover:bg-amber-50"
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Unpublish
            </Button>
          ) : (
            <Button
              onClick={() => setShowPublishDialog(true)}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              Publish Event
            </Button>
          )}
        </div>
      </div>

      {isPublished && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Public URL:</span>
          <a
            href={`/e/${eventId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium truncate max-w-md"
          >
            {typeof window !== 'undefined' ? window.location.origin : ''}/e/{eventId}
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/e/${eventId}`)
              toast.success('Link copied to clipboard')
            }}
            className="text-muted-foreground hover:text-foreground ml-1 shrink-0"
            title="Copy link"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatDate(event.startDate)}</p>
                <p className="text-xs text-muted-foreground">at {formatTime(event.startTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{event.venue}</p>
                <p className="text-xs text-muted-foreground">{event.city}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Ticket className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {localTicketTypes.reduce((sum, t) => sum + (t.quantitySold || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">tickets sold</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {event.capacityRange
                    ? `${event.capacityRange.lower} – ${event.capacityRange.upper}`
                    : '∞'}
                </p>
                <p className="text-xs text-muted-foreground">capacity range</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Tabs Section - Replacing shadcn Tabs */}
      <div className="space-y-6">
        {/* Tab Triggers */}
        <div className="w-full bg-card rounded-xl shadow-sm border border-border/60 overflow-hidden">
          <div className="flex w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab('details')}
              className={`
                flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200
                flex-1 justify-center border-b-2 whitespace-nowrap
                ${
                  activeTab === 'details'
                    ? 'border-purple-600 text-purple-600 bg-purple-50/50'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }
              `}
            >
              <Calendar className="h-4 w-4" />
              Event Details
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`
                flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200
                flex-1 justify-center border-b-2 whitespace-nowrap
                ${
                  activeTab === 'tickets'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }
              `}
            >
              <Ticket className="h-4 w-4" />
              Ticket Types
            </button>
          </div>
        </div>

        {/* Tab Content - Directly under the triggers */}
        <div className="focus-visible:outline-none">
          {activeTab === 'details' && (
            <EventDetailsTab
              form={form}
              isSaving={isSaving}
              coverImageUrl={coverImageUrl}
              onCoverUpload={handleCoverUploadAction}
              onCoverChange={setCoverImageUrl}
              onSubmit={handleSaveEvent}
            />
          )}

          {activeTab === 'tickets' && (
            <TicketTypesTab
              ticketForm={ticketForm}
              fields={fields}
              append={append}
              remove={remove}
              localTicketTypes={localTicketTypes}
              isSaving={isSaving}
              onSubmit={handleSaveTickets}
            />
          )}
        </div>
      </div>

      <ConfirmationDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        onConfirm={handlePublish}
        title="Publish Event"
        description={`Are you ready to publish "${event.title}"?`}
        confirmText="Yes, Publish Event"
        cancelText="Cancel"
        variant="info"
        isLoading={isSaving}
      >
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-700 mb-2">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Once published:</span>
          </div>
          <ul className="space-y-1 text-sm text-green-600">
            <li>The event will be visible to the public</li>
            <li>Attendees can start purchasing tickets</li>
            <li>The shareable link will become active</li>
          </ul>
        </div>
      </ConfirmationDialog>

      <ConfirmationDialog
        open={showUnpublishDialog}
        onOpenChange={setShowUnpublishDialog}
        onConfirm={handleUnpublish}
        title="Unpublish Event"
        description={`Are you sure you want to unpublish "${event.title}"?`}
        confirmText="Yes, Unpublish"
        cancelText="Cancel"
        variant="warning"
        isLoading={isSaving}
      >
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 text-amber-700 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Warning!</span>
          </div>
          <ul className="space-y-1 text-sm text-amber-600">
            <li>The event will be hidden from the public</li>
            <li>No new ticket sales will be possible</li>
            <li>Existing tickets remain valid</li>
          </ul>
        </div>
      </ConfirmationDialog>
    </div>
  )
}