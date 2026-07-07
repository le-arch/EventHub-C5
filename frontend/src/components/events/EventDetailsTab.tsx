'use client'

import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { Calendar, AlertCircle, Save, ImageIcon } from 'lucide-react'
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
import { EventCoverUpload } from './EventCoverUpload'

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

export type EventFormValues = z.infer<typeof eventSchema>
export { eventSchema }

interface EventDetailsTabProps {
  form: UseFormReturn<EventFormValues>
  isSaving: boolean
  coverImageUrl: string | null
  onCoverUpload: (file: File) => Promise<string>
  onCoverChange: (url: string | null) => void
  onSubmit: (data: EventFormValues) => void
}

export function EventDetailsTab({
  form,
  isSaving,
  coverImageUrl,
  onCoverUpload,
  onCoverChange,
  onSubmit,
}: EventDetailsTabProps) {
  return (
    <Card className="border-l-4 border-l-purple-500 border-border/80 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Event Information
        </CardTitle>
        <CardDescription>
          Update your event details below
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form id="event-details-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground font-medium flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-purple-500" />
              Event Cover Image
            </Label>
            <EventCoverUpload
              value={coverImageUrl || undefined}
              onUpload={onCoverUpload}
              onChange={(_file, previewUrl) => {
                onCoverChange(previewUrl || null)
              }}
            />
          </div>

          <div>
            <Label htmlFor="title">Event Title *</Label>
            <Input id="title" placeholder="e.g., Douala Music Fest 2025" {...form.register('title')} />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={5} placeholder="Describe your event..." {...form.register('description')} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="venue">Venue Name and Address *</Label>
              <Input id="venue" placeholder="e.g., Palais des Congrès" {...form.register('venue')} />
              {form.formState.errors.venue && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {form.formState.errors.venue.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="city">City *</Label>
              <Select
                onValueChange={(value) => form.setValue('city', value)}
                value={form.watch('city')}
              >
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Select a city" />
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
            <div>
              <Label htmlFor="startDate">Event Date *</Label>
              <Input id="startDate" type="date" {...form.register('startDate')} />
              {form.formState.errors.startDate && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {form.formState.errors.startDate.message}
                </p>
              )}
            </div>
            <div>
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
            <div>
              <Label htmlFor="capacityMin">Minimum Capacity</Label>
              <Input
                id="capacityMin"
                type="number"
                placeholder="e.g., 10"
                {...form.register('capacityMin', { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="capacityMax">Maximum Capacity</Label>
              <Input
                id="capacityMax"
                type="number"
                placeholder="e.g., 100"
                {...form.register('capacityMax', { valueAsNumber: true })}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button form="event-details-form" type="submit" disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardFooter>
    </Card>
  )
}
