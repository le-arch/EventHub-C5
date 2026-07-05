// page.tsx - Updated imports and store usage

'use client'

import { useState, useEffect } from 'react'
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
  EyeOff
} from 'lucide-react'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog'
import { ShareEventButton } from '@/components/events/ShareEventButton'

// Stores & Utilities
import { useEventStore, type Event, type TicketType } from '@/store/eventStore'
import { toast } from 'sonner'
import { formatDate, formatTime } from '@/lib/utils'
import api from '@/lib/api'

// Cameroon cities list
const CAMEROON_CITIES = [
  'Douala', 'Yaoundé', 'Garoua', 'Bamenda', 'Maroua',
  'Bafoussam', 'Nkongsamba', 'Limbe', 'Edéa', 'Kumbo',
  'Bertoua', 'Loum', 'Kribi', 'Mbalmayo', 'Foumban', 'Buea',
]

// Validation schemas - include capacityRange
const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().max(5000).optional(),
  venue: z.string().min(3, 'Venue name and address is required'),
  city: z.string().min(2, 'City is required'),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  status: z.enum(['draft', 'published', 'cancelled', 'suspended', 'archived']),
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

const ticketFormSchema = z.object({
  ticketTypes: z.array(ticketTypeSchema),
})

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  
  // Store actions and state
  const { 
    currentEvent, 
    ticketTypes,
    fetchEvent, 
    fetchTicketTypes,
    updateEvent, 
    publishEvent, 
    unpublishEvent,
    isLoading 
  } = useEventStore()
  
  const [event, setEvent] = useState<Event | null>(null)
  const [localTicketTypes, setLocalTicketTypes] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false)

  // Form for event details
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

  // Form for ticket types
  const ticketForm = useForm({
    resolver: zodResolver(z.object({ ticketTypes: z.array(ticketTypeSchema) })),
    defaultValues: { ticketTypes: [] },
  })

  const { fields, append, remove } = useFieldArray({
    control: ticketForm.control,
    name: 'ticketTypes',
  })

  const hasChanges = form.formState.isDirty || ticketForm.formState.isDirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasChanges])

  // Fetch event details on mount using store
  useEffect(() => {
    fetchEventDetails()
  }, [params.id])

  const fetchEventDetails = async () => {
    setLoading(true)
    try {
      // Fetch event and tickets in parallel
      const [eventData, ticketsData] = await Promise.all([
        fetchEvent(params.id as string),
        fetchTicketTypes(params.id as string),
      ])
      
      if (!eventData) {
        toast.error('Event not found')
        router.push('/organizer/events')
        return
      }
      
      setEvent(eventData)
      setLocalTicketTypes(ticketsData || [])
      
      // Format date for input
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
  }

  /**
   * Save event details using store.
   * If the event is published, auto-unpublish first so changes aren't live.
   */
  const handleSaveEvent = async (data: z.infer<typeof eventSchema>) => {
    setIsSaving(true)
    try {
      const wasPublished = event?.status === 'published'

      if (wasPublished) {
        toast.info('Unpublishing event before saving changes...')
        await unpublishEvent(params.id as string)
        setEvent(prev => prev ? { ...prev, status: 'draft' } : prev)
      }

      const updateData: any = {
        title: data.title,
        description: data.description,
        venue: data.venue,
        city: data.city,
        startDate: data.startDate,
        startTime: data.startTime,
        status: 'draft',
      }
      
      // Add capacity range if both values are provided
      if (data.capacityMin !== undefined && data.capacityMax !== undefined) {
        updateData.capacityRange = {
          lower: data.capacityMin,
          upper: data.capacityMax,
        }
      }
      
      const updatedEvent = await updateEvent(params.id as string, updateData)
      if (updatedEvent) {
        setEvent(updatedEvent)
        if (wasPublished) {
          toast.success('Changes saved. Review and republish when ready.', { duration: 5000 })
        } else {
          toast.success('Event updated successfully')
        }
      }
    } catch (error) {
      toast.error('Failed to update event')
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Save ticket types
   */
  const handleSaveTickets = async (data: z.infer<typeof ticketFormSchema>) => {
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
          await api.patch(`/events/${params.id}/ticket-types/${ticket.id}`, payload)
        } else {
          await api.post(`/events/${params.id}/ticket-types`, payload)
        }
      }
      
      for (const original of localTicketTypes) {
        if (!formIds.has(original.id)) {
          await api.delete(`/events/${params.id}/ticket-types/${original.id}`)
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

  /**
   * Publish event using store
   */
  const handlePublish = async () => {
    setIsSaving(true)
    try {
      const success = await publishEvent(params.id as string)
      if (success) {
        setShowPublishDialog(false)
        await fetchEventDetails()
        const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/e/${params.id}`
        toast.success('Event published!', {
          description: `Share link: ${shareUrl}`,
          action: {
            label: 'Copy',
            onClick: () => navigator.clipboard.writeText(shareUrl),
          },
          duration: 8000,
        })
      }
    } catch (error) {
      toast.error('Failed to publish event')
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Unpublish event using store
   */
  const handleUnpublish = async () => {
    setIsSaving(true)
    try {
      const success = await unpublishEvent(params.id as string)
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
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Dashboard', href: '/organizer/events' },
          { label: 'Events', href: '/organizer/events' },
          { label: event.title, href: `/organizer/events/${event.id}` },
          { label: 'Edit Event', href: '#', isActive: true },
        ]}
        showHome
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Edit Event</h1>
            <p className="text-muted-foreground mt-1">
              {isPublished
                ? 'Saving changes will unpublish this event for review before republishing.'
                : 'Update your event details and manage ticket types'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isPublished ? (
            <>
              <ShareEventButton
                eventId={event.id}
                eventTitle={event.title}
                eventDate={event.startDate}
                venue={`${event.venue}, ${event.city}`}
                variant="outline"
              />
              <Button 
                variant="outline" 
                onClick={() => setShowUnpublishDialog(true)} 
                disabled={isSaving}
                className="border-amber-500 text-amber-600 hover:bg-amber-50"
              >
                  <EyeOff className="h-4 w-4 mr-2" />
                 Unpublish 
              </Button>
            </>
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

      {/* Published event notice */}
      {isPublished && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>This event is <strong>published</strong>. Saving changes will automatically unpublish it — you can republish after reviewing.</span>
        </div>
      )}

      {/* Stats Card */}
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
                <p className="text-xs text-muted-foreground">tickets sold </p>
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

      {/* Vertical Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col md:flex-row gap-6 md:gap-8">
        <TabsList className="flex flex-row md:flex-col bg-card border border-border rounded-2xl p-2 shadow-sm h-fit w-full md:w-48 shrink-0 gap-1">
          <TabsTrigger value="details" className="flex items-center gap-3 justify-start w-full px-4 py-3 text-sm font-medium rounded-xl data-active:bg-indigo-50 dark:data-active:bg-indigo-900/30 data-active:text-indigo-700 dark:data-active:text-indigo-300 data-active:border-l-indigo-500 dark:data-active:border-l-indigo-400 data-active:shadow-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
            <Calendar className="h-4 w-4 shrink-0" />
            Event Details
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-3 justify-start w-full px-4 py-3 text-sm font-medium rounded-xl data-active:bg-indigo-50 dark:data-active:bg-indigo-900/30 data-active:text-indigo-700 dark:data-active:text-indigo-300 data-active:border-l-indigo-500 dark:data-active:border-l-indigo-400 data-active:shadow-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
            <Ticket className="h-4 w-4 shrink-0" />
            Ticket Types
          </TabsTrigger>
        </TabsList>
        <div className="flex-1 min-w-0">

        {/* Event Details Tab */}
        <TabsContent value="details" className="space-y-6 mt-6">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Event Information
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Update your event details below</p>
          </div>
          <form id="event-form" onSubmit={form.handleSubmit(handleSaveEvent)} className="space-y-4 p-6 bg-card rounded-xl border border-border shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input id="title" placeholder="e.g., Douala Music Fest 2025" {...form.register('title')} />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={5} placeholder="Describe your event..." {...form.register('description')} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venue">Venue Name and Address *</Label>
                <Input id="venue" placeholder="e.g., Palais des Congrès" {...form.register('venue')} />
                {form.formState.errors.venue && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {form.formState.errors.venue.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Select
                  onValueChange={(value) => form.setValue('city', value)}
                  value={form.watch('city')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder=" Select a city" />
                  </SelectTrigger>
                      <SelectContent>
                    {CAMEROON_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.city && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {form.formState.errors.city.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Event Date *</Label>
                <Input id="startDate" type="date" {...form.register('startDate')} />
                {form.formState.errors.startDate && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {form.formState.errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Event Time *</Label>
                <Input id="startTime" type="time" {...form.register('startTime')} />
                {form.formState.errors.startTime && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {form.formState.errors.startTime.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacityMin">Minimum Capacity</Label>
                <Input
                  id="capacityMin"
                  type="number"
                  placeholder="e.g., 10"
                  {...form.register('capacityMin', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacityMax">Maximum Capacity</Label>
                <Input
                  id="capacityMax"
                  type="number"
                  placeholder="e.g., 100"
                  {...form.register('capacityMax', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button type="submit" disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Ticket Types Tab */}
        <TabsContent value="tickets" className="space-y-6 mt-6">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              Ticket Types
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Manage ticket categories and pricing</p>
          </div>
          <form id="ticket-form" onSubmit={ticketForm.handleSubmit(handleSaveTickets)} className="space-y-4 p-6 bg-card rounded-xl border border-border shadow-sm">
            <div className="space-y-4">
              {fields.map((field, index) => {
                const originalTicket = localTicketTypes.find(t => t.id === field.id)
                const soldCount = originalTicket?.quantitySold || 0
                
                return (
                  <div key={field.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Ticket className="h-3 w-3" />
                        Ticket {index + 1}
                      </Badge>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Ticket Name</Label>
                        <Input
                          placeholder="e.g., VIP"
                          {...ticketForm.register(`ticketTypes.${index}.name`)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price (XAF)</Label>
                        <Input
                          type="number"
                          {...ticketForm.register(`ticketTypes.${index}.price`, { valueAsNumber: true })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity Available</Label>
                        <Input
                          type="number"
                          {...ticketForm.register(`ticketTypes.${index}.quantityAvailable`, { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                    
                    {soldCount > 0 && (
                      <p className="text-sm text-amber-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {soldCount} tickets already sold for this type.
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => append({ name: '', price: 0, quantityAvailable: 0, quantitySold: 0 })}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Ticket Type
            </Button>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button type="submit" disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Save Ticket Types
              </Button>
            </div>
          </form>
        </TabsContent>
      </div>
      </Tabs>

      {/* Publish Confirmation Dialog */}
      <ConfirmationDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        onConfirm={handlePublish}
        title="Publish Event"
        description={`Are you ready to publish "${event.title}"?`}
        confirmText="Publish Event"
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
            <li>✓ The event will be visible to the public</li>
            <li>✓ Attendees can start purchasing tickets</li>
            <li>✓ The shareable link will become active</li>
          </ul>
        </div>
      </ConfirmationDialog>

      {/* Unpublish Confirmation Dialog */}
      <ConfirmationDialog
        open={showUnpublishDialog}
        onOpenChange={setShowUnpublishDialog}
        onConfirm={handleUnpublish}
        title="Unpublish Event"
        description={`Are you sure you want to unpublish "${event.title}"?`}
        confirmText="Unpublish Event"
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