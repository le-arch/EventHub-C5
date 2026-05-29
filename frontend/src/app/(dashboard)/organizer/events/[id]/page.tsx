/**
 * Edit Event Page
 * 
 * Allows organizer to edit existing event details and manage ticket types.
 * 
 * @module EditEventPage
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Save, ArrowLeft, Calendar, MapPin, Users } from 'lucide-react'

// shadcn/ui components
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Badge } from '@/src/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { Skeleton } from '@/src/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'

// Utilities
import api from '@/src/lib/api'
import { toast } from 'sonner'
import { formatDate, formatTime } from '@/src/lib/utils'

// Cameroon cities list
const CAMEROON_CITIES = [
  'Douala', 'Yaoundé', 'Garoua', 'Bamenda', 'Maroua',
  'Bafoussam', 'Nkongsamba', 'Limbe', 'Edéa', 'Kumbo',
]

// Validation schemas
const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().max(5000).optional(),
  venueName: z.string().min(3, 'Venue name is required'),
  city: z.string().min(2, 'City is required'),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']),
})

const ticketTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Ticket name required'),
  price: z.number().min(0, 'Price must be 0 or more'),
  quantityAvailable: z.number().min(1, 'At least 1 ticket required'),
})

interface Event {
  id: string
  title: string
  description: string
  venueName: string
  city: string
  startDate: string
  startTime: string
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  coverImageUrl: string | null
}

interface TicketType {
  id: string
  name: string
  price: number
  quantityAvailable: number
  quantitySold: number
}

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [eventToPublish, setEventToPublish] = useState<boolean>(false)

  // Form for event details
  const form = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      venueName: '',
      city: '',
      startDate: '',
      startTime: '',
      status: 'draft' as const,
    },
  })

  // Form for ticket types
  const ticketForm = useForm<{ ticketTypes: TicketType[] }>({
    resolver: zodResolver(z.object({ ticketTypes: z.array(ticketTypeSchema) })),
    defaultValues: { ticketTypes: [] },
  })

  const { fields, append, remove } = useFieldArray({
    control: ticketForm.control,
    name: 'ticketTypes',
  })

  // Fetch event details on mount
  useEffect(() => {
    fetchEventDetails()
  }, [params.id])

  const fetchEventDetails = async () => {
    try {
      const [eventRes, ticketsRes] = await Promise.all([
        api.get(`/events/${params.id}`),
        api.get(`/events/${params.id}/tickets`),
      ])
      
      const eventData = eventRes.data.event
      setEvent(eventData)
      
      // Format date for input
      const formattedDate = eventData.startDate.split('T')[0]
      
      form.reset({
        title: eventData.title,
        description: eventData.description || '',
        venueName: eventData.venueName,
        city: eventData.city,
        startDate: formattedDate,
        startTime: eventData.startTime,
        status: eventData.status,
      })
      
      setTicketTypes(ticketsRes.data.ticket_types)
      ticketForm.reset({
        ticketTypes: ticketsRes.data.ticket_types.map((t: TicketType) => ({
          id: t.id,
          name: t.name,
          price: t.price,
          quantityAvailable: t.quantityAvailable,
        })),
      })
    } catch (error) {
      toast.error('Failed to load event details')
      router.push('/organizer/events')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Save event details
   */
  const handleSaveEvent = async (data: z.infer<typeof eventSchema>) => {
    setIsSaving(true)
    try {
      await api.put(`/events/${params.id}`, data)
      toast.success('Event updated successfully')
      setEvent({ ...event!, ...data })
    } catch (error) {
      toast.error('Failed to update event')
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Save ticket types
   */
  const handleSaveTickets = async (data: { ticketTypes: TicketType[] }) => {
    setIsSaving(true)
    try {
      await api.put(`/events/${params.id}/tickets`, { ticketTypes: data.ticketTypes })
      toast.success('Ticket types updated successfully')
      fetchEventDetails()
    } catch (error) {
      toast.error('Failed to update ticket types')
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Publish event
   */
  const handlePublish = async () => {
    setIsSaving(true)
    try {
      await api.post(`/events/${params.id}/publish`)
      toast.success('Event published successfully')
      fetchEventDetails()
      setEventToPublish(false)
    } catch (error) {
      toast.error('Failed to publish event')
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Unpublish event
   */
  const handleUnpublish = async () => {
    setIsSaving(true)
    try {
      await api.post(`/events/${params.id}/unpublish`)
      toast.success('Event unpublished')
      fetchEventDetails()
    } catch (error) {
      toast.error('Failed to unpublish event')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!event) return null

  const isPublished = event.status === 'published'

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Event</h1>
        </div>
        <div className="flex gap-2">
          {isPublished ? (
            <Button variant="outline" onClick={handleUnpublish} disabled={isSaving}>
              Unpublish
            </Button>
          ) : (
            <Button onClick={() => setEventToPublish(true)} disabled={isSaving}>
              Publish Event
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatDate(event.startDate)}</p>
                <p className="text-xs text-gray-500">at {formatTime(event.startTime)}</p>
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
                <p className="font-semibold">{event.venueName}</p>
                <p className="text-xs text-gray-500">{event.city}</p>
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
                  {ticketTypes.reduce((sum, t) => sum + t.quantitySold, 0)}
                </p>
                <p className="text-xs text-gray-500">tickets sold</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Event Details</TabsTrigger>
          <TabsTrigger value="tickets">Ticket Types</TabsTrigger>
        </TabsList>

        {/* Event Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
              <CardDescription>
                Update your event details below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form id="event-form" onSubmit={form.handleSubmit(handleSaveEvent)} className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input id="title" {...form.register('title')} />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" rows={5} {...form.register('description')} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="venueName">Venue Name *</Label>
                    <Input id="venueName" {...form.register('venueName')} />
                    {form.formState.errors.venueName && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.venueName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Select
                      onValueChange={(value) => form.setValue('city', value)}
                      value={form.watch('city')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {CAMEROON_CITIES.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.city && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.city.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Event Date *</Label>
                    <Input id="startDate" type="date" {...form.register('startDate')} />
                    {form.formState.errors.startDate && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.startDate.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="startTime">Event Time *</Label>
                    <Input id="startTime" type="time" {...form.register('startTime')} />
                    {form.formState.errors.startTime && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.startTime.message}</p>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button form="event-form" type="submit" disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Ticket Types Tab */}
        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Types</CardTitle>
              <CardDescription>
                Manage ticket categories and pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="ticket-form" onSubmit={ticketForm.handleSubmit(handleSaveTickets)} className="space-y-4">
                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const originalTicket = ticketTypes.find(t => t.id === field.id)
                    const soldCount = originalTicket?.quantitySold || 0
                    
                    return (
                      <div key={field.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">Ticket {index + 1}</Badge>
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Ticket Name</Label>
                            <Input
                              placeholder="e.g., VIP"
                              {...ticketForm.register(`ticketTypes.${index}.name`)}
                            />
                          </div>
                          <div>
                            <Label>Price (XAF)</Label>
                            <Input
                              type="number"
                              {...ticketForm.register(`ticketTypes.${index}.price`, { valueAsNumber: true })}
                            />
                          </div>
                          <div>
                            <Label>Quantity Available</Label>
                            <Input
                              type="number"
                              {...ticketForm.register(`ticketTypes.${index}.quantityAvailable`, { valueAsNumber: true })}
                            />
                          </div>
                        </div>
                        
                        {soldCount > 0 && (
                          <p className="text-sm text-amber-600">
                            {soldCount} tickets already sold for this type. Reducing quantity below sold count will prevent further sales.
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ name: '', price: 0, quantityAvailable: 0 })}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Ticket Type
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <Button form="ticket-form" type="submit" disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Save Ticket Types
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={eventToPublish} onOpenChange={setEventToPublish}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you ready to publish "{event.title}"?
              <br />
              <br />
              Once published:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>The event will be visible to the public</li>
                <li>Attendees can start purchasing tickets</li>
                <li>The shareable link will become active</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish}>
              Publish Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}