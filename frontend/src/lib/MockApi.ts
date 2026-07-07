/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosResponse, AxiosRequestConfig } from 'axios'

const MOCK_DELAY = 200
const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=450&fit=crop',
]
let mockImageIndex = 0
const delay = (ms = MOCK_DELAY) => new Promise<void>(resolve => setTimeout(resolve, ms))

function mockResponse<T>(data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Created',
    headers: {},
    config: {} as AxiosRequestConfig,
  }
}

function makeError(status: number, message: string) {
  return {
    response: {
      status,
      data: { error: message },
    },
  }
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const now = new Date()
const today = now.toISOString().split('T')[0]

const mockUsers = [
  {
    id: 'usr_001',
    email: 'admin@example.com',
    phone: '237670000001',
    fullName: 'Admin User',
    role: 'admin' as const,
    isEmailVerified: true,
    permissions: ['manage_users', 'manage_events', 'manage_transactions', 'view_logs', 'manage_settings'],
    createdAt: '2025-01-15T08:00:00.000Z',
    updatedAt: now.toISOString(),
    lastLoginAt: now.toISOString(),
  },
  {
    id: 'usr_002',
    email: 'organizer@example.com',
    phone: '237670000002',
    fullName: 'Alice Kamga',
    role: 'organizer' as const,
    isEmailVerified: true,
    organizationName: 'Kamga Events',
    organizationWebsite: 'https://kamga-events.cm',
    bio: 'Professional event organizer based in Douala.',
    totalEvents: 12,
    totalAttendees: 3450,
    totalRevenue: 15600000,
    socialLinks: { facebook: '#', twitter: '#', instagram: '#' },
    createdAt: '2025-02-01T10:00:00.000Z',
    updatedAt: now.toISOString(),
    lastLoginAt: now.toISOString(),
  },
  {
    id: 'usr_003',
    email: 'organizer2@example.com',
    phone: '237670000003',
    fullName: 'Boris Nkwi',
    role: 'organizer' as const,
    isEmailVerified: true,
    organizationName: 'Boris Prod',
    totalEvents: 5,
    totalAttendees: 890,
    totalRevenue: 4200000,
    createdAt: '2025-03-10T09:00:00.000Z',
    updatedAt: now.toISOString(),
  },
  {
    id: 'usr_004',
    email: 'unverified@example.com',
    phone: '237670000004',
    fullName: 'Unverified User',
    role: 'organizer' as const,
    isEmailVerified: false,
    createdAt: '2025-06-01T12:00:00.000Z',
    updatedAt: now.toISOString(),
  },
]

const mockEvents = [
  {
    id: 'evt_001',
    organizerId: 'usr_002',
    organizerName: 'Alice Kamga',
    title: 'Douala Music Fest 2025',
    slug: 'douala-music-fest-2025',
    description: 'The biggest music festival in Douala featuring top African artists, live performances, and cultural exhibitions.',
    venue: 'Douala Conference Centre',
    city: 'Douala',
    startDate: '2025-08-15',
    endDate: '2025-08-17',
    startTime: '14:00',
    endTime: '23:59',
    coverImageUrl: '',
    status: 'published' as const,
    salesStartDate: '2025-06-01',
    salesEndDate: '2025-08-14',
    ticketStats: { totalSold: 1240, totalRevenue: 9480000, totalAttendees: 1100, availableTickets: 760 },
    capacityRange: { lower: 500, upper: 2000 },
    createdAt: '2025-05-01T08:00:00.000Z',
    updatedAt: '2025-06-15T10:00:00.000Z',
  },
  {
    id: 'evt_002',
    organizerId: 'usr_002',
    organizerName: 'Alice Kamga',
    title: 'Yaoundé Tech Summit',
    slug: 'yaounde-tech-summit-2025',
    description: 'Annual technology conference bringing together innovators, startups, and investors from across Central Africa.',
    venue: 'Yaoundé Convention Centre',
    city: 'Yaoundé',
    startDate: '2025-09-20',
    endDate: '2025-09-21',
    startTime: '09:00',
    endTime: '18:00',
    coverImageUrl: '',
    status: 'published' as const,
    salesStartDate: '2025-07-01',
    salesEndDate: '2025-09-19',
    ticketStats: { totalSold: 680, totalRevenue: 5100000, totalAttendees: 620, availableTickets: 320 },
    capacityRange: { lower: 200, upper: 1000 },
    createdAt: '2025-06-01T08:00:00.000Z',
    updatedAt: '2025-07-10T12:00:00.000Z',
  },
  {
    id: 'evt_003',
    organizerId: 'usr_002',
    organizerName: 'Alice Kamga',
    title: 'Buea Art Exhibition',
    slug: 'buea-art-exhibition-2025',
    description: 'Showcasing contemporary art from Cameroonian artists across painting, sculpture, and digital media.',
    venue: 'Buea Cultural Center',
    city: 'Buea',
    startDate: '2025-10-05',
    endDate: null,
    startTime: '10:00',
    endTime: '20:00',
    coverImageUrl: '',
    status: 'draft' as const,
    salesStartDate: null,
    salesEndDate: null,
    ticketStats: { totalSold: 0, totalRevenue: 0, totalAttendees: 0, availableTickets: 300 },
    capacityRange: { lower: 50, upper: 300 },
    createdAt: '2025-07-20T14:00:00.000Z',
    updatedAt: '2025-07-20T14:00:00.000Z',
  },
  {
    id: 'evt_004',
    organizerId: 'usr_003',
    organizerName: 'Boris Nkwi',
    title: 'Kribi Beach Party',
    slug: 'kribi-beach-party-2025',
    description: 'A weekend of music, dancing, and fun at the beautiful Kribi beach.',
    venue: 'Kribi Public Beach',
    city: 'Kribi',
    startDate: '2025-08-30',
    endDate: '2025-08-31',
    startTime: '12:00',
    endTime: '23:00',
    coverImageUrl: '',
    status: 'published' as const,
    salesStartDate: '2025-07-01',
    salesEndDate: '2025-08-29',
    ticketStats: { totalSold: 340, totalRevenue: 1700000, totalAttendees: 310, availableTickets: 160 },
    capacityRange: { lower: 100, upper: 500 },
    createdAt: '2025-06-15T09:00:00.000Z',
    updatedAt: '2025-07-05T11:00:00.000Z',
  },
  {
    id: 'evt_005',
    organizerId: 'usr_002',
    organizerName: 'Alice Kamga',
    title: 'Douala Food Festival',
    slug: 'douala-food-festival-2025',
    description: 'Taste the best of Cameroonian cuisine with cooking competitions, tasting sessions, and live demonstrations.',
    venue: 'Douala City Square',
    city: 'Douala',
    startDate: '2025-11-10',
    endDate: '2025-11-12',
    startTime: '11:00',
    endTime: '22:00',
    coverImageUrl: '',
    status: 'draft' as const,
    salesStartDate: null,
    salesEndDate: null,
    ticketStats: { totalSold: 0, totalRevenue: 0, totalAttendees: 0, availableTickets: 1000 },
    capacityRange: { lower: 200, upper: 1000 },
    createdAt: '2025-08-01T08:00:00.000Z',
    updatedAt: '2025-08-01T08:00:00.000Z',
  },
  {
    id: 'evt_006',
    organizerId: 'usr_003',
    organizerName: 'Boris Nkwi',
    title: 'Garoua Horse Racing Cup',
    slug: 'garoua-horse-racing-cup-2025',
    description: 'Annual horse racing competition with participants from across the region.',
    venue: 'Garoua Racetrack',
    city: 'Garoua',
    startDate: '2025-12-05',
    endDate: null,
    startTime: '08:00',
    endTime: '17:00',
    coverImageUrl: null,
    status: 'cancelled' as const,
    salesStartDate: null,
    salesEndDate: null,
    ticketStats: { totalSold: 0, totalRevenue: 0, totalAttendees: 0, availableTickets: 500 },
    capacityRange: { lower: 100, upper: 500 },
    createdAt: '2025-07-01T10:00:00.000Z',
    updatedAt: '2025-07-15T16:00:00.000Z',
  },
]

const mockTicketTypes: Record<string, any[]> = {
  evt_001: [
    { id: 'tkt_001', eventId: 'evt_001', name: 'General Admission', description: 'Standard entry to all performance stages', price: 5000, quantityAvailable: 1000, quantitySold: 700, salesStart: null, salesEnd: null, isActive: true, createdAt: '2025-05-01T08:00:00.000Z', updatedAt: '2025-05-01T08:00:00.000Z' },
    { id: 'tkt_002', eventId: 'evt_001', name: 'VIP Pass', description: 'Includes backstage access and complimentary drinks', price: 15000, quantityAvailable: 300, quantitySold: 250, salesStart: null, salesEnd: null, isActive: true, createdAt: '2025-05-01T08:00:00.000Z', updatedAt: '2025-05-01T08:00:00.000Z' },
    { id: 'tkt_003', eventId: 'evt_001', name: 'VVIP Gold', description: 'Premium seating, meet & greet with artists', price: 35000, quantityAvailable: 100, quantitySold: 90, salesStart: null, salesEnd: null, isActive: true, createdAt: '2025-05-01T08:00:00.000Z', updatedAt: '2025-05-01T08:00:00.000Z' },
  ],
  evt_002: [
    { id: 'tkt_004', eventId: 'evt_002', name: 'Standard', description: 'Full access to all talks and workshops', price: 10000, quantityAvailable: 500, quantitySold: 380, salesStart: null, salesEnd: null, isActive: true, createdAt: '2025-06-01T08:00:00.000Z', updatedAt: '2025-06-01T08:00:00.000Z' },
    { id: 'tkt_005', eventId: 'evt_002', name: 'Student', description: 'Discounted entry for students (valid ID required)', price: 5000, quantityAvailable: 300, quantitySold: 200, salesStart: null, salesEnd: null, isActive: true, createdAt: '2025-06-01T08:00:00.000Z', updatedAt: '2025-06-01T08:00:00.000Z' },
    { id: 'tkt_006', eventId: 'evt_002', name: 'Corporate', description: 'Includes networking dinner and premium seating', price: 25000, quantityAvailable: 100, quantitySold: 60, salesStart: null, salesEnd: null, isActive: true, createdAt: '2025-06-01T08:00:00.000Z', updatedAt: '2025-06-01T08:00:00.000Z' },
  ],
  evt_004: [
    { id: 'tkt_007', eventId: 'evt_004', name: 'Single Day', description: 'Entry for one day', price: 3000, quantityAvailable: 300, quantitySold: 200, salesStart: null, salesEnd: null, isActive: true, createdAt: '2025-06-15T09:00:00.000Z', updatedAt: '2025-06-15T09:00:00.000Z' },
    { id: 'tkt_008', eventId: 'evt_004', name: 'Weekend Pass', description: 'Entry for both days', price: 5000, quantityAvailable: 200, quantitySold: 140, salesStart: null, salesEnd: null, isActive: true, createdAt: '2025-06-15T09:00:00.000Z', updatedAt: '2025-06-15T09:00:00.000Z' },
  ],
}

const mockAttendees = [
  { id: 'att_001', name: 'Jean-Pierre Mbida', phone: '237691234567', email: 'jp@example.com', ticketType: 'General Admission', ticketTypeId: 'tkt_001', quantity: 2, unitPrice: 5000, totalPaid: 10000, checkedIn: true, checkedInAt: '2025-02-15T10:30:00.000Z', purchasedAt: '2025-02-01T08:00:00.000Z', orderId: 'ord_001', eventId: 'evt_001' },
  { id: 'att_002', name: 'Marie Nganou', phone: '237698765432', email: 'marie@example.com', ticketType: 'VIP Pass', ticketTypeId: 'tkt_002', quantity: 1, unitPrice: 15000, totalPaid: 15000, checkedIn: false, checkedInAt: null, purchasedAt: '2025-02-05T10:00:00.000Z', orderId: 'ord_002', eventId: 'evt_001' },
  { id: 'att_003', name: 'Paul Biya Jr', phone: '237677777777', email: 'paul@example.com', ticketType: 'General Admission', ticketTypeId: 'tkt_001', quantity: 3, unitPrice: 5000, totalPaid: 15000, checkedIn: true, checkedInAt: '2025-02-15T11:00:00.000Z', purchasedAt: '2025-01-20T14:00:00.000Z', orderId: 'ord_003', eventId: 'evt_001' },
  { id: 'att_004', name: 'Esther Tchinda', phone: '237655443322', email: 'esther@example.com', ticketType: 'VVIP Gold', ticketTypeId: 'tkt_003', quantity: 1, unitPrice: 35000, totalPaid: 35000, checkedIn: true, checkedInAt: '2025-02-15T09:15:00.000Z', purchasedAt: '2025-01-10T12:00:00.000Z', orderId: 'ord_004', eventId: 'evt_001' },
  { id: 'att_005', name: 'Samuel Foe', phone: '237612345678', email: 'sam@example.com', ticketType: 'General Admission', ticketTypeId: 'tkt_001', quantity: 1, unitPrice: 5000, totalPaid: 5000, checkedIn: false, checkedInAt: null, purchasedAt: '2025-02-10T09:00:00.000Z', orderId: 'ord_005', eventId: 'evt_001' },
  { id: 'att_006', name: 'Christine Eyanga', phone: '237689876543', email: 'chris@example.com', ticketType: 'Standard', ticketTypeId: 'tkt_004', quantity: 2, unitPrice: 10000, totalPaid: 20000, checkedIn: true, checkedInAt: '2025-04-10T09:30:00.000Z', purchasedAt: '2025-03-15T11:00:00.000Z', orderId: 'ord_006', eventId: 'evt_002' },
  { id: 'att_007', name: 'David Kemajou', phone: '237670011223', email: 'david@example.com', ticketType: 'Student', ticketTypeId: 'tkt_005', quantity: 1, unitPrice: 5000, totalPaid: 5000, checkedIn: false, checkedInAt: null, purchasedAt: '2025-03-20T15:00:00.000Z', orderId: 'ord_007', eventId: 'evt_002' },
  { id: 'att_008', name: 'Francois Nkwi', phone: '237692233445', email: 'francois@example.com', ticketType: 'Single Day', ticketTypeId: 'tkt_007', quantity: 2, unitPrice: 3000, totalPaid: 6000, checkedIn: true, checkedInAt: '2025-03-22T12:00:00.000Z', purchasedAt: '2025-03-01T10:00:00.000Z', orderId: 'ord_008', eventId: 'evt_004' },
]

const mockCheckins = [
  { id: 'chk_001', attendeeName: 'Jean-Pierre Mbida', ticketType: 'General Admission', checkedInAt: '2025-02-15T10:30:00.000Z', scannedBy: 'usr_002', scannerName: 'Alice Kamga' },
  { id: 'chk_002', attendeeName: 'Paul Biya Jr', ticketType: 'General Admission', checkedInAt: '2025-02-15T11:00:00.000Z', scannedBy: 'usr_002', scannerName: 'Alice Kamga' },
  { id: 'chk_003', attendeeName: 'Esther Tchinda', ticketType: 'VVIP Gold', checkedInAt: '2025-02-15T09:15:00.000Z', scannedBy: 'usr_002', scannerName: 'Alice Kamga' },
  { id: 'chk_004', attendeeName: 'Christine Eyanga', ticketType: 'Standard', checkedInAt: '2025-04-10T09:30:00.000Z', scannedBy: 'usr_002', scannerName: 'Alice Kamga' },
  { id: 'chk_005', attendeeName: 'Francois Nkwi', ticketType: 'Single Day', checkedInAt: '2025-03-22T12:00:00.000Z', scannedBy: 'usr_003', scannerName: 'Boris Nkwi' },
]

const mockOrders = [
  { id: 'ord_001', eventId: 'evt_001', ticketTypeId: 'tkt_001', attendeeName: 'Jean-Pierre Mbida', attendeePhone: '237691234567', attendeeEmail: 'jp@example.com', quantity: 2, unitPrice: 5000, totalAmount: 10000, paymentStatus: 'paid', paymentMethod: 'mtn_momo', transactionId: 'txn_001', paymentReceivedAt: '2025-02-01T08:05:00.000Z', qrCodeHash: 'qr_abc123', qrCodeImageUrl: null, isUsed: true, usedAt: '2025-02-15T10:30:00.000Z', checkedInBy: 'usr_002', createdAt: '2025-02-01T08:00:00.000Z', updatedAt: '2025-02-15T10:30:00.000Z' },
  { id: 'ord_002', eventId: 'evt_001', ticketTypeId: 'tkt_002', attendeeName: 'Marie Nganou', attendeePhone: '237698765432', attendeeEmail: 'marie@example.com', quantity: 1, unitPrice: 15000, totalAmount: 15000, paymentStatus: 'paid', paymentMethod: 'orange_money', transactionId: 'txn_002', paymentReceivedAt: '2025-02-05T10:05:00.000Z', qrCodeHash: 'qr_def456', qrCodeImageUrl: null, isUsed: false, usedAt: null, checkedInBy: null, createdAt: '2025-02-05T10:00:00.000Z', updatedAt: '2025-02-05T10:05:00.000Z' },
  { id: 'ord_003', eventId: 'evt_001', ticketTypeId: 'tkt_001', attendeeName: 'Paul Biya Jr', attendeePhone: '237677777777', attendeeEmail: 'paul@example.com', quantity: 3, unitPrice: 5000, totalAmount: 15000, paymentStatus: 'paid', paymentMethod: 'mtn_momo', transactionId: 'txn_003', paymentReceivedAt: '2025-01-20T14:05:00.000Z', qrCodeHash: 'qr_ghi789', qrCodeImageUrl: null, isUsed: true, usedAt: '2025-02-15T11:00:00.000Z', checkedInBy: 'usr_002', createdAt: '2025-01-20T14:00:00.000Z', updatedAt: '2025-02-15T11:00:00.000Z' },
]

const mockTransactions = [
  { id: 'txn_001', transactionId: 'MTN250215001', orderId: 'ord_001', amount: 10000, currency: 'XAF', provider: 'mtn_momo', status: 'paid', phoneNumber: '237691234567', reference: 'REF-001', createdAt: '2025-02-01T08:05:00.000Z', completedAt: '2025-02-01T08:06:00.000Z' },
  { id: 'txn_002', transactionId: 'OM250205001', orderId: 'ord_002', amount: 15000, currency: 'XAF', provider: 'orange_money', status: 'paid', phoneNumber: '237698765432', reference: 'REF-002', createdAt: '2025-02-05T10:05:00.000Z', completedAt: '2025-02-05T10:06:00.000Z' },
  { id: 'txn_003', transactionId: 'MTN250120001', orderId: 'ord_003', amount: 15000, currency: 'XAF', provider: 'mtn_momo', status: 'paid', phoneNumber: '237677777777', reference: 'REF-003', createdAt: '2025-01-20T14:05:00.000Z', completedAt: '2025-01-20T14:06:00.000Z' },
]

const mockLogs = [
  { id: 'log_001', action: 'User login', userId: 'usr_001', userName: 'Admin User', details: 'Admin logged in from 127.0.0.1', ipAddress: '127.0.0.1', createdAt: '2025-07-05T08:00:00.000Z' },
  { id: 'log_002', action: 'Event created', userId: 'usr_002', userName: 'Alice Kamga', details: 'Created event "Douala Food Festival"', ipAddress: '127.0.0.1', createdAt: '2025-07-04T14:30:00.000Z' },
  { id: 'log_003', action: 'User suspended', userId: 'usr_001', userName: 'Admin User', details: 'Suspended user usr_004', ipAddress: '127.0.0.1', createdAt: '2025-07-03T11:00:00.000Z' },
  { id: 'log_004', action: 'Ticket purchased', userId: 'usr_002', userName: 'Alice Kamga', details: 'Order ord_001 for 2x General Admission', ipAddress: '127.0.0.1', createdAt: '2025-07-02T16:45:00.000Z' },
  { id: 'log_005', action: 'Payment processed', userId: null, userName: 'System', details: 'MTN Momo payment REF-001 settled', ipAddress: null, createdAt: '2025-07-02T16:46:00.000Z' },
  { id: 'log_006', action: 'Check-in', userId: 'usr_002', userName: 'Alice Kamga', details: 'Checked in att_001 (Jean-Pierre Mbida)', ipAddress: '127.0.0.1', createdAt: '2025-07-01T10:30:00.000Z' },
  { id: 'log_007', action: 'Event published', userId: 'usr_002', userName: 'Alice Kamga', details: 'Published event "Yaoundé Tech Summit"', ipAddress: '127.0.0.1', createdAt: '2025-06-15T09:00:00.000Z' },
  { id: 'log_008', action: 'User registered', userId: 'usr_004', userName: 'Unverified User', details: 'New organizer registration', ipAddress: '127.0.0.1', createdAt: '2025-06-01T12:00:00.000Z' },
]

function makeDailySales(baseDate: Date, days: number) {
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(baseDate)
    d.setDate(d.getDate() - i)
    result.push({
      date: d.toISOString().split('T')[0],
      tickets: Math.floor(Math.random() * 50) + 5,
      revenue: Math.floor(Math.random() * 400000) + 25000,
    })
  }
  return result
}

