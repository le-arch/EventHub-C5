
// src/lib/api.ts (temporary mock version)
import { toast } from 'sonner';

// Helper to simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock responses keyed by endpoint pattern
const mockResponses: Record<string, any> = {
  // Auth
  '/auth/login': (data: any) => ({
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    user: {
      id: 'mock-user-id',
      full_name: data.identifier.includes('admin') ? 'Admin User' : 'John Organizer',
      email: data.identifier,
      phone: '237612345678',
      role: data.identifier.includes('admin') ? 'admin' : 'organizer',
      is_email_verified: true,
      created_at: new Date().toISOString(),
    },
  }),
  '/auth/register': () => ({ message: 'Registration successful' }),
  '/auth/verify-otp': () => ({
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    user: { id: 'mock-user-id', full_name: 'New User', email: 'user@example.com', phone: '237612345678', role: 'organizer', is_email_verified: true },
  }),
  '/auth/refresh': () => ({ access_token: 'new-access-token', refresh_token: 'new-refresh-token', user: {} }),
  '/auth/logout': () => ({}),
  '/auth/me': () => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : { id: 'mock-id', full_name: 'Test User', email: 'test@test.com', role: 'organizer' };
  },

  // Events
  '/events': (_, method) => {
    if (method === 'GET') {
      const storedEvents = localStorage.getItem('events');
      return { events: storedEvents ? JSON.parse(storedEvents) : [] };
    }
    if (method === 'POST') return { event: { id: 'new-event-id', title: 'New Event', status: 'draft' } };
    return {};
  },
  '/events/:id': (params, method) => {
    if (method === 'PUT') return { event: { ...params, updated: true } };
    if (method === 'DELETE') return { success: true };
    return {};
  },
  '/events/:id/publish': () => ({ success: true }),
  '/events/:id/unpublish': () => ({ success: true }),
  '/events/:id/tickets': () => ({ ticket_types: [] }),
  '/events/:id/attendees': () => ({ attendees: [], total: 0 }),
  '/events/:id/analytics': () => ({ summary: { totalAttendees: 0, totalRevenue: 0, checkedInCount: 0, checkInPercentage: 0 }, dailySales: [], ticketBreakdown: [] }),

  // Orders & Tickets
  '/orders': () => ({ order_id: 'mock-order-id', total_amount: 5000, payment_reference: 'ref123' }),
  '/orders/:id/ticket': () => ({ qrCodeData: 'https://example.com/qr.png', ...mockOrderDetails() }),
  '/checkin': () => ({ attendee_name: 'John Doe', ticket_type: 'VIP', checked_in_at: new Date().toISOString() }),
};

function mockOrderDetails() {
  return {
    id: 'order123',
    attendeeName: 'Test Attendee',
    attendeePhone: '237612345678',
    ticketType: 'Regular',
    quantity: 1,
    unitPrice: 5000,
    totalAmount: 5000,
    eventTitle: 'Test Event',
    eventDate: '2025-12-01',
    eventTime: '18:00:00',
    eventVenue: 'Test Venue',
    eventCity: 'Douala',
    qrCodeData: 'test-qr-data',
    createdAt: new Date().toISOString(),
  };
}

// Mock axios client
const api = {
  get: async (url: string, config?: any) => {
    await delay();
    const matched = Object.keys(mockResponses).find(pattern => url.includes(pattern.replace(':id', '[^/]+')));
    const handler = matched ? mockResponses[matched] : () => ({});
    const data = handler(config?.params, 'GET');
    return { data };
  },
  post: async (url: string, data?: any, config?: any) => {
    await delay();
    const matched = Object.keys(mockResponses).find(pattern => url.includes(pattern.replace(':id', '[^/]+')));
    const handler = matched ? mockResponses[matched] : () => ({});
    const responseData = handler(data, 'POST');
    return { data: responseData };
  },
  put: async (url: string, data?: any) => {
    await delay();
    const matched = Object.keys(mockResponses).find(pattern => url.includes(pattern.replace(':id', '[^/]+')));
    const handler = matched ? mockResponses[matched] : () => ({});
    const responseData = handler(data, 'PUT');
    return { data: responseData };
  },
  delete: async (url: string) => {
    await delay();
    return { data: { success: true } };
  },
  defaults: { headers: { common: {} } },
  interceptors: { request: { use: () => {} }, response: { use: () => {} } },
};

export default api;