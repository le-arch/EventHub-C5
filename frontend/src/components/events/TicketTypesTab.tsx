'use client'

import { UseFormReturn, UseFieldArrayReturn } from 'react-hook-form'
import { z } from 'zod'
import { Ticket, Plus, Trash2, Save, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type TicketType } from '@/store/eventStore'

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

export type TicketFormValues = z.infer<typeof ticketFormSchema>
export type TicketFormInputValues = z.input<typeof ticketFormSchema>
export { ticketFormSchema, ticketTypeSchema }

interface TicketTypesTabProps {
  ticketForm: UseFormReturn<TicketFormInputValues>
  fields: UseFieldArrayReturn<TicketFormInputValues>['fields']
  append: UseFieldArrayReturn<TicketFormInputValues>['append']
  remove: UseFieldArrayReturn<TicketFormInputValues>['remove']
  localTicketTypes: TicketType[]
  isSaving: boolean
  onSubmit: (data: TicketFormValues) => void
}

export function TicketTypesTab({
  ticketForm,
  fields,
  append,
  remove,
  localTicketTypes,
  isSaving,
  onSubmit,
}: TicketTypesTabProps) {
  const handleFormSubmit = ticketForm.handleSubmit((data: TicketFormInputValues) => {
    onSubmit(data as TicketFormValues)
  })

  return (
    <Card className="border-l-4 border-l-blue-500 border-border/80 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          Ticket Types
        </CardTitle>
        <CardDescription>
          Manage ticket categories and pricing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="ticket-types-form" onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-3">
            {fields.map((field, index) => {
              const originalTicket = localTicketTypes.find(t => t.id === field.id)
              const soldCount = originalTicket?.quantitySold || 0

              return (
                <div key={field.id} className="border rounded-lg p-4 space-y-3">
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
        </form>
      </CardContent>
      <CardFooter>
        <Button form="ticket-types-form" type="submit" disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          Save Ticket Types
        </Button>
      </CardFooter>
    </Card>
  )
}
