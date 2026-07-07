/**
 * Payment Cancel Page
 * 
 * Displayed when a user cancels a payment or the payment fails.
 * Shows error message and provides options to retry or go back.
 * 
 * @module PaymentCancelPage
 */

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { XCircle, ArrowLeft, RefreshCw, Home, CreditCard } from 'lucide-react'

// Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

// Utilities
import { toast } from 'sonner'

function PaymentCancelContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const error = searchParams.get('error')
    const order = searchParams.get('order_id')
    
    if (error) {
      setErrorMessage(decodeURIComponent(error))
    }
    if (order) {
      setOrderId(order)
    }
    
    // Log cancellation for analytics
    console.log('Payment cancelled:', { orderId: order, error })
  }, [searchParams])

  const handleRetry = () => {
    if (orderId) {
      // Redirect back to event page with order ID
      router.push(`/ticket/${orderId}`)
    } else {
      router.back()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription>
            Your payment was not completed
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <p className="text-muted-foreground">
            You cancelled the payment or the transaction failed. No charges have been made to your account.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
            <p className="font-medium mb-1">Need help?</p>
            <p>
              If you experienced a technical issue, please contact our support team at{' '}
              <a href="mailto:support@eventhub.com" className="underline">
                support@eventhub.com
              </a>
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button onClick={handleRetry} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          <Button variant="outline" onClick={() => router.back()} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          
          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  )
}