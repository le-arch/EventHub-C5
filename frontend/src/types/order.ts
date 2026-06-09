/**
 * Order Types
 * 
 * Type definitions for ticket orders and purchases.
 * 
 * @module OrderTypes
 */

import { Event } from './event'
import { TicketType } from './event'
import { Attendee } from './attendee'

// Payment Status Enum
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

// Payment Method Enum
export type PaymentMethod = 'mtn_momo' | 'orange_money'

// Core Order Interface
export interface Order {
  id: string
  eventId: string
  ticketTypeId: string
  attendeeId?: string
  attendeeName: string
  attendeePhone: string
  attendeeEmail?: string
  quantity: number
  unitPrice: number
  totalAmount: number
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  transactionId: string | null
  paymentReceivedAt: string | null
  qrCodeHash: string
  qrCodeImageUrl: string | null
  isUsed: boolean
  usedAt: string | null
  checkedInBy: string | null
  createdAt: string
  updatedAt: string
}

// Order with Related Data
export interface OrderDetails extends Order {
  event: Event
  ticketType: TicketType
  attendee?: Attendee
  checkedInByName?: string
}

// Create Order Request
export interface CreateOrderRequest {
  event_id: string
  ticket_type_id: string
  attendee_name: string
  attendee_phone: string
  attendee_email?: string
  quantity: number
  payment_method: PaymentMethod
}

// Order List Response
export interface OrderListResponse {
  orders: Order[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Order Summary for Receipt
export interface OrderSummary {
  orderId: string
  eventTitle: string
  eventDate: string
  eventVenue: string
  attendeeName: string
  ticketType: string
  quantity: number
  unitPrice: number
  totalAmount: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  purchaseDate: string
  qrCodeUrl: string
}

// Order Status Update
export interface OrderStatusUpdate {
  orderId: string
  status: PaymentStatus
  transactionId?: string
  reason?: string
}