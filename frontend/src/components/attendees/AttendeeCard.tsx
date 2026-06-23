/**
 * AttendeeCard Component
 * * Displays attendee information in a card format optimized for mobile devices.
 * Shows attendee name, phone, ticket details, and check-in status.
 * Used in the mobile view of the attendee list page.
 * * @module AttendeeCard
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CheckCircle, XCircle, Phone, Ticket, Calendar, Clock, ArrowRight } from 'lucide-react'
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
 * Get premium-palette color variation for avatar based on name
 */
const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    'bg-violet-500/10 text-violet-600 border-violet-500/20',
    'bg-amber-500/10 text-amber-600 border-amber-500/20',
    'bg-rose-500/10 text-rose-600 border-rose-500/20',
    'bg-sky-500/10 text-sky-600 border-sky-500/20',
    'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20',
    'bg-teal-500/10 text-teal-600 border-teal-500/20',
  ]
  const index = name.length % colors.length
  return colors[index]
}

export function AttendeeCard({ attendee, onCheckIn, showActions = true }: AttendeeCardProps) {
  return (
    <Card 
      className={`overflow-hidden transition-all duration-200 border-white/40 bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 relative ${
        attendee.checkedIn ? 'after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-emerald-500' : ''
      }`}
    >
      <CardContent className="p-4 sm:p-5">
        
        {/* Header with Avatar and Name */}
        <div className="flex items-start gap-3.5 mb-4">
          <Avatar className="h-11 w-11 shadow-sm border border-slate-100">
            <AvatarFallback className={`text-sm font-bold border ${getAvatarColor(attendee.name)}`}>
              {getInitials(attendee.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-slate-800 tracking-tight text-base sm:text-lg truncate leading-snug">
                {attendee.name}
              </h3>
              
              {attendee.checkedIn ? (
                <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/15 shadow-none shrink-0 font-bold text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-md gap-1">
                  <CheckCircle className="h-3 w-3 stroke-[2.5]" />
                  Checked In
                </Badge>
              ) : (
                <Badge className="bg-slate-100 text-slate-500 border-slate-200/60 hover:bg-slate-150 shadow-none shrink-0 font-bold text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-md gap-1">
                  <XCircle className="h-3 w-3 stroke-[2.5]" />
                  Pending
                </Badge>
              )}
            </div>
            
            {/* Phone Number */}
            <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-slate-400">
              <Phone className="h-3 w-3 text-slate-400" />
              <span className="tracking-wide">{attendee.phone}</span>
            </div>
          </div>
        </div>

        {/* Ticket Details Container */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 space-y-2.5 mb-4">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2 font-medium text-slate-400">
              <Ticket className="h-3.5 w-3.5 text-slate-400" />
              <span>Ticket Tier</span>
            </div>
            <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200/50 shadow-sm">{attendee.ticketType}</span>
          </div>
          
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-slate-400">Quantity</span>
            <span className="font-bold text-slate-700">{attendee.quantity}</span>
          </div>
          
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-slate-400">Unit Price</span>
            <span className="font-semibold text-slate-600">{formatCurrency(attendee.unitPrice)}</span>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
            <span className="text-xs font-bold text-slate-500">Total Paid</span>
            <span className="text-sm font-black text-indigo-600">{formatCurrency(attendee.totalPaid)}</span>
          </div>
        </div>

        {/* Purchase and Check-in Info */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] font-medium text-slate-400 border-b border-transparent pb-0.5">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-slate-400" />
            <span>Purchased: {formatDate(attendee.purchasedAt)}</span>
          </div>
          
          {attendee.checkedIn && attendee.checkedInAt && (
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-500/10 font-semibold">
              <Clock className="h-3 w-3 stroke-[2.5]" />
              <span>In: {formatTime(attendee.checkedInAt)}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        {showActions && !attendee.checkedIn && onCheckIn && (
          <button
            onClick={() => onCheckIn(attendee.id)}
            className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-[0_4px_12px_rgba(79,70,229,0.15)] hover:shadow-[0_4px_16px_rgba(79,70,229,0.25)] flex items-center justify-center gap-1.5 active:scale-[0.99]"
          >
            Confirm Check In
            <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        )}
        
      </CardContent>
    </Card>
  )
}