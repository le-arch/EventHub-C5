/**
 * Attendee Types
 * 
 * Type definitions for attendees who purchase tickets.
 * 
 * @module AttendeeTypes
 */

import { TicketType } from './event'
import { Order } from './order'

// Core Attendee Interface
export interface Attendee {
  id: string
  name: string
  phone: string
  email?: string
  ticketType: string
  ticketTypeId: string
  quantity: number
  unitPrice: number
  totalPaid: number
  checkedIn: boolean
  checkedInAt: string | null
  purchasedAt: string
  orderId: string
  eventId: string
  qrCodeUrl?: string
}

// Attendee with Full Details
export interface AttendeeDetails extends Attendee {
  eventTitle: string
  eventDate: string
  eventVenue: string
  organizerName: string
  organizerEmail: string
  ticketTypeDetails: TicketType
  orderDetails: Order
}

// Attendee List Response
export interface AttendeeListResponse {
  attendees: Attendee[]
  total: number
  page: number
  limit: number
  totalPages: number
  summary: AttendeeSummary
}

// Attendee Summary Statistics
export interface AttendeeSummary {
  totalAttendees: number
  checkedInCount: number
  notCheckedInCount: number
  checkInPercentage: number
  totalRevenue: number
  ticketBreakdown: TicketBreakdown[]
}

// Ticket Breakdown for Summary
export interface TicketBreakdown {
  ticketType: string
  sold: number
  revenue: number
  percentage: number
}

// Check-in Request/Response
export interface CheckinRequest {
  qr_hash?: string
  ticket_id?: string
  event_id?: string
}

export interface CheckinResponse {
  success: boolean
  attendeeName: string
  ticketType: string
  checkedInAt: string
  message?: string
}

// Check-in History
export interface CheckinHistory {
  id: string
  attendeeName: string
  ticketType: string
  checkedInAt: string
  scannedBy: string
  scannerName: string
}

// Export Formats
export type ExportFormat = 'csv' | 'excel' | 'pdf'

// Attendee Filter Options
export interface AttendeeFilters {
  ticketType?: string
  checkInStatus?: 'all' | 'checked_in' | 'not_checked'
  dateFrom?: string
  dateTo?: string
  search?: string
}