const mockAnalytics = {
  evt_001: {
    totalTickets: 2000,
    totalRevenue: 9480000,
    checkinCount: 3,
    checkinPercentage: 37.5,
    dailySales: makeDailySales(new Date('2025-08-15'), 30),
    ticketBreakdown: [
      { name: 'General Admission', sold: 700, revenue: 3500000, percentage: 56.5 },
      { name: 'VIP Pass', sold: 250, revenue: 3750000, percentage: 20.2 },
      { name: 'VVIP Gold', sold: 90, revenue: 3150000, percentage: 7.3 },
    ],
    recentCheckins: [
      { attendeeName: 'Jean-Pierre Mbida', ticketType: 'General Admission', checkedInAt: '2025-08-15T10:30:00.000Z' },
      { attendeeName: 'Paul Biya Jr', ticketType: 'General Admission', checkedInAt: '2025-08-15T11:00:00.000Z' },
      { attendeeName: 'Esther Tchinda', ticketType: 'VVIP Gold', checkedInAt: '2025-08-15T09:15:00.000Z' },
    ],
  },
  evt_002: {
    totalTickets: 1000,
    totalRevenue: 5100000,
    checkinCount: 1,
    checkinPercentage: 25,
    dailySales: makeDailySales(new Date('2025-09-20'), 14),
    ticketBreakdown: [
      { name: 'Standard', sold: 380, revenue: 3800000, percentage: 74.5 },
      { name: 'Student', sold: 200, revenue: 1000000, percentage: 19.6 },
      { name: 'Corporate', sold: 60, revenue: 1500000, percentage: 5.9 },
    ],
    recentCheckins: [
      { attendeeName: 'Christine Eyanga', ticketType: 'Standard', checkedInAt: '2025-09-20T09:30:00.000Z' },
    ],
  },
  evt_004: {
    totalTickets: 500,
    totalRevenue: 1700000,
    checkinCount: 1,
    checkinPercentage: 50,
    dailySales: makeDailySales(new Date('2025-08-30'), 7),
    ticketBreakdown: [
      { name: 'Single Day', sold: 200, revenue: 600000, percentage: 58.8 },
      { name: 'Weekend Pass', sold: 140, revenue: 700000, percentage: 41.2 },
    ],
    recentCheckins: [
      { attendeeName: 'Francois Nkwi', ticketType: 'Single Day', checkedInAt: '2025-08-30T12:00:00.000Z' },
    ],
  },
}

