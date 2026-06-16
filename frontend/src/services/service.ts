// src/services/auth.service.ts (temporary mock version)
import api from '@/lib/api'; // still imported but mocked

export interface UserData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'organizer' | 'admin';
  is_email_verified: boolean;
  created_at?: string;
}

export const authService = {
  register: async (fullName: string, email: string, phone: string, password: string, role: 'organizer' | 'admin' = 'organizer') => {
    // Store registration data in localStorage (optional)
    localStorage.setItem('register_email', email);
    return Promise.resolve();
  },

  verifyEmail: async (email: string, otp: string) => {
    const user: UserData = {
      id: 'mock-id-' + Date.now(),
      full_name: email.split('@')[0],
      email,
      phone: '237612345678',
      role: 'organizer',
      is_email_verified: true,
    };
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('access_token', 'mock-access-token');
    localStorage.setItem('refresh_token', 'mock-refresh-token');
    return {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user,
    };
  },

  login: async (identifier: string, password: string) => {
    const isAdmin = identifier.includes('admin');
    const user: UserData = {
      id: 'mock-user-id',
      full_name: isAdmin ? 'Admin User' : 'John Organizer',
      email: identifier,
      phone: '237612345678',
      role: isAdmin ? 'admin' : 'organizer',
      is_email_verified: true,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('access_token', 'mock-access-token');
    localStorage.setItem('refresh_token', 'mock-refresh-token');
    return {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user,
    };
  },

  logout: async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  refreshToken: async (refreshToken: string) => {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : { id: 'mock-id', full_name: 'User', email: 'user@test.com', role: 'organizer' };
    return {
      access_token: 'new-mock-token',
      refresh_token: 'new-mock-refresh',
      user,
    };
  },

  resendOTP: async (email: string) => Promise.resolve(),
  forgotPassword: async (email: string) => Promise.resolve(),
  resetPassword: async (email: string, otp: string, newPassword: string) => Promise.resolve(),

  // Admin user management (mock)
  getUsers: async (page = 1, limit = 10) => ({
    users: [
      { id: '1', full_name: 'Test Organizer', email: 'org@test.com', phone: '237611111111', role: 'organizer', is_email_verified: true },
      { id: '2', full_name: 'Admin User', email: 'admin@test.com', phone: '237622222222', role: 'admin', is_email_verified: true }
    ],
    total: 2,
    page,
    limit,
    totalPages: 1,
  }),
  getUserById: async (userId: string) => ({ id: userId, full_name: 'User', email: 'user@test.com', phone: '237600000000', role: 'organizer', is_email_verified: true }),
  updateUser: async (userId: string, data: any) => ({ ...data, id: userId }),
  verifyUser: async (userId: string) => {},
  suspendUser: async (userId: string) => {},
  unsuspendUser: async (userId: string) => {},
  deleteUser: async (userId: string) => {},
  batchVerifyUsers: async (userIds: string[]) => {},
  batchSuspendUsers: async (userIds: string[]) => {},
};

export default authService;