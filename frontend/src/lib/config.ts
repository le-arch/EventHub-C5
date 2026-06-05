/**
 * Application Configuration
 * 
 * Centralized configuration for the EventHub application.
 * Includes environment variables, feature flags, and app settings.
 * 
 * @module Config
 */

// Environment variables with fallbacks
export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085/api/v1',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
  },
  
  // App Configuration
  app: {
    name: 'EventHub',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    environment: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
  },
  
  // Feature Flags
  features: {
    enableOrangeMoney: process.env.NEXT_PUBLIC_ENABLE_ORANGE_MONEY === 'true',
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false',
    enableNovaAnimations: process.env.NEXT_PUBLIC_ENABLE_NOVA_ANIMATIONS !== 'false',
  },
  
  // Payment Configuration
  payment: {
    mtnMomo: {
      enabled: true,
      redirectUrl: process.env.NEXT_PUBLIC_MTN_MOMO_REDIRECT_URL || '',
    },
    orangeMoney: {
      enabled: process.env.NEXT_PUBLIC_ENABLE_ORANGE_MONEY === 'true',
      redirectUrl: process.env.NEXT_PUBLIC_ORANGE_MONEY_REDIRECT_URL || '',
    },
  },
  
  // QR Code Configuration
  qr: {
    baseUrl: process.env.NEXT_PUBLIC_QR_BASE_URL || 'http://localhost:3000/ticket',
    size: parseInt(process.env.NEXT_PUBLIC_QR_SIZE || '256', 10),
  },
  
  // Pagination Defaults
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
  
  // Upload Configuration
  upload: {
    maxSize: parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE || '5242880', 10), // 5MB
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 1,
  },
  
  // Date/Time Formatting
  dateFormat: {
    date: 'PPP', // 'Apr 29, 2024'
    time: 'p',   // '6:00 PM'
    dateTime: 'PPp', // 'Apr 29, 2024 at 6:00 PM'
  },
  
  // Currency Configuration
  currency: {
    code: 'XAF',
    symbol: 'FCFA',
    locale: 'fr-CM',
  },
}

// Helper function to get app URL for different environments
export const getAppUrl = (path: string = ''): string => {
  const baseUrl = config.app.url
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}

// Helper function to get API URL for different endpoints
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = config.api.baseUrl
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${baseUrl}${normalizedEndpoint}`
}

// Feature flag checker
export const isFeatureEnabled = (feature: keyof typeof config.features): boolean => {
  return config.features[feature]
}

// Environment checker
export const isDevelopment = (): boolean => config.app.isDevelopment
export const isProduction = (): boolean => config.app.isProduction