// ─── URL helpers ─────────────────────────────────────────────────────────────

function matchUrl(url: string, pattern: string): boolean {
  const regex = new RegExp('^' + pattern.replace(/:\w+/g, '([^/]+)') + '$')
  return regex.test(url)
}

function extractParams(url: string, pattern: string): Record<string, string> {
  const regex = new RegExp('^' + pattern.replace(/:\w+/g, '([^/]+)') + '$')
  const match = url.match(regex)
  const paramNames = (pattern.match(/:\w+/g) || []).map(p => p.slice(1))
  if (!match) return {}
  const params: Record<string, string> = {}
  paramNames.forEach((name, i) => { params[name] = match[i + 1] })
  return params
}

// ─── Mock handler ────────────────────────────────────────────────────────────

function handleRequest(method: string, url: string, data?: any, config?: any) {
  // Strip leading / and base path
  const cleanUrl = url.replace(/^\/+/, '')
  // Normalise: remove query string for matching
  const pathOnly = cleanUrl.split('?')[0]

  switch (method) {
    // ── Auth ─────────────────────────────────────────────────────────────
    case 'post': {
      if (pathOnly === 'auth/login') {
        const { email, password_hash } = data || {}
        const user = email?.includes('admin')
          ? mockUsers[0]
          : email?.includes('unverified')
            ? mockUsers[3]
            : mockUsers[1]

        if (email && !mockUsers.find(u => u.email === email)) {
          throw makeError(401, 'Invalid email or password')
        }
        if (password_hash && password_hash.length < 4) {
          throw makeError(401, 'Invalid email or password')
        }

        return mockResponse({
          message: 'Login successful',
          user: {
            token: 'mock_access_token_' + user.id,
            refreshToken: 'mock_refresh_token_' + user.id,
            user: {
              id: user.id,
              fullName: (user as any).fullName,
              email: user.email,
              phone: user.phone,
              role: user.role,
              isEmailVerified: user.isEmailVerified,
              createdAt: user.createdAt,
            },
          },
        })
      }

      if (pathOnly === 'auth/register') {
        const body = data || {}
        return mockResponse({ message: 'Registration successful. Please verify your email.' })
      }

      if (pathOnly === 'auth/verify-otp') {
        return mockResponse({
          token: 'mock_access_token_usr_new',
          refreshToken: 'mock_refresh_token_usr_new',
          user: {
            id: 'usr_new',
            fullName: 'New User',
            email: data?.email || '',
            phone: '237670000000',
            role: 'organizer',
            isEmailVerified: true,
          },
        })
      }

      if (pathOnly === 'auth/resend-otp') {
        return mockResponse({ message: 'OTP resent successfully' })
      }

      if (pathOnly === 'auth/forgot-password') {
        return mockResponse({ message: 'Password reset email sent' })
      }

      if (pathOnly === 'auth/reset-password') {
        return mockResponse({ message: 'Password reset successful' })
      }

      if (pathOnly === 'auth/logout') {
        return mockResponse({ message: 'Logged out successfully' })
      }

      if (pathOnly === 'auth/refresh-token') {
        return mockResponse({
          token: 'mock_new_access_token',
          refreshToken: 'mock_new_refresh_token',
          user: {
            id: 'usr_001',
            fullName: 'Admin User',
            email: 'admin@example.com',
            phone: '237670000001',
            role: 'admin',
            isEmailVerified: true,
          },
        })
      }

      if (pathOnly === 'admin/users/batch-verify') {
        return mockResponse({ message: 'Users verified successfully' })
      }

      if (pathOnly === 'admin/users/batch-suspend') {
        return mockResponse({ message: 'Users suspended successfully' })
      }

      // POST /orders
      if (pathOnly === 'orders') {
        const body = data || {}
        const newOrder = {
          id: 'ord_' + Date.now(),
          eventId: body.event_id || 'evt_001',
          ticketTypeId: body.ticket_type_id || 'tkt_001',
          attendeeName: body.attendee_name || 'Test Buyer',
          attendeePhone: body.attendee_phone || '237670000000',
          attendeeEmail: body.attendee_email || 'buyer@example.com',
          quantity: body.quantity || 1,
          unitPrice: 5000,
          totalAmount: (body.quantity || 1) * 5000,
          paymentStatus: 'pending',
          paymentMethod: body.payment_method || 'mtn_momo',
          transactionId: null,
          paymentReceivedAt: null,
          qrCodeHash: 'qr_' + Math.random().toString(36).substring(2, 10),
          qrCodeImageUrl: null,
          isUsed: false,
          usedAt: null,
          checkedInBy: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        return mockResponse(newOrder)
      }

      // POST /payments/mtn-momo (or orange_money)
      if (pathOnly.match(/^payments\/(mtn-momo|orange_money)$/)) {
        return mockResponse({
          success: true,
          transactionId: 'txn_' + Date.now(),
          reference: 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          status: 'paid',
          message: 'Payment processed successfully',
          providerReference: 'PROV_' + Math.random().toString(36).substring(2, 10),
        })
      }

      // POST /events/:eventId/ticket-types
      if (matchUrl(pathOnly, 'events/:eventId/ticket-types')) {
        const { eventId } = extractParams(pathOnly, 'events/:eventId/ticket-types')
        const body = data || {}
        const newType = {
          id: 'tkt_' + Date.now(),
          eventId,
          name: body.name || 'New Ticket',
          description: body.description || null,
          price: body.price || 0,
          quantityAvailable: body.quantity_available || 100,
          quantitySold: 0,
          salesStart: null,
          salesEnd: null,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        if (!mockTicketTypes[eventId]) mockTicketTypes[eventId] = []
        mockTicketTypes[eventId].push(newType)
        return mockResponse(newType)
      }

      // POST /events/upload-image
      if (pathOnly === 'events/upload-image') {
        const url = MOCK_IMAGES[mockImageIndex++ % MOCK_IMAGES.length]
        return mockResponse({ url })
      }

      // POST /events
      if (pathOnly === 'events') {
        const body = data || {}
        const newEvent = {
          id: 'evt_' + Date.now(),
          organizerId: 'usr_002',
          organizerName: 'Alice Kamga',
          title: body.title || 'New Event',
          slug: body.slug || (body.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'new-event',
          description: body.description || null,
          venue: body.venue || '',
          city: body.city || '',
          startDate: body.start_date || today,
          endDate: body.end_date || null,
          startTime: body.start_time || '09:00',
          endTime: body.end_time || '18:00',
          coverImageUrl: body.cover_image_url || null,
          status: 'draft',
          ticketStats: { totalSold: 0, totalRevenue: 0, totalAttendees: 0, availableTickets: 0 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        mockEvents.unshift(newEvent as any)
        return mockResponse(newEvent)
      }

      // POST /events/:eventId/duplicate
      if (matchUrl(pathOnly, 'events/:eventId/duplicate')) {
        const { eventId } = extractParams(pathOnly, 'events/:eventId/duplicate')
        const original = mockEvents.find(e => e.id === eventId)
        if (!original) throw makeError(404, 'Event not found')
        const dup = {
          ...original,
          id: 'evt_' + Date.now(),
          title: original.title + ' (Copy)',
          slug: original.slug + '-copy-' + Date.now(),
          status: 'draft',
          ticketStats: { totalSold: 0, totalRevenue: 0, totalAttendees: 0, availableTickets: 0 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        mockEvents.unshift(dup as any)
        return mockResponse({ event: dup })
      }

      // POST /checkin
      if (pathOnly === 'checkin') {
        const body = data || {}
        const attendee = mockAttendees.find(a => a.eventId === (body.event_id || body.eventId))
        if (!attendee) throw makeError(404, 'Invalid or already used ticket')
        if (attendee.checkedIn) throw makeError(409, 'Ticket already used for check-in')

        attendee.checkedIn = true
        attendee.checkedInAt = new Date().toISOString()

        return mockResponse({
          attendee_name: attendee.name,
          ticket_type: attendee.ticketType,
          checked_in_at: attendee.checkedInAt,
        })
      }

      // POST /checkin/manual
      if (pathOnly === 'checkin/manual') {
        const body = data || {}
        const attendee = mockAttendees.find(a => a.id === (body.ticket_id || body.ticketId))
        if (!attendee) throw makeError(404, 'Invalid ticket ID')
        if (attendee.checkedIn) throw makeError(409, 'Ticket already used for check-in')

        attendee.checkedIn = true
        attendee.checkedInAt = new Date().toISOString()

        return mockResponse({
          attendee_name: attendee.name,
          ticket_type: attendee.ticketType,
          checked_in_at: attendee.checkedInAt,
        })
      }

      // POST /events/:eventId/checkin
      if (matchUrl(pathOnly, 'events/:eventId/checkin')) {
        const body = data || {}
        const attendee = mockAttendees.find(a => a.eventId === body.event_id || body.eventId)
        if (!attendee) throw makeError(404, 'Invalid or already used ticket')
        if (attendee.checkedIn) throw makeError(409, 'Ticket already used for check-in')

        attendee.checkedIn = true
        attendee.checkedInAt = new Date().toISOString()

        return mockResponse({
          success: true,
          attendee_name: attendee.name,
          ticket_type: attendee.ticketType,
          checked_in_at: attendee.checkedInAt,
        })
      }

      break
    }

    // ── GET ──────────────────────────────────────────────────────────────
    case 'get': {
      // GET /auth/me
      if (pathOnly === 'auth/me') {
        return mockResponse(mockUsers[1])
      }

      // GET /Organization/events (with optional params)
      if (pathOnly === 'Organization/events') {
        const params = config?.params || {}
        let filtered = [...mockEvents]
        if (params.search) {
          const s = params.search.toLowerCase()
          filtered = filtered.filter(e => e.title.toLowerCase().includes(s) || e.city.toLowerCase().includes(s))
        }
        if (params.status && params.status !== 'all') {
          filtered = filtered.filter(e => e.status === params.status)
        }
        const page = params.page || 1
        const limit = params.limit || 10
        const start = (page - 1) * limit
        const paged = filtered.slice(start, start + limit)
        return mockResponse(paged)
      }

      // GET /Organization/:id (single event)
      if (matchUrl(pathOnly, 'Organization/:id')) {
        const { id } = extractParams(pathOnly, 'Organization/:id')
        const event = mockEvents.find(e => e.id === id)
        if (!event) throw makeError(404, 'Event not found')
        return mockResponse(event)
      }

      // GET /events/:eventId
      if (matchUrl(pathOnly, 'events/:eventId')) {
        const { eventId } = extractParams(pathOnly, 'events/:eventId')
        const event = mockEvents.find(e => e.id === eventId)
        if (!event) throw makeError(404, 'Event not found')
        return mockResponse(event)
      }

      // GET /events/:eventId/ticket-types
      if (matchUrl(pathOnly, 'events/:eventId/ticket-types')) {
        const { eventId } = extractParams(pathOnly, 'events/:eventId/ticket-types')
        return mockResponse(mockTicketTypes[eventId] || [])
      }

      // GET /events/:eventId/attendees
      if (matchUrl(pathOnly, 'events/:eventId/attendees')) {
        const { eventId } = extractParams(pathOnly, 'events/:eventId/attendees')
        const params = config?.params || {}
        let filtered = mockAttendees.filter(a => a.eventId === eventId)
        if (params.search) {
          const s = params.search.toLowerCase()
          filtered = filtered.filter(a => a.name.toLowerCase().includes(s) || a.phone.includes(s))
        }
        if (params.ticketType && params.ticketType !== 'all') {
          filtered = filtered.filter(a => a.ticketType === params.ticketType)
        }
        if (params.checkedIn !== undefined) {
          filtered = filtered.filter(a => a.checkedIn === params.checkedIn)
        }
        const page = params.page || 1
        const limit = params.limit || 20
        const start = (page - 1) * limit
        const paged = filtered.slice(start, start + limit)
        return mockResponse({
          attendees: paged,
          total: filtered.length,
          page,
          limit,
          totalPages: Math.ceil(filtered.length / limit),
          summary: {
            totalAttendees: filtered.length,
            checkedInCount: filtered.filter(a => a.checkedIn).length,
            notCheckedInCount: filtered.filter(a => !a.checkedIn).length,
            checkInPercentage: filtered.length > 0 ? (filtered.filter(a => a.checkedIn).length / filtered.length) * 100 : 0,
            totalRevenue: filtered.reduce((s, a) => s + a.totalPaid, 0),
            ticketBreakdown: Object.entries(
              filtered.reduce((acc: Record<string, { sold: number; revenue: number }>, a) => {
                if (!acc[a.ticketType]) acc[a.ticketType] = { sold: 0, revenue: 0 }
                acc[a.ticketType].sold += a.quantity
                acc[a.ticketType].revenue += a.totalPaid
                return acc
              }, {})
            ).map(([name, vals], _, arr) => ({
              ticketType: name,
              ...vals,
              percentage: arr.reduce((t, [, v]) => t + v.revenue, 0) > 0
                ? (vals.revenue / arr.reduce((t, [, v]) => t + v.revenue, 0)) * 100
                : 0,
            })),
          },
        })
      }

      // GET /Organization/events/:eventId/attendees
      if (matchUrl(pathOnly, 'Organization/events/:eventId/attendees')) {
        const { eventId } = extractParams(pathOnly, 'Organization/events/:eventId/attendees')
        const params = config?.params || {}
        let filtered = mockAttendees.filter(a => a.eventId === eventId)
        if (params.search) {
          const s = params.search.toLowerCase()
          filtered = filtered.filter(a => a.name.toLowerCase().includes(s) || a.phone.includes(s))
        }
        const page = params.page || 1
        const limit = params.limit || 20
        const start = (page - 1) * limit
        return mockResponse({
          attendees: filtered.slice(start, start + limit),
          total: filtered.length,
        })
      }

      // GET /events/:eventId/analytics
      if (matchUrl(pathOnly, 'events/:eventId/analytics')) {
        const { eventId } = extractParams(pathOnly, 'events/:eventId/analytics')
        return mockResponse(mockAnalytics[eventId] || {
          totalTickets: 0,
          totalRevenue: 0,
          checkinCount: 0,
          checkinPercentage: 0,
          dailySales: [],
          ticketBreakdown: [],
          recentCheckins: [],
        })
      }

      // GET /events/:eventId/checkin-stats
      if (matchUrl(pathOnly, 'events/:eventId/checkin-stats')) {
        const { eventId } = extractParams(pathOnly, 'events/:eventId/checkin-stats')
        const event = mockEvents.find(e => e.id === eventId)
        const total = event?.ticketStats?.totalSold || 0
        const checked = mockAttendees.filter(a => a.eventId === eventId && a.checkedIn).length
        return mockResponse({
          checked_in: checked,
          total,
          percentage: total > 0 ? (checked / total) * 100 : 0,
        })
      }

      // GET /events/:eventId/recent-checkins
      if (matchUrl(pathOnly, 'events/:eventId/recent-checkins')) {
        const { eventId } = extractParams(pathOnly, 'events/:eventId/recent-checkins')
        const eventCheckins = mockCheckins.filter(c =>
          mockAttendees.some(a => a.eventId === eventId && a.name === c.attendeeName)
        )
        return mockResponse({ checkins: eventCheckins.slice(0, 20) })
      }

      // GET /events/:eventId/checkins/count
      if (matchUrl(pathOnly, 'events/:eventId/checkins/count')) {
        const { eventId } = extractParams(pathOnly, 'events/:eventId/checkins/count')
        const event = mockEvents.find(e => e.id === eventId)
        const total = event?.ticketStats?.totalSold || 0
        const checked = mockAttendees.filter(a => a.eventId === eventId && a.checkedIn).length
        return mockResponse({
          checked_in: checked,
          total,
          percentage: total > 0 ? (checked / total) * 100 : 0,
        })
      }

      // GET /events/:eventId/checkins/recent
      if (matchUrl(pathOnly, 'events/:eventId/checkins/recent')) {
        const { eventId } = extractParams(pathOnly, 'events/:eventId/checkins/recent')
        const eventCheckins = mockCheckins.filter(c =>
          mockAttendees.some(a => a.eventId === eventId && a.name === c.attendeeName)
        )
        return mockResponse(eventCheckins.slice(0, 10))
      }

      // GET /orders/:orderId
      if (matchUrl(pathOnly, 'orders/:orderId')) {
        const { orderId } = extractParams(pathOnly, 'orders/:orderId')
        const order = mockOrders.find(o => o.id === orderId)
        if (!order) throw makeError(404, 'Order not found')
        const event = mockEvents.find(e => e.id === order.eventId)!
        const ticketType = (mockTicketTypes[order.eventId] || []).find((t: any) => t.id === order.ticketTypeId)
        const attendee = mockAttendees.find(a => a.orderId === orderId)
        return mockResponse({
          ...order,
          event,
          ticketType,
          attendee,
        })
      }

      // GET /payments/status/:reference
      if (matchUrl(pathOnly, 'payments/status/:reference')) {
        return mockResponse({
          transactionId: 'txn_' + Date.now(),
          status: 'paid',
          amount: 5000,
          paidAt: new Date().toISOString(),
        })
      }

      // GET /admin/users
      if (pathOnly === 'admin/users') {
        const params = config?.params || {}
        let filtered = [...mockUsers]
        if (params.search) {
          const s = params.search.toLowerCase()
          filtered = filtered.filter(u => u.fullName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s))
        }
        if (params.status && params.status !== 'all') {
          filtered = filtered.filter(u =>
            params.status === 'verified' ? u.isEmailVerified : !u.isEmailVerified
          )
        }
        const page = params.page || 1
        const limit = params.limit || 10
        const start = (page - 1) * limit
        return mockResponse(filtered.slice(start, start + limit))
      }

      // GET /admin/users/:userId
      if (matchUrl(pathOnly, 'admin/users/:userId')) {
        const { userId } = extractParams(pathOnly, 'admin/users/:userId')
        const user = mockUsers.find(u => u.id === userId)
        if (!user) throw makeError(404, 'User not found')
        return mockResponse(user)
      }

      // GET /admin/events
      if (pathOnly === 'admin/events') {
        const params = config?.params || {}
        let filtered = [...mockEvents]
        if (params.search) {
          const s = params.search.toLowerCase()
          filtered = filtered.filter(e => e.title.toLowerCase().includes(s))
        }
        const page = params.page || 1
        const limit = params.limit || 10
        const start = (page - 1) * limit
        return mockResponse({
          events: filtered.slice(start, start + limit),
          total: filtered.length,
          page,
          limit,
          totalPages: Math.ceil(filtered.length / limit),
        })
      }

      // GET /admin/transactions
      if (pathOnly === 'admin/transactions') {
        const params = config?.params || {}
        const page = params.page || 1
        const limit = params.limit || 20
        const start = (page - 1) * limit
        return mockResponse({
          transactions: mockTransactions.slice(start, start + limit),
          total: mockTransactions.length,
          page,
          limit,
          totalPages: Math.ceil(mockTransactions.length / limit),
        })
      }

      // GET /admin/logs
      if (pathOnly === 'admin/logs') {
        const params = config?.params || {}
        const page = params.page || 1
        const limit = params.limit || 20
        const start = (page - 1) * limit
        return mockResponse({
          logs: mockLogs.slice(start, start + limit),
          total: mockLogs.length,
          page,
          limit,
          totalPages: Math.ceil(mockLogs.length / limit),
        })
      }

      // GET /events/:eventId/attendees/export
      if (matchUrl(pathOnly, 'events/:eventId/attendees/export')) {
        return mockResponse(new Blob(['name,email,phone,ticketType\nTest,test@example.com,237670000000,General'], { type: 'text/csv' }))
      }

      break
    }

    // ── PATCH ────────────────────────────────────────────────────────────
    case 'patch': {
      // PATCH /events/:id
      if (matchUrl(pathOnly, 'events/:id')) {
        const { id } = extractParams(pathOnly, 'events/:id')
        const idx = mockEvents.findIndex(e => e.id === id)
        if (idx === -1) throw makeError(404, 'Event not found')
        mockEvents[idx] = { ...mockEvents[idx], ...(data || {}), updatedAt: new Date().toISOString() } as any
        return mockResponse({
          eventDetails: mockEvents[idx],
        })
      }

      // PATCH /events/:id/publish
      if (matchUrl(pathOnly, 'events/:id/publish')) {
        const { id } = extractParams(pathOnly, 'events/:id')
        const idx = mockEvents.findIndex(e => e.id === id)
        if (idx === -1) throw makeError(404, 'Event not found')
        mockEvents[idx] = { ...mockEvents[idx], status: 'published', updatedAt: new Date().toISOString() } as any
        return mockResponse({ message: 'Event published' })
      }

      // PATCH /events/:id/unpublish
      if (matchUrl(pathOnly, 'events/:id/unpublish')) {
        const { id } = extractParams(pathOnly, 'events/:id')
        const idx = mockEvents.findIndex(e => e.id === id)
        if (idx === -1) throw makeError(404, 'Event not found')
        mockEvents[idx] = { ...mockEvents[idx], status: 'draft', updatedAt: new Date().toISOString() } as any
        return mockResponse({ message: 'Event unpublished' })
      }

      // PATCH /events/:eventId/ticket-types/:ticketId
      if (matchUrl(pathOnly, 'events/:eventId/ticket-types/:ticketId')) {
        const { eventId, ticketId } = extractParams(pathOnly, 'events/:eventId/ticket-types/:ticketId')
        const types = mockTicketTypes[eventId]
        if (!types) throw makeError(404, 'Ticket type not found')
        const idx = types.findIndex((t: any) => t.id === ticketId)
        if (idx === -1) throw makeError(404, 'Ticket type not found')
        types[idx] = { ...types[idx], ...(data || {}), updatedAt: new Date().toISOString() }
        return mockResponse(types[idx])
      }

      // PATCH /auth/me
      if (pathOnly === 'auth/me') {
        return mockResponse({
          ...mockUsers[1],
          ...(data || {}),
          updatedAt: new Date().toISOString(),
        })
      }

      // PATCH /admin/users/:userId
      if (matchUrl(pathOnly, 'admin/users/:userId')) {
        const { userId } = extractParams(pathOnly, 'admin/users/:userId')
        const idx = mockUsers.findIndex(u => u.id === userId)
        if (idx === -1) throw makeError(404, 'User not found')
        mockUsers[idx] = { ...mockUsers[idx], ...(data || {}), updatedAt: new Date().toISOString() } as any
        return mockResponse(mockUsers[idx])
      }

      break
    }

    // ── PUT ──────────────────────────────────────────────────────────────
    case 'put': {
      if (matchUrl(pathOnly, 'admin/users/:userId')) {
        const { userId } = extractParams(pathOnly, 'admin/users/:userId')
        const idx = mockUsers.findIndex(u => u.id === userId)
        if (idx === -1) throw makeError(404, 'User not found')
        mockUsers[idx] = { ...mockUsers[idx], ...(data || {}), updatedAt: new Date().toISOString() } as any
        return mockResponse(mockUsers[idx])
      }

      if (matchUrl(pathOnly, 'admin/users/:userId/verify')) {
        const { userId } = extractParams(pathOnly, 'admin/users/:userId/verify')
        const idx = mockUsers.findIndex(u => u.id === userId)
        if (idx === -1) throw makeError(404, 'User not found')
        mockUsers[idx].isEmailVerified = true
        return mockResponse({ message: 'User verified' })
      }

      if (matchUrl(pathOnly, 'admin/users/:userId/suspend')) {
        return mockResponse({ message: 'User suspended' })
      }

      if (matchUrl(pathOnly, 'admin/users/:userId/unsuspend')) {
        return mockResponse({ message: 'User unsuspended' })
      }

      break
    }

    // ── DELETE ───────────────────────────────────────────────────────────
    case 'delete': {
      if (matchUrl(pathOnly, 'events/:id')) {
        const { id } = extractParams(pathOnly, 'events/:id')
        const idx = mockEvents.findIndex(e => e.id === id)
        if (idx === -1) throw makeError(404, 'Event not found')
        mockEvents.splice(idx, 1)
        return mockResponse({ message: 'Event deleted' })
      }

      if (matchUrl(pathOnly, 'events/:eventId/ticket-types/:ticketId')) {
        const { eventId, ticketId } = extractParams(pathOnly, 'events/:eventId/ticket-types/:ticketId')
        if (mockTicketTypes[eventId]) {
          const idx = mockTicketTypes[eventId].findIndex((t: any) => t.id === ticketId)
          if (idx !== -1) mockTicketTypes[eventId].splice(idx, 1)
        }
        return mockResponse({ message: 'Ticket type deleted' })
      }

      if (matchUrl(pathOnly, 'admin/users/:userId')) {
        const { userId } = extractParams(pathOnly, 'admin/users/:userId')
        const idx = mockUsers.findIndex(u => u.id === userId)
        if (idx === -1) throw makeError(404, 'User not found')
        mockUsers.splice(idx, 1)
        return mockResponse({ message: 'User deleted' })
      }

      break
    }
  }

  throw makeError(404, `Mock endpoint not found: ${method} /${pathOnly}`)
}

// ─── Exported mock API client ────────────────────────────────────────────────

const mockApi = {
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    await delay()
    return handleRequest('get', url, undefined, config) as AxiosResponse<T>
  },
  post: async <T = any>(url: string, data?: any, _config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    await delay()
    return handleRequest('post', url, data) as AxiosResponse<T>
  },
  put: async <T = any>(url: string, data?: any, _config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    await delay()
    return handleRequest('put', url, data) as AxiosResponse<T>
  },
  patch: async <T = any>(url: string, data?: any, _config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    await delay()
    return handleRequest('patch', url, data) as AxiosResponse<T>
  },
  delete: async <T = any>(url: string, _config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    await delay()
    return handleRequest('delete', url) as AxiosResponse<T>
  },
  upload: async <T = any>(url: string, file: File, fieldName = 'file'): Promise<AxiosResponse<T>> => {
    await delay(500)
    const imageUrl = MOCK_IMAGES[mockImageIndex++ % MOCK_IMAGES.length]
    return mockResponse({ url: imageUrl } as T)
  },
}

export default mockApi

export const mockApiClient = {
  get: mockApi.get,
  post: mockApi.post,
  put: mockApi.put,
  patch: mockApi.patch,
  delete: mockApi.delete,
  upload: mockApi.upload,
}
