/**
 * TicketSelector Component
 * 
 * Allows attendees to select ticket types and quantities.
 * Shows availability, pricing, and updates total in real-time.
 * 
 * @module TicketSelector
 */

'use client'

import { useState } from 'react'
import { Minus, Plus, Ticket } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { formatCurrency } from '@/src/lib/utils'
import { cn } from '@/src/lib/utils'

interface TicketType {
  id: string
  name: string
  price: number
  quantityAvailable: number
}

interface TicketSelectorProps {
  tickets: TicketType[]
  onSelect: (ticket: TicketType, quantity: number) => void
  isLoading?: boolean
}

export function TicketSelector({ tickets, onSelect, isLoading = false }: TicketSelectorProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const selectedTicket = tickets.find(t => t.id === selectedTicketId)

  const incrementQuantity = () => {
    if (selectedTicket && quantity < selectedTicket.quantityAvailable) {
      setQuantity(prev => prev + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  const handleSelect = (ticket: TicketType) => {
    setSelectedTicketId(ticket.id)
    setQuantity(1)
  }

  const handleProceed = () => {
    if (selectedTicket) {
      onSelect(selectedTicket, quantity)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-8 w-24 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tickets available</p>
          <p className="text-sm text-gray-400">Check back later for ticket sales</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Ticket Type Cards */}
      {tickets.map((ticket) => {
        const isSelected = selectedTicketId === ticket.id
        const isSoldOut = ticket.quantityAvailable === 0

        return (
          <Card
            key={ticket.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isSelected && "border-primary ring-2 ring-primary/20",
              isSoldOut && "opacity-60 cursor-not-allowed"
            )}
            onClick={() => !isSoldOut && handleSelect(ticket)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{ticket.name}</h3>
                    {isSoldOut && (
                      <Badge variant="secondary" className="text-xs">
                        Sold Out
                      </Badge>
                    )}
                    {ticket.quantityAvailable > 0 && ticket.quantityAvailable < 10 && (
                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
                        Only {ticket.quantityAvailable} left
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-primary mt-2">
                    {formatCurrency(ticket.price)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {ticket.quantityAvailable} tickets available
                  </p>
                </div>
                
                {isSelected && (
                  <div className="bg-primary text-white rounded-full px-3 py-1 text-xs font-medium">
                    Selected
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Quantity Selector and Proceed Button */}
      {selectedTicket && selectedTicket.quantityAvailable > 0 && (
        <Card className="bg-gray-50 border-primary/20">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Quantity:</span>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-xl font-semibold w-8 text-center">
                  {quantity}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={incrementQuantity}
                  disabled={quantity >= selectedTicket.quantityAvailable}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <span className="font-semibold text-gray-700">Total:</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(selectedTicket.price * quantity)}
              </span>
            </div>

            <Button onClick={handleProceed} className="w-full" size="lg">
              Proceed to Payment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}