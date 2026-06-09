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

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Calendar, MapPin, Clock, Ticket, Users, CheckCircle, Shield, ChevronRight } from 'lucide-react'

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
        toast.error('Event not found')
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Cover Image Skeleton */}
        <Skeleton className="h-48 md:h-64 w-full" />
        
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-2/3 mb-6" />
          <Skeleton className="h-32 w-full mb-6" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  if (!event) return null

  // Check if event has available tickets
  const hasAvailableTickets = tickets.some(t => t.quantityAvailable > t.quantitySold)
  const isEventPast = new Date(event.startDate) < new Date()

  // Name input step
  if (step === 'name') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Cover Image */}
        {event.coverImageUrl && (
          <div className="relative h-48 md:h-64 w-full overflow-hidden">
            <Image
              src={event.coverImageUrl}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        )}

        {/* Event Header */}
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{event.title}</h1>
          
          <div className="space-y-2 text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(event.startDate)}</span>
              {event.endDate && event.endDate !== event.startDate && (
                <span> - {formatDate(event.endDate)}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{formatTime(event.startTime)}</span>
              {event.endTime && (
                <span> - {formatTime(event.endTime)}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.venueName}, {event.city}</span>
            </div>
            {event.venueAddress && (
              <div className="text-sm text-gray-400 ml-6">
                {event.venueAddress}
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Name Input Form */}
          <NameInput
            eventTitle={event.title}
            onSubmit={handleNameSubmit}
          />
        </div>
      </div>
    )
  }

  // Ticket selection step
  if (step === 'ticket') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Cover Image */}
        {event.coverImageUrl && (
          <div className="relative h-32 md:h-40 w-full overflow-hidden">
            <Image
              src={event.coverImageUrl}
              alt={event.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-white text-xl md:text-2xl font-bold px-4 text-center">
                {event.title}
              </h1>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Welcome Message */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold mb-2">
              Hello, {attendeeName}!
            </h2>
            <p className="text-gray-500">
              Select your ticket type and quantity below
            </p>
          </div>

          {/* Ticket Selection Component */}
          <TicketSelector
            tickets={tickets}
            onSelect={handleTicketSelect}
          />

          {/* Back button */}
          <Button
            variant="ghost"
            className="mt-6 w-full"
            onClick={() => setStep('name')}
          >
            ← Back to Name Entry
          </Button>
        </div>
      </div>
    )
  }

  // Success step (QR code download)
  if (step === 'success' && orderId) {
    // Redirect to ticket page
    router.push(`/ticket/${orderId}`)
    return null
  }

  // Fallback
  return null
}