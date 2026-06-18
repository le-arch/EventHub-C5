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
  RefreshCw,
} from 'lucide-react'

// shadcn/ui components
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

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog'

// Utilities
import api from '@/lib/api'
import { toast } from 'sonner'
import { formatDate, formatTime } from '@/lib/utils'

// Cameroon cities list
const CAMEROON_CITIES = [
  'Douala', 'Yaoundé', 'Garoua', 'Bamenda', 'Maroua',
  'Bafoussam', 'Nkongsamba', 'Limbe', 'Edéa', 'Kumbo',
  'Bertoua', 'Loum', 'Kribi', 'Mbalmayo', 'Foumban', 'Buea',
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
  quantitySold: z.number().default(0),
})

const ticketFormSchema = z.object({
  ticketTypes: z.array(ticketTypeSchema),
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

type TabKey = 'details' | 'tickets'

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('details')
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false)

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
  const ticketForm = useForm({
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
      
      const ticketData = ticketsRes.data.ticket_types || []
      setTicketTypes(ticketData)
      ticketForm.reset({
        ticketTypes: ticketData.map((t: TicketType) => ({
          id: t.id,
          name: t.name,
          price: t.price,
          quantityAvailable: t.quantityAvailable,
          quantitySold: t.quantitySold || 0,
        })),
      })
    } catch (error) {
      toast.error('❌ Failed to load event details')
      router.push('/organizer/events')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEvent = async (data: z.infer<typeof eventSchema>) => {
    setIsSaving(true)
    try {
      await api.put(`/events/${params.id}`, data)
      toast.success('✅ Event updated successfully')
      setEvent({ ...event!, ...data })
    } catch (error) {
      toast.error('❌ Failed to update event')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveTickets = async (data: z.infer<typeof ticketFormSchema>) => {
    setIsSaving(true)
    try {
      const processedTickets = data.ticketTypes.map(t => ({
        id: t.id || undefined,
        name: t.name,
        price: t.price,
        quantityAvailable: t.quantityAvailable,
        quantitySold: t.quantitySold,
      }))
      await api.put(`/events/${params.id}/tickets`, { ticketTypes: processedTickets })
      toast.success('✅ Ticket types updated successfully')
      fetchEventDetails()
    } catch (error) {
      toast.error('❌ Failed to update ticket types')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    setIsSaving(true)
    try {
      await api.post(`/events/${params.id}/publish`)
      toast.success('✅ Event published successfully! Your event is now live.')
      fetchEventDetails()
      setShowPublishDialog(false)
    } catch (error) {
      toast.error('❌ Failed to publish event')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUnpublish = async () => {
    setIsSaving(true)
    try {
      await api.post(`/events/${params.id}/unpublish`)
      toast.success('📝 Event unpublished. It is now hidden from the public.')
      fetchEventDetails()
      setShowUnpublishDialog(false)
    } catch (error) {
      toast.error('❌ Failed to unpublish event')
    } finally {
      setIsSaving(false)
    }
  }

  // Tab configuration
  const tabs: { key: TabKey; label: string; icon: React.ReactNode; accent: string }[] = [
    { key: 'details', label: 'Event Details', icon: <Calendar className="h-4 w-4" />, accent: 'purple' },
    { key: 'tickets', label: 'Ticket Types', icon: <Ticket className="h-4 w-4" />, accent: 'blue' },
  ]

  const accentColors: Record<string, string> = {
    purple: 'text-purple-700 border-b-purple-600 bg-purple-50',
    blue: 'text-blue-700 border-b-blue-600 bg-blue-50',
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-24 w-full" />
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
  const totalTicketsSold = ticketTypes.reduce((sum, t) => sum + (t.quantitySold || 0), 0)

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

      {/* Header with Purple/Blue Gradient */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 p-5 rounded-xl shadow-lg text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Calendar className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Edit Event ✏️</h1>
            <p className="text-white/80 text-sm mt-0.5">
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
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white backdrop-blur-sm"
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Unpublish 📝
            </Button>
          ) : (
            <Button 
              onClick={() => setShowPublishDialog(true)} 
              disabled={isSaving}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              <Eye className="h-4 w-4 mr-2" />
              Publish Event 🚀
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards with Gradients */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-200 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700">{formatDate(event.startDate)}</p>
                <p className="text-xs text-purple-600">at {formatTime(event.startTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="font-semibold text-blue-800">{event.venueName}</p>
                <p className="text-xs text-blue-600">{event.city}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-200 rounded-lg">
                <Ticket className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">{totalTicketsSold}</p>
                <p className="text-xs text-emerald-600">tickets sold 🎟️</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Horizontal Nav Bar Tabs */}
      <div className="w-full bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="flex w-full overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            const activeClass = isActive
              ? accentColors[tab.accent]
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200
                  border-b-2 border-transparent whitespace-nowrap flex-1 justify-center
                  ${activeClass}
                  ${isActive ? `border-b-${tab.accent === 'purple' ? 'purple' : tab.accent}-600` : 'hover:border-gray-300'}
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content Panels */}
      <div className="w-full">
        {/* Event Details Tab */}
        {activeTab === 'details' && (
          <Card className="w-full border-l-4 border-l-purple-500 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Calendar className="h-5 w-5 text-purple-500" />
                Event Information
              </CardTitle>
              <CardDescription>
                Update your event details below
              </CardDescription>
            </CardHeader>
            <form id="event-form" onSubmit={form.handleSubmit(handleSaveEvent)}>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-gray-700 font-medium">Event Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Douala Music Fest 2025"
                    {...form.register('title')}
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-700 font-medium">Description 📝</Label>
                  <Textarea
                    id="description"
                    rows={5}
                    placeholder="Describe your event..."
                    {...form.register('description')}
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="venueName" className="text-gray-700 font-medium">Venue Name *</Label>
                    <Input
                      id="venueName"
                      placeholder="e.g., Palais des Congrès"
                      {...form.register('venueName')}
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                    {form.formState.errors.venueName && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {form.formState.errors.venueName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-gray-700 font-medium">City *</Label>
                    <Select
                      onValueChange={(value) => form.setValue('city', value)}
                      value={form.watch('city')}
                    >
                      <SelectTrigger className="bg-white border-purple-200 focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="📍 Select a city" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
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
                  <div>
                    <Label htmlFor="startDate" className="text-gray-700 font-medium">Event Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...form.register('startDate')}
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                    {form.formState.errors.startDate && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {form.formState.errors.startDate.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="startTime" className="text-gray-700 font-medium">Event Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      {...form.register('startTime')}
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                    {form.formState.errors.startTime && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {form.formState.errors.startTime.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes 💾'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* Ticket Types Tab */}
        {activeTab === 'tickets' && (
          <Card className="w-full border-l-4 border-l-blue-500 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Ticket className="h-5 w-5 text-blue-500" />
                Ticket Types
              </CardTitle>
              <CardDescription>
                Manage ticket categories and pricing
              </CardDescription>
            </CardHeader>
            <form id="ticket-form" onSubmit={ticketForm.handleSubmit(handleSaveTickets)}>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const originalTicket = ticketTypes.find(t => t.id === field.id)
                    const soldCount = originalTicket?.quantitySold || 0
                    
                    return (
                      <div key={field.id} className="border-2 border-blue-100 rounded-xl p-4 space-y-3 hover:border-blue-200 transition-colors">
                        <div className="flex justify-between items-center">
                          <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200 flex items-center gap-1">
                            <Ticket className="h-3 w-3" />
                            Ticket {index + 1}
                          </Badge>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Ticket Name</Label>
                            <Input
                              placeholder="e.g., VIP"
                              {...ticketForm.register(`ticketTypes.${index}.name`)}
                              className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Price (XAF)</Label>
                            <Input
                              type="number"
                              {...ticketForm.register(`ticketTypes.${index}.price`, { valueAsNumber: true })}
                              className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Quantity Available</Label>
                            <Input
                              type="number"
                              {...ticketForm.register(`ticketTypes.${index}.quantityAvailable`, { valueAsNumber: true })}
                              className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        
                        {soldCount > 0 && (
                          <p className="text-sm text-amber-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
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
                  className="w-full border-dashed border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Ticket Type ➕
                </Button>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                  <Save className="h-4 w-4 mr-2" />
                  Save Ticket Types 💾
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>

      {/* Publish Confirmation Dialog */}
      <ConfirmationDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        onConfirm={handlePublish}
        title="🚀 Publish Event"
        description={`Are you ready to publish "${event.title}"?`}
        confirmText="Yes, Publish Event"
        cancelText="Cancel"
        variant="success"
        isLoading={isSaving}
      >
        <div className="mt-4 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-2 text-emerald-700 mb-2">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">Once published:</span>
          </div>
          <ul className="space-y-1 text-sm text-emerald-600 ml-6 list-disc">
            <li>The event will be visible to the public</li>
            <li>Attendees can start purchasing tickets</li>
            <li>The shareable link will become active</li>
          </ul>
        </div>
      </ConfirmationDialog>

      {/* Unpublish Confirmation Dialog */}
      <ConfirmationDialog
        open={showUnpublishDialog}
        onOpenChange={setShowUnpublishDialog}
        onConfirm={handleUnpublish}
        title="📝 Unpublish Event"
        description={`Are you sure you want to unpublish "${event.title}"?`}
        confirmText="Yes, Unpublish"
        cancelText="Cancel"
        variant="warning"
        isLoading={isSaving}
      >
        <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 text-amber-700 mb-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-semibold">Warning!</span>
          </div>
          <ul className="space-y-1 text-sm text-amber-600 ml-6 list-disc">
            <li>The event will be hidden from the public</li>
            <li>No new ticket sales will be possible</li>
            <li>Existing tickets remain valid</li>
          </ul>
        </div>
      </ConfirmationDialog>
    </div>
  )
}