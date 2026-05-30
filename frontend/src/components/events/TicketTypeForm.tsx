/**
 * TicketTypeForm Component
 * 
 * Form for adding or editing a single ticket type.
 * Used within EventForm and TicketTypeList for inline editing.
 * 
 * @module TicketTypeForm
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'

const ticketTypeSchema = z.object({
  name: z.string().min(1, 'Ticket name is required'),
  price: z.number().min(0, 'Price must be 0 or more'),
  quantityAvailable: z.number().min(1, 'At least 1 ticket required'),
})

type TicketTypeFormData = z.infer<typeof ticketTypeSchema>

interface TicketTypeFormProps {
  initialData?: Partial<TicketTypeFormData>
  onSubmit: (data: TicketTypeFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function TicketTypeForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}: TicketTypeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TicketTypeFormData>({
    resolver: zodResolver(ticketTypeSchema),
    defaultValues: {
      name: initialData?.name || '',
      price: initialData?.price || 0,
      quantityAvailable: initialData?.quantityAvailable || 0,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">Ticket Name</Label>
          <Input
            placeholder="e.g., VIP"
            {...register('name')}
            className="mt-1"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>
        
        <div>
          <Label className="text-xs">Price (XAF)</Label>
          <Input
            type="number"
            placeholder="5000"
            {...register('price', { valueAsNumber: true })}
            className="mt-1"
          />
          {errors.price && (
            <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>
          )}
        </div>
        
        <div>
          <Label className="text-xs">Quantity</Label>
          <Input
            type="number"
            placeholder="100"
            {...register('quantityAvailable', { valueAsNumber: true })}
            className="mt-1"
          />
          {errors.quantityAvailable && (
            <p className="text-xs text-red-500 mt-1">{errors.quantityAvailable.message}</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="h-3 w-3 mr-1" />
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          <Check className="h-3 w-3 mr-1" />
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  )
}