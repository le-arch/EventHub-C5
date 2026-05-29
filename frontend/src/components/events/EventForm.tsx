/**
 * EventForm Component
 * 
 * Comprehensive form for creating and editing events.
 * Includes validation, multi-step support, and ticket type management.
 * 
 * @module EventForm
 */

'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarIcon, Clock, MapPin, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'
import { Card, CardContent } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { DatePicker } from '@/src/components/common/DatePicker'
import { TimePicker } from '@/src/components/common/TimePicker'
import { EventCoverUpload } from './EventCoverUpload'
import { cn } from '@/src/lib/utils'

// Cameroon cities list
const CAMEROON_CITIES = [
  'Douala', 'Yaoundé', 'Garoua', 'Bamenda', 'Maroua',
  'Bafoussam', 'Nkongsamba', 'Limbe', 'Edéa', 'Kumbo',
]

// Validation schema
const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().max(5000).optional(),
  venueName: z.string().min(3, 'Venue name is required'),
  venueAddress: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  startDate: z.date({ required_error: 'Start date is required' }),
  startTime: z.string().min(1, 'Start time is required'),
  endDate: z.date().optional(),
  endTime: z.string().optional(),
})

const ticketTypeSchema = z.object({
  name: z.string().min(1, 'Ticket name required'),
  price: z.number().min(0, 'Price must be 0 or more'),
  quantityAvailable: z.number().min(1, 'At least 1 ticket required'),
})

type EventFormData = z.infer<typeof eventSchema>
type TicketTypeData = z.infer<typeof ticketTypeSchema>

interface EventFormProps {
  initialData?: Partial<EventFormData>
  initialTickets?: TicketTypeData[]
  onSubmit: (data: EventFormData, tickets: TicketTypeData[]) => Promise<void>
  isSubmitting?: boolean
}

export function EventForm({ 
  initialData, 
  initialTickets = [], 
  onSubmit, 
  isSubmitting = false 
}: EventFormProps) {
  const [step, setStep] = useState<'basic' | 'tickets'>('basic')
  const [coverImage, setCoverImage] = useState<File | null>(null)

  // Basic info form
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      venueName: initialData?.venueName || '',
      venueAddress: initialData?.venueAddress || '',
      city: initialData?.city || '',
      startDate: initialData?.startDate,
      startTime: initialData?.startTime || '',
      endDate: initialData?.endDate,
      endTime: initialData?.endTime || '',
    },
  })

  // Ticket types form with dynamic fields
  const ticketForm = useForm<{ tickets: TicketTypeData[] }>({
    defaultValues: {
      tickets: initialTickets.length > 0 ? initialTickets : [{ name: '', price: 0, quantityAvailable: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: ticketForm.control,
    name: 'tickets',
  })

  const onBasicSubmit = (data: EventFormData) => {
    setStep('tickets')
  }

  const handleFinalSubmit = async (data: { tickets: TicketTypeData[] }) => {
    const basicData = form.getValues()
    await onSubmit(basicData, data.tickets)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              step === 'basic' ? "bg-primary text-white" : "bg-green-100 text-green-600"
            )}>
              {step === 'basic' ? '1' : '✓'}
            </div>
            <span className={step === 'basic' ? 'font-medium' : 'text-gray-500'}>
              Basic Info
            </span>
          </div>
          <div className="w-16 h-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              step === 'tickets' ? "bg-primary text-white" : "text-gray-400"
            )}>
              2
            </div>
            <span className={step === 'tickets' ? 'font-medium' : 'text-gray-500'}>
              Ticket Types
            </span>
          </div>
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {step === 'basic' && (
        <form onSubmit={form.handleSubmit(onBasicSubmit)} className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="font-semibold text-lg">Event Details</h2>
              
              {/* Title */}
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Douala Music Fest 2025"
                  {...form.register('title')}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event..."
                  rows={4}
                  {...form.register('description')}
                />
              </div>

              {/* Cover Image */}
              <EventCoverUpload
                value={initialData?.coverImageUrl}
                onChange={(file) => setCoverImage(file)}
              />

              {/* Venue */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="venueName">Venue Name *</Label>
                  <Input
                    id="venueName"
                    placeholder="e.g., Palais des Congrès"
                    {...form.register('venueName')}
                  />
                  {form.formState.errors.venueName && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.venueName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="venueAddress">Venue Address (Optional)</Label>
                  <Input
                    id="venueAddress"
                    placeholder="Street address"
                    {...form.register('venueAddress')}
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <Label htmlFor="city">City *</Label>
                <select
                  id="city"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  {...form.register('city')}
                >
                  <option value="">Select a city</option>
                  {CAMEROON_CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {form.formState.errors.city && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.city.message}</p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <DatePicker
                    value={form.watch('startDate')}
                    onChange={(date) => form.setValue('startDate', date as Date)}
                  />
                </div>
                <div>
                  <Label>Start Time *</Label>
                  <TimePicker
                    value={form.watch('startTime')}
                    onChange={(time) => form.setValue('startTime', time)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="submit">
              Continue to Ticket Types
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      )}

      {/* Step 2: Ticket Types */}
      {step === 'tickets' && (
        <form onSubmit={ticketForm.handleSubmit(handleFinalSubmit)} className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg">Ticket Types</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: '', price: 0, quantityAvailable: 0 })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Ticket
                </Button>
              </div>

              {fields.map((field, index) => (
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
                        placeholder="e.g., Early Bird, VIP"
                        {...ticketForm.register(`tickets.${index}.name`)}
                      />
                    </div>
                    <div>
                      <Label>Price (XAF)</Label>
                      <Input
                        type="number"
                        placeholder="5000"
                        {...ticketForm.register(`tickets.${index}.price`, { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Label>Quantity Available</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        {...ticketForm.register(`tickets.${index}.quantityAvailable`, { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {fields.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  Click "Add Ticket" to create ticket types
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between gap-3">
            <Button type="button" variant="outline" onClick={() => setStep('basic')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting || fields.length === 0}>
              {isSubmitting ? 'Creating Event...' : 'Create Event'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}