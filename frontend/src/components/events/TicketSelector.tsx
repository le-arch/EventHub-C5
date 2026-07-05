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
import { Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface TicketType {
  id: string
  name: string
  description: string | null
  price: number
  quantityAvailable: number
  quantitySold: number
}

interface TicketSelectorProps {
  tickets: TicketType[]
  onSelect: (ticket: TicketType, quantity: number) => void
  isLoading?: boolean
}

export function TicketSelector({ tickets, onSelect, isLoading = false }: TicketSelectorProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)

  const selectedTicket = tickets.find(t => t.id === selectedTicketId)

  const handleSelect = (ticket: TicketType) => {
    setSelectedTicketId(ticket.id)
  }

  const handleProceed = () => {
    if (selectedTicket) {
      onSelect(selectedTicket, 1)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-6 w-32 bg-muted rounded mb-2" />
              <div className="h-8 w-24 bg-muted rounded" />
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
          <Ticket className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No tickets available</p>
          <p className="text-sm text-muted-foreground/60">Check back later for ticket sales</p>
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
                      <Badge variant="outline" className="text-xs text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                        Only {ticket.quantityAvailable} left
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-primary mt-2">
                    {formatCurrency(ticket.price)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {ticket.quantityAvailable} ticket{ticket.quantityAvailable !== 1 ? 's' : ''} available
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

      {/* Proceed Button */}
      {selectedTicket && selectedTicket.quantityAvailable > 0 && (
        <Card className="bg-muted border-primary/20">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Ticket</span>
              <span className="font-medium text-foreground">{selectedTicket.name}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="font-semibold text-foreground">Total:</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(selectedTicket.price)}
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