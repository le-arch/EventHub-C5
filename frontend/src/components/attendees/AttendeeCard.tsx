/**
 * AttendeeCard Component
 * 
 * Displays attendee information in a card format optimized for mobile devices.
 * Shows attendee name, phone, ticket details, and check-in status.
 * Used in the mobile view of the attendee list page.
 * 
 * @module AttendeeCard
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CheckCircle, XCircle, Phone, Ticket, Calendar, Clock } from 'lucide-react'
import { formatCurrency, formatTime, formatDate } from '@/lib/utils'

// Types
interface AttendeeCardProps {
  attendee: {
    id: string
    name: string
    phone: string
    ticketType: string
    quantity: number
    unitPrice: number
    totalPaid: number
    checkedIn: boolean
    checkedInAt: string | null
    purchasedAt: string
  }
  onCheckIn?: (attendeeId: string) => void
  showActions?: boolean
}

/**
 * Get initials for avatar
 */
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Get random color for avatar based on name
 */
const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-blue-100 text-blue-600',
    'bg-green-100 text-green-600',
    'bg-purple-100 text-purple-600',
    'bg-amber-100 text-amber-600',
    'bg-pink-100 text-pink-600',
    'bg-indigo-100 text-indigo-600',
    'bg-red-100 text-red-600',
    'bg-teal-100 text-teal-600',
  ]
  const index = name.length % colors.length
  return colors[index]
}

export function AttendeeCard({ attendee, onCheckIn, showActions = true }: AttendeeCardProps) {
  return (
    <Card className={`overflow-hidden transition-shadow hover:shadow-md ${attendee.checkedIn ? 'border-l-4 border-l-green-500' : ''}`}>
      <CardContent className="p-4">
        {/* Header with Avatar and Name */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className={getAvatarColor(attendee.name)}>
              {getInitials(attendee.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-semibold text-lg truncate">
                {attendee.name}
              </h3>
              {attendee.checkedIn ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Checked In
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="h-3 w-3 mr-1" />
                  Not Checked
                </Badge>
              )}
            </div>
            
            {/* Phone Number */}
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{attendee.phone}</span>
            </div>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-2 mb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Ticket className="h-4 w-4" />
              <span>Ticket Type:</span>
            </div>
            <span className="font-medium">{attendee.ticketType}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Quantity:</span>
            <span className="font-medium">{attendee.quantity}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Unit Price:</span>
            <span>{formatCurrency(attendee.unitPrice)}</span>
          </div>
          
          <div className="flex justify-between items-center pt-1 border-t">
            <span className="text-sm font-medium">Total Paid:</span>
            <span className="font-bold text-primary">{formatCurrency(attendee.totalPaid)}</span>
          </div>
        </div>

        {/* Purchase and Check-in Info */}
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Purchased: {formatDate(attendee.purchasedAt)}</span>
          </div>
          {attendee.checkedIn && attendee.checkedInAt && (
            <div className="flex items-center gap-1 text-green-600">
              <Clock className="h-3 w-3" />
              <span>Checked in: {formatTime(attendee.checkedInAt)}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        {showActions && !attendee.checkedIn && onCheckIn && (
          <button
            onClick={() => onCheckIn(attendee.id)}
            className="w-full mt-3 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Check In
          </button>
        )}
      </CardContent>
    </Card>
  )
}