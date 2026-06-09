/**
 * Ticket Download Page
 * 
 * Displays the QR code ticket after successful payment.
 * Allows attendee to download the QR code as PNG image.
 * 
 * @module TicketPage
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {QRCodeCanvas} from 'qrcode.react'
import { Download, CheckCircle, Home, Ticket, Calendar, MapPin, Clock, Share2 } from 'lucide-react'

// Components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

// Utilities
import api from '@/lib/api'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface OrderDetails {
  id: string
  attendeeName: string
  attendeePhone: string
  ticketType: string
  quantity: number
  unitPrice: number
  totalAmount: number
  eventTitle: string
  eventDate: string
  eventTime: string
  eventVenue: string
  eventCity: string
  qrCodeData: string
  createdAt: string
}

export default function TicketPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  const qrRef = useRef<HTMLDivElement>(null)

  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloadCount, setDownloadCount] = useState(0)

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/orders/${orderId}/ticket`)
      setOrder(response.data)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Ticket not found'
      toast.error(errorMessage)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      const filename = `ticket_${order?.eventTitle?.replace(/\s/g, '_')}_${order?.attendeeName?.replace(/\s/g, '_')}.png`
      downloadLink.href = pngUrl
      downloadLink.download = filename
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      
      setDownloadCount(prev => prev + 1)
      toast.success('✅ QR code downloaded successfully!')
    }
  }

  const shareTicket = async () => {
    if (!order) return
    
    try {
      const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement
      if (canvas && typeof navigator.share === 'function') {
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/png')
        })
        const file = new File([blob], 'ticket.png', { type: 'image/png' })
        
        await navigator.share({
          title: `Ticket for ${order.eventTitle}`,
          text: `Here's my ticket for ${order.eventTitle}!`,
          files: [file],
        })
        toast.success('📤 Ticket shared successfully!')
      } else {
        downloadQRCode()
      }
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <Skeleton className="h-8 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-40 w-40 mx-auto mb-6 rounded" />
            <Skeleton className="h-10 w-full mb-3" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Success Header */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Payment Successful! 🎉</h1>
          <p className="text-gray-500">Thank you, {order.attendeeName}!</p>
        </div>

        {/* Ticket Card */}
        <Card className="mb-6 overflow-hidden shadow-lg animate-slide-up">
          {/* Ticket Header */}
          <div className="bg-primary p-4 text-white text-center">
            <h2 className="font-bold text-lg">{order.eventTitle}</h2>
            <p className="text-primary-foreground/80 text-sm">Event Ticket 🎟️</p>
          </div>

          {/* QR Code */}
          <CardContent className="pt-6 text-center">
            <div className="bg-white p-4 rounded-lg inline-block mx-auto border-2 border-dashed border-gray-200">
              <div ref={qrRef}>
                <QRCodeCanvas
                  id="qr-code-canvas"
                  value={order.qrCodeData}
                  size={200}
                  level="H"
                  includeMargin={true}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              📱 Scan this QR code at the event entrance
            </p>
          </CardContent>

          <Separator />

          {/* Event Details */}
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="font-medium">{formatDate(order.eventDate)}</p>
                <p className="text-xs text-gray-500">{formatTime(order.eventTime)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div>
                <p className="font-medium">{order.eventVenue}</p>
                <p className="text-xs text-gray-500">{order.eventCity}</p>
              </div>
            </div>
          </CardContent>

          <Separator />

          {/* Ticket Details */}
          <CardContent className="pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">👤 Attendee:</span>
              <span className="font-medium">{order.attendeeName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">🎟️ Ticket Type:</span>
              <span className="font-medium">{order.ticketType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">🔢 Quantity:</span>
              <span className="font-medium">{order.quantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">💰 Total Paid:</span>
              <span className="font-bold text-primary">{formatCurrency(order.totalAmount)}</span>
            </div>
          </CardContent>

          <Separator />

          {/* Footer */}
          <CardContent className="pt-4 pb-6 text-center">
            <Badge variant="outline" className="text-xs">
              🆔 Order ID: {order.id.slice(0, 8)}...
            </Badge>
            <p className="text-xs text-gray-400 mt-2">
              📅 Purchased on {formatDate(order.createdAt)}
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={downloadQRCode} className="w-full btn-press">
            <Download className="h-4 w-4 mr-2" />
            Download QR Code (PNG) 📥
          </Button>
          
          
            <Button variant="outline" onClick={shareTicket} className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              Share Ticket 📤
            </Button>
          
          
          <Button variant="ghost" onClick={() => router.push('/')} className="w-full">
            <Home className="h-4 w-4 mr-2" />
            Back to Home 🏠
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-xs text-gray-400 space-y-1">
          <p>💾 Save this QR code to your phone gallery</p>
          <p>📱 Present this QR code at the event entrance</p>
          <p>⚠️ One-time use only - QR code expires after scanning</p>
        </div>
      </div>
    </div>
  )
}