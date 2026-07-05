/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Public Event Page
 * * Displays event details and allows attendees to:
 * 1. Enter their name
 * 2. Select ticket type and quantity
 * 3. Pay via Mobile Money
 * 4. Get QR code ticket after successful payment
 * * @module PublicEventPage
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, MapPin, Clock, Ticket, Users, CheckCircle, Shield, ChevronRight, ArrowLeft, Check, Bell, BellOff } from 'lucide-react'

// Hooks
import { useEventReminder } from '@/hooks/useEventReminder'

// Components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { NameInput } from '@/components/events/NameInput'
import { PaymentModal } from '@/components/events/PaymentModal'
import { TicketSelector } from '@/components/events/TicketSelector'

// Utilities
import api from '@/lib/api'
import { formatDate, formatTime } from '@/lib/utils'
import { toast } from 'sonner'

// Types
interface Event {
  id: string
  title: string
  description: string | null
  venue: string | null
  city: string
  startDate: string
  startTime: string
  endDate: string | null
  endTime: string | null
  coverImageUrl: string | null
  status: string
  organizerName: string
  capacityRange?: {
    lower: number
    upper: number
  } | null
}

interface TicketType {
  id: string
  name: string
  description: string | null
  price: number
  quantityAvailable: number
  quantitySold: number
}

type Step = 'name' | 'ticket' | 'payment' | 'success'

