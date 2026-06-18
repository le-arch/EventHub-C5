/**
 * Public Event Page
 * 
 * Displays event details and allows attendees to:
 * 1. Enter their name (required)
 * 2. Select ticket type and quantity
 * 3. Pay via Mobile Money
 * 4. Download QR code ticket after successful payment
 * 
 * @module PublicEventPage
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Calendar, MapPin, Clock, Ticket, Users, CheckCircle, Shield, ChevronRight, ArrowLeft } from 'lucide-react'

// Components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { NameInput } from '@/components/events/NameInput'
import { PaymentModal } from '@/components/events/PaymentModal'
import { TicketSelector } from '@/components/events/TicketSelector'

// Utilities
import api from '@/lib/api'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Types
interface Event {
  id: string
  title: string
  description: string | null
  venueName: string
  venueAddress: string | null
  city: string
  startDate: string
  startTime: string
  endDate: string | null
  endTime: string | null
  coverImageUrl: string | null
  status: string
  organizerName: string
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
  const eventId = params.eventId as string

  // State
  const [event, setEvent] = useState<Event | null>(null)
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>('name')
  const [attendeeName, setAttendeeName] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await api.get(`/events/public/${eventId}`)
        setEvent(response.data.event)
        setTickets(response.data.ticket_types)
      } catch (error) {
        toast.error('❌ Event not found')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchEventDetails()
    }
  }, [eventId, router])

  // Handle name submission
  const handleNameSubmit = (name: string) => {
    setAttendeeName(name)
    setStep('ticket')
  }

  // Handle ticket selection
  const handleTicketSelect = (ticket: TicketType, qty: number) => {
    setSelectedTicket(ticket)
    setQuantity(qty)
    setShowPaymentModal(true)
  }

  // Handle payment success
  const handlePaymentSuccess = (orderId: string) => {
    setOrderId(orderId)
    setStep('success')
    setShowPaymentModal(false)
  }

  // Loading state with themed skeletons
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <Skeleton className="h-48 md:h-64 w-full rounded-none" />
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-5 w-1/2 mb-2" />
          <Skeleton className="h-5 w-2/3 mb-6" />
          <Skeleton className="h-32 w-full mb-6 rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!event) return null

  // Check if event has available tickets
  const hasAvailableTickets = tickets.some(t => t.quantityAvailable > t.quantitySold)

  // Name input step
  if (step === 'name') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50/30">
        {/* Cover Image with Gradient Overlay */}
        {event.coverImageUrl ? (
          <div className="relative h-48 md:h-64 w-full overflow-hidden">
            <Image
              src={event.coverImageUrl}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 via-indigo-800/40 to-blue-900/60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h1 className="text-3xl md:text-4xl font-bold drop-shadow-lg">{event.title}</h1>
                <p className="text-white/90 text-sm mt-2 drop-shadow">
                  {formatDate(event.startDate)} • {event.venueName}, {event.city}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-48 md:h-64 w-full bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 flex items-center justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{event.title}</h1>
          </div>
        )}

        {/* Event Details Summary */}
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <div className="bg-white rounded-xl shadow-md border border-purple-100 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-purple-500" />
                <span>{formatDate(event.startDate)}</span>
                {event.endDate && event.endDate !== event.startDate && (
                  <span> - {formatDate(event.endDate)}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-purple-500" />
                <span>{formatTime(event.startTime)}</span>
                {event.endTime && <span> - {formatTime(event.endTime)}</span>}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-purple-500" />
                <span className="truncate">{event.venueName}, {event.city}</span>
              </div>
            </div>
            {event.venueAddress && (
              <div className="text-xs text-gray-400 mt-2 ml-6">
                {event.venueAddress}
              </div>
            )}
          </div>

          {/* Name Input Card */}
          <Card className="border-l-4 border-l-purple-500 shadow-lg">
            <CardContent className="pt-6">
              <NameInput
                eventTitle={event.title}
                onSubmit={handleNameSubmit}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Ticket selection step
  if (step === 'ticket') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50/30">
        {/* Mini Header */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 p-4 text-white">
          <div className="container mx-auto max-w-2xl flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStep('name')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm opacity-90">Step 2 of 3</p>
              <h2 className="font-semibold text-lg">Select Tickets</h2>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Welcome Message */}
          <div className="text-center mb-6">
            <div className="inline-block bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm font-medium mb-2">
              👋 Welcome, {attendeeName}!
            </div>
            <p className="text-gray-500 text-sm">
              Choose your ticket type and quantity below
            </p>
          </div>

          {/* Ticket Selection */}
          <TicketSelector
            tickets={tickets}
            onSelect={handleTicketSelect}
          />

          {/* Back button */}
          <Button
            variant="ghost"
            className="mt-6 w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            onClick={() => setStep('name')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Name Entry
          </Button>
        </div>
      </div>
    )
  }

  // Success step (QR code download) – redirect to ticket page
  if (step === 'success' && orderId) {
    router.push(`/ticket/${orderId}`)
    return null
  }

  // Fallback (should not reach)
  return null
}