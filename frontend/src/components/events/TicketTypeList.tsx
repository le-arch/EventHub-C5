/**
 * TicketTypeList Component
 * 
 * Displays a list of ticket types with edit and delete capabilities.
 * Shows sold counts and availability status.
 * 
 * @module TicketTypeList
 */

'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { TicketTypeForm } from './TicketTypeForm'

interface TicketType {
  id?: string
  name: string
  price: number
  quantityAvailable: number
  quantitySold?: number
}

interface TicketTypeListProps {
  ticketTypes: TicketType[]
  onAdd: (ticket: Omit<TicketType, 'id'>) => Promise<void>
  onUpdate: (id: string, ticket: Partial<TicketType>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isLoading?: boolean
}

export function TicketTypeList({ 
  ticketTypes, 
  onAdd, 
  onUpdate, 
  onDelete, 
  isLoading = false 
}: TicketTypeListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAdd = async (data: Omit<TicketType, 'id'>) => {
    await onAdd(data)
    setIsAdding(false)
  }

  const handleUpdate = async (id: string, data: Partial<TicketType>) => {
    await onUpdate(id, data)
    setEditingId(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Ticket Types</h3>
        {!isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Ticket
          </Button>
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <TicketTypeForm
              onSubmit={handleAdd}
              onCancel={() => setIsAdding(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Ticket List */}
      <div className="space-y-3">
        {ticketTypes.map((ticket) => {
          const isEditing = editingId === ticket.id
          const soldCount = ticket.quantitySold || 0
          const available = ticket.quantityAvailable - soldCount
          const isSoldOut = available === 0

          if (isEditing) {
            return (
              <Card key={ticket.id} className="border-primary/20">
                <CardContent className="p-4">
                  <TicketTypeForm
                    initialData={ticket}
                    onSubmit={(data) => handleUpdate(ticket.id!, data)}
                    onCancel={() => setEditingId(null)}
                  />
                </CardContent>
              </Card>
            )
          }

          return (
            <Card key={ticket.id} className={isSoldOut ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{ticket.name}</h4>
                      {isSoldOut && (
                        <Badge variant="secondary" className="text-xs">
                          Sold Out
                        </Badge>
                      )}
                      {available > 0 && available < 10 && (
                        <Badge variant="outline" className="text-xs text-amber-600">
                          Only {available} left
                        </Badge>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {formatCurrency(ticket.price)}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Total: {ticket.quantityAvailable}</span>
                      {soldCount > 0 && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Sold: {soldCount}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingId(ticket.id!)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                      onClick={() => onDelete(ticket.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {ticketTypes.length === 0 && !isAdding && (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-gray-500 mb-3">No ticket types yet</p>
            <Button variant="outline" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add your first ticket type
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}