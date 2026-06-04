/**
 * Create Event Page
 * 
 * Multi-step form for creating a new event:
 * Step 1: Basic event information (title, venue, date, time, etc.)
 * Step 2: Ticket types (name, price, quantity)
 * 
 * @module CreateEventPage
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, ArrowLeft, ArrowRight, Check, Calendar, MapPin, Clock, Ticket } from 'lucide-react'

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

// Utilities
import api from '@/lib/api'
import { toast } from 'sonner'


import { createEventApi } from "@/lib/api";


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
})

// Validation schema for ticket type
const ticketTypeSchema = z.object({
  name: z.string().min(1, 'Ticket name required'),
  price: z.number().min(0, 'Price must be 0 or more'),
  quantityAvailable: z.number().min(1, 'At least 1 ticket required'),
})

// Combined schema
const eventSchema = z.object({
  basicInfo: basicInfoSchema,
  ticketTypes: z.array(ticketTypeSchema).min(1, 'At least one ticket type required'),
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
      // Step A: Format data fields to match  Go validator 
      const eventPayload = {
        title: basicInfo.title,
        description: basicInfo.description || "",
        venue: basicInfo.venueName, // maps 'venueName' to  backend 'venue' variable
        city: basicInfo.city,
        // handling dynamic ticket lists, we use the first item price or default to 0
        ticket_price: Number(data.ticketTypes[0]?.price || 0), 
      }
      
      // Sending the formatted payload to the Go server using custom api utility tool
      await createEventApi(eventPayload)
      
      toast.success('✅ Event created successfully!')
      router.push('/organizer/events') // Redirects back to the main events view table layout
    } catch (error: any) {
      // If  Go validation rules fail, grab the error string and display a toast alert banner
      const errorMessage = error.message || 'Failed to create event'
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
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'basic' ? 'bg-primary text-white' : 'bg-green-100 text-green-600'
          }`}>
            {step === 'basic' ? '1' : <Check className="h-4 w-4" />}
          </div>
          <span className={step === 'basic' ? 'font-medium' : 'text-gray-500'}>
            📝 Basic Info
          </span>
        </div>
        <div className="w-16 h-px bg-gray-300" />
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'tickets' ? 'bg-primary text-white' : 'text-gray-400'
          }`}>
            2
          </div>
          <span className={step === 'tickets' ? 'font-medium' : 'text-gray-500'}>
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

      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Create New Event ✨</h1>
          <p className="text-gray-500 mt-1">
            Fill in the details below to create your event and start selling tickets
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator />

      <div className="max-w-2xl mx-auto">
        {/* Step 1: Basic Information */}
        {step === 'basic' && (
          <form onSubmit={basicForm.handleSubmit(onBasicInfoSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Event Details 📅
                </CardTitle>
                <CardDescription>
                  Tell us about your event. You can add ticket types in the next step.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Douala Music Fest 2025"
                    {...basicForm.register('title')}
                  />
                  {basicForm.formState.errors.title && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <span>⚠️</span> {basicForm.formState.errors.title.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description 📝</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event..."
                    rows={4}
                    {...basicForm.register('description')}
                  />
                </div>

                {/* Venue Name */}
                <div>
                  <Label htmlFor="venueName">Venue Name *</Label>
                  <Input
                    id="venueName"
                    placeholder="e.g., Palais des Congrès"
                    {...basicForm.register('venueName')}
                  />
                  {basicForm.formState.errors.venueName && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <span>⚠️</span> {basicForm.formState.errors.venueName.message}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Select
                    onValueChange={(value) => basicForm.setValue('city', value)}
                    value={basicForm.watch('city')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="📍 Select a city" />
                    </SelectTrigger>
                    <SelectContent>
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

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Event Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...basicForm.register('startDate')}
                    />
                    {basicForm.formState.errors.startDate && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <span>⚠️</span> {basicForm.formState.errors.startDate.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="startTime">Event Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      {...basicForm.register('startTime')}
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
                >
                  Cancel
                </Button>
                <Button type="submit">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" />
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
                    <div key={field.id} className="border rounded-lg p-4 space-y-3 relative">
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
                            className="text-red-600 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Ticket Name</Label>
                          <Input
                            placeholder="e.g., Early Bird"
                            {...ticketForm.register(`ticketTypes.${index}.name`)}
                          />
                        </div>
                        <div>
                          <Label>Price (XAF)</Label>
                          <Input
                            type="number"
                            placeholder="5000"
                            {...ticketForm.register(`ticketTypes.${index}.price`, {
                              valueAsNumber: true,
                            })}
                          />
                        </div>
                        <div>
                          <Label>Quantity Available</Label>
                          <Input
                            type="number"
                            placeholder="100"
                            {...ticketForm.register(`ticketTypes.${index}.quantityAvailable`, {
                              valueAsNumber: true,
                            })}
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
                  className="w-full"
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
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting}>
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