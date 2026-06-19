/**
 * Create Event Page
 * * Multi-step form for creating a new event:
 * Step 1: Basic event information (title, venue, date, time, cover image, etc.)
 * Step 2: Ticket types (name, price, quantity)
 * * @module CreateEventPage
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, ArrowLeft, ArrowRight, Check, Calendar, Ticket, ImageIcon } from 'lucide-react'

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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { EventCoverUpload } from '@/components/events/EventCoverUpload' // Adjusted path to match custom components location

// Utilities
import api from '@/lib/api'
import { toast } from 'sonner'
import { slugify } from '@/utils/stringHelpers'

// Cameroon cities list
const CAMEROON_CITIES = [
  'Douala', 'Yaoundé', 'Garoua', 'Bamenda', 'Maroua',
  'Bafoussam', 'Nkongsamba', 'Limbe', 'Edéa', 'Kumbo',
  'Bertoua', 'Loum', 'Kribi', 'Mbalmayo', 'Foumban', 'Buea',
]

// Validation schema for basic info
const basicInfoSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().max(5000).optional(),
  venueName: z.string().min(3, 'Venue name is required'),
  city: z.string().min(2, 'City is required'),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  coverImageUrl: z.string().nullable().optional(), // Preserved state tracking for cover image link
})

// Validation schema for ticket type
const ticketTypeSchema = z.object({
  name: z.string().min(1, 'Ticket name required'),
  price: z.number().min(0, 'Price must be 0 or more'),
  quantityAvailable: z.number().min(1, 'At least 1 ticket required'),
})

type BasicInfoForm = z.infer<typeof basicInfoSchema>
type TicketTypeForm = z.infer<typeof ticketTypeSchema>

type Step = 'basic' | 'tickets'

export default function CreateEventPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [basicInfo, setBasicInfo] = useState<BasicInfoForm | null>(null)

  // Form for basic info
  const basicForm = useForm<BasicInfoForm>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: '',
      description: '',
      venueName: '',
      city: '',
      startDate: '',
      startTime: '',
      coverImageUrl: null,
    },
  })

  // Form for ticket types with dynamic fields
  const ticketForm = useForm<{ ticketTypes: TicketTypeForm[] }>({
    resolver: zodResolver(z.object({ ticketTypes: z.array(ticketTypeSchema) })),
    defaultValues: {
      ticketTypes: [{ name: '', price: 0, quantityAvailable: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: ticketForm.control,
    name: 'ticketTypes',
  })

  /**
   * Action handler invoked by EventCoverUpload component upon drop/browse selection
   */
  const handleCoverUploadAction = async (file: File): Promise<string> => {
    try {
      const response = await api.upload<{ url: string }>('/api/v1/upload', file)
      return response.data.url
    } catch (error) {
      toast.error('Failed to upload image asset')
      throw error
    }
  }

  /**
   * Handle basic info submission and move to ticket step
   */
  const onBasicInfoSubmit = (data: BasicInfoForm) => {
    setBasicInfo(data)
    setStep('tickets')
  }

  /**
   * Handle complete event creation
   */
  const onCreateEvent = async (data: { ticketTypes: TicketTypeForm[] }) => {
    if (!basicInfo) return

    setIsSubmitting(true)
    try {
      const slug = slugify(basicInfo.title)
      const venueCombined = basicInfo.venueName + (basicInfo.venueAddress ? `, ${basicInfo.venueAddress}` : '')

      const eventData = {
        // backend expects `venue` and `slug`
        title: basicInfo.title,
        description: basicInfo.description,
        venue: venueCombined,
        city: basicInfo.city,
        start_date: basicInfo.startDate,
        start_time: basicInfo.startTime,
        cover_image_url: basicInfo.coverImageUrl,
        slug,
        ticketTypes: data.ticketTypes,
      }

      const response = await api.post('/events', eventData)
      const eventId = response.data.id

      // Create ticket types for the event
      try {
        await Promise.all(
          data.ticketTypes.map((t) =>
            api.post(`/events/${eventId}/ticket-types`, {
              name: t.name,
              description: t.description || '',
              price: Math.round(t.price),
              quantityAvailable: Math.round(t.quantityAvailable),
            })
          )
        )
      } catch (err) {
        // ticket creation errors are non-fatal for now
        console.warn('failed creating ticket types', err)
      }

      toast.success('✅ Event created successfully!')
      router.push(`/organizer/events`)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create event'
      toast.error(`❌ ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step indicators
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
            step === 'basic' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/25' 
              : 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
          }`}>
            {step === 'basic' ? '1' : <Check className="h-4 w-4" />}
          </div>
          <span className={`${step === 'basic' ? 'font-semibold text-purple-700' : 'text-gray-500'}`}>
            📝 Basic Info
          </span>
        </div>
        <div className={`w-12 h-0.5 ${step === 'basic' ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gray-300'}`} />
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
            step === 'tickets' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/25' 
              : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
          }`}>
            2
          </div>
          <span className={`${step === 'tickets' ? 'font-semibold text-purple-700' : 'text-gray-400'}`}>
            🎟️ Ticket Types
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Dashboard', href: '/organizer/events' },
          { label: 'Events', href: '/organizer/events' },
          { label: 'Create Event', href: '/organizer/create', isActive: true },
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
            <h1 className="text-2xl font-bold">Create New Event ✨</h1>
            <p className="text-white/80 text-sm mt-0.5">
              Fill in the details below to create your event and start selling tickets
            </p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator />

      <div className="max-w-2xl mx-auto">
        {/* Step 1: Basic Information */}
        {step === 'basic' && (
          <form onSubmit={basicForm.handleSubmit(onBasicInfoSubmit)}>
            <Card className="border-l-4 border-l-purple-500 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-purple-700">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  Event Details 📅
                </CardTitle>
                <CardDescription>
                  Tell us about your event. You can add ticket types in the next step.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Custom Specialized Cover Image Uploader Module */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-purple-500" />
                    Event Cover Image
                  </Label>
                  <EventCoverUpload
                    value={basicForm.watch('coverImageUrl') || undefined}
                    onUpload={handleCoverUploadAction}
                    onChange={(file, previewUrl) => {
                      basicForm.setValue('coverImageUrl', previewUrl || null)
                    }}
                  />
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title" className="text-gray-700 font-medium">Event Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Douala Music Fest 2025"
                    {...basicForm.register('title')}
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                  {basicForm.formState.errors.title && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <span>⚠️</span> {basicForm.formState.errors.title.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-gray-700 font-medium">Description 📝</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event..."
                    rows={4}
                    {...basicForm.register('description')}
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Venue Name */}
                  <div>
                    <Label htmlFor="venueName" className="text-gray-700 font-medium">Venue Name *</Label>
                    <Input
                      id="venueName"
                      placeholder="e.g., Palais des Congrès"
                      {...basicForm.register('venueName')}
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                    {basicForm.formState.errors.venueName && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <span>⚠️</span> {basicForm.formState.errors.venueName.message}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <Label htmlFor="city" className="text-gray-700 font-medium">City *</Label>
                    <Select
                      onValueChange={(value) => basicForm.setValue('city', value)}
                      value={basicForm.watch('city')}
                    >
                      <SelectTrigger className="bg-white border-purple-200 focus:border-purple-500 focus:ring-purple-500"> 
                        <SelectValue placeholder="📍 Select a city" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {CAMEROON_CITIES.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {basicForm.formState.errors.city && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <span>⚠️</span> {basicForm.formState.errors.city.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="text-gray-700 font-medium">Event Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...basicForm.register('startDate')}
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                    {basicForm.formState.errors.startDate && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <span>⚠️</span> {basicForm.formState.errors.startDate.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="startTime" className="text-gray-700 font-medium">Event Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      {...basicForm.register('startTime')}
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                    {basicForm.formState.errors.startTime && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <span>⚠️</span> {basicForm.formState.errors.startTime.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/organizer/events')}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                  Continue to Ticket Types
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}

        {/* Step 2: Ticket Types */}
        {step === 'tickets' && (
          <form onSubmit={ticketForm.handleSubmit(onCreateEvent)}>
            <Card className="border-l-4 border-l-blue-500 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-blue-700">
                  <Ticket className="h-5 w-5 text-blue-500" />
                  Ticket Types 🎟️
                </CardTitle>
                <CardDescription>
                  Add different ticket categories for your event (e.g., Early Bird, VIP, Regular)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Ticket Types List */}
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border-2 border-purple-100 rounded-xl p-4 space-y-3 relative hover:border-purple-200 transition-colors">
                      <div className="flex justify-between items-center">
                        <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200 flex items-center gap-1">
                          <Ticket className="h-3 w-3" />
                          Ticket {index + 1}
                        </Badge>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-gray-700 font-medium">Ticket Name</Label>
                          <Input
                            placeholder="e.g., Early Bird"
                            {...ticketForm.register(`ticketTypes.${index}.name`)}
                            className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 font-medium">Price (XAF)</Label>
                          <Input
                            type="number"
                            placeholder="5000"
                            {...ticketForm.register(`ticketTypes.${index}.price`, {
                              valueAsNumber: true,
                        })}
                            className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 font-medium">Quantity Available</Label>
                          <Input
                            type="number"
                            placeholder="100"
                            {...ticketForm.register(`ticketTypes.${index}.quantityAvailable`, {
                              valueAsNumber: true,
                            })}
                            className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Ticket Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ name: '', price: 0, quantityAvailable: 0 })}
                  className="w-full border-dashed border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Ticket Type ➕
                </Button>

                {ticketForm.formState.errors.ticketTypes && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span>⚠️</span> {ticketForm.formState.errors.ticketTypes.message}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('basic')}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating Event...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Create Event ✨
                    </span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>
    </div>
  )
}