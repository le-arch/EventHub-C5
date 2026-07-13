/**
 * Root Layout Component
 * 
 * This is the root layout for the entire application.
 * It wraps all pages and provides:
 * - HTML document structure
 * - Metadata and SEO
 * - Global providers (Theme, Auth, Toast)
 * - Font configuration
 * 
 * @module RootLayout
 */

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import './globals.css'

// Initialize Inter font with optimized loading
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
})

/**
 * Application metadata for SEO and browser display
 */
export const metadata: Metadata = {
  title: {
    default: 'EventHub - Event Management Platform',
    template: '%s | EventHub',
  },
  description: 'Create, manage, and sell tickets for your events in Cameroon. Mobile Money payments, QR code check-in, and WhatsApp sharing.',
  keywords: [
    'event management',
    'ticket sales',
    'mobile money',
    'MTN Momo',
    'Orange Money',
    'QR code',
    'Cameroon',
    'event planning',
    'ticketing platform',
  ],
  authors: [
    { name: 'Leonie Basil' },
    { name: 'Fonyuy Verena' },
    { name: 'Rosine Achah' },
  ],
  creator: 'EventHub Team',
  publisher: 'EventHub',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_CM',
    url: 'https://eventhub.com',
    siteName: 'EventHub',
    title: 'EventHub - Event Management Platform',
    description: 'Create, manage, and sell tickets for your events in Cameroon.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EventHub Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EventHub - Event Management Platform',
    description: 'Create, manage, and sell tickets for your events in Cameroon.',
    images: ['/twitter-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

/**
 * Viewport configuration for responsive design
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563EB' },
    { media: '(prefers-color-scheme: dark)', color: '#1D4ED8' },
  ],
}

/**
 * Root Layout Component
 * Wraps the entire application with necessary providers and structure
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Theme Provider - handles dark/light mode */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* Auth Provider - manages authentication state */}
          <AuthProvider>
            {/* Main application content */}
            {children}

            {/* Vercel Analytics */}
            <Analytics />
            
            {/* Toast notifications */}
            <Toaster 
              position="bottom-center"
              richColors
              closeButton
              expand={false}
              duration={4000}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}