/**
 * Payment Success Page
 * 
 * Displayed after successful payment confirmation.
 * Shows success message and redirects to ticket download page.
 * 
 * @module PaymentSuccessPage
 */

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Ticket, Download, ArrowRight, Home } from 'lucide-react'
import Image from 'next/image'

// Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

// Utilities
import { toast } from 'sonner'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const order = searchParams.get('order_id')
    const transactionId = searchParams.get('transaction_id')
    
    if (order) {
      setOrderId(order)
      // Redirect to ticket page after countdown
      const timer = setTimeout(() => {
        router.push(`/ticket/${order}`)
      }, 5000)
      
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
      
      return () => {
        clearTimeout(timer)
        clearInterval(interval)
      }
    } else {
      toast.error('Missing order information')
      router.push('/')
    }
  }, [searchParams, router])

  const handleViewTicket = () => {
    if (orderId) {
      router.push(`/ticket/${orderId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-scale-in">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your ticket has been confirmed
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Order ID:</span>
              <code className="text-sm font-mono">{orderId?.slice(0, 8)}...</code>
            </div>
            <div className="flex items-center justify-between">
              <Image 
                src="/images/payment-success.svg" 
                alt="Payment Success Icon" 
                width={32} 
                height={32}
                className="w-8 h-8"
               />
              <span className="text-sm text-gray-600">Status:</span>
              <Badge className="bg-green-100 text-green-800">Completed</Badge>
            </div>
          </div>

          <p className="text-gray-600">
            Your payment has been processed successfully. You can now download your ticket.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            <p className="font-medium mb-1">What's next?</p>
            <p>Download your QR code ticket. You'll need to show it at the event entrance.</p>
          </div>

          {countdown > 0 && (
            <p className="text-sm text-gray-500 animate-pulse">
              Redirecting to ticket in {countdown} seconds...
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button onClick={handleViewTicket} className="w-full">
            <Ticket className="h-4 w-4 mr-2" />
            View & Download Ticket
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}