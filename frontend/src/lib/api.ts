/**
 * Mock API Client – Simple & Reliable
 * 
 * Replaces the real API for frontend testing.
 * All handlers work with both /api/v1/... and /... paths.
 */

const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================
// MOCK DATA STORE
// ============================================================

const users = [
  {
    id: 'user-1',
    full_name: 'John Organizer',
    email: 'organizer@eventhub.com',
    phone: '237612345678',
    password_hash: 'mockhash',
    role: 'organizer',
    is_email_verified: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'user-2',
    full_name: 'Admin User',
    email: 'admin@eventhub.com',
    phone: '237698765432',
    password_hash: 'mockhash',
    role: 'admin',
    is_email_verified: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'user-3',
    full_name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '237655544433',
    password_hash: 'mockhash',
    role: 'organizer',
    is_email_verified: false,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const otpStore: Record<string, string> = {};
const tokenStore: Record<string, string> = {};

// ============================================================
// SIMPLE HANDLERS
// ============================================================

const handlers: Record<string, (data?: any, params?: any, method?: string, headers?: any) => any> = {

  // -------- AUTH --------
  '/auth/register': (data) => {
    const existing = users.find(u => u.email === data.email);
    if (existing) throw { response: { status: 400, data: { error: 'Email already registered' } } };
    const newUser = {
      id: `user-${Date.now()}`,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      password_hash: 'mockhash',
      role: data.role || 'organizer',
      is_email_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    const otp = '123456';
    otpStore[data.email] = otp;
    console.log(`📧 OTP for ${data.email}: ${otp}`);
    return { message: 'Registration successful' };
  },

  '/auth/verify-otp': (data) => {
    const user = users.find(u => u.email === data.email);
    if (!user) throw { response: { status: 404, data: { error: 'User not found' } } };
    if (otpStore[data.email] !== data.otp) throw { response: { status: 400, data: { error: 'Invalid OTP' } } };
    user.is_email_verified = true;
    const token = `mock-access-${Date.now()}`;
    const refresh = `mock-refresh-${Date.now()}`;
    tokenStore[token] = user.id;
    return {
      access_token: token,
      refresh_token: refresh,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_email_verified: user.is_email_verified,
        created_at: user.created_at,
      },
    };
  },

  '/auth/login': (data) => {
    const user = users.find(u => u.email === data.identifier || u.phone === data.identifier);
    if (!user) throw { response: { status: 401, data: { error: 'Invalid credentials' } } };
    if (!user.is_active) throw { response: { status: 403, data: { error: 'Account suspended' } } };
    
    const token = `mock-access-${Date.now()}`;
    const refresh = `mock-refresh-${Date.now()}`;
    tokenStore[token] = user.id;
    return {
      access_token: token,
      refresh_token: refresh,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_email_verified: user.is_email_verified,
        created_at: user.created_at,
      },
    };
  },

  '/auth/refresh': (data) => {
    if (!data.refresh_token) throw { response: { status: 401, data: { error: 'Invalid refresh token' } } };
    return {
      access_token: `mock-access-${Date.now()}`,
      refresh_token: `mock-refresh-${Date.now()}`,
    };
  },

  '/auth/logout': () => ({ success: true }),

   '/auth/me': (_, __, ___, headers) => {
      const authHeader = headers?.Authorization || headers?.authorization;
      const token = authHeader?.replace('Bearer ', '');
      if (!token) throw { response: { status: 401, data: { error: 'Unauthorized' } } };
      
      const userId = tokenStore[token];
      if (!userId) throw { response: { status: 401, data: { error: 'Invalid token' } } };
      
      const user = users.find(u => u.id === userId);
      if (!user) throw { response: { status: 404, data: { error: 'User not found' } } };
      
      // Return a guaranteed flat layout structure with fallback properties
      return {
        id: user.id || userId,
        fullName: user.full_name || user.fullName || 'Organizer Account',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'organizer',
        isEmailVerified: user.is_email_verified ?? user.isEmailVerified ?? true,
        createdAt: user.created_at || user.createdAt || new Date().toISOString(),
      };
    },

  '/auth/resend-otp': (data) => {
    const user = users.find(u => u.email === data.email);
    if (!user) throw { response: { status: 404, data: { error: 'User not found' } } };
    const otp = '123456';
    otpStore[data.email] = otp;
    return { message: 'OTP resent' };
  },

  '/auth/forgot-password': () => ({ message: 'Reset link sent (if email exists)' }),
  '/auth/reset-password': (data) => {
    const user = users.find(u => u.email === data.email);
    if (!user) throw { response: { status: 404, data: { error: 'User not found' } } };
    if (otpStore[data.email] !== data.otp) throw { response: { status: 400, data: { error: 'Invalid OTP' } } };
    return { message: 'Password reset successful' };
  },

  // -------- ADMIN --------
  '/admin/users': (_, params) => {
    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 10;
    const search = params?.search || '';
    let filtered = users;
    if (search) {
      filtered = filtered.filter(u =>
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    return {
      users: paginated,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
  },

  '/admin/users/:id/verify': (_, params) => ({ success: true, userId: params?.id }),
  '/admin/users/:id/suspend': (_, params) => ({ success: true, userId: params?.id }),
  '/admin/users/:id/unsuspend': (_, params) => ({ success: true, userId: params?.id }),
  '/admin/users/batch-verify': () => ({ success: true }),
  '/admin/users/batch-suspend': () => ({ success: true }),

 // -------- EVENTS (Fixed for Dashboard Analytics) --------
  '/events': (data, params, method) => {
    if (method === 'GET') {
      return { 
        events: [
          { 
            id: 'evt-1', 
            title: 'Silicon Mountain Tech Fest', 
            venue_name: 'Chariot Hotel', 
            city: 'Buea', 
            start_date: '2026-11-15', 
            status: 'published',
            // Added mock sub-object property structure to resolve UI loop crash
            ticketStats: {
              totalSold: 45,
              totalCapacity: 200,
              revenue: 225000
            }
          },
          { 
            id: 'evt-2', 
            title: 'Kumba Food Expo', 
            venue_name: 'Town Hall', 
            city: 'Kumba', 
            start_date: '2026-12-20', 
            status: 'draft',
            ticketStats: {
              totalSold: 0,
              totalCapacity: 100,
              revenue: 0
            }
          }
        ] 
      };
    }
    if (method === 'POST') {
      return {
        event: {
          id: `evt-${Date.now()}`,
          title: data?.title || 'New Event',
          status: 'draft',
          created_at: new Date().toISOString(),
          // Include default empty metrics for newly initialized creation payloads
          ticketStats: {
            totalSold: 0,
            totalCapacity: 0,
            revenue: 0
          }
        }
      };
    }
    return {};
  },

  '/events/:id': (data, params, method) => {
    if (method === 'GET') {
      return {
        event: {
          id: params?.id || 'evt-1',
          title: 'Mock Dynamic Event Context',
          venue_name: 'Mountain Hotel venue',
          city: 'Buea',
          start_date: '2026-12-01',
          start_time: '18:00:00',
          status: 'published',
          ticketStats: {
            totalSold: 120,
            totalCapacity: 500,
            revenue: 600000
          }
        }
      };
    }
    if (method === 'PUT') {
      return { 
        event: { 
          ...data, 
          id: params?.id, 
          updated: true,
          ticketStats: data?.ticketStats || { totalSold: 0, totalCapacity: 0, revenue: 0 }
        } 
      };
    }
    if (method === 'DELETE') return { success: true, id: params?.id };
    return {};
  },

  '/events/:id/publish': (_, params) => ({ success: true, id: params?.id }),
  '/events/:id/unpublish': (_, params) => ({ success: true, id: params?.id }),
  '/events/:id/tickets': () => ({ ticket_types: [{ id: 't-1', name: 'Regular', price: 5000 }, { id: 't-2', name: 'VIP', price: 15000 }] }),
  '/events/:id/attendees': () => ({ attendees: [], total: 0 }),
  '/events/:id/analytics': () => ({
    summary: { totalAttendees: 140, totalRevenue: 700000, checkedInCount: 95, checkInPercentage: 67 },
    dailySales: [],
    ticketBreakdown: [],
  }),

  // -------- ORDERS & TICKETS --------
  '/orders': (data) => ({
    order_id: `ord-${Date.now()}`,
    total_amount: (data?.quantity || 1) * 5000,
    payment_reference: `ref-${Date.now()}`,
  }),

  '/orders/:id/ticket': (_, params) => ({
    id: params?.id || 'order123',
    attendeeName: 'Test Attendee',
    attendeePhone: '237612345678',
    ticketType: 'Regular',
    quantity: 1,
    unitPrice: 5000,
    totalAmount: 5000,
    eventTitle: 'Mock Event Elite',
    eventDate: '2026-12-01',
    eventTime: '18:00:00',
    eventVenue: 'Amphi 750 UB',
    eventCity: 'Buea',
    qrCodeData: 'mock-qr-data',
    createdAt: new Date().toISOString(),
  }),

  '/checkin': () => ({
    attendee_name: 'John Doe',
    ticket_type: 'VIP',
    checked_in_at: new Date().toISOString(),
  }),

  '/health': () => ({ status: 'ok' }),
};

// ============================================================
// PARSING LOGIC ENGINE
// ============================================================

function findHandler(url: string): { handlerKey: string; params: any } | null {
  // Strip out full query structures (?page=1&search=test) prior to verification lookup
  const cleanUrl = url.split('?')[0].replace(/^\/api\/v1/, '');
  
  if (handlers[cleanUrl]) {
    return { handlerKey: cleanUrl, params: {} };
  }

  const cleanUrlParts = cleanUrl.split('/').filter(Boolean);

  for (const key of Object.keys(handlers)) {
    const keyParts = key.split('/').filter(Boolean);
    if (keyParts.length !== cleanUrlParts.length) continue;

    let match = true;
    const extractedParams: Record<string, string> = {};

    for (let i = 0; i < keyParts.length; i++) {
      if (keyParts[i].startsWith(':')) {
        const paramName = keyParts[i].slice(1);
        extractedParams[paramName] = cleanUrlParts[i];
      } else if (keyParts[i] !== cleanUrlParts[i]) {
        match = false;
        break;
      }
    }

    if (match) {
      return { handlerKey: key, params: extractedParams };
    }
  }

  return null;
}

// ============================================================
// MOCK AXIOS INTERFACE IMPLEMENTATION
// ============================================================

const api = {
  get: async (url: string, config?: any) => {
    await delay();
    const resultMatch = findHandler(url);
    if (resultMatch) {
      try {
        const mergedParams = { ...config?.params, ...resultMatch.params };
        const result = handlers[resultMatch.handlerKey](null, mergedParams, 'GET', config?.headers);
        return { data: result, status: 200 };
      } catch (err: any) {
        throw err;
      }
    }
    console.warn(`⚠️ Mock GET not found: ${url}`);
    return { data: {}, status: 404 };
  },

  post: async (url: string, data?: any, config?: any) => {
    await delay();
    const resultMatch = findHandler(url);
    if (resultMatch) {
      try {
        const result = handlers[resultMatch.handlerKey](data, resultMatch.params, 'POST', config?.headers);
        return { data: result, status: 200 };
      } catch (err: any) {
        throw err;
      }
    }
    console.warn(`⚠️ Mock POST not found: ${url}`);
    return { data: {}, status: 404 };
  },

  put: async (url: string, data?: any, config?: any) => {
    await delay();
    const resultMatch = findHandler(url);
    if (resultMatch) {
      try {
        const result = handlers[resultMatch.handlerKey](data, resultMatch.params, 'PUT', config?.headers);
        return { data: result, status: 200 };
      } catch (err: any) {
        throw err;
      }
    }
    console.warn(`⚠️ Mock PUT not found: ${url}`);
    return { data: {}, status: 404 };
  },

  delete: async (url: string, config?: any) => {
    await delay();
    const resultMatch = findHandler(url);
    if (resultMatch) {
      try {
        const result = handlers[resultMatch.handlerKey](null, resultMatch.params, 'DELETE', config?.headers);
        return { data: result, status: 200 };
      } catch (err: any) {
        throw err;
      }
    }
    console.warn(`⚠️ Mock DELETE not found: ${url}`);
    return { data: { success: true }, status: 200 };
  },

  defaults: { headers: { common: {} } },
  interceptors: {
    request: {
      use: () => {},
      eject: () => {},
    },
    response: {
      use: () => {},
      eject: () => {},
    },
  },
};

export default api;