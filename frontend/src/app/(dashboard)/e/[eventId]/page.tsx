/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Public Event Page
 * * Displays event details and allows attendees to:
 * 1. Enter their name (required)
 * 2. Select ticket type and quantity
 * 3. Pay via Mobile Money
 * 4. Download QR code ticket after successful payment
 * * @module PublicEventPage
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Calendar, MapPin, Clock, Ticket, Users, CheckCircle, Shield, ChevronRight, ArrowLeft } from 'lucide-react'

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
        toast.error('❌ Request failed: Target event could not be found')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    fetchEventDetails()
  }, [eventId, router])

  // Handle name submission step transition
  const handleNameSubmit = (name: string) => {
    if (!name.trim()) {
      toast.error('⚠️ Identification required: Please fill out your name to register')
      return
    }
    setAttendeeName(name.trim())
    setStep('ticket')
  }

  // Handle ticket checkout kickoff
  const handleTicketSelect = (ticket: TicketType, qty: number) => {
    setSelectedTicket(ticket)
    setQuantity(qty)
    setShowPaymentModal(true)
  }

  // Handle successful gateway reconciliation closure
  const handlePaymentSuccess = (confirmedOrderId: string) => {
    setOrderId(confirmedOrderId)
    setStep('success')
    setShowPaymentModal(false)
    router.push(`/ticket/${confirmedOrderId}`)
  }

  // Loading Skeleton State Fallback
  if (loading) {
    return (
      <div className="min-h-screen bg-muted/50 max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        <Skeleton className="h-48 md:h-64 w-full rounded-2xl bg-purple-100" />
        <div className="space-y-3">
          <Skeleton className="h-9 w-5/6 bg-purple-100" />
          <Skeleton className="h-5 w-2/3 bg-purple-100" />
        </div>
        <Separator className="bg-purple-100" />
        <div className="space-y-4">
          <Skeleton className="h-14 w-full rounded-xl bg-purple-100" />
          <Skeleton className="h-28 w-full rounded-xl bg-purple-100" />
        </div>
      </div>
    )
  }

  // Error boundary protection
  if (!event) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <Card className="glass max-w-md w-full text-center border-2 border-red-100 p-6 rounded-2xl">
          <p className="text-foreground font-black text-lg">Event Missing </p>
          <p className="text-muted-foreground text-sm mt-1 font-medium">
            This checkout context has timed out or points to an invalid record entry.
          </p>
          <Button onClick={() => router.push('/')} className="mt-4 w-full bg-purple-700 hover:bg-purple-800 font-bold rounded-xl">
            Return to Homepage
          </Button>
        </Card>
      </div>
    )
  }

  // Evaluate structural inventory flags
  const hasAvailableTickets = tickets.some(t => t.quantityAvailable > t.quantitySold)
  const isEventPast = new Date(event.startDate) < new Date()

  // Render Step 1: Attendee Name Input Identity Entry
  if (step === 'name') {
    return (
      <div className="min-h-screen bg-muted/50 text-foreground pb-12">
          {event.coverImageUrl && (
          <div className="relative h-48 md:h-64 w-full overflow-hidden border-b-2 border-purple-100">
            <Image
              src={event.coverImageUrl}
              alt={event.title}
              fill
              unoptimized
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-900/20 to-transparent" />
          </div>
        )}

        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {isEventPast && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-900 rounded-xl text-sm font-bold flex items-center gap-2">
               This registration framework marks an archive record for a historical past event.
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 mb-3">{event.title}</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-foreground font-semibold text-sm bg-card p-4 rounded-xl border border-purple-100 shadow-sm mb-6">
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-purple-600 shrink-0" />
              <span>
                {formatDate(event.startDate)}
                {event.endDate && event.endDate !== event.startDate && ` - ${formatDate(event.endDate)}`}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-purple-600 shrink-0" />
              <span>
                {formatTime(event.startTime)}
                {event.endTime && ` - ${formatTime(event.endTime)}`}
              </span>
            </div>
            <div className="flex items-center gap-2.5 sm:col-span-2 border-t border-slate-50 pt-2 mt-1">
              <MapPin className="h-4 w-4 text-purple-600 shrink-0" />
              <span className="truncate">{event.venue || 'TBA'}, {event.city}</span>
            </div>

            {event.capacityRange && (
              <div className="flex items-center gap-2.5 sm:col-span-2 border-t border-slate-50 pt-2 text-muted-foreground font-medium">
                <Users className="h-4 w-4 text-purple-500 shrink-0" />
                <span>Hosting Bracket: {event.capacityRange.lower} – {event.capacityRange.upper} seats</span>
              </div>
            )}
          </div>

          <Separator className="my-6 bg-purple-100" />

          <div className="bg-card rounded-2xl border-2 border-purple-100 p-5 shadow-sm">
            <NameInput
              eventTitle={event.title}
              onSubmit={handleNameSubmit}
            />
          </div>
        </div>
      </div>
    )
  }

  // Render Step 2: Interactive Ticket Selection Array Panel
  if (step === 'ticket') {
    return (
      <div className="min-h-screen bg-muted/50 text-foreground pb-12">
        {event.coverImageUrl && (
          <div className="relative h-36 md:h-44 w-full overflow-hidden border-b-2 border-purple-100">
            <Image
              src={event.coverImageUrl}
              alt={event.title}
              fill
              unoptimized
              className="object-cover opacity-80 filter blur-[1px]"
            />
            <div className="absolute inset-0 bg-slate-950/70" />
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <h1 className="text-white text-lg md:text-xl font-black tracking-tight text-center max-w-xl line-clamp-2">
                {event.title}
              </h1>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="mb-6 bg-gradient-to-r from-purple-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm border border-slate-950">
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              Welcome, <span className="text-purple-200">{attendeeName}</span>! 👋
            </h2>
            <p className="text-purple-100/80 text-xs md:text-sm font-medium mt-1">
              Select your required programmatic credential option and inventory count parameters below to continue checkout.
            </p>
          </div>

          <div className="bg-card rounded-2xl border-2 border-purple-100 p-2 shadow-sm">
            <TicketSelector
              tickets={tickets}
              onSelect={handleTicketSelect}
            />
          </div>

          <Button
            variant="ghost"
            className="mt-6 w-full text-foreground hover:text-purple-900 hover:bg-purple-50 border-2 border-dashed border-purple-200 py-6 font-bold rounded-xl shadow-sm transition-all"
            onClick={() => setStep('name')}
          >
            <ArrowLeft className="h-4 w-4 mr-2 text-purple-600" />
            Return to Client Information Step
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
            attendeeName={attendeeName}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    )
  }

  // Render Step 3: Success Redirection State Catch
  if (step === 'success' && orderId) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <Card className="glass max-w-md w-full border-2 border-purple-200 p-6 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-200 mx-auto animate-pulse">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="text-slate-950 font-black text-xl tracking-tight">Payment Verification Confirmed! <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600" >🎉</span></p>
          <p className="text-sm text-muted-foreground font-semibold leading-relaxed">
            Your transaction pass has cleared successfully. Stand by while we redirect you to your high-resolution printable QR secure ticket node...
          </p>
          <Button 
            onClick={() => router.push(`/ticket/${orderId}`)} 
            className="w-full bg-purple-700 hover:bg-purple-800 font-bold py-5 rounded-xl text-sm shadow-md"
          >
            Access Secured Ticket Instantly
          </Button>
        </Card>
      </div>
    )
  }

  return null
}