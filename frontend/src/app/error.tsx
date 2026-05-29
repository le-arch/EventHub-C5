/**
 * Global Error Boundary Component
 * 
 * Catches unexpected errors in the application and displays a user-friendly
 * error message with options to retry or go back home.
 * 
 * @module ErrorBoundary
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react'

// shadcn/ui components
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  const router = useRouter()

  // Log error to console in development
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        {/* Error Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Something Went Wrong</h1>
        <p className="text-gray-500 mb-4">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-6 text-left">
            <CardHeader>
              <CardTitle className="text-sm font-mono">Error Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-600 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button onClick={() => router.push('/')} variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Go Home
          </Button>
          <Button onClick={() => router.back()} variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Support Message */}
        <p className="text-sm text-gray-400 mt-8">
          If the problem persists, please contact our support team at{' '}
          <a href="mailto:support@eventhub.com" className="text-primary hover:underline">
            support@eventhub.com
          </a>
        </p>
      </div>
    </div>
  )
}