export default function PublicEventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params?.eventId as string

  // State
  const [event, setEvent] = useState<Event | null>(null)
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>('name')
  const [attendeeName, setAttendeeName] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)

  const { reminderSet, setReminder, clearReminder } = useEventReminder(
    eventId,
    event?.title || '',
    event?.startDate || ''
  )

  const steps = [
    { key: 'name' as Step, label: 'Your Name' },
    { key: 'ticket' as Step, label: 'Select Ticket' },
    { key: 'payment' as Step, label: 'Payment' },
    { key: 'success' as Step, label: 'Done' },
  ]

  const currentStepIndex = steps.findIndex(s => s.key === step)

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return
      try {
        const [eventRes, ticketsRes] = await Promise.all([
          api.get(`/events/public/${eventId}`),
          api.get(`/events/public/${eventId}/ticket-types`).catch(() => null),
        ])
        if (eventRes.data) {
          setEvent(eventRes.data)
          if (ticketsRes && Array.isArray(ticketsRes.data)) {
            setTickets(ticketsRes.data)
          }
        } else {
          throw new Error('Event data payload is invalid')
        }
      } catch (error) {
        toast.error('Event not found')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    fetchEventDetails()
  }, [eventId, router])

  const handleNameSubmit = (name: string) => {
    if (!name.trim()) {
      toast.error('Please enter your name to continue')
      return
    }
    setAttendeeName(name.trim())
    setStep('ticket')
  }

  // Handle proceed to payment
  const handleTicketSelect = (ticket: TicketType, qty: number) => {
    setSelectedTicket(ticket)
    setQuantity(qty)
    setShowPaymentModal(true)
  }

  // Handle successful payment — refresh ticket counts
  const handlePaymentSuccess = (confirmedOrderId: string) => {
    setOrderId(confirmedOrderId)
    setStep('success')
    setShowPaymentModal(false)
    // Refetch ticket types to update sold/available counts
    api.get(`/events/public/${eventId}/ticket-types`).then(res => {
      if (res.data && Array.isArray(res.data)) {
        setTickets(res.data)
      }
    }).catch(() => {})
  }

  // Loading Skeleton State Fallback
  if (loading) {
    return (
      <div className="min-h-screen bg-background md:grid md:grid-cols-2">
        <Skeleton className="h-48 md:h-screen w-full rounded-none" />
        <div className="p-4 md:p-8 md:overflow-y-auto space-y-6">
          <Skeleton className="h-9 w-5/6" />
          <Skeleton className="h-5 w-2/3" />
          <Separator />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  // Error boundary protection
  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center border border-destructive/30 bg-card p-6 rounded-2xl shadow-sm">
          <p className="text-foreground font-black text-lg">Event not found</p>
          <p className="text-muted-foreground text-sm mt-1 font-medium">
            This event could not be found. It may have been removed or the link is invalid.
          </p>
          <Button onClick={() => router.push('/')} className="mt-4 w-full" variant="default">
            Return to Homepage
          </Button>
        </Card>
      </div>
    )
  }

  // Check availability
  const hasAvailableTickets = tickets.some(t => t.quantityAvailable > t.quantitySold)
  const isEventPast = new Date(event.startDate) < new Date()

  // Step 1: Enter your name
  if (step === 'name') {
    return (
      <div className="min-h-screen bg-background text-foreground pb-12 md:pb-0 md:grid md:grid-cols-2">
        {event.coverImageUrl && !imageError ? (
          <div className="relative h-48 md:h-screen md:sticky md:top-0 w-full overflow-hidden border-b md:border-b-0 border-border">
            <img
              src={event.coverImageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-background/60 via-background/10 to-transparent" />
          </div>
        ) : (
          <div className="h-32 md:h-screen md:sticky md:top-0 w-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center border-b md:border-b-0 border-border">
            <Calendar className="h-12 w-12 text-primary/40" />
          </div>
        )}

        {/* Right side parent container */}
        <div className="flex flex-col md:h-screen">
          {/* Step indicator - above scrollable content */}
          <div className="flex items-center justify-center py-4 px-5 md:px-8 shrink-0">
            <div className="flex items-center gap-4 md:gap-6 shrink-0">
              {steps.flatMap((s, i) => {
                const el = (
                  <div key={s.key} className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      i === currentStepIndex
                        ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                        : i < currentStepIndex
                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'
                    }`}>
                      {i < currentStepIndex ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={`text-sm font-medium hidden sm:inline ${
                      i === currentStepIndex
                        ? 'font-semibold text-purple-700 dark:text-purple-400'
                        : i < currentStepIndex
                        ? 'text-gray-500 dark:text-gray-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                )
                if (i < steps.length - 1) {
                  return [el, (
                    <div key={`conn-${i}`} className={`w-8 md:w-12 h-0.5 hidden sm:block ${i < currentStepIndex ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
                  )]
                }
                return [el]
              })}
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 container mx-auto px-5 pb-8 md:max-w-xl md:px-8 md:pb-10 md:overflow-y-auto">

          {isEventPast && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-bold flex items-center gap-2">
               This event has already taken place.
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-3">{event.title}</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-muted-foreground font-semibold text-sm bg-card p-4 rounded-xl border border-border shadow-sm mb-6">
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span className="text-foreground">
                {formatDate(event.startDate)}
                {event.endDate && event.endDate !== event.startDate && ` - ${formatDate(event.endDate)}`}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span className="text-foreground">
                {formatTime(event.startTime)}
                {event.endTime && ` - ${formatTime(event.endTime)}`}
              </span>
            </div>
            <div className="flex items-center gap-2.5 sm:col-span-2 border-t border-border pt-2 mt-1">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate text-foreground">{event.venue || 'TBA'}, {event.city}</span>
            </div>

            {event.capacityRange && (
              <div className="flex items-center gap-2.5 sm:col-span-2 border-t border-border pt-2 text-muted-foreground font-medium">
                <Users className="h-4 w-4 text-primary shrink-0" />
                <span>Capacity: {event.capacityRange.lower} – {event.capacityRange.upper} seats</span>
              </div>
            )}
          </div>

          {/* Remind Me Button */}
          <div className="mb-4">
            {reminderSet ? (
              <Button
                variant="outline"
                size="sm"
                onClick={clearReminder}
                className="gap-2 text-amber-600 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950/30"
              >
                <BellOff className="h-4 w-4" />
                Reminder Set — Cancel
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={setReminder}
                className="gap-2"
              >
                <Bell className="h-4 w-4" />
                Remind Me
              </Button>
            )}
          </div>

          {event.description && (
            <div className="mb-6">
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          <Separator className="my-6" />

          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <NameInput
              eventTitle={event.title}
              onSubmit={handleNameSubmit}
            />
          </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Choose your ticket
  if (step === 'ticket') {
    return (
      <div className="min-h-screen bg-background text-foreground pb-12 md:pb-0 md:grid md:grid-cols-2">
        {event.coverImageUrl && !imageError ? (
          <div className="relative h-36 md:h-screen md:sticky md:top-0 w-full overflow-hidden border-b md:border-b-0 border-border">
            <img
              src={event.coverImageUrl}
              alt={event.title}
              className="w-full h-full object-cover opacity-80 filter blur-[1px]"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-background/70" />
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <h1 className="text-foreground text-lg md:text-xl font-black tracking-tight text-center max-w-xl line-clamp-2">
                {event.title}
              </h1>
            </div>
          </div>
        ) : (
          <div className="h-28 md:h-screen md:sticky md:top-0 w-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center border-b md:border-b-0 border-border">
            <Calendar className="h-10 w-10 text-primary/40" />
          </div>
        )}

        <div className="container mx-auto px-4 py-6 md:max-w-xl md:px-8 md:py-10 md:overflow-y-auto">
          <div className="mb-6 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 text-white p-5 rounded-2xl shadow-lg">
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              Welcome, <span className="text-white/80">{attendeeName}</span>!
            </h2>
            <p className="text-white/70 text-xs md:text-sm font-medium mt-1">
                Choose your ticket type and how many you'd like.
              </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-2 shadow-sm">
            <TicketSelector
              tickets={tickets}
              onSelect={handleTicketSelect}
            />
          </div>

          <Button
            variant="ghost"
            className="mt-6 w-full text-muted-foreground hover:text-foreground hover:bg-accent border-2 border-dashed border-border py-6 font-bold rounded-xl shadow-sm transition-all"
            onClick={() => setStep('name')}
          >
            <ArrowLeft className="h-4 w-4 mr-2 text-primary" />
            Back to name
          </Button>
        </div>

        {/* Payment Processing Interstitial Modal Panel */}
          {showPaymentModal && selectedTicket && (
            <PaymentModal
              open={showPaymentModal}
              onClose={() => setShowPaymentModal(false)}
              ticketType={selectedTicket}
              quantity={quantity}
              eventId={eventId}
              eventTitle={event?.title || 'Event'}
              attendeeName={attendeeName}
              onSuccess={handlePaymentSuccess}
              onError={(error) => toast.error(error)}
            />
          )}
      </div>
    )
  }

  // Step 3: Payment confirmed
  if (step === 'success' && orderId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border border-border bg-card p-6 rounded-2xl shadow-md text-center space-y-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center border border-green-200 dark:border-green-800 mx-auto animate-pulse">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-foreground font-black text-xl tracking-tight">Payment successful!</p>
          <p className="text-sm text-muted-foreground font-semibold leading-relaxed">
            Your ticket is ready. Redirecting you now...
          </p>
          <Button 
            onClick={() => router.push(`/ticket/${orderId}`)} 
            className="w-full font-bold py-5 rounded-xl text-sm shadow-md"
          >
            View Your Ticket
          </Button>
        </Card>
      </div>
    )
  }

  return null
}