/**
 * Event Types
 * 
 * Type definitions for events, ticket types, and event management.
 * 
 * @module EventTypes
 */

// Event Status Enum
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'

// Core Event Interface
export interface Event {
  id: string
  organizerId: string
  organizerName?: string
  title: string
  slug: string
  description: string | null
  venueName: string
  venueAddress: string | null
  city: string
  startDate: string
  endDate: string | null
  startTime: string
  endTime: string | null
  coverImageUrl: string | null
  status: EventStatus
  salesStartDate: string | null
  salesEndDate: string | null
  ticketStats: TicketStats
  createdAt: string
  updatedAt: string
}

// Ticket Statistics
export interface TicketStats {
  totalSold: number
  totalRevenue: number
  totalAttendees: number
  availableTickets: number
}

// Ticket Type Interface
export interface TicketType {
  id: string
  eventId: string
  name: string
  description: string | null
  price: number
  quantityAvailable: number
  quantitySold: number
  salesStart: string | null
  salesEnd: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Create Event Data
export interface CreateEventData {
  title: string
  description?: string
  venueName: string
  venueAddress?: string
  city: string
  startDate: string
  startTime: string
  endDate?: string
  endTime?: string
  coverImage?: File
  ticketTypes: Omit<TicketType, 'id' | 'quantitySold' | 'createdAt' | 'updatedAt'>[]
}

// Update Event Data
export interface UpdateEventData extends Partial<CreateEventData> {
  status?: EventStatus
}

// Event List Response
export interface EventListResponse {
  events: Event[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Event Analytics
export interface EventAnalytics {
  totalTickets: number
  totalRevenue: number
  checkinCount: number
  checkinPercentage: number
  dailySales: DailySalesData[]
  ticketBreakdown: TicketBreakdownData[]
  recentCheckins: RecentCheckinData[]
}

export interface DailySalesData {
  date: string
  tickets: number
  revenue: number
}

export interface TicketBreakdownData {
  name: string
  sold: number
  revenue: number
  percentage: number
}

export interface RecentCheckinData {
  attendeeName: string
  ticketType: string
  checkedInAt: string
}

// Event Status Configuration
export interface EventStatusConfig {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
  description: string
  allowedActions: string[]
}

// Event Filter Options
export interface EventFilters {
  status?: EventStatus
  city?: string
  startDate?: string
  endDate?: string
  search?: string
}